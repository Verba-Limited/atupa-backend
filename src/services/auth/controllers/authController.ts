import { Request, Response } from 'express';
import { body } from 'express-validator';
import crypto from 'crypto';
import { User, UserDocument } from '../models/User';
import { JwtUtil } from '../../../shared/utils/jwt';
import { ResponseUtil } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/middleware/auth';

export const authValidationRules = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('First name must be at least 2 characters long'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Last name must be at least 2 characters long')
  ],
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  forgotPassword: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email')
  ],
  resetPassword: [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
  ],
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
  ]
};

export class AuthController {
  // Register new user
  static async register(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password, firstName, lastName, name } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return ResponseUtil.error(res, 'User with this email already exists', null, 409);
      }

      // Create new user
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        name: name || (firstName && lastName ? `${firstName} ${lastName}` : email.split('@')[0]),
        verificationToken: crypto.randomBytes(32).toString('hex'),
        verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      await user.save();

      // Generate tokens
      const tokens = JwtUtil.generateTokens({
        id: user._id,
        email: user.email,
        isVerified: user.isVerified
      });

      // Save refresh token
      user.refreshToken = tokens.refreshToken;
      await user.save();

      // TODO: Send verification email
      console.log(`Verification token for ${email}: ${user.verificationToken}`);

      return ResponseUtil.success(res, {
        user: user.toJSON(),
        tokens
      }, 'User registered successfully. Please check your email for verification.', 201);

    } catch (error) {
      console.error('Registration error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Login user
  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      // Find user and check password
      const user = await (User as any).findByCredentials(email, password);

      // Generate tokens
      const tokens = JwtUtil.generateTokens({
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
        subscription: user.subscription
      });

      // Save refresh token
      user.refreshToken = tokens.refreshToken;
      await user.save();

      return ResponseUtil.success(res, {
        user: user.toJSON(),
        tokens
      }, 'Login successful');

    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('locked')) {
          return ResponseUtil.error(res, error.message, null, 423);
        }
        if (error.message.includes('Invalid credentials')) {
          return ResponseUtil.error(res, 'Invalid email or password', null, 401);
        }
      }
      
      return ResponseUtil.serverError(res, error);
    }
  }

  // Google OAuth login
  static async googleLogin(req: Request, res: Response): Promise<Response> {
    try {
      const { idToken, email, name, picture } = req.body;

      if (!email) {
        return ResponseUtil.error(res, 'Email is required for Google authentication');
      }

      // Find or create user
      let user = await User.findOne({ email });
      
      if (!user) {
        // Create new user from Google data
        user = new User({
          email,
          name,
          profileImage: picture,
          isVerified: true, // Google accounts are pre-verified
          password: crypto.randomBytes(32).toString('hex') // Random password for Google users
        });
        await user.save();
      } else if (picture && !user.profileImage) {
        // Update profile image if not set
        user.profileImage = picture;
        await user.save();
      }

      // Generate tokens
      const tokens = JwtUtil.generateTokens({
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
        subscription: user.subscription
      });

      // Save refresh token
      user.refreshToken = tokens.refreshToken;
      await user.save();

      return ResponseUtil.success(res, {
        user: user.toJSON(),
        tokens
      }, 'Google login successful');

    } catch (error) {
      console.error('Google login error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Refresh token
  static async refreshToken(req: Request, res: Response): Promise<Response> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return ResponseUtil.error(res, 'Refresh token is required', null, 401);
      }

      // Verify refresh token
      const decoded = JwtUtil.verifyRefreshToken(refreshToken);
      
      // Find user and verify refresh token
      const user = await User.findById(decoded.id);
      if (!user || user.refreshToken !== refreshToken) {
        return ResponseUtil.error(res, 'Invalid refresh token', null, 401);
      }

      // Generate new tokens
      const tokens = JwtUtil.generateTokens({
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
        subscription: user.subscription
      });

      // Update refresh token
      user.refreshToken = tokens.refreshToken;
      await user.save();

      return ResponseUtil.success(res, { tokens }, 'Token refreshed successfully');

    } catch (error) {
      console.error('Refresh token error:', error);
      return ResponseUtil.error(res, 'Invalid or expired refresh token', null, 401);
    }
  }

  // Logout
  static async logout(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const user = await User.findById(req.user?.id);
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }

      return ResponseUtil.success(res, null, 'Logout successful');

    } catch (error) {
      console.error('Logout error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Verify email
  static async verifyEmail(req: Request, res: Response): Promise<Response> {
    try {
      const { token } = req.params;

      const user = await User.findOne({
        verificationToken: token,
        verificationExpires: { $gt: Date.now() }
      });

      if (!user) {
        return ResponseUtil.error(res, 'Invalid or expired verification token');
      }

      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationExpires = undefined;
      await user.save();

      return ResponseUtil.success(res, null, 'Email verified successfully');

    } catch (error) {
      console.error('Email verification error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Forgot password
  static async forgotPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if email exists
        return ResponseUtil.success(res, null, 'If the email exists, a reset link has been sent');
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      // TODO: Send reset email
      console.log(`Password reset token for ${email}: ${resetToken}`);

      return ResponseUtil.success(res, null, 'If the email exists, a reset link has been sent');

    } catch (error) {
      console.error('Forgot password error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Reset password
  static async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { token, password } = req.body;

      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        return ResponseUtil.error(res, 'Invalid or expired reset token');
      }

      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.refreshToken = undefined; // Invalidate all sessions
      await user.save();

      return ResponseUtil.success(res, null, 'Password reset successfully');

    } catch (error) {
      console.error('Reset password error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Change password
  static async changePassword(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user?.id);
      if (!user) {
        return ResponseUtil.error(res, 'User not found', null, 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return ResponseUtil.error(res, 'Current password is incorrect', null, 400);
      }

      // Update password
      user.password = newPassword;
      user.refreshToken = undefined; // Invalidate all sessions
      await user.save();

      return ResponseUtil.success(res, null, 'Password changed successfully');

    } catch (error) {
      console.error('Change password error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Get current user profile
  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const user = await User.findById(req.user?.id);
      if (!user) {
        return ResponseUtil.error(res, 'User not found', null, 404);
      }

      return ResponseUtil.success(res, user.toJSON(), 'Profile retrieved successfully');

    } catch (error) {
      console.error('Get profile error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }
}
