import { Task } from '../types/task';

export function getSuggestedTask(tasks: Task[]): Task | null {
  const firstPendingTask = tasks.find((task) => !task.completed);
  return firstPendingTask ?? null;
}
