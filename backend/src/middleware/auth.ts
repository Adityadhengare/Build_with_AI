import { Request, Response, NextFunction } from 'express';
import { firebaseAdmin, isUsingMockFirebase, mockStore } from '../config/firebase';
import { AuthenticatedUser, UserRole } from '../types';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { logger } from '../utils/logger';

// Augment Express Request interface to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Extracts and verifies Firebase ID Token from Authorization header
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or malformed Authorization header. Expected Bearer <token>'));
  }

  const token = authHeader.split('Bearer ')[1].trim();

  if (!token) {
    return next(new UnauthorizedError('Empty Bearer token provided'));
  }

  try {
    // 1. Test environment token handling (strictly isolated to test runner)
    if (process.env.NODE_ENV === 'test' && (token.startsWith('mock-') || token.startsWith('test-') || isUsingMockFirebase())) {
      let role: UserRole = 'STUDENT';
      let uid = token;
      let email = 'student@example.com';

      if (token.includes('admin')) {
        role = token.includes('super') ? 'SUPER_ADMIN' : 'ADMIN';
        uid = 'test-admin-uid-1';
        email = 'admin@scholarsaathi.in';
      } else if (token.includes('uid-2') || token.includes('user-2') || token.includes('user2') || token.includes('user-b')) {
        uid = 'test-student-uid-2';
        email = 'student2@example.com';
      } else if (token.includes('uid-1') || token.includes('user-1') || token.includes('student')) {
        uid = 'test-student-uid-1';
        email = 'student@example.com';
      }

      // Check if user has updated role in mockStore
      const userDoc = mockStore.get(`users/${uid}`);
      if (userDoc?.role) {
        role = userDoc.role;
      }

      req.user = { uid, email, role, isVerified: true };
      return next();
    }

    // 2. Local development mock mode — decode JWT payload without Admin SDK verification
    //    USE_FIREBASE_EMULATOR_OR_MOCK=true in .env enables this path.
    //    The Firebase client (frontend) still issues a real JWT; we just skip Admin verification.
    if (isUsingMockFirebase()) {
      try {
        // JWT is base64url encoded: header.payload.signature
        const payloadBase64 = token.split('.')[1];
        const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
        const payload = JSON.parse(payloadJson);
        const uid = payload.sub || payload.user_id || 'unknown-uid';
        const email = payload.email || '';
        req.user = {
          uid,
          email,
          role: 'STUDENT',
          isVerified: payload.email_verified ?? false,
        };
        logger.warn(`[DEV MOCK] Auth bypassed for uid=${uid}. DO NOT use USE_FIREBASE_EMULATOR_OR_MOCK=true in production.`);
        return next();
      } catch {
        return next(new UnauthorizedError('Could not decode token in mock mode. Ensure user is signed into Firebase.'));
      }
    }

    // 3. Production Firebase Admin Token Verification
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    
    // Check custom claims or fetch user record from Firestore for assigned role
    let role: UserRole = (decodedToken.role as UserRole) || 'STUDENT';

    // Verify against database role to prevent privilege escalation
    try {
      const db = firebaseAdmin.firestore();
      const userSnap = await db.collection('users').doc(decodedToken.uid).get();
      if (userSnap.exists) {
        const userData = userSnap.data();
        if (userData?.role) {
          role = userData.role as UserRole;
        }
      }
    } catch {
      // In case firestore read fails, fallback to verified token claims
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role,
      isVerified: decodedToken.email_verified ?? false,
    };

    return next();
  } catch (error) {
    logger.warn('Token verification failed:', { error: (error as Error).message });
    return next(new UnauthorizedError('Invalid or expired authentication token. Please sign in again.'));
  }
}

/**
 * Middleware that allows unauthenticated access but parses user if token exists
 */
export async function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.split('Bearer ')[1].trim();
    if (!token) return next();

    if (process.env.NODE_ENV === 'test' && (isUsingMockFirebase() || token.startsWith('mock-') || token.startsWith('test-'))) {
      let role: UserRole = 'STUDENT';
      let uid = 'test-student-uid-1';
      let email = 'student@example.com';

      if (token.includes('admin')) {
        role = 'ADMIN';
        uid = 'test-admin-uid-1';
        email = 'admin@scholarsaathi.in';
      }

      req.user = { uid, email, role, isVerified: true };
      return next();
    }

    if (isUsingMockFirebase()) {
      try {
        const payloadBase64 = token.split('.')[1];
        const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
        const payload = JSON.parse(payloadJson);
        const uid = payload.sub || payload.user_id || 'unknown-uid';
        const email = payload.email || '';
        req.user = {
          uid,
          email,
          role: 'STUDENT',
          isVerified: payload.email_verified ?? false,
        };
        return next();
      } catch {
        return next();
      }
    }

    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: (decodedToken.role as UserRole) || 'STUDENT',
      isVerified: decodedToken.email_verified ?? false,
    };
  } catch {
    // Silently continue for optional auth
  }

  next();
}

/**
 * Role-Based Access Control (RBAC) middleware
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Forbidden access attempt: User ${req.user.uid} with role ${req.user.role} attempted to access restricted endpoint`, {
        path: req.path,
        requiredRoles: allowedRoles,
      });
      return next(new ForbiddenError('You do not have administrative privileges to perform this action'));
    }

    next();
  };
}
