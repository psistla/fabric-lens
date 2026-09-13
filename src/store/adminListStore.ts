import { create } from 'zustand';
import { isEffectiveDemoMode } from '@/auth/AuthProvider';
import { adminRateLimiter } from '@/utils/rateLimiter';

interface AdminListState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
}

// Admin list endpoints share one lifecycle: session cache, rate-limit guard, demo branch.
export function createAdminListStore<T>(
  fetchLive: () => Promise<T[]>,
  fetchMock: () => T[],
  failMessage: string,
) {
  return create<AdminListState<T>>()((set, get) => ({
    items: [],
    loading: false,
    error: null,

    fetch: async () => {
      const { items, error } = get();
      if (items.length > 0 && !error) return;

      if (!isEffectiveDemoMode() && !adminRateLimiter.canMakeRequest()) {
        set({ error: 'Admin API rate limit reached. Please wait before retrying.' });
        return;
      }

      set({ loading: true, error: null });
      try {
        const result = isEffectiveDemoMode() ? fetchMock() : await fetchLive();
        if (!isEffectiveDemoMode()) {
          adminRateLimiter.trackRequest();
        }
        set({ items: result, loading: false });
      } catch (e) {
        set({ error: e instanceof Error ? e.message : failMessage, loading: false });
      }
    },
  }));
}
