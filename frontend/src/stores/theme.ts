import { create } from 'zustand';

interface ThemeStore {
  isDark: boolean;
  toggle: () => void;
}

const stored = typeof window !== 'undefined' ? localStorage.getItem('stockroom-dark') : null;
const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

export const useThemeStore = create<ThemeStore>((set) => ({
  isDark: stored !== null ? stored === 'true' : prefersDark,
  toggle: () =>
    set((state) => {
      const next = !state.isDark;
      localStorage.setItem('stockroom-dark', String(next));
      return { isDark: next };
    }),
}));
