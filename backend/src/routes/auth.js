import express from 'express';
import prisma from '../config/database.js';
import { body, validationResult } from 'express-validator';
import { auth as firebaseAuth } from '../config/firebase.js';

const router = express.Router();

// Sign up - Firebase Auth Version
router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').notEmpty(),
    body('orgName').notEmpty(),
    body('firebaseUid').notEmpty(), // Firebase UID from frontend
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, orgName, firebaseUid } = req.body;

    try {
      // Verify Firebase user exists
      if (firebaseAuth) {
        const firebaseUser = await firebaseAuth.getUser(firebaseUid);
        if (firebaseUser.email !== email) {
          return res.status(400).json({ error: 'Firebase UID does not match email' });
        }
      }

      // Check if user exists in our database
      const existingRecruiter = await prisma.recruiter.findUnique({ where: { email } });
      if (existingRecruiter) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Create org and recruiter (no password needed - Firebase handles that)
      const org = await prisma.org.create({
        data: {
          name: orgName,
          recruiters: {
            create: {
              email,
              name,
              passwordHash: firebaseUid, // Store Firebase UID instead of password
              role: 'admin',
            },
          },
        },
        include: { recruiters: true },
      });

      const recruiter = org.recruiters[0];

      res.status(201).json({
        message: 'Account created successfully',
        user: {
          id: recruiter.id,
          email: recruiter.email,
          name: recruiter.name,
          orgId: org.id,
          role: recruiter.role,
          firebaseUid: firebaseUid,
        },
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Login - Firebase Auth Version
// Note: Firebase handles login on frontend, backend just verifies token
router.post(
  '/verify',
  [
    body('firebaseToken').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firebaseToken } = req.body;

    try {
      if (!firebaseAuth) {
        return res.status(500).json({ error: 'Firebase Auth not configured' });
      }

      // Verify Firebase token
      const decodedToken = await firebaseAuth.verifyIdToken(firebaseToken);
      const { email, uid } = decodedToken;

      // Find user in our database
      const recruiter = await prisma.recruiter.findUnique({ 
        where: { email },
        include: { org: true }
      });

      if (!recruiter) {
        return res.status(404).json({ error: 'User not found. Please sign up first.' });
      }

      res.json({
        message: 'Authentication successful',
        user: {
          id: recruiter.id,
          email: recruiter.email,
          name: recruiter.name,
          orgId: recruiter.orgId,
          orgName: recruiter.org.name,
          role: recruiter.role,
          firebaseUid: uid,
        },
      });
    } catch (error) {
      console.error('Verification error:', error);
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  }
);

// Sync endpoint - For frontend AuthContext to fetch/sync user data
router.post('/sync', async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!firebaseAuth) {
      return res.status(500).json({ error: 'Firebase Auth not configured' });
    }

    // Verify Firebase token
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    const { email, uid } = decodedToken;

    // Find user in our database
    const recruiter = await prisma.recruiter.findUnique({
      where: { email },
      include: { org: true }
    });

    if (!recruiter) {
      return res.status(404).json({ error: 'User not found. Please complete signup.' });
    }

    res.json({
      user: {
        uid: recruiter.id,
        email: recruiter.email,
        name: recruiter.name,
        role: 'recruiter', // For now, all users are recruiters
        orgId: recruiter.orgId,
        orgName: recruiter.org.name,
      },
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Recruiter dashboard data endpoint
router.get('/recruiter/dashboard', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    const { email } = decodedToken;

    const recruiter = await prisma.recruiter.findUnique({ where: { email } });
    if (!recruiter) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch dashboard stats
    const [totalJobs, activeJobs, applicantsData] = await Promise.all([
      prisma.job.count({ where: { orgId: recruiter.orgId } }),
      prisma.job.count({ where: { orgId: recruiter.orgId, status: 'active' } }),
      prisma.applicant.aggregate({
        where: { job: { orgId: recruiter.orgId } },
        _count: true,
        _avg: { finalScore: true }
      })
    ]);

    const recentJobs = await prisma.job.findMany({
      where: { orgId: recruiter.orgId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { applicants: true }
        },
        applicants: {
          select: { finalScore: true }
        }
      }
    });

    // Format jobs for frontend
    const formattedJobs = recentJobs.map(job => ({
      id: job.id,
      title: job.title,
      status: job.status || 'active',
      applicants: job._count.applicants,
      createdAt: job.createdAt,
      avgScore: job.applicants.length > 0
        ? Math.round(job.applicants.reduce((sum, a) => sum + (a.finalScore || 0), 0) / job.applicants.length)
        : null
    }));

    res.json({
      totalJobs,
      activeJobs,
      totalApplicants: applicantsData._count || 0,
      avgScore: Math.round(applicantsData._avg.finalScore || 0),
      recentJobs: formattedJobs
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;



