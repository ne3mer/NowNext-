export type TaskCategory = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  deadline: string | null;
  completed: boolean;
  createdAt: string;
}
