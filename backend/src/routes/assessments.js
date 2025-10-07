import express from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../config/database.js';
import { optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import assessmentService from '../services/assessmentService.js';
import { calculateTimeRemaining } from '../utils/helpers.js';

const router = express.Router();

/**
 * Get assessment questions for applicant (public endpoint)
 * GET /api/assessments/job/:shareableId
 */
router.get(
  '/job/:shareableId',
  param('shareableId').notEmpty(),
  asyncHandler(async (req, res) => {
    const { shareableId } = req.params;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const shareableUrl = `${frontendUrl}/apply/${shareableId}`;

    // Find job
    const job = await prisma.job.findUnique({
      where: { shareableUrl }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get assessment questions
    const assessmentData = await assessmentService.getJobAssessmentQuestions(job.id);

    if (!assessmentData) {
      return res.status(404).json({ error: 'No assessment configured for this job' });
    }

    // Don't send correct answers to frontend
    const questions = assessmentData.questions.map(q => ({
      id: q.id,
      type: q.type,
      category: q.category,
      difficulty: q.difficulty,
      question: q.question,
      options: q.options
      // correctAnswer and explanation are excluded
    }));

    res.json({
      questions,
      timeLimit: assessmentData.timeLimit,
      passMark: assessmentData.passMark,
      isRequired: assessmentData.isRequired,
      totalQuestions: questions.length
    });
  })
);

/**
 * Start assessment (creates/updates assessment record)
 * POST /api/assessments/start
 */
router.post(
  '/start',
  [
    body('applicantId').notEmpty().isString(),
    body('jobId').notEmpty().isString(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { applicantId, jobId } = req.body;

    // Verify applicant and job exist
    const applicant = await prisma.applicant.findUnique({
      where: { id: applicantId }
    });

    if (!applicant || applicant.jobId !== jobId) {
      return res.status(404).json({ error: 'Applicant not found for this job' });
    }

    // Find or create assessment
    let assessment = await prisma.assessment.findFirst({
      where: {
        applicantId,
        jobId
      }
    });

    if (!assessment) {
      // Create new assessment
      assessment = await prisma.assessment.create({
        data: {
          applicantId,
          jobId,
          type: 'mcq',
          status: 'started',
          startedAt: new Date()
        }
      });
    } else if (assessment.status === 'pending') {
      // Start existing assessment
      assessment = await prisma.assessment.update({
        where: { id: assessment.id },
        data: {
          status: 'started',
          startedAt: new Date()
        }
      });
    } else if (assessment.status === 'completed') {
      return res.status(400).json({ 
        error: 'Assessment already completed',
        assessment 
      });
    }

    // Get assessment questions
    const assessmentData = await assessmentService.getJobAssessmentQuestions(jobId);

    if (!assessmentData) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Calculate time remaining
    const timeRemaining = calculateTimeRemaining(
      assessment.startedAt,
      assessmentData.timeLimit
    );

    if (timeRemaining === 0) {
      // Time expired, mark as completed with 0 score
      await prisma.assessment.update({
        where: { id: assessment.id },
        data: {
          status: 'completed',
          finishedAt: new Date(),
          score: 0
        }
      });

      return res.status(400).json({ error: 'Assessment time expired' });
    }

    res.json({
      assessmentId: assessment.id,
      status: assessment.status,
      startedAt: assessment.startedAt,
      timeRemaining,
      timeLimit: assessmentData.timeLimit
    });
  })
);

/**
 * Submit assessment answers (public endpoint)
 * POST /api/assessments/submit
 */
router.post(
  '/submit',
  [
    body('assessmentId').optional().isString(),
    body('applicantId').notEmpty().isString(),
    body('jobId').notEmpty().isString(),
    body('answers').isArray(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { assessmentId, applicantId, jobId, answers } = req.body;

    // Find or create assessment
    let assessment;
    
    if (assessmentId) {
      assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId }
      });
    } else {
      assessment = await prisma.assessment.findFirst({
        where: { applicantId, jobId }
      });
    }

    if (!assessment) {
      // Create assessment if it doesn't exist
      assessment = await prisma.assessment.create({
        data: {
          applicantId,
          jobId,
          type: 'mcq',
          status: 'started',
          startedAt: new Date()
        }
      });
    }

    if (assessment.status === 'completed') {
      return res.status(400).json({ error: 'Assessment already completed' });
    }

    // Get assessment questions
    const assessmentData = await assessmentService.getJobAssessmentQuestions(jobId);

    if (!assessmentData) {
      return res.status(404).json({ error: 'Assessment questions not found' });
    }

    // Check time limit
    if (assessmentData.timeLimit && assessment.startedAt) {
      const timeRemaining = calculateTimeRemaining(
        assessment.startedAt,
        assessmentData.timeLimit
      );

      if (timeRemaining === 0) {
        // Time expired, but still score the answers
        console.log('Assessment submitted after time limit');
      }
    }

    // Score the assessment
    const scoreResult = await assessmentService.scoreAssessment(
      answers,
      assessmentData.questions
    );

    // Update assessment
    const updatedAssessment = await prisma.assessment.update({
      where: { id: assessment.id },
      data: {
        answersJson: answers,
        score: scoreResult.score,
        status: 'completed',
        finishedAt: new Date()
      }
    });

    // Check if passed
    const passed = scoreResult.score >= assessmentData.passMark;

    res.json({
      message: 'Assessment submitted successfully',
      assessment: {
        id: updatedAssessment.id,
        score: scoreResult.score,
        percentage: scoreResult.percentage,
        correctCount: scoreResult.correctCount,
        totalQuestions: scoreResult.totalQuestions,
        passed,
        passMark: assessmentData.passMark
      }
    });
  })
);

