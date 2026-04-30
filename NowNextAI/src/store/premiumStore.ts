import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type PremiumStore = {
  isPremiumUser: boolean;
  lastFreeSuggestionAt: string | null;
  unlockPremium: () => void;
  canUseFreeSuggestion: () => boolean;
  consumeFreeSuggestion: () => void;
};

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export const usePremiumStore = create<PremiumStore>()(
  persist(
    (set, get) => ({
      isPremiumUser: false,
      lastFreeSuggestionAt: null,
      unlockPremium: () => set({ isPremiumUser: true }),
      canUseFreeSuggestion: () => {
        const { lastFreeSuggestionAt } = get();
        if (!lastFreeSuggestionAt) {
          return true;
        }
        return dayKey(new Date(lastFreeSuggestionAt)) !== dayKey(new Date());
      },
      consumeFreeSuggestion: () => set({ lastFreeSuggestionAt: new Date().toISOString() }),
    }),
    {
      name: 'nownext-premium-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isPremiumUser: state.isPremiumUser,
        lastFreeSuggestionAt: state.lastFreeSuggestionAt,
      }),
    },
  ),
);
