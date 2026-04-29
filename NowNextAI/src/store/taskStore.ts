import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';
import { compareByDeadline } from '../utils/taskMeta';
import { CreateTaskInput, Task, TaskCategory, TaskPriority, UpdateTaskInput } from '../types/task';

type TaskStore = {
  tasks: Task[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  createTask: (input: CreateTaskInput) => Task;
  updateTask: (taskId: string, updates: UpdateTaskInput) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
  clearCompletedTasks: () => void;
};

const PRIORITY_SCORE: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function createTaskId(): string {
  return `task-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return Number(a.completed) - Number(b.completed);
    }

    const priorityDelta = PRIORITY_SCORE[b.priority] - PRIORITY_SCORE[a.priority];
    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return compareByDeadline(a, b);
  });
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      createTask: (input) => {
        const nowIso = new Date().toISOString();
        const task: Task = {
          id: createTaskId(),
          title: input.title.trim(),
          note: input.note?.trim(),
          category: input.category,
          priority: input.priority,
          deadline: input.deadline,
          completed: false,
          createdAt: nowIso,
          updatedAt: nowIso,
          completedAt: null,
        };

        set((state) => ({
          tasks: sortTasks([...state.tasks, task]),
        }));

        return task;
      },
      updateTask: (taskId, updates) => {
        set((state) => ({
          tasks: sortTasks(
            state.tasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    ...updates,
                    title: updates.title ? updates.title.trim() : task.title,
                    note: updates.note?.trim() ?? task.note,
                    updatedAt: new Date().toISOString(),
                  }
                : task,
            ),
          ),
        }));
      },
      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        }));
      },
      toggleTaskCompletion: (taskId) => {
        set((state) => ({
          tasks: sortTasks(
            state.tasks.map((task) => {
              if (task.id !== taskId) {
                return task;
              }

              const nowIso = new Date().toISOString();
              const nextCompleted = !task.completed;

              return {
                ...task,
                completed: nextCompleted,
                completedAt: nextCompleted ? nowIso : null,
                updatedAt: nowIso,
              };
            }),
          ),
        }));
      },
      clearCompletedTasks: () => {
        set((state) => ({
          tasks: state.tasks.filter((task) => !task.completed),
        }));
      },
    }),
    {
      name: 'nownext-task-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ tasks: state.tasks }),
      merge: (persistedState, currentState) => {
        const typedPersistedState = persistedState as Partial<TaskStore> | undefined;
        const persistedTasks = typedPersistedState?.tasks ?? [];

        return {
          ...currentState,
          ...typedPersistedState,
          tasks: sortTasks(persistedTasks),
          hasHydrated: false,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    },
  ),
);

export const taskSelectors = {
  byCategory: (tasks: Task[], category: TaskCategory) =>
    tasks.filter((task) => task.category === category),
  completed: (tasks: Task[]) => tasks.filter((task) => task.completed),
  pending: (tasks: Task[]) => tasks.filter((task) => !task.completed),
  byPriority: (tasks: Task[], priority: TaskPriority) =>
    tasks.filter((task) => task.priority === priority),
};
