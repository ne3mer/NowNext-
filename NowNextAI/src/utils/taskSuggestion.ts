import { Task } from '../types/task';

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

function getExplanation(task: Task, breakdown: ScoreBreakdown): string {
  const reasons: string[] = [];
  if (breakdown.priority >= 50) {
    reasons.push('high priority');
  } else if (breakdown.priority >= 30) {
    reasons.push('strong priority');
  }

  if (breakdown.deadline >= 40) {
    reasons.push('overdue deadline');
  } else if (breakdown.deadline >= 30) {
    reasons.push('due today');
  } else if (breakdown.deadline >= 20) {
    reasons.push('due tomorrow');
  }

  if (breakdown.category >= 25) {
    reasons.push('relevant for today');
  }
  if (breakdown.status >= 20) {
    reasons.push('already in progress');
  }
  if (reasons.length === 0) {
    return 'This task has the best current balance of urgency and impact.';
  }
  return `This task is suggested because it has ${reasons.join(', ')}.`;
}

export function getBestTaskSuggestion(tasks: Task[]): SuggestionResult | null {
  const now = new Date();
  const pendingTasks = tasks.filter((task) => !task.completed);

  if (pendingTasks.length === 0) {
    return null;
  }

  let bestTask: Task | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  let bestBreakdown: ScoreBreakdown | null = null;

  for (const task of pendingTasks) {
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
    explanation: getExplanation(bestTask, bestBreakdown),
  };
}

export function getSimpleSuggestion(tasks: Task[]): Task | null {
  const pendingTasks = tasks.filter((task) => !task.completed);
  if (pendingTasks.length === 0) {
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
