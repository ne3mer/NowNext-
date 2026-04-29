import { Task } from '../types/task';

const PRIORITY_WEIGHT: Record<Task['priority'], number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function getDeadlineTimestamp(task: Task): number {
  if (!task.deadline) {
    return Number.MAX_SAFE_INTEGER;
  }

  const timestamp = new Date(task.deadline).getTime();
  return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
}

export function getSuggestedTask(tasks: Task[]): Task | null {
  const pendingTasks = tasks.filter((task) => !task.completed);

  if (pendingTasks.length === 0) {
    return null;
  }

  return [...pendingTasks].sort((a, b) => {
    const priorityDelta = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return getDeadlineTimestamp(a) - getDeadlineTimestamp(b);
  })[0];
}
