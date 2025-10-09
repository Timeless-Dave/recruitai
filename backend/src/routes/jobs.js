import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import prisma from '../config/database.js';
import { authenticate, requireOrgAccess } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import aiService from '../services/aiService.js';
import assessmentService from '../services/assessmentService.js';
import scoringService from '../services/scoringService.js';
import { generateShareableId, generateApplicationUrl, parsePaginationParams, buildPaginationResponse, formatApplicationForExport } from '../utils/helpers.js';

const router = express.Router();

/**
 * Get public job listings (no auth required)
 * GET /api/jobs/public
 */
router.get(
  '/public',
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePaginationParams(req.query);
    const { search, type, experienceLevel, location } = req.query;

    const where = {
      status: 'active',
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(type && { type }),
      ...(experienceLevel && { experienceLevel }),
      ...(location && { location: { contains: location, mode: 'insensitive' } })
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          type: true,
          experienceLevel: true,
          department: true,
          shareableUrl: true,
          createdAt: true,
          _count: {
            select: {
              applicants: true
            }
          }
        }
      }),
      prisma.job.count({ where })
    ]);

    res.json(buildPaginationResponse(jobs, total, page, limit));
  })
);

/**
 * Get single public job by shareable URL (no auth required)
 * GET /api/jobs/public/:shareableId
 */
