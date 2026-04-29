import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/appError';
import { verifyToken } from '../utils/jwt';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  const token = authHeader.replace('Bearer ', '').trim();
  try {
    const payload = verifyToken(token);
    req.authUser = { userId: payload.userId };
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}
