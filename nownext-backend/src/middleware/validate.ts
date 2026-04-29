import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../utils/appError';

export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(', ');
      return next(new AppError(message, 422));
    }
    req.body = result.data;
    next();
  };
}
