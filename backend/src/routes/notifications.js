import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @route   GET /api/notifications
 * @desc    Get notifications for authenticated user
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id; // Use database ID instead of firebaseUid
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;

    const where = {
      userId,
      ...(unreadOnly === 'true' && { isRead: false })
    };

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.notification.count({
        where: { userId, isRead: false }
      })
    ]);

    res.json({
      notifications,
      unreadCount,
      hasMore: notifications.length === parseInt(limit)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.post('/:id/read', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Use database ID instead of firebaseUid

    // Verify notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: { id, userId }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.post('/read-all', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id; // Use database ID instead of firebaseUid

    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    res.json({
      success: true,
      count: result.count
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Use database ID instead of firebaseUid

    // Verify notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: { id, userId }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/notifications
 * @desc    Delete all notifications for user
 * @access  Private
 */
router.delete('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id; // Use database ID instead of firebaseUid

    const result = await prisma.notification.deleteMany({
      where: { userId }
    });

    res.json({
      success: true,
      count: result.count
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/notifications/create
 * @desc    Create a notification (internal use, can be called from other services)
 * @access  Private
 */
router.post('/create', authenticate, async (req, res, next) => {
  try {
    const { userId, type, title, message, link } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, type, title, message' 
      });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link
      }
    });

    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
});

// Helper function to create notifications (can be imported by other modules)
export async function createNotification({ userId, type, title, message, link }) {
  return await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link
    }
  });
}

export default router;
