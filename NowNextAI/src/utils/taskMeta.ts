import { Task, TaskStatus } from '../types/task';

export function isTaskOverdue(task: Task, now = new Date()): boolean {
  if (task.completed || !task.deadline) {
    return false;
  }

  return new Date(task.deadline).getTime() < now.getTime();
}

export function getTaskStatus(task: Task, now = new Date()): TaskStatus {
  if (task.completed) {
    return 'completed';
  }

  if (isTaskOverdue(task, now)) {
    return 'overdue';
  }

  return 'todo';
}

export function compareByDeadline(a: Task, b: Task): number {
  const aTime = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
  const bTime = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
  return aTime - bTime;
}
