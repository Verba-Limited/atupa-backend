import express from 'express';
import multer from 'multer';
import path from 'path';
import { UserController, userValidationRules } from '../controllers/userController';
import { validateRequest } from '../../../shared/middleware/validation';
import { authenticateToken } from '../../../shared/middleware/auth';
import { generalLimiter } from '../../../shared/middleware/rateLimiter';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Protected routes (require authentication)
router.get('/profile',
  authenticateToken,
  UserController.getProfile
);

router.put('/profile',
  authenticateToken,
  userValidationRules.updateProfile,
  validateRequest,
  UserController.updateProfile
);

router.put('/preferences',
  authenticateToken,
  userValidationRules.updatePreferences,
  validateRequest,
  UserController.updatePreferences
);

router.post('/profile/image',
  authenticateToken,
  upload.single('profileImage'),
  UserController.uploadProfileImage
);

// Public routes
router.get('/public/:userId',
  generalLimiter,
  UserController.getPublicProfile
);

// Internal service routes (should be secured with service authentication in production)
router.post('/sync',
  UserController.createOrSyncProfile
);

export default router;
