import { create } from 'zustand';
import { API_BASE_URL } from '../config/api';

export type CategoryItem = {
  _id: string;
  name: string;
  isDefault: boolean;
};

type CategoryStore = {
  categories: CategoryItem[];
  loading: boolean;
  error: string | null;
  fetchCategories: (token: string | null) => Promise<void>;
  createCategory: (token: string | null, name: string) => Promise<void>;
};

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await res.json()) as { success: boolean; data: T; error?: string };
  if (!res.ok || !payload.success) {
    throw new Error(payload.error ?? 'Category request failed');
  }
  return payload.data;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  loading: false,
  error: null,
  fetchCategories: async (token) => {
    if (!token) return;
    set({ loading: true, error: null });
    try {
      const data = await request<CategoryItem[]>('/categories', token);
      set({ categories: data, loading: false });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to fetch categories' });
    }
  },
  createCategory: async (token, name) => {
    if (!token) return;
    const normalized = name.trim().toLowerCase();
    if (!normalized) return;
    set({ loading: true, error: null });
    try {
      await request<CategoryItem>('/categories', token, {
        method: 'POST',
        body: JSON.stringify({ name: normalized }),
      });
      const data = await request<CategoryItem[]>('/categories', token);
      set({ categories: data, loading: false });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to create category' });
    }
  },
}));
