import { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { UserProgress, QuizAttempt } from '../models/UserProgress';
import { ResponseUtil } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/middleware/auth';

export const progressValidationRules = {
  updateProgress: [
    body('quizId').notEmpty().withMessage('Quiz ID is required'),
    body('categoryId').notEmpty().withMessage('Category ID is required'),
    body('levelNumber').isInt({ min: 1 }).withMessage('Level number must be a positive integer'),
    body('selectedAnswer').isIn(['option1', 'option2', 'option3', 'option4']).withMessage('Invalid answer option'),
    body('isCorrect').isBoolean().withMessage('isCorrect must be a boolean'),
    body('pointsEarned').isInt({ min: 0 }).withMessage('Points earned must be non-negative'),
    body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be non-negative')
  ],
  getProgressByCategory: [
    param('categoryId').notEmpty().withMessage('Category ID is required')
  ]
};

export class ProgressController {
  // Get user's overall progress
  static async getUserProgress(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      
      const progress = await UserProgress.find({ userId }).sort({ categoryId: 1 });
      
      // Calculate overall stats
      const totalPoints = progress.reduce((sum, p) => sum + p.totalPoints, 0);
      const totalCategories = progress.length;
      const completedLevels = progress.reduce((sum, p) => sum + p.completedLevels.length, 0);
      const maxStreak = Math.max(...progress.map(p => p.streakDays), 0);

      return ResponseUtil.success(res, {
        progress,
        stats: {
          totalPoints,
          totalCategories,
          completedLevels,
          maxStreak
        }
      }, 'User progress retrieved successfully');
    } catch (error) {
      console.error('Get user progress error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Get progress for a specific category
  static async getProgressByCategory(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { categoryId } = req.params;

      let progress = await UserProgress.findOne({ userId, categoryId });
      
      if (!progress) {
        // Create initial progress record
        progress = new UserProgress({
          userId,
          categoryId,
          levelNumber: 1,
          totalPoints: 0,
          completedQuestions: [],
          highestLevelUnlocked: 1,
          completedLevels: [],
          achievements: [],
          streakDays: 0,
          lastActiveDate: new Date()
        });
        await progress.save();
      }

      return ResponseUtil.success(res, progress, 'Category progress retrieved successfully');
    } catch (error) {
      console.error('Get category progress error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Update progress after quiz completion
  static async updateProgress(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { 
        quizId, 
        categoryId, 
        levelNumber, 
        selectedAnswer, 
        isCorrect, 
        pointsEarned, 
        timeSpent = 0 
      } = req.body;

      // Record the quiz attempt
      const attempt = new QuizAttempt({
        userId,
        quizId,
        categoryId,
        levelNumber,
        selectedAnswer,
        isCorrect,
        timeSpent,
        pointsEarned,
        attemptDate: new Date()
      });
      await attempt.save();

      // Update user progress
      let progress = await UserProgress.findOne({ userId, categoryId });
      
      if (!progress) {
        progress = new UserProgress({
          userId,
          categoryId,
          levelNumber: 1,
          totalPoints: 0,
          completedQuestions: [],
          highestLevelUnlocked: 1,
          completedLevels: [],
          achievements: [],
          streakDays: 0,
          lastActiveDate: new Date()
        });
      }

      // Add to completed questions if correct and not already completed
      if (isCorrect && !progress.completedQuestions.includes(quizId)) {
        progress.completedQuestions.push(quizId);
        progress.totalPoints += pointsEarned;
      }

      // Check if level is completed (you might want to implement level completion logic)
      // For now, let's assume a level is completed if they answer 5 questions correctly
      const levelQuestions = await QuizAttempt.countDocuments({
        userId,
        categoryId,
        levelNumber,
        isCorrect: true
      });

      if (levelQuestions >= 5 && !progress.completedLevels.includes(levelNumber)) {
        progress.completedLevels.push(levelNumber);
        // Unlock next level
        if (levelNumber + 1 > progress.highestLevelUnlocked) {
          progress.highestLevelUnlocked = levelNumber + 1;
        }
      }

      // Update streak (simplified logic)
      const today = new Date();
      const lastActive = new Date(progress.lastActiveDate);
      const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        progress.streakDays += 1;
      } else if (daysDiff > 1) {
        progress.streakDays = 1;
      }
      
      progress.lastActiveDate = today;
      await progress.save();

      return ResponseUtil.success(res, {
        progress,
        attempt
      }, 'Progress updated successfully');
    } catch (error) {
      console.error('Update progress error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Get quiz attempts history
  static async getAttemptHistory(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { categoryId, page = 1, limit = 20 } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const query: any = { userId };
      if (categoryId) {
        query.categoryId = categoryId;
      }

      const [attempts, total] = await Promise.all([
        QuizAttempt.find(query)
          .sort({ attemptDate: -1 })
          .skip(skip)
          .limit(limitNum),
        QuizAttempt.countDocuments(query)
      ]);

      return ResponseUtil.paginated(res, attempts, pageNum, limitNum, total, 'Attempt history retrieved successfully');
    } catch (error) {
      console.error('Get attempt history error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Get user statistics
  static async getUserStats(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;

      const [
        totalAttempts,
        correctAttempts,
        totalPoints,
        categoriesStats
      ] = await Promise.all([
        QuizAttempt.countDocuments({ userId }),
        QuizAttempt.countDocuments({ userId, isCorrect: true }),
        UserProgress.aggregate([
          { $match: { userId } },
          { $group: { _id: null, total: { $sum: '$totalPoints' } } }
        ]),
        UserProgress.aggregate([
          { $match: { userId } },
          {
            $group: {
              _id: '$categoryId',
              totalPoints: { $sum: '$totalPoints' },
              completedLevels: { $first: '$completedLevels' },
              highestLevel: { $first: '$highestLevelUnlocked' },
              completedQuestions: { $first: '$completedQuestions' }
            }
          }
        ])
      ]);

      const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
      const userTotalPoints = totalPoints.length > 0 ? totalPoints[0].total : 0;

      return ResponseUtil.success(res, {
        totalAttempts,
        correctAttempts,
        accuracy: Math.round(accuracy * 100) / 100,
        totalPoints: userTotalPoints,
        categoriesProgress: categoriesStats
      }, 'User statistics retrieved successfully');
    } catch (error) {
      console.error('Get user stats error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Reset progress for a category (for testing/admin)
  static async resetCategoryProgress(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { categoryId } = req.params;

      await Promise.all([
        UserProgress.findOneAndUpdate(
          { userId, categoryId },
          {
            levelNumber: 1,
            totalPoints: 0,
            completedQuestions: [],
            highestLevelUnlocked: 1,
            completedLevels: [],
            achievements: [],
            streakDays: 0,
            lastActiveDate: new Date()
          },
          { upsert: true }
        ),
        QuizAttempt.deleteMany({ userId, categoryId })
      ]);

      return ResponseUtil.success(res, null, 'Category progress reset successfully');
    } catch (error) {
      console.error('Reset category progress error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }
}
