import express from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * Register a webhook
 * POST /api/webhooks/register
 */
router.post(
  '/register',
  authenticate,
  [
    body('url').isURL(),
    body('events').isArray().notEmpty(),
    body('jobId').optional().isString(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { url, events, jobId } = req.body;

    // Verify job ownership if jobId provided
    if (jobId) {
      const job = await prisma.job.findUnique({
        where: { id: jobId }
      });

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      if (job.orgId !== req.user.orgId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Store webhook configuration (you'd typically store this in a separate Webhook table)
    // For now, we'll return success
    res.status(201).json({
      message: 'Webhook registered successfully',
      webhook: {
        url,
        events,
        jobId: jobId || null,
        orgId: req.user.orgId
      }
    });
  })
);

/**
 * Get webhook events for a job
 * GET /api/webhooks/events/:jobId
 */
router.get(
  '/events/:jobId',
  authenticate,
  param('jobId').isString(),
  asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    // Verify job ownership
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get webhook events
    const events = await prisma.webhookEvent.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json(events);
  })
);

/**
 * Get webhook event details
 * GET /api/webhooks/event/:eventId
 */
router.get(
  '/event/:eventId',
  authenticate,
  param('eventId').isString(),
  asyncHandler(async (req, res) => {
    const event = await prisma.webhookEvent.findUnique({
      where: { id: req.params.eventId }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify access through job
    if (event.jobId) {
      const job = await prisma.job.findUnique({
        where: { id: event.jobId }
      });

      if (!job || job.orgId !== req.user.orgId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json(event);
  })
);

/**
 * Retry failed webhook
 * POST /api/webhooks/retry/:eventId
 */
router.post(
  '/retry/:eventId',
  authenticate,
  param('eventId').isString(),
  asyncHandler(async (req, res) => {
    const event = await prisma.webhookEvent.findUnique({
      where: { id: req.params.eventId }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify access
    if (event.jobId) {
      const job = await prisma.job.findUnique({
        where: { id: event.jobId }
      });

      if (!job || job.orgId !== req.user.orgId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Reset status to pending for retry
    const updated = await prisma.webhookEvent.update({
      where: { id: req.params.eventId },
      data: {
        status: 'pending',
        attempts: 0
      }
    });

    res.json({
      message: 'Webhook queued for retry',
      event: updated
    });
  })
);

export default router;



