import { create, StoreApi } from 'zustand';

interface ThemeState {
  theme: string;
  setTheme: (theme: string) => void;
}

const useThemeStore = create<ThemeState>((set: StoreApi<ThemeState>['setState']) => ({
  theme: localStorage.getItem('theme') || 'light',
  setTheme: (theme: string) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },
}));

export default useThemeStore;
