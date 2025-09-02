import express from 'express';
import { LessonController, lessonValidationRules } from '../controllers/lessonController';
import { validateRequest } from '../../../shared/middleware/validation';
import { authenticateToken, optionalAuth } from '../../../shared/middleware/auth';
import { generalLimiter } from '../../../shared/middleware/rateLimiter';

const router = express.Router();

// Public routes (no authentication required)
router.get('/',
  generalLimiter,
  LessonController.getAllLessons
);

router.get('/popular',
  generalLimiter,
  LessonController.getPopularLessons
);

router.get('/search',
  generalLimiter,
  LessonController.searchLessons
);

router.get('/stats',
  generalLimiter,
  LessonController.getLessonStats
);

router.get('/category/:categoryId',
  generalLimiter,
  lessonValidationRules.getLessonsByCategory,
  validateRequest,
  LessonController.getLessonsByCategory
);

router.get('/level/:level',
  generalLimiter,
  LessonController.getLessonsByLevel
);

router.get('/:id',
  generalLimiter,
  lessonValidationRules.getLessonById,
  validateRequest,
  LessonController.getLessonById
);

// Protected routes (authentication required for admin functions)
router.post('/',
  authenticateToken,
  lessonValidationRules.createLesson,
  validateRequest,
  LessonController.createLesson
);

router.put('/:id',
  authenticateToken,
  lessonValidationRules.createLesson,
  validateRequest,
  LessonController.updateLesson
);

router.delete('/:id',
  authenticateToken,
  LessonController.deleteLesson
);

export default router;
