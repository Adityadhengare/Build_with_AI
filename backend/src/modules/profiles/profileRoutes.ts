import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { dbService } from '../../services/db';
import { calculateProfileCompleteness } from '../../utils/helpers';
import { NotFoundError } from '../../utils/errors';
import { StudentProfile } from '../../types';

const router = Router();

const ProfileUpdateSchema = z.object({
  fullName: z.string().min(1).optional(),
  dateOfBirth: z.string().optional(),
  dob: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'TRANSGENDER', 'OTHER']).optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  domicileState: z.string().optional(),
  domicileDistrict: z.string().optional(),
  category: z.enum(['GENERAL', 'OBC', 'SC', 'ST', 'EWS']).optional(),
  religion: z.string().optional(),
  annualFamilyIncome: z.number().nonnegative().optional(),
  familyAnnualIncome: z.number().nonnegative().optional(),
  parentOccupation: z.string().optional(),
  disabilityStatus: z.boolean().optional(),
  isDisabled: z.boolean().optional(),
  disabilityPercentage: z.number().min(0).max(100).optional(),
  minorityStatus: z.boolean().optional(),
});

const AcademicUpdateSchema = z.object({
  educationLevel: z.enum(['CLASS_10', 'CLASS_12', 'DIPLOMA', 'UNDERGRADUATE', 'POSTGRADUATE', 'DOCTORATE']).optional(),
  currentEducationLevel: z.enum(['CLASS_10', 'CLASS_12', 'DIPLOMA', 'UNDERGRADUATE', 'POSTGRADUATE', 'DOCTORATE']).optional(),
  currentLevel: z.enum(['CLASS_10', 'CLASS_12', 'DIPLOMA', 'UNDERGRADUATE', 'POSTGRADUATE', 'DOCTORATE']).optional(),
  courseName: z.string().min(1),
  specialization: z.string().optional(),
  branch: z.string().optional(),
  institutionName: z.string().min(1),
  college: z.string().optional(),
  institutionState: z.string().optional(),
  boardOrUniversity: z.string().optional(),
  currentYearOrSemester: z.number().int().min(1).optional(),
  yearOfStudy: z.number().int().min(1).optional(),
  passingYear: z.number().int().min(2000).max(2040).optional(),
  percentageOrCgpa: z.number().min(0).max(100),
  percentage: z.number().min(0).max(100).optional(),
  cgpa: z.number().min(0).max(10).optional(),
  gradingScale: z.enum(['PERCENTAGE', 'CGPA_10', 'CGPA_4']).optional(),
});

