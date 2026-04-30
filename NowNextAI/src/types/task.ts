export const TASK_CATEGORIES = ['daily', 'weekly', 'monthly', 'yearly'] as const;
export type TaskCategory = string;

export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export type TaskStatus = 'todo' | 'completed' | 'overdue';
export type ISODateString = string;

export interface Task {
  id: string;
  title: string;
  note?: string;
  description?: string;
  category: TaskCategory;
  parentTaskId: string | null;
  notificationId: string | null;
  priority: TaskPriority;
  deadline: ISODateString | null;
  startTime: ISODateString | null;
  endTime: ISODateString | null;
  completed: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  completedAt: ISODateString | null;
}

export interface CreateTaskInput {
  title: string;
  note?: string;
  description?: string;
  category: TaskCategory;
  parentTaskId?: string | null;
  priority: TaskPriority;
  deadline: ISODateString | null;
  startTime?: ISODateString | null;
  endTime?: ISODateString | null;
}

export type UpdateTaskInput = Partial<Omit<CreateTaskInput, 'deadline'>> & {
  deadline?: ISODateString | null;
  notificationId?: string | null;
};
