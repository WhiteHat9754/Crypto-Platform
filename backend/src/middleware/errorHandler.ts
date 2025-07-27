import { Request, Response, NextFunction } from 'express';
import { sendErrorResponse } from '../utils/responses';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('❌ Error caught by middleware:', error);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((err: any) => err.message);
    sendErrorResponse(res, 'Validation failed', 400, messages.join(', '));
    return;
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    sendErrorResponse(res, `${field} already exists`, 400, 'Duplicate field error');
    return;
  }

  // Mongoose cast error
  if (error.name === 'CastError') {
    sendErrorResponse(res, 'Invalid resource ID', 400, 'Cast error');
    return;
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    sendErrorResponse(res, 'Invalid token', 401, 'JWT error');
    return;
  }

  if (error.name === 'TokenExpiredError') {
    sendErrorResponse(res, 'Token expired', 401, 'JWT expired');
    return;
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  
  sendErrorResponse(res, message, statusCode, process.env.NODE_ENV === 'development' ? error.stack : undefined);
};

export const notFound = (req: Request, res: Response): void => {
  sendErrorResponse(res, `Route ${req.originalUrl} not found`, 404);
};
