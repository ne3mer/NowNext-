import { CategoryModel } from '../models/category.model';
import { AppError } from '../utils/appError';

const DEFAULT_CATEGORIES = ['daily', 'weekly', 'monthly', 'yearly'];

export async function listCategories(userId: string) {
  await Promise.all(
    DEFAULT_CATEGORIES.map((name) =>
      CategoryModel.updateOne(
        { userId: null, name },
        { $setOnInsert: { userId: null, name, isDefault: true } },
        { upsert: true },
      ),
    ),
  );

  return CategoryModel.find({
    $or: [{ userId: null }, { userId }],
  }).sort({ isDefault: -1, name: 1 });
}

export async function createCategory(userId: string, name: string) {
  const normalized = name.trim().toLowerCase();
  const exists = await CategoryModel.findOne({
    name: normalized,
    $or: [{ userId: null }, { userId }],
  });
  if (exists) {
    throw new AppError('Category already exists', 409);
  }
  return CategoryModel.create({
    userId,
    name: normalized,
    isDefault: false,
  });
}
