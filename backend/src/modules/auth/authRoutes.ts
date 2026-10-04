import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { authLimiter } from '../../middleware/rateLimit';
import { dbService } from '../../services/db';
import { firebaseAdmin, isUsingMockFirebase } from '../../config/firebase';
import { BadRequestError } from '../../utils/errors';
import { logger } from '../../utils/logger';

const router = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

// POST /api/auth/register
router.post(
  '/register',
  authLimiter,
  validateRequest({ body: RegisterSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, firstName, lastName, phone } = req.body;

      let uid = `usr_${Date.now()}`;

      if (!isUsingMockFirebase()) {
        try {
          const userRecord = await firebaseAdmin.auth().createUser({
            email,
            password,
            displayName: `${firstName} ${lastName}`,
          });
          uid = userRecord.uid;
        } catch (err: any) {
          if (err.code === 'auth/email-already-exists') {
            throw new BadRequestError('An account with this email address already exists.');
          }
          throw err;
        }
      }

      // Save user base record in Firestore
      await dbService.setUser(uid, {
        email,
        role: 'STUDENT',
        createdAt: new Date().toISOString(),
      });

      // Initialize default student profile
      await dbService.saveProfile(uid, {
        id: `sp_${uid}`,
        userId: uid,
        fullName: `${firstName} ${lastName}`,
        email,
        phone,
        dob: '',
        gender: 'OTHER',
        domicileState: '',
        domicileDistrict: '',
        category: 'GENERAL',
        familyAnnualIncome: 0,
        isDisabled: false,
        minorityStatus: false,
        profileCompleteness: 20,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      logger.info('User successfully registered', { uid, email });

      res.status(201).json({
        success: true,
        data: {
          userId: uid,
          email,
          role: 'STUDENT',
          message: 'Account created successfully.',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  authLimiter,
  validateRequest({ body: LoginSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      // In real Firebase client flow, client signs in with Firebase Client SDK and sends ID Token
      // Here we provide a mock/token generation response for dev & API testing
      let uid = 'test-student-uid-1';
      let role = 'STUDENT';

      if (email.includes('admin')) {
        uid = 'test-admin-uid-1';
        role = 'ADMIN';
      }

      const existingUser = await dbService.getUser(uid);
      if (existingUser) {
        role = existingUser.role;
      }

      res.status(200).json({
        success: true,
        data: {
          token: `mock-token-${role.toLowerCase()}-${uid}`,
          userId: uid,
          email,
          role,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/auth/me
router.get(
  '/me',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;
      const profile = await dbService.getProfile(user.uid);

      res.status(200).json({
        success: true,
        data: {
          userId: user.uid,
          email: user.email,
          role: user.role,
          profileCompleted: Boolean(profile && profile.profileCompleteness >= 80),
          profileCompleteness: profile?.profileCompleteness || 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/logout
router.post(
  '/logout',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      data: {
        message: 'Logged out successfully.',
      },
    });
  }
);

export const authRoutes = router;
