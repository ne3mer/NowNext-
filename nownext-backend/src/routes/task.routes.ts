import { Router } from 'express';
import {
  getSuggestionNow,
  getTask,
  getTasks,
  patchCompleteTask,
  patchReorderTasks,
  patchTask,
  postTask,
  removeTask,
} from '../controllers/task.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate';
import { createTaskSchema, reorderTasksSchema, updateTaskSchema } from '../validators/task.validator';

const taskRouter = Router();

taskRouter.use(requireAuth);

taskRouter.get('/', getTasks);
taskRouter.post('/', validateBody(createTaskSchema), postTask);
taskRouter.get('/suggestion/now', getSuggestionNow);
taskRouter.patch('/reorder', validateBody(reorderTasksSchema), patchReorderTasks);
taskRouter.get('/:id', getTask);
taskRouter.patch('/:id', validateBody(updateTaskSchema), patchTask);
taskRouter.delete('/:id', removeTask);
taskRouter.patch('/:id/complete', patchCompleteTask);

export { taskRouter };
