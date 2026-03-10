import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface UiState {
  sidebarCollapsed: boolean;
  theme: Theme;
  lastRefresh: Date | null;
  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
  setLastRefresh: () => void;
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: 'light' as Theme,
      lastRefresh: null,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setTheme: (theme: Theme) => {
        applyTheme(theme);
        set({ theme });
      },
      setLastRefresh: () => set({ lastRefresh: new Date() }),
    }),
    {
      name: 'fabric-lens-ui',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
        }
      },
    },
  ),
);
