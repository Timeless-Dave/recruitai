import express from 'express';
import { body, param, validationResult } from 'express-validator';
import multer from 'multer';
import prisma from '../config/database.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { storage } from '../config/firebase.js';
import { isValidFileType, isValidFileSize, parsePaginationParams, buildPaginationResponse } from '../utils/helpers.js';
import { Queue } from 'bullmq';
import scoringService from '../services/scoringService.js';

const router = express.Router();

const backgroundJobsDisabled = process.env.DISABLE_BACKGROUND_JOBS === 'true';

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (isValidFileType(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX are allowed.'));
    }
  }
});

// Initialize scoring queue only if jobs enabled
const scoringQueue = backgroundJobsDisabled
  ? null
  : new Queue('scoring-queue', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD
      }
    });

/**
 * Public: Submit application (no auth required)
 * POST /api/applicants/apply/:shareableId
 */
router.post(
  '/apply/:shareableId',
  upload.single('cv'),
  [
    param('shareableId').notEmpty().trim(),
    body('name').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('phone').optional().trim(),
    body('answers').optional(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shareableId } = req.params;
    const { name, email, phone, answers } = req.body;
    const cvFile = req.file;

    // Find job by shareable URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const shareableUrl = `${frontendUrl}/apply/${shareableId}`;

    const job = await prisma.job.findUnique({
      where: { shareableUrl },
      include: {
        jobAssessments: true
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found or link expired' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ error: 'This job is no longer accepting applications' });
    }

    // Check for duplicate application
    const existingApplicant = await prisma.applicant.findFirst({
      where: {
        jobId: job.id,
        email
      }
    });

    if (existingApplicant) {
      return res.status(409).json({ 
        error: 'You have already applied for this position',
        applicantId: existingApplicant.id
      });
    }

    // Upload CV to Firebase Storage if provided
    let cvUrl = null;
    let cvFilename = null;

    if (cvFile) {
      try {
        if (!storage) {
          throw new Error('Firebase Storage not configured');
        }

        const bucket = storage.bucket();
        const filename = `cvs/${job.id}/${Date.now()}_${cvFile.originalname}`;
        const file = bucket.file(filename);

        await file.save(cvFile.buffer, {
          metadata: {
            contentType: cvFile.mimetype,
          }
        });

        // Make file publicly accessible (with signed URL)
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
        });

        cvUrl = url;
        cvFilename = cvFile.originalname;
      } catch (error) {
        console.error('CV upload error:', error);
        // Continue without CV if upload fails
      }
    }

    // Parse answers if string
    let parsedAnswers = answers;
    if (typeof answers === 'string') {
      try {
        parsedAnswers = JSON.parse(answers);
      } catch (e) {
        parsedAnswers = { raw: answers };
      }
    }

    // Create applicant
    const applicant = await prisma.applicant.create({
      data: {
        jobId: job.id,
        name,
        email,
        phone: phone || null,
        fieldsJson: parsedAnswers || null,
        cvUrl,
        cvFilename,
        status: 'received'
      }
    });

    // Create assessment record if job has assessment
    if (job.jobAssessments && job.jobAssessments.length > 0) {
      await prisma.assessment.create({
        data: {
          applicantId: applicant.id,
          jobId: job.id,
          type: 'mcq',
          status: 'pending'
        }
      });
    }

    // Enqueue for background processing or process immediately
    try {
      if (backgroundJobsDisabled) {
        const result = await scoringService.processApplicant(applicant.id);
        // Optionally update status here if needed, e.g. 'scored'
        // await prisma.applicant.update({ where: { id: applicant.id }, data: { status: 'scored' } });
      } else {
        await scoringQueue.add('processApplicant', { applicantId: applicant.id });
      }
    } catch (queueError) {
      console.error('Queue/processing error:', queueError);
      // Continue even if queuing/processing fails
    }

    res.status(201).json({
      message: 'Application submitted successfully',
      applicantId: applicant.id,
      hasAssessment: job.jobAssessments && job.jobAssessments.length > 0,
      assessmentRequired: job.jobAssessments?.[0]?.isRequired || false
    });
  })
);