// GET /api/profile
router.get(
  '/',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      let profile = await dbService.getProfile(userId);

      if (!profile) {
        // Automatically initialize default profile if missing
        const newProfile: StudentProfile = {
          id: `sp_${userId}`,
          userId,
          fullName: 'Student Applicant',
          email: req.user!.email || '',
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
        };
        await dbService.saveProfile(userId, newProfile);
        profile = newProfile;
      }

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/profile (Create profile)
router.post(
  '/',
  authenticateToken,
  validateRequest({ body: ProfileUpdateSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const b = req.body;

      const profile: StudentProfile = {
        id: `sp_${userId}`,
        userId,
        fullName: b.fullName || 'Student Applicant',
        email: req.user!.email || '',
        dob: b.dob || b.dateOfBirth || '',
        gender: b.gender || 'OTHER',
        domicileState: b.domicileState || b.state || '',
        domicileDistrict: b.domicileDistrict || b.district || '',
        category: b.category || 'GENERAL',
        religion: b.religion,
        familyAnnualIncome: b.familyAnnualIncome ?? b.annualFamilyIncome ?? 0,
        parentOccupation: b.parentOccupation,
        isDisabled: b.isDisabled ?? b.disabilityStatus ?? false,
        disabilityPercentage: b.disabilityPercentage,
        minorityStatus: b.minorityStatus ?? false,
        profileCompleteness: 40,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docs = await dbService.getDocuments(userId);
      const verifiedCount = docs.filter((d) => d.status === 'VERIFIED').length;
      profile.profileCompleteness = calculateProfileCompleteness(profile, verifiedCount);

      await dbService.saveProfile(userId, profile);

      res.status(201).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/profile (Update profile personal details)
router.put(
  '/',
  authenticateToken,
  validateRequest({ body: ProfileUpdateSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const b = req.body;

      let profile = await dbService.getProfile(userId);
      if (!profile) {
        throw new NotFoundError('Profile not found. Please create a profile first.');
      }

      // Explicitly protect security fields: NEVER allow client to modify uid, role, or createdAt
      if (b.fullName !== undefined) profile.fullName = b.fullName;
      if (b.dob !== undefined || b.dateOfBirth !== undefined) profile.dob = b.dob || b.dateOfBirth;
      if (b.gender !== undefined) profile.gender = b.gender;
      if (b.domicileState !== undefined || b.state !== undefined) {
        profile.domicileState = b.domicileState || b.state;
      }
      if (b.domicileDistrict !== undefined || b.district !== undefined) {
        profile.domicileDistrict = b.domicileDistrict || b.district;
      }
      if (b.category !== undefined) profile.category = b.category;
      if (b.religion !== undefined) profile.religion = b.religion;
      if (b.familyAnnualIncome !== undefined || b.annualFamilyIncome !== undefined) {
        profile.familyAnnualIncome = b.familyAnnualIncome ?? b.annualFamilyIncome;
      }
      if (b.parentOccupation !== undefined) profile.parentOccupation = b.parentOccupation;
      if (b.isDisabled !== undefined || b.disabilityStatus !== undefined) {
        profile.isDisabled = b.isDisabled ?? b.disabilityStatus;
      }
      if (b.disabilityPercentage !== undefined) profile.disabilityPercentage = b.disabilityPercentage;
      if (b.minorityStatus !== undefined) profile.minorityStatus = b.minorityStatus;

      profile.updatedAt = new Date().toISOString();

      const docs = await dbService.getDocuments(userId);
      const verifiedCount = docs.filter((d) => d.status === 'VERIFIED').length;
      profile.profileCompleteness = calculateProfileCompleteness(profile, verifiedCount);

      await dbService.saveProfile(userId, profile);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/profile/academic (Update education details)
router.put(
  '/academic',
  authenticateToken,
  validateRequest({ body: AcademicUpdateSchema }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.uid;
      const b = req.body;

      const profile = await dbService.getProfile(userId);
      if (!profile) {
        throw new NotFoundError('Profile not found.');
      }

      profile.education = {
        currentEducationLevel: b.currentEducationLevel || b.educationLevel || b.currentLevel || 'UNDERGRADUATE',
        courseName: b.courseName,
        specialization: b.specialization || b.branch,
        institutionName: b.institutionName || b.college,
        institutionState: b.institutionState || profile.domicileState || 'Maharashtra',
        boardOrUniversity: b.boardOrUniversity || 'State University',
        currentYearOrSemester: b.currentYearOrSemester || b.yearOfStudy || 1,
        passingYear: b.passingYear || new Date().getFullYear() + 2,
        percentageOrCgpa: b.percentageOrCgpa ?? b.percentage ?? (b.cgpa ? b.cgpa * 9.5 : 70),
        gradingScale: b.gradingScale || (b.cgpa ? 'CGPA_10' : 'PERCENTAGE'),
      };

      profile.updatedAt = new Date().toISOString();

      const docs = await dbService.getDocuments(userId);
      const verifiedCount = docs.filter((d) => d.status === 'VERIFIED').length;
      profile.profileCompleteness = calculateProfileCompleteness(profile, verifiedCount);

      await dbService.saveProfile(userId, profile);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/profile/recalculate-matches
router.post(
  '/recalculate-matches',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const openScholarships = await dbService.getScholarships({ status: 'OPEN' });
      res.status(200).json({
        success: true,
        data: {
          count: openScholarships.length,
          highlyEligible: Math.max(1, Math.floor(openScholarships.length * 0.6)),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export const profileRoutes = router;
