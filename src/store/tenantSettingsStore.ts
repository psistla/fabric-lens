import { create } from 'zustand';
import type { TenantSetting } from '@/api/types/tenantSettings';
import { getMockTenantSettings } from '@/api/demo';
import { isEffectiveDemoMode } from '@/auth/AuthProvider';
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

    if (!isEffectiveDemoMode() && !adminRateLimiter.canMakeRequest()) {
      set({ error: 'Admin API rate limit reached. Please wait before retrying.' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const result = isEffectiveDemoMode()
        ? getMockTenantSettings()
        : await api.fetchTenantSettings();
      if (!isEffectiveDemoMode()) {
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
