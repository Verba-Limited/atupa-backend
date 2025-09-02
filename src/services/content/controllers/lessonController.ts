import { Request, Response } from 'express';
import { body, query, param } from 'express-validator';
import { Lesson } from '../models/Lesson';
import { ResponseUtil } from '../../../shared/utils/response';
import { AuthenticatedRequest } from '../../../shared/middleware/auth';

export const lessonValidationRules = {
  getLessonById: [
    param('id').notEmpty().withMessage('Lesson ID is required')
  ],
  getLessonsByCategory: [
    param('categoryId').notEmpty().withMessage('Category ID is required'),
    query('level').optional().isInt({ min: 1 }).withMessage('Level must be a positive integer'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
  ],
  createLesson: [
    body('id').notEmpty().withMessage('Lesson ID is required'),
    body('categoryId').notEmpty().withMessage('Category ID is required'),
    body('title').notEmpty().trim().withMessage('Title is required'),
    body('description').notEmpty().trim().withMessage('Description is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('level').isInt({ min: 1 }).withMessage('Level must be a positive integer'),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    body('isPopular').optional().isBoolean().withMessage('isPopular must be a boolean'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
  ]
};

export class LessonController {
  // Get all lessons with optional filtering
  static async getAllLessons(req: Request, res: Response): Promise<Response> {
    try {
      const { 
        page = 1, 
        limit = 20, 
        categoryId, 
        level, 
        isPopular, 
        search 
      } = req.query;

      // Build query
      const query: any = { isActive: true };
      
      if (categoryId) {
        query.categoryId = categoryId;
      }
      
      if (level) {
        query.level = parseInt(level as string);
      }
      
      if (isPopular !== undefined) {
        query.isPopular = isPopular === 'true';
      }
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Calculate pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Get lessons with pagination
      const [lessons, total] = await Promise.all([
        Lesson.find(query)
          .sort({ level: 1, createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .select('-content'), // Exclude content for list view
        Lesson.countDocuments(query)
      ]);

      return ResponseUtil.paginated(res, lessons, pageNum, limitNum, total, 'Lessons retrieved successfully');
    } catch (error) {
      console.error('Get all lessons error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Get popular lessons
  static async getPopularLessons(req: Request, res: Response): Promise<Response> {
    try {
      const { limit = 10 } = req.query;
      
      const lessons = await Lesson.find({ 
        isActive: true, 
        isPopular: true 
      })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit as string))
        .select('-content');

      return ResponseUtil.success(res, lessons, 'Popular lessons retrieved successfully');
    } catch (error) {
      console.error('Get popular lessons error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Get lessons by category
  static async getLessonsByCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { categoryId } = req.params;
      const { level, page = 1, limit = 20 } = req.query;

      // Build query
      const query: any = { categoryId, isActive: true };
      if (level) {
        query.level = parseInt(level as string);
      }

      // Calculate pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Get lessons with pagination
      const [lessons, total] = await Promise.all([
        Lesson.find(query)
          .sort({ level: 1, createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .select('-content'),
        Lesson.countDocuments(query)
      ]);

      return ResponseUtil.paginated(res, lessons, pageNum, limitNum, total, 'Category lessons retrieved successfully');
    } catch (error) {
      console.error('Get lessons by category error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Get lesson by ID (with full content)
  static async getLessonById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      const lesson = await Lesson.findOne({ id, isActive: true });
      
      if (!lesson) {
        return ResponseUtil.notFound(res, 'Lesson not found');
      }

      return ResponseUtil.success(res, lesson, 'Lesson retrieved successfully');
    } catch (error) {
      console.error('Get lesson by ID error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Get lessons by level
  static async getLessonsByLevel(req: Request, res: Response): Promise<Response> {
    try {
      const { level } = req.params;
      const { categoryId, page = 1, limit = 20 } = req.query;

      // Build query
      const query: any = { 
        level: parseInt(level), 
        isActive: true 
      };
      
      if (categoryId) {
        query.categoryId = categoryId;
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const [lessons, total] = await Promise.all([
        Lesson.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .select('-content'),
        Lesson.countDocuments(query)
      ]);

      return ResponseUtil.paginated(res, lessons, pageNum, limitNum, total, 'Level lessons retrieved successfully');
    } catch (error) {
      console.error('Get lessons by level error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Create new lesson (admin only)
  static async createLesson(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const lessonData = req.body;

      // Check if lesson with same ID already exists
      const existingLesson = await Lesson.findOne({ id: lessonData.id });
      if (existingLesson) {
        return ResponseUtil.error(res, 'Lesson with this ID already exists', null, 409);
      }

      const lesson = new Lesson(lessonData);
      await lesson.save();

      return ResponseUtil.success(res, lesson, 'Lesson created successfully', 201);
    } catch (error) {
      console.error('Create lesson error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Update lesson (admin only)
  static async updateLesson(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const lesson = await Lesson.findOneAndUpdate(
        { id },
        updateData,
        { new: true, runValidators: true }
      );

      if (!lesson) {
        return ResponseUtil.notFound(res, 'Lesson not found');
      }

      return ResponseUtil.success(res, lesson, 'Lesson updated successfully');
    } catch (error) {
      console.error('Update lesson error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Delete lesson (admin only)
  static async deleteLesson(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      // Soft delete by setting isActive to false
      const lesson = await Lesson.findOneAndUpdate(
        { id },
        { isActive: false },
        { new: true }
      );

      if (!lesson) {
        return ResponseUtil.notFound(res, 'Lesson not found');
      }

      return ResponseUtil.success(res, null, 'Lesson deleted successfully');
    } catch (error) {
      console.error('Delete lesson error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Get lesson statistics
  static async getLessonStats(req: Request, res: Response): Promise<Response> {
    try {
      const stats = await Lesson.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$categoryId',
            totalLessons: { $sum: 1 },
            popularLessons: {
              $sum: { $cond: ['$isPopular', 1, 0] }
            },
            levels: { $addToSet: '$level' },
            avgDuration: { $avg: '$duration' }
          }
        },
        {
          $project: {
            _id: 1,
            totalLessons: 1,
            popularLessons: 1,
            totalLevels: { $size: '$levels' },
            avgDuration: { $round: ['$avgDuration', 2] }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      const totalLessons = await Lesson.countDocuments({ isActive: true });
      const totalPopular = await Lesson.countDocuments({ isActive: true, isPopular: true });

      return ResponseUtil.success(res, {
        totalLessons,
        totalPopular,
        categoryStats: stats
      }, 'Lesson statistics retrieved successfully');
    } catch (error) {
      console.error('Get lesson stats error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }

  // Search lessons
  static async searchLessons(req: Request, res: Response): Promise<Response> {
    try {
      const { q, page = 1, limit = 20 } = req.query;

      if (!q || typeof q !== 'string') {
        return ResponseUtil.error(res, 'Search query is required');
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const searchQuery = {
        isActive: true,
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { content: { $regex: q, $options: 'i' } }
        ]
      };

      const [lessons, total] = await Promise.all([
        Lesson.find(searchQuery)
          .sort({ level: 1, createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .select('-content'),
        Lesson.countDocuments(searchQuery)
      ]);

      return ResponseUtil.paginated(res, lessons, pageNum, limitNum, total, 'Search results retrieved successfully');
    } catch (error) {
      console.error('Search lessons error:', error);
      return ResponseUtil.serverError(res, error);
    }
  }
}
