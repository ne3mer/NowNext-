import { Request, Response } from 'express';
import { ok } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { getCurrentUser, loginUser, registerUser } from '../services/auth.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUser(req.body);
  res.status(201).json(ok(result));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);
  res.status(200).json(ok(result));
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await getCurrentUser(req.authUser!.userId);
  res.status(200).json(ok(user));
});
