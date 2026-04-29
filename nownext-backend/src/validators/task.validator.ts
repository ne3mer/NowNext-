import { z } from 'zod';

export const taskPriority = z.enum(['low', 'medium', 'high']);
export const taskStatus = z.enum(['todo', 'in_progress', 'done']);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(180),
  description: z.string().max(2000).optional(),
  category: z.string().trim().min(2).max(40),
  priority: taskPriority.default('medium'),
  status: taskStatus.default('todo').optional(),
  dueDate: z.string().datetime().nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),
  color: z.string().min(4).max(20).optional(),
  order: z.number().int().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const reorderTasksSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      order: z.number().int(),
    }),
  ),
});
