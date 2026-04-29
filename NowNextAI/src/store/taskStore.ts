import { create } from 'zustand';
import { Task } from '../types/task';

type TaskStore = {
  tasks: Task[];
};

export const useTaskStore = create<TaskStore>(() => ({
  tasks: [],
}));
