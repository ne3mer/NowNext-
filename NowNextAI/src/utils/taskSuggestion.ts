import { Task } from '../types/task';

export const MIN_PENDING_TASKS_FOR_SUGGESTION = 5;

const PRIORITY_WEIGHT: Record<Task['priority'], number> = {
  high: 50,
  medium: 30,
  low: 10,
};

const CATEGORY_WEIGHT: Record<string, number> = {
  daily: 25,
  weekly: 15,
  monthly: 10,
  yearly: 5,
};

type ScoreBreakdown = {
  priority: number;
  deadline: number;
  category: number;
  status: number;
  penalty: number;
};

export type SuggestionResult = {
  task: Task;
  score: number;
  explanation: string;
};

type SuggestionOptions = {
  excludeTaskIds?: string[];
  contextSeed?: number;
};

function startOfDay(date: Date): Date {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function getDeadlineWeight(task: Task, now: Date): number {
  if (!task.deadline) {
    return 5;
  }
  const deadline = new Date(task.deadline);
  if (Number.isNaN(deadline.getTime())) {
    return 5;
  }
  if (deadline.getTime() < now.getTime()) {
    return 40;
  }
  if (isSameDay(deadline, now)) {
    return 30;
  }
  const tomorrow = startOfDay(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isSameDay(deadline, tomorrow)) {
    return 20;
  }
  return 10;
}

function getStatusWeight(task: Task): number {
  if (task.completed) {
    return 0;
  }
  return task.updatedAt !== task.createdAt ? 20 : 10;
}

function getPenalty(task: Task, now: Date): number {
  const createdAt = new Date(task.createdAt);
  const ageInDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const hasNoActivity = task.updatedAt === task.createdAt;
  if (ageInDays > 21 && hasNoActivity && !task.deadline) {
    return 20;
  }
  return 0;
}

function getBreakdown(task: Task, now: Date): ScoreBreakdown {
  return {
    priority: PRIORITY_WEIGHT[task.priority],
    deadline: getDeadlineWeight(task, now),
    category: CATEGORY_WEIGHT[task.category] ?? 8,
    status: getStatusWeight(task),
    penalty: getPenalty(task, now),
  };
}

function pickBySeed<T>(items: T[], seed: number): T {
  return items[Math.abs(seed) % items.length];
}

function getExplanation(task: Task, breakdown: ScoreBreakdown, seed = 0): string {
  const reasons: string[] = [];
  if (breakdown.priority >= 50) {
    reasons.push('it has high priority impact');
  } else if (breakdown.priority >= 30) {
    reasons.push('it carries strong priority');
  }

  if (breakdown.deadline >= 40) {
    reasons.push('it is already overdue');
  } else if (breakdown.deadline >= 30) {
    reasons.push('it is due today');
  } else if (breakdown.deadline >= 20) {
    reasons.push('it is due tomorrow');
  }

  if (breakdown.category >= 25) {
    reasons.push('it is highly relevant for today');
  }
  if (breakdown.status >= 20) {
    reasons.push('you already started it, so finishing it is efficient');
  }

  const openers = [
    'Agent recommendation:',
    'Smart focus signal:',
    'Best next move right now:',
  ];
  const closers = [
    'Start now and protect momentum.',
    'If you finish this, your day unlocks faster.',
    'This is the highest leverage move in your queue.',
  ];
  const fallback = 'it currently has the best urgency and impact balance';
  const reasonText = reasons.length > 0 ? reasons.join(', ') : fallback;

  return `${pickBySeed(openers, seed)} ${task.title} is selected because ${reasonText}. ${pickBySeed(
    closers,
    seed + task.title.length,
  )}`;
}

export function getBestTaskSuggestion(tasks: Task[], options: SuggestionOptions = {}): SuggestionResult | null {
  const now = new Date();
  const basePendingTasks = tasks.filter((task) => !task.completed);
  if (basePendingTasks.length < MIN_PENDING_TASKS_FOR_SUGGESTION) {
    return null;
  }

  const excluded = new Set(options.excludeTaskIds ?? []);
  const pendingTasks = basePendingTasks.filter((task) => !excluded.has(task.id));
  const pool = pendingTasks.length > 0 ? pendingTasks : basePendingTasks;

  if (pool.length === 0) {
    return null;
  }

  let bestTask: Task | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  let bestBreakdown: ScoreBreakdown | null = null;

  for (const task of pool) {
    const breakdown = getBreakdown(task, now);
    const score = breakdown.priority + breakdown.deadline + breakdown.category + breakdown.status - breakdown.penalty;
    if (score > bestScore) {
      bestTask = task;
      bestScore = score;
      bestBreakdown = breakdown;
    }
  }

  if (!bestTask || !bestBreakdown) {
    return null;
  }

  return {
    task: bestTask,
    score: bestScore,
    explanation: getExplanation(bestTask, bestBreakdown, options.contextSeed ?? 0),
  };
}

export function getSimpleSuggestion(tasks: Task[]): Task | null {
  const pendingTasks = tasks.filter((task) => !task.completed);
  if (pendingTasks.length < MIN_PENDING_TASKS_FOR_SUGGESTION) {
    return null;
  }
  return [...pendingTasks].sort((a, b) => {
    const priorityDelta = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
    if (priorityDelta !== 0) {
      return priorityDelta;
    }
    const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
    const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
    return aDeadline - bDeadline;
  })[0];
}

export function getSuggestedTask(tasks: Task[]): Task | null {
  return getBestTaskSuggestion(tasks)?.task ?? null;
}
