import { Request, Response } from 'express';
import { body, query, param } from 'express-validator';
import { Quiz } from '../models/Quiz';
import { Category } from '../models/Category';
import { ResponseUtil } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/middleware/auth';

export const quizValidationRules = {
  getQuizzesByCategory: [
    param('categoryId').notEmpty().withMessage('Category ID is required'),
    query('level').optional().isInt({ min: 1 }).withMessage('Level must be a positive integer'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  getQuizById: [
    param('id').notEmpty().withMessage('Quiz ID is required')
  ],
  submitAnswer: [
    body('quizId').notEmpty().withMessage('Quiz ID is required'),
    body('selectedAnswer').isIn(['option1', 'option2', 'option3', 'option4']).withMessage('Selected answer must be option1, option2, option3, or option4'),
    body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be a non-negative integer')
  ]
};

export class QuizController {
  // Get all categories
  static async getCategories(req: Request, res: Response): Promise<Response> {
    try {
      const categories = await Category.find({ isActive: true }).sort({ order: 1 });
      return ResponseUtil.success(res, categories, 'Categories retrieved successfully');
    } catch (error) {
      console.error('Get categories error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Get category by ID
  static async getCategoryById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const category = await Category.findOne({ id, isActive: true });
      
      if (!category) {
        return ResponseUtil.notFound(res, 'Category not found');
      }

      return ResponseUtil.success(res, category, 'Category retrieved successfully');
    } catch (error) {
      console.error('Get category error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Get quizzes by category
  static async getQuizzesByCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { categoryId } = req.params;
      const { level, page = 1, limit = 20 } = req.query;

      // Build query
      const query: any = { categoryId };
      if (level) {
        query.levelNumber = parseInt(level as string);
      }

      // Calculate pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Get quizzes with pagination
      const [quizzes, total] = await Promise.all([
        Quiz.find(query)
          .sort({ levelNumber: 1, questionNumber: 1 })
          .skip(skip)
          .limit(limitNum),
        Quiz.countDocuments(query)
      ]);

      return ResponseUtil.paginated(res, quizzes, pageNum, limitNum, total, 'Quizzes retrieved successfully');
    } catch (error) {
      console.error('Get quizzes by category error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Get quiz by ID
  static async getQuizById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const quiz = await Quiz.findOne({ id });
      
      if (!quiz) {
        return ResponseUtil.notFound(res, 'Quiz not found');
      }

      return ResponseUtil.success(res, quiz, 'Quiz retrieved successfully');
    } catch (error) {
      console.error('Get quiz error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Get quizzes by level
  static async getQuizzesByLevel(req: Request, res: Response): Promise<Response> {
    try {
      const { categoryId, level } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const query = { 
        categoryId, 
        levelNumber: parseInt(level)
      };

      const [quizzes, total] = await Promise.all([
        Quiz.find(query)
          .sort({ questionNumber: 1 })
          .skip(skip)
          .limit(limitNum),
        Quiz.countDocuments(query)
      ]);

      return ResponseUtil.paginated(res, quizzes, pageNum, limitNum, total, 'Level quizzes retrieved successfully');
    } catch (error) {
      console.error('Get quizzes by level error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Submit quiz answer
  static async submitAnswer(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { quizId, selectedAnswer, timeSpent = 0 } = req.body;

      // Find the quiz
      const quiz = await Quiz.findOne({ id: quizId });
      if (!quiz) {
        return ResponseUtil.notFound(res, 'Quiz not found');
      }

      // Check if answer is correct
      const isCorrect = quiz.answer === selectedAnswer;
      const pointsEarned = isCorrect ? quiz.points : 0;

      // Prepare response data
      const responseData = {
        quizId,
        selectedAnswer,
        correctAnswer: quiz.answer,
        isCorrect,
        pointsEarned,
        explanation: quiz.explanation,
        fullMeaning: quiz.fullMeaning,
        timeSpent
      };

      return ResponseUtil.success(res, responseData, 'Answer submitted successfully');
    } catch (error) {
      console.error('Submit answer error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Get random quiz questions
  static async getRandomQuizzes(req: Request, res: Response): Promise<Response> {
    try {
      const { categoryId, count = 10, level } = req.query;

      // Build match query
      const matchQuery: any = {};
      if (categoryId) {
        matchQuery.categoryId = categoryId;
      }
      if (level) {
        matchQuery.levelNumber = parseInt(level as string);
      }

      const pipeline = [
        { $match: matchQuery },
        { $sample: { size: parseInt(count as string) } },
        { $sort: { levelNumber: 1 as 1, questionNumber: 1 as 1 } }
      ];

      const quizzes = await Quiz.aggregate(pipeline);

      return ResponseUtil.success(res, quizzes, 'Random quizzes retrieved successfully');
    } catch (error) {
      console.error('Get random quizzes error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Get quiz statistics
  static async getQuizStats(req: Request, res: Response): Promise<Response> {
    try {
      const stats = await Quiz.aggregate([
        {
          $group: {
            _id: '$categoryId',
            categoryName: { $first: '$categoryName' },
            totalQuestions: { $sum: 1 },
            levels: { $addToSet: '$levelNumber' },
            avgPoints: { $avg: '$points' },
            difficulties: { $addToSet: '$difficulty' }
          }
        },
        {
          $project: {
            _id: 1,
            categoryName: 1,
            totalQuestions: 1,
            totalLevels: { $size: '$levels' },
            avgPoints: { $round: ['$avgPoints', 2] },
            difficulties: 1
          }
        },
        { $sort: { _id: 1 } }
      ]);

      const totalQuizzes = await Quiz.countDocuments();
      const totalCategories = await Category.countDocuments({ isActive: true });

      return ResponseUtil.success(res, {
        totalQuizzes,
        totalCategories,
        categoryStats: stats
      }, 'Quiz statistics retrieved successfully');
    } catch (error) {
      console.error('Get quiz stats error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }
}
