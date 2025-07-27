import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types/interfaces';

export const sendSuccessResponse = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data
  };
  return res.status(statusCode).json(response);
};

export const sendErrorResponse = (
  res: Response,
  message: string,
  statusCode: number = 400,
  error?: string
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    error
  };
  return res.status(statusCode).json(response);
};

// ✅ FIXED: Use PaginatedResponse interface instead of ApiResponse
export const sendPaginatedResponse = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message: string = 'Success'
): Response => {
  const response: PaginatedResponse<T[]> = {
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
  return res.status(200).json(response);
};

// ✅ ADDITIONAL: Utility function for validation errors
export const sendValidationErrorResponse = (
  res: Response,
  errors: Array<{ field: string; message: string }>,
  message: string = 'Validation failed'
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    error: errors.map(err => `${err.field}: ${err.message}`).join(', '),
    validationErrors: errors
  };
  return res.status(422).json(response);
};

// ✅ ADDITIONAL: Utility function for not found responses
export const sendNotFoundResponse = (
  res: Response,
  resource: string = 'Resource'
): Response => {
  return sendErrorResponse(res, `${resource} not found`, 404);
};

// ✅ ADDITIONAL: Utility function for unauthorized responses
export const sendUnauthorizedResponse = (
  res: Response,
  message: string = 'Unauthorized access'
): Response => {
  return sendErrorResponse(res, message, 401);
};

// ✅ ADDITIONAL: Utility function for forbidden responses
export const sendForbiddenResponse = (
  res: Response,
  message: string = 'Access forbidden'
): Response => {
  return sendErrorResponse(res, message, 403);
};

// ✅ ADDITIONAL: Utility function for server error responses
export const sendServerErrorResponse = (
  res: Response,
  message: string = 'Internal server error'
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? message : 'Something went wrong'
  };
  return res.status(500).json(response);
};