router.get(
  '/public/:shareableId',
  asyncHandler(async (req, res) => {
    const job = await prisma.job.findFirst({
      where: {
        shareableUrl: {
          contains: req.params.shareableId
        },
        status: 'active'
      },
      include: {
        jobAssessments: {
          select: {
            id: true,
            isRequired: true,
            timeLimit: true,
            passMark: true,
            customQuestions: true
          }
        },
        _count: {
          select: {
            applicants: true
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found or no longer active' });
    }

    res.json(job);
  })
);

/**
 * Create a new job
 * POST /api/jobs
 */
router.post(
  '/',
  authenticate,
  [
    body('title').notEmpty().trim(),
    body('description').notEmpty().trim(),
    body('location').optional().trim(),
    body('type').optional().isIn(['full-time', 'part-time', 'contract', 'internship']),
    body('experienceLevel').optional().isIn(['entry', 'mid', 'senior', 'lead']),
    body('department').optional().trim(),
    body('responsibilities').optional().trim(),
    body('qualifications').optional().trim(),
    body('requiredSkills').optional().isArray(),
    body('salary').optional().isObject(),
    body('assessmentType').optional().isIn(['ai-generated', 'question-pool', 'custom', 'none']),
    body('questionPoolId').optional().isString(),
    body('customQuestions').optional().isArray(),
    body('criteriaJson').optional().isObject(),
    body('weightsJson').optional().isObject(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      location,
      type,
      experienceLevel,
      department,
      responsibilities,
      qualifications,
      requiredSkills,
      salary,
      assessmentType = 'ai-generated',
      questionPoolId,
      customQuestions,
      criteriaJson,
      weightsJson,
      applicationForm,
      passMark,
      settings
    } = req.body;

    // Generate shareable URL
    const shareableId = generateShareableId();
    const shareableUrl = generateApplicationUrl(shareableId);

    // Get AI suggestions for requirements if not provided
    let finalCriteria = criteriaJson;
    let finalWeights = weightsJson;

    if (!criteriaJson || !weightsJson) {
      const suggestions = await aiService.suggestJobRequirements(title, description);
      finalCriteria = criteriaJson || {
        skills: suggestions.skills,
        experience: suggestions.experience,
        education: suggestions.education
      };
      finalWeights = weightsJson || suggestions.weights;
    }

    // Create job
    const job = await prisma.job.create({
      data: {
        orgId: req.user.orgId,
        title,
        description,
        location,
        type,
        experienceLevel,
        department,
        responsibilities,
        qualifications,
        requiredSkills,
        salary,
        criteriaJson: finalCriteria,
        weightsJson: finalWeights,
        shareableUrl,
        applicationForm: applicationForm || null,
        passMark: passMark || 70.0,
        status: 'active'
      }
    });

    // Create assessment if requested
    if (assessmentType !== 'none') {
      let assessmentData = {
        jobId: job.id,
        isRequired: false,
        timeLimit: 15,
        passMark: passMark || 60.0
      };

      if (assessmentType === 'ai-generated') {
        // Generate questions using AI
        const questions = await assessmentService.generateQuestionsForJob(job.id);
        assessmentData.customQuestions = questions;
      } else if (assessmentType === 'question-pool' && questionPoolId) {
        // Use existing question pool
        assessmentData.questionPoolId = questionPoolId;
      } else if (assessmentType === 'custom' && customQuestions) {
        // Use custom questions
        assessmentData.customQuestions = customQuestions;
      }

      await prisma.jobAssessment.create({ data: assessmentData });
    }

    // Fetch complete job with assessment
    const completeJob = await prisma.job.findUnique({
      where: { id: job.id },
      include: {
        jobAssessments: {
          include: {
            questionPool: true
          }
        }
      }
    });

    res.status(201).json({
      job: completeJob,
      shareableUrl,
      message: 'Job created successfully'
    });
  })
);

/**
 * Get all jobs for organization
 * GET /api/jobs
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePaginationParams(req.query);
    const { status } = req.query;

    const where = {
      orgId: req.user.orgId,
      ...(status && { status })
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              applicants: true,
              scores: true
            }
          }
        }
      }),
      prisma.job.count({ where })
    ]);

    res.json(buildPaginationResponse(jobs, total, page, limit));
  })
);

/**
 * Get single job details
 * GET /api/jobs/:id
 */
router.get(
  '/:id',
  authenticate,
  param('id').isString(),
  asyncHandler(async (req, res) => {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        jobAssessments: {
          include: {
            questionPool: true
          }
        },
        _count: {
          select: {
            applicants: true,
            scores: true
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(job);
  })
);

/**
 * Update job
 * PATCH /api/jobs/:id
 */
router.patch(
  '/:id',
  authenticate,
  param('id').isString(),
  asyncHandler(async (req, res) => {
    const { title, description, status, criteriaJson, weightsJson, passMark } = req.body;

    // Verify ownership
    const existingJob = await prisma.job.findUnique({
      where: { id: req.params.id }
    });

    if (!existingJob) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (existingJob.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const job = await prisma.job.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
        ...(criteriaJson && { criteriaJson }),
        ...(weightsJson && { weightsJson }),
        ...(passMark && { passMark })
      }
    });

    res.json(job);
  })
);

/**
 * Delete job
 * DELETE /api/jobs/:id
 */
router.delete(
  '/:id',
  authenticate,
  param('id').isString(),
  asyncHandler(async (req, res) => {
    // Verify ownership
    const job = await prisma.job.findUnique({
      where: { id: req.params.id }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.job.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Job deleted successfully' });
  })
);

/**
 * Get ranked applicants for a job
 * GET /api/jobs/:id/ranked
 */
router.get(
  '/:id/ranked',
  authenticate,
  param('id').isString(),
  asyncHandler(async (req, res) => {
    const { limit = 100 } = req.query;

    // Verify ownership
    const job = await prisma.job.findUnique({
      where: { id: req.params.id }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const rankedApplicants = await scoringService.getRankedApplicants(
      req.params.id,
      parseInt(limit)
    );

    res.json({
      jobId: req.params.id,
      totalApplicants: rankedApplicants.length,
      applicants: rankedApplicants
    });
  })
);

/**
 * Export applicants as CSV
 * GET /api/jobs/:id/export
 */
router.get(
  '/:id/export',
  authenticate,
  param('id').isString(),
  asyncHandler(async (req, res) => {
    // Verify ownership
    const job = await prisma.job.findUnique({
      where: { id: req.params.id }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const rankedApplicants = await scoringService.getRankedApplicants(req.params.id);

    // Format for export
    const exportData = rankedApplicants.map(item => 
      formatApplicationForExport(item.applicant, {
        finalScore: item.finalScore,
        rank: item.rank,
        percentile: item.percentile,
        status: item.status
      })
    );

    res.json({
      jobTitle: job.title,
      exportDate: new Date().toISOString(),
      totalApplicants: exportData.length,
      data: exportData
    });
  })
);

/**
 * Get available question pools
 * GET /api/jobs/question-pools
 */
router.get(
  '/question-pools/list',
  authenticate,
  asyncHandler(async (req, res) => {
    const { category, role } = req.query;

    const where = {
      OR: [
        { isDefault: true },
        { orgId: req.user.orgId }
      ],
      ...(category && { category }),
      ...(role && { role })
    };

    const pools = await prisma.questionPool.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        role: true,
        isDefault: true
      }
    });

    res.json(pools);
  })
);

export default router;



