import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AppTheme = {
  colors: {
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    tabActive: string;
    tabInactive: string;
    success: string;
    category: {
      daily: string;
      weekly: string;
      monthly: string;
      yearly: string;
    };
    priority: {
      low: string;
      medium: string;
      high: string;
    };
  };
  radius: {
    md: number;
    lg: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
  };
  shadow: {
    card: {
      shadowColor: string;
      shadowOpacity: number;
      shadowRadius: number;
      shadowOffset: { width: number; height: number };
      elevation: number;
    };
  };
};

const shared = {
  radius: {
    md: 14,
    lg: 18,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 20,
  },
  shadow: {
    card: {
      shadowColor: '#0f172a',
      shadowOpacity: 0.08,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
  },
} as const;

export const lightTheme: AppTheme = {
  colors: {
    background: '#f8fafc',
    surface: '#ffffff',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    border: '#e2e8f0',
    tabActive: '#0f172a',
    tabInactive: '#64748b',
    success: '#15803d',
    category: {
      daily: '#fee2e2',
      weekly: '#dcfce7',
      monthly: '#ede9fe',
      yearly: '#dbeafe',
    },
    priority: {
      low: '#0284c7',
      medium: '#b45309',
      high: '#b91c1c',
    },
  },
  ...shared,
};

export const darkTheme: AppTheme = {
  colors: {
    background: '#020617',
    surface: '#0f172a',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    border: '#1e293b',
    tabActive: '#f8fafc',
    tabInactive: '#94a3b8',
    success: '#4ade80',
    category: {
      daily: '#7f1d1d',
      weekly: '#14532d',
      monthly: '#4c1d95',
      yearly: '#1e3a8a',
    },
    priority: {
      low: '#38bdf8',
      medium: '#f59e0b',
      high: '#f87171',
    },
  },
  ...shared,
};

type ThemeMode = 'light' | 'dark';
type ThemeStore = {
  mode: ThemeMode;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'light',
      toggleTheme: () =>
        set((state) => ({
          mode: state.mode === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'nownext-theme-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function useAppTheme() {
  const mode = useThemeStore((state) => state.mode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const theme = mode === 'dark' ? darkTheme : lightTheme;
  return { theme, mode, isDark: mode === 'dark', toggleTheme };
}
