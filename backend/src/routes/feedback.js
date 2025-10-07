import express from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * Add feedback/override for applicant score
 * POST /api/feedback
 */
router.post(
  '/',
  authenticate,
  [
    body('scoreId').notEmpty().isString(),
    body('action').isIn(['override', 'approve', 'reject', 'shortlist']),
    body('note').optional().trim(),
    body('newScore').optional().isFloat({ min: 0, max: 100 }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { scoreId, action, note, newScore } = req.body;

    // Get score and verify access
    const score = await prisma.score.findUnique({
      where: { id: scoreId },
      include: {
        job: {
          select: { orgId: true }
        }
      }
    });

    if (!score) {
      return res.status(404).json({ error: 'Score not found' });
    }

    if (score.job.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        scoreId,
        recruiterId: req.user.id,
        action,
        note: note || null
      }
    });

    // Update score status based on action
    let updateData = {};
    
    if (action === 'approve') {
      updateData.status = 'approved';
    } else if (action === 'reject') {
      updateData.status = 'rejected';
    } else if (action === 'shortlist') {
      updateData.status = 'approved'; // Shortlist is similar to approve
    } else if (action === 'override' && newScore !== undefined) {
      // Override the final score
      updateData.finalScore = newScore;
      updateData.status = 'approved';
    }

    const updatedScore = await prisma.score.update({
      where: { id: scoreId },
      data: updateData
    });

    res.status(201).json({
      feedback,
      updatedScore,
      message: 'Feedback added successfully'
    });
  })
);

/**
 * Get all feedback for a score
 * GET /api/feedback/score/:scoreId
 */
router.get(
  '/score/:scoreId',
  authenticate,
  param('scoreId').isString(),
  asyncHandler(async (req, res) => {
    // Get score and verify access
    const score = await prisma.score.findUnique({
      where: { id: req.params.scoreId },
      include: {
        job: {
          select: { orgId: true }
        }
      }
    });

    if (!score) {
      return res.status(404).json({ error: 'Score not found' });
    }

    if (score.job.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all feedback
    const feedback = await prisma.feedback.findMany({
      where: { scoreId: req.params.scoreId },
      include: {
        recruiter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(feedback);
  })
);

/**
 * Get all feedback by recruiter
 * GET /api/feedback/recruiter/:recruiterId
 */
router.get(
  '/recruiter/:recruiterId',
  authenticate,
  param('recruiterId').isString(),
  asyncHandler(async (req, res) => {
    const { recruiterId } = req.params;

    // Verify recruiter belongs to same org
    const recruiter = await prisma.recruiter.findUnique({
      where: { id: recruiterId }
    });

    if (!recruiter) {
      return res.status(404).json({ error: 'Recruiter not found' });
    }

    if (recruiter.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get feedback
    const feedback = await prisma.feedback.findMany({
      where: { recruiterId },
      include: {
        score: {
          include: {
            applicant: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            job: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(feedback);
  })
);

/**
 * Get feedback statistics for a job
 * GET /api/feedback/job/:jobId/stats
 */
router.get(
  '/job/:jobId/stats',
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

    // Get all scores for this job with feedback
    const scores = await prisma.score.findMany({
      where: { jobId },
      include: {
        feedback: true
      }
    });

    // Calculate statistics
    const stats = {
      totalApplicants: scores.length,
      approved: scores.filter(s => s.status === 'approved').length,
      rejected: scores.filter(s => s.status === 'rejected').length,
      pending: scores.filter(s => s.status === 'pending').length,
      withFeedback: scores.filter(s => s.feedback.length > 0).length,
      feedbackByAction: {}
    };

    // Count feedback by action
    scores.forEach(score => {
      score.feedback.forEach(f => {
        stats.feedbackByAction[f.action] = (stats.feedbackByAction[f.action] || 0) + 1;
      });
    });

    res.json(stats);
  })
);

/**
 * Bulk update applicant statuses
 * POST /api/feedback/bulk-action
 */
router.post(
  '/bulk-action',
  authenticate,
  [
    body('scoreIds').isArray().notEmpty(),
    body('action').isIn(['approve', 'reject', 'shortlist']),
    body('note').optional().trim(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { scoreIds, action, note } = req.body;

    // Verify all scores belong to user's org
    const scores = await prisma.score.findMany({
      where: {
        id: { in: scoreIds }
      },
      include: {
        job: {
          select: { orgId: true }
        }
      }
    });

    if (scores.length !== scoreIds.length) {
      return res.status(404).json({ error: 'Some scores not found' });
    }

    const unauthorizedScores = scores.filter(s => s.job.orgId !== req.user.orgId);
    if (unauthorizedScores.length > 0) {
      return res.status(403).json({ error: 'Access denied to some scores' });
    }

    // Create feedback for all scores
    const feedbackData = scoreIds.map(scoreId => ({
      scoreId,
      recruiterId: req.user.id,
      action,
      note: note || null
    }));

    await prisma.feedback.createMany({
      data: feedbackData
    });

    // Update score statuses
    let status = 'pending';
    if (action === 'approve' || action === 'shortlist') {
      status = 'approved';
    } else if (action === 'reject') {
      status = 'rejected';
    }

    await prisma.score.updateMany({
      where: { id: { in: scoreIds } },
      data: { status }
    });

    res.json({
      message: `Bulk action applied to ${scoreIds.length} applicants`,
      action,
      count: scoreIds.length
    });
  })
);

/**
 * Delete feedback
 * DELETE /api/feedback/:id
 */
router.delete(
  '/:id',
  authenticate,
  param('id').isString(),
  asyncHandler(async (req, res) => {
    // Get feedback and verify access
    const feedback = await prisma.feedback.findUnique({
      where: { id: req.params.id },
      include: {
        recruiter: true
      }
    });

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Only allow deletion by feedback creator or admin
    if (feedback.recruiterId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.feedback.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Feedback deleted successfully' });
  })
);

export default router;



