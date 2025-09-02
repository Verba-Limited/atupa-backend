import express from 'express';
import { ProgressController, progressValidationRules } from '../controllers/progressController';
import { validateRequest } from '../../../shared/middleware/validation';
import { authenticateToken } from '../../../shared/middleware/auth';
import { generalLimiter } from '../../../shared/middleware/rateLimiter';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user's overall progress
router.get('/',
  generalLimiter,
  ProgressController.getUserProgress
);

// Get progress for a specific category
router.get('/category/:categoryId',
  generalLimiter,
  progressValidationRules.getProgressByCategory,
  validateRequest,
  ProgressController.getProgressByCategory
);

// Update progress after quiz completion
router.post('/update',
  generalLimiter,
  progressValidationRules.updateProgress,
  validateRequest,
  ProgressController.updateProgress
);

// Get quiz attempts history
router.get('/attempts',
  generalLimiter,
  ProgressController.getAttemptHistory
);

// Get user statistics
router.get('/stats',
  generalLimiter,
  ProgressController.getUserStats
);

// Reset progress for a category (for testing)
router.delete('/category/:categoryId/reset',
  generalLimiter,
  ProgressController.resetCategoryProgress
);

export default router;
