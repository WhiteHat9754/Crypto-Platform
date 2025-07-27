import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { sendErrorResponse } from '../utils/responses';

export const validateRequest = (schema: ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      sendErrorResponse(res, 'Validation error', 400, errorMessage);
      return;
    }
    
    next();
  };
};
