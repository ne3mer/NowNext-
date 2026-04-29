export const TASK_CATEGORIES = ['daily', 'weekly', 'monthly', 'yearly'] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export type TaskStatus = 'todo' | 'completed' | 'overdue';
export type ISODateString = string;

export interface Task {
  id: string;
  title: string;
  note?: string;
  category: TaskCategory;
  priority: TaskPriority;
  deadline: ISODateString | null;
  completed: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  completedAt: ISODateString | null;
}

export interface CreateTaskInput {
  title: string;
  note?: string;
  category: TaskCategory;
  priority: TaskPriority;
  deadline: ISODateString | null;
}

export type UpdateTaskInput = Partial<Omit<CreateTaskInput, 'deadline'>> & {
  deadline?: ISODateString | null;
};
