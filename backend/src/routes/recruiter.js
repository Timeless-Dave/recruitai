import express from 'express';
import prisma from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * Get recruiter dashboard data
 * GET /api/recruiter/dashboard
 */
router.get(
  '/dashboard',
  authenticate,
  asyncHandler(async (req, res) => {
    const orgId = req.user.orgId;

    // Get total jobs count
    const totalJobs = await prisma.job.count({
      where: { orgId }
    });

    // Get active jobs count
    const activeJobs = await prisma.job.count({
      where: { 
        orgId,
        status: 'active'
      }
    });

    // Get total applicants count
    const totalApplicants = await prisma.applicant.count({
      where: {
        job: {
          orgId
        }
      }
    });

    // Get average score across all applicants
    const scoresAgg = await prisma.applicantScore.aggregate({
      where: {
        applicant: {
          job: {
            orgId
          }
        }
      },
      _avg: {
        finalScore: true
      }
    });

    const avgScore = scoresAgg._avg.finalScore || 0;

    // Get recent jobs with applicant counts
    const recentJobs = await prisma.job.findMany({
      where: { orgId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            applicants: true
          }
        }
      }
    });

    // Transform recent jobs to match expected format
    const formattedJobs = recentJobs.map(job => ({
      id: job.id,
      title: job.title,
      status: job.status,
      applicants: job._count.applicants,
      createdAt: job.createdAt.toISOString(),
    }));

    res.json({
      totalJobs,
      activeJobs,
      totalApplicants,
      avgScore: Math.round(avgScore * 10) / 10,
      recentJobs: formattedJobs
    });
  })
);

/**
 * Get recruiter statistics
 * GET /api/recruiter/stats
 */
router.get(
  '/stats',
  authenticate,
  asyncHandler(async (req, res) => {
    const orgId = req.user.orgId;

    // Get jobs by status
    const jobsByStatus = await prisma.job.groupBy({
      by: ['status'],
      where: { orgId },
      _count: true
    });

    // Get applicants by status
    const applicantsByStatus = await prisma.applicant.groupBy({
      by: ['status'],
      where: {
        job: { orgId }
      },
      _count: true
    });

    // Get recent applicants
    const recentApplicants = await prisma.applicant.findMany({
      where: {
        job: { orgId }
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          select: {
            title: true
          }
        },
        scores: {
          select: {
            finalScore: true,
            rank: true
          }
        }
      }
    });

    res.json({
      jobsByStatus: jobsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {}),
      applicantsByStatus: applicantsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {}),
      recentApplicants
    });
  })
);

export default router;

