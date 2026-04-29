import { TaskModel } from '../models/task.model';
import { AppError } from '../utils/appError';

type CreateTaskInput = {
  title: string;
  description?: string;
  category: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'todo' | 'in_progress' | 'done';
  dueDate?: string | null;
  completedAt?: string | null;
  color?: string;
  order?: number;
};

type UpdateTaskInput = Partial<CreateTaskInput>;

const priorityWeight = { high: 0, medium: 1, low: 2 };
const categoryWeight: Record<string, number> = { daily: 0, weekly: 1, monthly: 2, yearly: 3 };

export async function listTasks(userId: string) {
  return TaskModel.find({ userId }).sort({ order: 1, createdAt: -1 });
}

export async function createTask(userId: string, payload: CreateTaskInput) {
  const maxOrderTask = await TaskModel.findOne({ userId }).sort({ order: -1 }).lean();
  const nextOrder = typeof payload.order === 'number' ? payload.order : (maxOrderTask?.order ?? 0) + 1;

  return TaskModel.create({
    userId,
    ...payload,
    dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
    completedAt: payload.completedAt ? new Date(payload.completedAt) : null,
    order: nextOrder,
  });
}

export async function getTaskById(userId: string, taskId: string) {
  const task = await TaskModel.findOne({ _id: taskId, userId });
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  return task;
}

export async function updateTask(userId: string, taskId: string, payload: UpdateTaskInput) {
  const updates: Record<string, unknown> = { ...payload };
  if (payload.dueDate !== undefined) {
    updates.dueDate = payload.dueDate ? new Date(payload.dueDate) : null;
  }
  if (payload.completedAt !== undefined) {
    updates.completedAt = payload.completedAt ? new Date(payload.completedAt) : null;
  }

  const task = await TaskModel.findOneAndUpdate({ _id: taskId, userId }, updates, { new: true });
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  return task;
}

export async function deleteTask(userId: string, taskId: string) {
  const deleted = await TaskModel.findOneAndDelete({ _id: taskId, userId });
  if (!deleted) {
    throw new AppError('Task not found', 404);
  }
}

export async function completeTask(userId: string, taskId: string) {
  const task = await TaskModel.findOne({ _id: taskId, userId });
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  task.status = 'done';
  task.completedAt = new Date();
  await task.save();
  return task;
}

export async function reorderTasks(userId: string, items: Array<{ id: string; order: number }>) {
  const updates = items.map((item) =>
    TaskModel.updateOne({ _id: item.id, userId }, { $set: { order: item.order } }, { runValidators: true }),
  );
  await Promise.all(updates);
  return listTasks(userId);
}

export async function suggestNowTask(userId: string) {
  const tasks = await TaskModel.find({
    userId,
    status: { $in: ['todo', 'in_progress'] },
  });
  if (tasks.length === 0) {
    return null;
  }

  const now = Date.now();
  const sorted = [...tasks].sort((a, b) => {
    const aDue = a.dueDate ? a.dueDate.getTime() : Number.MAX_SAFE_INTEGER;
    const bDue = b.dueDate ? b.dueDate.getTime() : Number.MAX_SAFE_INTEGER;
    const aOverdue = aDue < now ? 0 : 1;
    const bOverdue = bDue < now ? 0 : 1;
    const aPriority = priorityWeight[a.priority];
    const bPriority = priorityWeight[b.priority];
    const aCategory = categoryWeight[a.category] ?? 9;
    const bCategory = categoryWeight[b.category] ?? 9;

    return aOverdue - bOverdue || aPriority - bPriority || aDue - bDue || aCategory - bCategory;
  });

  return sorted[0];
}
