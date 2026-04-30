import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';
import { API_BASE_URL } from '../config/api';
import { compareByDeadline } from '../utils/taskMeta';
import { CreateTaskInput, Task, TaskCategory, TaskPriority, UpdateTaskInput } from '../types/task';

type TaskStore = {
  tasks: Task[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  reset: () => void;
  setLocalTaskMeta: (taskId: string, updates: Pick<UpdateTaskInput, 'parentTaskId' | 'notificationId'>) => void;
  syncFromBackend: (token: string) => Promise<void>;
  createTask: (input: CreateTaskInput, token?: string | null) => Promise<Task | null>;
  updateTask: (taskId: string, updates: UpdateTaskInput, token?: string | null) => Promise<void>;
  deleteTask: (taskId: string, token?: string | null) => Promise<void>;
  toggleTaskCompletion: (taskId: string, token?: string | null) => Promise<void>;
  clearCompletedTasks: () => void;
};

const PRIORITY_SCORE: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

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

type BackendTask = {
  _id: string;
  title: string;
  note?: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: 'todo' | 'in_progress' | 'done';
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function fromBackend(task: BackendTask): Task {
  return {
    id: task._id,
    title: task.title,
    note: task.note ?? task.description ?? undefined,
    description: task.description ?? undefined,
    category: task.category,
    parentTaskId: null,
    notificationId: null,
    priority: task.priority,
    deadline: task.dueDate,
    completed: task.status === 'done',
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    completedAt: task.completedAt,
  };
}

function toBackend(input: CreateTaskInput | UpdateTaskInput) {
  return {
    title: input.title,
    note: input.note,
    description: input.description ?? input.note,
    category: input.category,
    priority: input.priority,
    dueDate: input.deadline,
  };
}

async function apiRequest<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await response.json()) as { success: boolean; data: T; error?: string };
  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? 'Request failed');
  }
  return payload.data;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      reset: () => set({ tasks: [], hasHydrated: false }),
      setLocalTaskMeta: (taskId, updates) => {
        set((state) => ({
          tasks: sortTasks(
            state.tasks.map((task) =>
              task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task,
            ),
          ),
        }));
      },
      syncFromBackend: async (token) => {
        const remoteTasks = await apiRequest<BackendTask[]>('/tasks', token);
        set({
          tasks: sortTasks(remoteTasks.map(fromBackend)),
          hasHydrated: true,
        });
      },
      createTask: async (input, token) => {
        if (!token) {
          return null;
        }
        const remoteTask = await apiRequest<BackendTask>('/tasks', token, {
          method: 'POST',
          body: JSON.stringify({
            ...toBackend(input),
            status: 'todo',
          }),
        });
        const task = fromBackend(remoteTask);
        set((state) => ({
          tasks: sortTasks([...state.tasks, task]),
        }));
        return task;
      },
      updateTask: async (taskId, updates, token) => {
        if (!token) {
          return;
        }
        const mapped = toBackend(updates);
        const remoteTask = await apiRequest<BackendTask>(`/tasks/${taskId}`, token, {
          method: 'PATCH',
          body: JSON.stringify(mapped),
        });
        const task = fromBackend(remoteTask);
        set((state) => ({
          tasks: sortTasks(state.tasks.map((item) => (item.id === taskId ? { ...item, ...task } : item))),
        }));
      },
      deleteTask: async (taskId, token) => {
        if (!token) {
          return;
        }
        await apiRequest<{ deleted: boolean }>(`/tasks/${taskId}`, token, {
          method: 'DELETE',
        });
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        }));
      },
      toggleTaskCompletion: async (taskId, token) => {
        if (!token) {
          return;
        }
        const current = get().tasks.find((task) => task.id === taskId);
        if (!current) {
          return;
        }
        if (current.completed) {
          const remoteTask = await apiRequest<BackendTask>(`/tasks/${taskId}`, token, {
            method: 'PATCH',
            body: JSON.stringify({
              status: 'todo',
              completedAt: null,
            }),
          });
          const task = fromBackend(remoteTask);
          set((state) => ({
            tasks: sortTasks(state.tasks.map((item) => (item.id === taskId ? { ...item, ...task } : item))),
          }));
          return;
        }
        const remoteTask = await apiRequest<BackendTask>(`/tasks/${taskId}/complete`, token, {
          method: 'PATCH',
        });
        const task = fromBackend(remoteTask);
        set((state) => ({
          tasks: sortTasks(state.tasks.map((item) => (item.id === taskId ? { ...item, ...task } : item))),
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
          state.setHasHydrated(false);
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
