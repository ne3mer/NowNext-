import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { API_BASE_URL } from '../config/api';

type AuthUser = {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
};

type AuthResponse = {
  success: boolean;
  data: {
    token: string;
    user: AuthUser;
  };
};

type AuthStore = {
  token: string | null;
  user: AuthUser | null;
  hasHydrated: boolean;
  loading: boolean;
  error: string | null;
  setHasHydrated: (value: boolean) => void;
  clearError: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

async function postAuth(path: string, body: Record<string, unknown>): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    const payload = (text ? JSON.parse(text) : {}) as AuthResponse & { error?: string };
    if (!response.ok || !payload.success) {
      throw new Error(payload.error ?? 'Authentication failed');
    }
    return payload;
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes('network request failed')) {
      throw new Error(`Cannot reach backend at ${API_BASE_URL}.`);
    }
    if (error instanceof SyntaxError) {
      throw new Error('Backend returned invalid JSON response.');
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Authentication failed');
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hasHydrated: false,
      loading: false,
      error: null,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      clearError: () => set({ error: null }),
      register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
          const result = await postAuth('/auth/register', { name, email, password });
          set({
            token: result.data.token,
            user: result.data.user,
            loading: false,
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
          });
        }
      },
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const result = await postAuth('/auth/login', { email, password });
          set({
            token: result.data.token,
            user: result.data.user,
            loading: false,
          });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
        }
      },
      logout: () => {
        set({
          token: null,
          user: null,
          error: null,
        });
      },
    }),
    {
      name: 'nownext-auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
