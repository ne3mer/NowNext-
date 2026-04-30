import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type SuggestionHistoryItem = {
  taskId: string;
  taskTitle: string;
  score: number;
  explanation: string | null;
  createdAt: string;
};

type PremiumStore = {
  premiumByUser: Record<string, boolean>;
  lastFreeSuggestionAtByUser: Record<string, string | null>;
  suggestionHistoryByUser: Record<string, SuggestionHistoryItem[]>;
  focusModeUntilByUser: Record<string, string | null>;
  focusNotificationIdByUser: Record<string, string | null>;
  focusPausedRemainingMsByUser: Record<string, number | null>;
  getIsPremiumForUser: (userId: string | null | undefined) => boolean;
  unlockPremium: (userId: string | null | undefined) => void;
  canUseFreeSuggestionForUser: (userId: string | null | undefined) => boolean;
  consumeFreeSuggestion: (userId: string | null | undefined) => void;
  getSuggestionHistory: (userId: string | null | undefined) => SuggestionHistoryItem[];
  addSuggestionHistory: (userId: string | null | undefined, item: Omit<SuggestionHistoryItem, 'createdAt'>) => void;
  getFocusModeUntil: (userId: string | null | undefined) => string | null;
  getFocusNotificationId: (userId: string | null | undefined) => string | null;
  getFocusPausedRemainingMs: (userId: string | null | undefined) => number | null;
  setFocusNotificationId: (userId: string | null | undefined, notificationId: string | null) => void;
  setFocusMode: (userId: string | null | undefined, minutes: number) => void;
  setFocusModeFromRemainingMs: (userId: string | null | undefined, remainingMs: number) => void;
  setFocusPausedRemainingMs: (userId: string | null | undefined, remainingMs: number | null) => void;
  clearFocusMode: (userId: string | null | undefined) => void;
};

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export const usePremiumStore = create<PremiumStore>()(
  persist(
    (set, get) => ({
      premiumByUser: {},
      lastFreeSuggestionAtByUser: {},
      suggestionHistoryByUser: {},
      focusModeUntilByUser: {},
      focusNotificationIdByUser: {},
      focusPausedRemainingMsByUser: {},
      getIsPremiumForUser: (userId) => {
        if (!userId) {
          return false;
        }
        return get().premiumByUser[userId] ?? false;
      },
      unlockPremium: (userId) => {
        if (!userId) {
          return;
        }
        set((state) => ({
          premiumByUser: {
            ...state.premiumByUser,
            [userId]: true,
          },
        }));
      },
      canUseFreeSuggestionForUser: (userId) => {
        if (!userId) {
          return false;
        }
        const lastFreeSuggestionAt = get().lastFreeSuggestionAtByUser[userId] ?? null;
        if (!lastFreeSuggestionAt) {
          return true;
        }
        return dayKey(new Date(lastFreeSuggestionAt)) !== dayKey(new Date());
      },
      consumeFreeSuggestion: (userId) => {
        if (!userId) {
          return;
        }
        set((state) => ({
          lastFreeSuggestionAtByUser: {
            ...state.lastFreeSuggestionAtByUser,
            [userId]: new Date().toISOString(),
          },
        }));
      },
      getSuggestionHistory: (userId) => {
        if (!userId) {
          return [];
        }
        return get().suggestionHistoryByUser[userId] ?? [];
      },
      addSuggestionHistory: (userId, item) => {
        if (!userId) {
          return;
        }
        set((state) => {
          const current = state.suggestionHistoryByUser[userId] ?? [];
          return {
            suggestionHistoryByUser: {
              ...state.suggestionHistoryByUser,
              [userId]: [{ ...item, createdAt: new Date().toISOString() }, ...current].slice(0, 30),
            },
          };
        });
      },
      getFocusModeUntil: (userId) => {
        if (!userId) {
          return null;
        }
        return get().focusModeUntilByUser[userId] ?? null;
      },
      getFocusNotificationId: (userId) => {
        if (!userId) {
          return null;
        }
        return get().focusNotificationIdByUser[userId] ?? null;
      },
      getFocusPausedRemainingMs: (userId) => {
        if (!userId) {
          return null;
        }
        return get().focusPausedRemainingMsByUser[userId] ?? null;
      },
      setFocusNotificationId: (userId, notificationId) => {
        if (!userId) {
          return;
        }
        set((state) => ({
          focusNotificationIdByUser: {
            ...state.focusNotificationIdByUser,
            [userId]: notificationId,
          },
        }));
      },
      setFocusMode: (userId, minutes) => {
        if (!userId) {
          return;
        }
        const endsAt = new Date(Date.now() + minutes * 60 * 1000).toISOString();
        set((state) => ({
          focusModeUntilByUser: {
            ...state.focusModeUntilByUser,
            [userId]: endsAt,
          },
          focusPausedRemainingMsByUser: {
            ...state.focusPausedRemainingMsByUser,
            [userId]: null,
          },
        }));
      },
      setFocusModeFromRemainingMs: (userId, remainingMs) => {
        if (!userId || remainingMs <= 0) {
          return;
        }
        const endsAt = new Date(Date.now() + remainingMs).toISOString();
        set((state) => ({
          focusModeUntilByUser: {
            ...state.focusModeUntilByUser,
            [userId]: endsAt,
          },
          focusPausedRemainingMsByUser: {
            ...state.focusPausedRemainingMsByUser,
            [userId]: null,
          },
        }));
      },
      setFocusPausedRemainingMs: (userId, remainingMs) => {
        if (!userId) {
          return;
        }
        set((state) => ({
          focusPausedRemainingMsByUser: {
            ...state.focusPausedRemainingMsByUser,
            [userId]: remainingMs,
          },
          focusModeUntilByUser: {
            ...state.focusModeUntilByUser,
            [userId]: null,
          },
        }));
      },
      clearFocusMode: (userId) => {
        if (!userId) {
          return;
        }
        set((state) => ({
          focusModeUntilByUser: {
            ...state.focusModeUntilByUser,
            [userId]: null,
          },
          focusNotificationIdByUser: {
            ...state.focusNotificationIdByUser,
            [userId]: null,
          },
          focusPausedRemainingMsByUser: {
            ...state.focusPausedRemainingMsByUser,
            [userId]: null,
          },
        }));
      },
    }),
    {
      name: 'nownext-premium-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        premiumByUser: state.premiumByUser,
        lastFreeSuggestionAtByUser: state.lastFreeSuggestionAtByUser,
        suggestionHistoryByUser: state.suggestionHistoryByUser,
        focusModeUntilByUser: state.focusModeUntilByUser,
        focusNotificationIdByUser: state.focusNotificationIdByUser,
        focusPausedRemainingMsByUser: state.focusPausedRemainingMsByUser,
      }),
      merge: (persistedState, currentState) => {
        const state = persistedState as Partial<PremiumStore> | undefined;
        const premiumByUser =
          state?.premiumByUser && typeof state.premiumByUser === 'object' ? state.premiumByUser : {};
        const lastFreeSuggestionAtByUser =
          state?.lastFreeSuggestionAtByUser && typeof state.lastFreeSuggestionAtByUser === 'object'
            ? state.lastFreeSuggestionAtByUser
            : {};
        const suggestionHistoryByUser =
          state?.suggestionHistoryByUser && typeof state.suggestionHistoryByUser === 'object'
            ? state.suggestionHistoryByUser
            : {};
        const focusModeUntilByUser =
          state?.focusModeUntilByUser && typeof state.focusModeUntilByUser === 'object'
            ? state.focusModeUntilByUser
            : {};
        const focusNotificationIdByUser =
          state?.focusNotificationIdByUser && typeof state.focusNotificationIdByUser === 'object'
            ? state.focusNotificationIdByUser
            : {};
        const focusPausedRemainingMsByUser =
          state?.focusPausedRemainingMsByUser && typeof state.focusPausedRemainingMsByUser === 'object'
            ? state.focusPausedRemainingMsByUser
            : {};

        return {
          ...currentState,
          premiumByUser,
          lastFreeSuggestionAtByUser,
          suggestionHistoryByUser,
          focusModeUntilByUser,
          focusNotificationIdByUser,
          focusPausedRemainingMsByUser,
        };
      },
    },
  ),
);
