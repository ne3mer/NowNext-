import { Request, Response } from 'express';
import { createCategory, listCategories } from '../services/category.service';
import { ok } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await listCategories(req.authUser!.userId);
  res.status(200).json(ok(categories));
});

export const postCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await createCategory(req.authUser!.userId, req.body.name);
  res.status(201).json(ok(category));
});
