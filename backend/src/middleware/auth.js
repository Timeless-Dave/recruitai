import prisma from '../config/database.js';
import { auth as firebaseAuth } from '../config/firebase.js';

/**
 * Firebase Authentication Middleware
 */
export async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    if (!firebaseAuth) {
      return res.status(500).json({ error: 'Firebase Auth not configured' });
    }

    // Verify Firebase token
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    const { email, uid, name: firebaseName } = decodedToken;
    
    // Find user in our database
    let recruiter = await prisma.recruiter.findFirst({
      where: { email },
      include: { org: true }
    });

    // Self-heal: If Firebase user exists but no database record, create it
    if (!recruiter) {
      console.log(`[Auth] Creating missing database record for Firebase user: ${email}`);
      const fallbackName = (firebaseName || email.split('@')[0]).trim();
      const orgName = `${fallbackName}'s Organization`;
      
      const org = await prisma.org.create({
        data: {
          name: orgName,
          recruiters: {
            create: {
              email,
              name: fallbackName,
              passwordHash: uid,
              role: 'admin',
            },
          },
        },
        include: { recruiters: true },
      });
      
      recruiter = org.recruiters[0];
      recruiter.org = org;
    }

    req.user = {
      id: recruiter.id,
      email: recruiter.email,
      orgId: recruiter.orgId,
      role: recruiter.role,
      firebaseUid: uid
    };

    return next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Check if user has admin role
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}

/**
 * Check if user belongs to organization
 */
export function requireOrgAccess(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const orgId = req.params.orgId || req.body.orgId || req.query.orgId;

  if (orgId && req.user.orgId !== orgId) {
    return res.status(403).json({ error: 'Access denied to this organization' });
  }

  next();
}

/**
 * Optional authentication (don't fail if no token)
 */
export async function optionalAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token || !firebaseAuth) {
      return next();
    }

    const decodedToken = await firebaseAuth.verifyIdToken(token);
    const recruiter = await prisma.recruiter.findFirst({
      where: { email: decodedToken.email }
    });

    if (recruiter) {
      req.user = {
        id: recruiter.id,
        email: recruiter.email,
        orgId: recruiter.orgId,
        role: recruiter.role,
        firebaseUid: decodedToken.uid
      };
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
}



