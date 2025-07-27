import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';
import { sendErrorResponse } from '../utils/responses';
import { AdminAuthenticatedRequest } from '../types/interfaces';

// ✅ FIXED: Use standard Express types with type assertion
export const authenticateAdmin = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      sendErrorResponse(res, 'Access token required', 401);
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.role !== 'admin') {
      sendErrorResponse(res, 'Admin access required', 403);
      return;
    }

    const admin = await Admin.findById(decoded.userId);
    if (!admin || !admin.isActive) {
      sendErrorResponse(res, 'Admin not found or inactive', 401);
      return;
    }

    // ✅ FIXED: Attach admin to request
    req.user = admin;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      sendErrorResponse(res, 'Invalid access token', 401);
    } else if (error.name === 'TokenExpiredError') {
      sendErrorResponse(res, 'Access token expired', 401);
    } else {
      sendErrorResponse(res, 'Authentication failed', 401);
    }
  }
};
