import { create } from 'zustand';
import type { TenantSetting } from '@/api/types/tenantSettings';
import { isDemoMode, getMockTenantSettings } from '@/api/demo';
import { fabricClient } from '@/api/fabricClientInstance';
import { createTenantSettingsApi } from '@/api/tenantSettings';
import { adminRateLimiter } from '@/utils/rateLimiter';

const api = createTenantSettingsApi(fabricClient);

interface TenantSettingsState {
  settings: TenantSetting[];
  loading: boolean;
  error: string | null;
  fetchTenantSettings: () => Promise<void>;
}

export const useTenantSettingsStore = create<TenantSettingsState>()((set, get) => ({
  settings: [],
  loading: false,
  error: null,

  fetchTenantSettings: async () => {
    const { settings, error } = get();
    // Cache guard: skip if already loaded successfully in this session
    if (settings.length > 0 && !error) return;

    if (!isDemoMode && !adminRateLimiter.canMakeRequest()) {
      set({ error: 'Admin API rate limit reached. Please wait before retrying.' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const result = isDemoMode
        ? getMockTenantSettings()
        : await api.fetchTenantSettings();
      if (!isDemoMode) {
        adminRateLimiter.trackRequest();
      }
      set({ settings: result, loading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to fetch tenant settings',
        loading: false,
      });
    }
  },
}));
