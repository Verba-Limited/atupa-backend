import { Response } from 'express';
import { ApiResponse } from '../types';

export class ResponseUtil {
  static success<T>(res: Response, data: T, message: string = 'Success', statusCode: number = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data
    };
    return res.status(statusCode).json(response);
  }

  static error(res: Response, message: string, error?: any, statusCode: number = 400): Response {
    const response: ApiResponse = {
      success: false,
      message,
      error: error?.message || error
    };
    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response, 
    data: T[], 
    page: number, 
    limit: number, 
    total: number,
    message: string = 'Success'
  ): Response {
    const totalPages = Math.ceil(total / limit);
    const response: ApiResponse<T[]> = {
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
    return res.status(200).json(response);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return this.error(res, message, null, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return this.error(res, message, null, 403);
  }

  static notFound(res: Response, message: string = 'Resource not found'): Response {
    return this.error(res, message, null, 404);
  }

  static validationError(res: Response, errors: any, message: string = 'Validation failed'): Response {
    const response: ApiResponse = {
      success: false,
      message,
      error: errors
    };
    return res.status(422).json(response);
  }

  static serverError(res: Response, error: any, message: string = 'Internal server error'): Response {
    console.error('Server Error:', error);
    return this.error(res, message, process.env.NODE_ENV === 'development' ? error : null, 500);
  }
}
