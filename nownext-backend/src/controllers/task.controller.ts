import { Request, Response } from 'express';
import { ok } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import {
  completeTask,
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  reorderTasks,
  suggestNowTask,
  updateTask,
} from '../services/task.service';

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await listTasks(req.authUser!.userId);
  res.status(200).json(ok(tasks));
});

export const postTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await createTask(req.authUser!.userId, req.body);
  res.status(201).json(ok(task));
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await getTaskById(req.authUser!.userId, String(req.params.id));
  res.status(200).json(ok(task));
});

export const patchTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await updateTask(req.authUser!.userId, String(req.params.id), req.body);
  res.status(200).json(ok(task));
});

export const removeTask = asyncHandler(async (req: Request, res: Response) => {
  await deleteTask(req.authUser!.userId, String(req.params.id));
  res.status(200).json(ok({ deleted: true }));
});

export const patchCompleteTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await completeTask(req.authUser!.userId, String(req.params.id));
  res.status(200).json(ok(task));
});

export const patchReorderTasks = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await reorderTasks(req.authUser!.userId, req.body.items);
  res.status(200).json(ok(tasks));
});

export const getSuggestionNow = asyncHandler(async (req: Request, res: Response) => {
  const task = await suggestNowTask(req.authUser!.userId);
  res.status(200).json(ok(task));
});