/**
 * Public: Get job details for application (no auth required)
 * GET /api/applicants/job/:shareableId
 */
router.get(
  '/job/:shareableId',
  param('shareableId').notEmpty(),
  asyncHandler(async (req, res) => {
    const { shareableId } = req.params;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const shareableUrl = `${frontendUrl}/apply/${shareableId}`;

    const job = await prisma.job.findUnique({
      where: { shareableUrl },
      include: {
        org: {
          select: {
            name: true
          }
        },
        jobAssessments: {
          select: {
            isRequired: true,
            timeLimit: true,
            passMark: true
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Return public job info (no sensitive data)
    res.json({
      id: job.id,
      title: job.title,
      description: job.description,
      company: job.org.name,
      status: job.status,
      applicationForm: job.applicationForm,
      hasAssessment: job.jobAssessments && job.jobAssessments.length > 0,
      assessmentInfo: job.jobAssessments?.[0] || null
    });
  })
);

/**
 * Get applicant details (authenticated)
 * GET /api/applicants/:id
 */
router.get(
  '/:id',
  authenticate,
  param('id').isString(),
  asyncHandler(async (req, res) => {
    const applicant = await prisma.applicant.findUnique({
      where: { id: req.params.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            orgId: true
          }
        },
        assessments: true,
        scores: {
          include: {
            feedback: {
              include: {
                recruiter: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!applicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    // Verify access
    if (applicant.job.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(applicant);
  })
);

/**
 * Get all applicants for a job (authenticated)
 * GET /api/applicants/job/:jobId/list
 */
router.get(
  '/job/:jobId/list',
  authenticate,
  param('jobId').isString(),
  asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const { page, limit, skip } = parsePaginationParams(req.query);
    const { status } = req.query;

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

    const where = {
      jobId,
      ...(status && { status })
    };

    const [applicants, total] = await Promise.all([
      prisma.applicant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          scores: {
            select: {
              finalScore: true,
              rank: true,
              percentile: true,
              status: true
            }
          },
          assessments: {
            select: {
              status: true,
              score: true
            }
          }
        }
      }),
      prisma.applicant.count({ where })
    ]);

    res.json(buildPaginationResponse(applicants, total, page, limit));
  })
);

/**
 * Update applicant status (authenticated)
 * PATCH /api/applicants/:id/status
 */
router.patch(
  '/:id/status',
  authenticate,
  param('id').isString(),
  body('status').isIn(['received', 'processing', 'scored', 'shortlisted', 'rejected']),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Get applicant and verify access
    const applicant = await prisma.applicant.findUnique({
      where: { id },
      include: {
        job: {
          select: { orgId: true }
        }
      }
    });

    if (!applicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    if (applicant.job.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await prisma.applicant.update({
      where: { id },
      data: { status }
    });

    res.json(updated);
  })
);

/**
 * Reprocess applicant (manual trigger for scoring)
 * POST /api/applicants/:id/reprocess
 */
router.post(
  '/:id/reprocess',
  authenticate,
  param('id').isString(),
  asyncHandler(async (req, res) => {
    // Get applicant and verify access
    const applicant = await prisma.applicant.findUnique({
      where: { id: req.params.id },
      include: {
        job: {
          select: { orgId: true }
        }
      }
    });

    if (!applicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    if (applicant.job.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Enqueue for processing
    await scoringQueue.add('processApplicant', {
      applicantId: applicant.id
    });

    res.json({ 
      message: 'Applicant queued for reprocessing',
      applicantId: applicant.id
    });
  })
);

/**
 * Delete applicant
 * DELETE /api/applicants/:id
 */
router.delete(
  '/:id',
  authenticate,
  param('id').isString(),
  asyncHandler(async (req, res) => {
    // Get applicant and verify access
    const applicant = await prisma.applicant.findUnique({
      where: { id: req.params.id },
      include: {
        job: {
          select: { orgId: true }
        }
      }
    });

    if (!applicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    if (applicant.job.orgId !== req.user.orgId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.applicant.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Applicant deleted successfully' });
  })
);

export default router;



