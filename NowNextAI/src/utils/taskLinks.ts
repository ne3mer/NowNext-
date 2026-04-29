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

type GoalPulse = {
  id: string;
  title: string;
  score: number;
};

export function getTopGoalPulse(tasks: Task[]): GoalPulse | null {
  const yearlyGoals = tasks.filter((task) => task.category === 'yearly');
  if (yearlyGoals.length === 0) {
    return null;
  }

  const byId = new Map(tasks.map((task) => [task.id, task]));

  const scored = yearlyGoals.map((goal) => {
    const descendants = tasks.filter((task) => {
      let pointer = task;
      let guard = 0;

      while (pointer.parentTaskId && guard < 8) {
        if (pointer.parentTaskId === goal.id) {
          return true;
        }
        const parent = byId.get(pointer.parentTaskId);
        if (!parent) {
          break;
        }
        pointer = parent;
        guard += 1;
      }

      return false;
    });

    const completedCount = descendants.filter((item) => item.completed).length;
    const score = descendants.length === 0 ? 0 : Math.round((completedCount / descendants.length) * 100);

    return {
      id: goal.id,
      title: goal.title,
      score,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0] ?? null;
}
