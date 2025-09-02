import { Request, Response } from 'express';
import { body } from 'express-validator';
import { UserProfile } from '../models/UserProfile';
import { ResponseUtil } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/middleware/auth';

export const userValidationRules = {
  updateProfile: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('First name must be at least 2 characters long'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Last name must be at least 2 characters long'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters long'),
    body('emailVisibility')
      .optional()
      .isBoolean()
      .withMessage('Email visibility must be a boolean')
  ],
  updatePreferences: [
    body('notifications')
      .optional()
      .isBoolean()
      .withMessage('Notifications must be a boolean'),
    body('sound')
      .optional()
      .isBoolean()
      .withMessage('Sound must be a boolean'),
    body('vibration')
      .optional()
      .isBoolean()
      .withMessage('Vibration must be a boolean'),
    body('language')
      .optional()
      .isString()
      .trim()
      .withMessage('Language must be a string')
  ]
};

export class UserController {
  // Get user profile
  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const user = await UserProfile.findById(req.user?.id);
      if (!user) {
        return ResponseUtil.notFound(res, 'User profile not found');
      }

      return ResponseUtil.success(res, user, 'Profile retrieved successfully');
    } catch (error) {
      console.error('Get profile error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Update user profile
  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { firstName, lastName, name, emailVisibility } = req.body;
      
      const updateData: any = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (name !== undefined) updateData.name = name;
      if (emailVisibility !== undefined) updateData.emailVisibility = emailVisibility;

      const user = await UserProfile.findByIdAndUpdate(
        req.user?.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!user) {
        return ResponseUtil.notFound(res, 'User profile not found');
      }

      return ResponseUtil.success(res, user, 'Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Update user preferences
  static async updatePreferences(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { notifications, sound, vibration, language } = req.body;
      
      const updateData: any = {};
      if (notifications !== undefined) updateData['preferences.notifications'] = notifications;
      if (sound !== undefined) updateData['preferences.sound'] = sound;
      if (vibration !== undefined) updateData['preferences.vibration'] = vibration;
      if (language !== undefined) updateData['preferences.language'] = language;

      const user = await UserProfile.findByIdAndUpdate(
        req.user?.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!user) {
        return ResponseUtil.notFound(res, 'User profile not found');
      }

      return ResponseUtil.success(res, user.preferences, 'Preferences updated successfully');
    } catch (error) {
      console.error('Update preferences error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Upload profile image
  static async uploadProfileImage(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      if (!req.file) {
        return ResponseUtil.error(res, 'No image file provided');
      }

      // In a real implementation, you would upload to cloud storage (AWS S3, Cloudinary, etc.)
      const imageUrl = `/uploads/profiles/${req.file.filename}`;

      const user = await UserProfile.findByIdAndUpdate(
        req.user?.id,
        { profileImage: imageUrl },
        { new: true }
      );

      if (!user) {
        return ResponseUtil.notFound(res, 'User profile not found');
      }

      return ResponseUtil.success(res, { profileImage: user.profileImage }, 'Profile image updated successfully');
    } catch (error) {
      console.error('Upload profile image error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Get public profile
  static async getPublicProfile(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;
      
      const user = await UserProfile.findById(userId).select('name firstName lastName profileImage emailVisibility email');
      if (!user) {
        return ResponseUtil.notFound(res, 'User not found');
      }

      // Filter out email if visibility is disabled
      const publicProfile: any = {
        id: user._id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage
      };

      if (user.emailVisibility) {
        publicProfile.email = user.email;
      }

      return ResponseUtil.success(res, publicProfile, 'Public profile retrieved successfully');
    } catch (error) {
      console.error('Get public profile error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Create or sync user profile (called from auth service)
  static async createOrSyncProfile(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, email, firstName, lastName, name, profileImage, isVerified } = req.body;

      const user = await UserProfile.findOneAndUpdate(
        { _id: userId },
        {
          email,
          firstName,
          lastName,
          name,
          profileImage,
          isVerified
        },
        { 
          upsert: true, 
          new: true, 
          runValidators: true 
        }
      );

      return ResponseUtil.success(res, user, 'User profile created/synced successfully');
    } catch (error) {
      console.error('Create/sync profile error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }
}
