import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../utils/jwt';
import { ResponseUtil } from '../utils/response';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    [key: string]: any;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return ResponseUtil.unauthorized(res, 'Access token required');
  }

  try {
    const decoded = JwtUtil.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return ResponseUtil.unauthorized(res, 'Invalid or expired token');
  }
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = JwtUtil.verifyAccessToken(token);
      req.user = decoded;
    } catch (error) {
      // Token is invalid but we continue without user
      req.user = undefined;
    }
  }

  next();
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ResponseUtil.unauthorized(res, 'Authentication required');
    }

    if (!req.user.roles || !req.user.roles.some((role: string) => roles.includes(role))) {
      return ResponseUtil.forbidden(res, 'Insufficient permissions');
    }

    next();
  };
};

export const requireSubscription = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return ResponseUtil.unauthorized(res, 'Authentication required');
  }

  if (!req.user.subscription || req.user.subscription.status !== 'active') {
    return ResponseUtil.forbidden(res, 'Active subscription required');
  }

  next();
};
