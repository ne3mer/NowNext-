import { Task, TaskCategory } from '../types/task';

const PARENT_RULES: Record<TaskCategory, TaskCategory[]> = {
  daily: ['weekly', 'monthly', 'yearly'],
  weekly: ['monthly', 'yearly'],
  monthly: ['yearly'],
  yearly: [],
};

export function getParentOptions(category: TaskCategory): TaskCategory[] {
  return PARENT_RULES[category];
}

export function getParentCandidates(tasks: Task[], category: TaskCategory, taskId?: string): Task[] {
  const allowedCategories = new Set(getParentOptions(category));
  if (allowedCategories.size === 0) {
    return [];
  }

  return tasks.filter((task) => task.id !== taskId && allowedCategories.has(task.category));
}

export function getTaskChain(task: Task, tasks: Task[]): Task[] {
  const byId = new Map(tasks.map((item) => [item.id, item]));
  const chain: Task[] = [task];
  let pointer = task;
  let guard = 0;

  while (pointer.parentTaskId && guard < 6) {
    const parent = byId.get(pointer.parentTaskId);
    if (!parent) {
      break;
    }

    chain.push(parent);
    pointer = parent;
    guard += 1;
  }

  return chain;
}

export function chainToLabel(chain: Task[]): string {
  return chain.map((item) => item.category).join(' -> ');
}
