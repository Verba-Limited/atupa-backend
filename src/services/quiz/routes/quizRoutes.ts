import express from 'express';
import { QuizController, quizValidationRules } from '../controllers/quizController';
import { validateRequest } from '../../../shared/middleware/validation';
import { authenticateToken, optionalAuth } from '../../../shared/middleware/auth';
import { generalLimiter } from '../../../shared/middleware/rateLimiter';

const router = express.Router();

// Public routes (no authentication required)
router.get('/categories', 
  generalLimiter,
  QuizController.getCategories
);

router.get('/categories/:id',
  generalLimiter,
  QuizController.getCategoryById
);

router.get('/stats',
  generalLimiter,
  QuizController.getQuizStats
);

// Routes that can work with or without authentication
router.get('/category/:categoryId',
  generalLimiter,
  optionalAuth,
  quizValidationRules.getQuizzesByCategory,
  validateRequest,
  QuizController.getQuizzesByCategory
);

router.get('/category/:categoryId/level/:level',
  generalLimiter,
  optionalAuth,
  QuizController.getQuizzesByLevel
);

router.get('/random',
  generalLimiter,
  optionalAuth,
  QuizController.getRandomQuizzes
);

router.get('/:id',
  generalLimiter,
  optionalAuth,
  quizValidationRules.getQuizById,
  validateRequest,
  QuizController.getQuizById
);

// Protected routes (authentication required)
router.post('/submit-answer',
  authenticateToken,
  quizValidationRules.submitAnswer,
  validateRequest,
  QuizController.submitAnswer
);

export default router;