/**
 * Get assessment results (public - for applicant to see their results)
 * GET /api/assessments/:assessmentId/results
 */
router.get(
  '/:assessmentId/results',
  param('assessmentId').isString(),
  asyncHandler(async (req, res) => {
    const assessment = await prisma.assessment.findUnique({
      where: { id: req.params.assessmentId }
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.status !== 'completed') {
      return res.status(400).json({ error: 'Assessment not completed yet' });
    }

    // Get assessment configuration
    const assessmentData = await assessmentService.getJobAssessmentQuestions(assessment.jobId);

    res.json({
      assessmentId: assessment.id,
      score: assessment.score,
      status: assessment.status,
      startedAt: assessment.startedAt,
      finishedAt: assessment.finishedAt,
      passed: assessment.score >= (assessmentData?.passMark || 60),
      passMark: assessmentData?.passMark || 60
    });
  })
);

/**
 * Get assessment status
 * GET /api/assessments/status/:applicantId/:jobId
 */
router.get(
  '/status/:applicantId/:jobId',
  [
    param('applicantId').isString(),
    param('jobId').isString(),
  ],
  asyncHandler(async (req, res) => {
    const { applicantId, jobId } = req.params;

    const assessment = await prisma.assessment.findFirst({
      where: { applicantId, jobId }
    });

    if (!assessment) {
      return res.json({
        hasAssessment: false,
        status: null
      });
    }

    // Get time remaining if started
    let timeRemaining = null;
    if (assessment.status === 'started' && assessment.startedAt) {
      const assessmentData = await assessmentService.getJobAssessmentQuestions(jobId);
      if (assessmentData?.timeLimit) {
        timeRemaining = calculateTimeRemaining(
          assessment.startedAt,
          assessmentData.timeLimit
        );
      }
    }

    res.json({
      hasAssessment: true,
      assessmentId: assessment.id,
      status: assessment.status,
      score: assessment.score,
      startedAt: assessment.startedAt,
      finishedAt: assessment.finishedAt,
      timeRemaining
    });
  })
);

export default router;



