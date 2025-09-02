import express from 'express';
import { AuthController, authValidationRules } from '../controllers/authController';
import { validateRequest } from '../../../shared/middleware/validation';
import { authenticateToken } from '../../../shared/middleware/auth';
import { authLimiter, strictLimiter } from '../../../shared/middleware/rateLimiter';

const router = express.Router();

// Public routes (with rate limiting)
router.post('/register', 
  authLimiter,
  authValidationRules.register,
  validateRequest,
  AuthController.register
);

router.post('/login',
  authLimiter,
  authValidationRules.login,
  validateRequest,
  AuthController.login
);

router.post('/google-login',
  authLimiter,
  AuthController.googleLogin
);

router.post('/refresh-token',
  strictLimiter,
  AuthController.refreshToken
);

router.post('/forgot-password',
  authLimiter,
  authValidationRules.forgotPassword,
  validateRequest,
  AuthController.forgotPassword
);

router.post('/reset-password',
  authLimiter,
  authValidationRules.resetPassword,
  validateRequest,
  AuthController.resetPassword
);

router.get('/verify-email/:token',
  AuthController.verifyEmail
);

// Protected routes
router.post('/logout',
  authenticateToken,
  AuthController.logout
);

router.post('/change-password',
  authenticateToken,
  authValidationRules.changePassword,
  validateRequest,
  AuthController.changePassword
);

router.get('/profile',
  authenticateToken,
  AuthController.getProfile
);

export default router;
