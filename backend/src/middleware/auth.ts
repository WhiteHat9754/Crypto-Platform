import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendErrorResponse } from '../utils/responses';
import User from '../models/User';
import { AuthenticatedRequest } from '../types/interfaces';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.cookies?.accessToken;

    // Check Authorization header if no cookie
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      sendErrorResponse(res, 'Access token required', 401);
      return;
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('+isActive');
    if (!user || !user.isActive) {
      sendErrorResponse(res, 'User not found or inactive', 401);
      return;
    }

    // Add user to request
    req.user = user;
    next();

  } catch (error: any) {
    console.error('❌ Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      sendErrorResponse(res, 'Invalid token', 401);
    } else if (error.name === 'TokenExpiredError') {
      sendErrorResponse(res, 'Token expired', 401);
    } else {
      sendErrorResponse(res, 'Authentication failed', 401);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendErrorResponse(res, 'Authentication required', 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendErrorResponse(res, 'Insufficient permissions', 403);
      return;
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.cookies?.accessToken;

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('+isActive');
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
