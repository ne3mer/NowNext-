import { Router } from 'express';
import { getCategories, postCategory } from '../controllers/category.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate';
import { createCategorySchema } from '../validators/category.validator';

const categoryRouter = Router();

categoryRouter.use(requireAuth);
categoryRouter.get('/', getCategories);
categoryRouter.post('/', validateBody(createCategorySchema), postCategory);

export { categoryRouter };
