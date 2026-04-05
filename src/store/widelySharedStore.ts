import { create } from 'zustand';
import type { WidelySharedArtifact } from '@/api/types/widelyShared';
import { isDemoMode, getMockWidelySharedArtifacts } from '@/api/demo';
import { fabricClient } from '@/api/fabricClientInstance';
import { createWidelySharedApi } from '@/api/widelyShared';
import { adminRateLimiter } from '@/utils/rateLimiter';

const api = createWidelySharedApi(fabricClient);

interface WidelySharedState {
  artifacts: WidelySharedArtifact[];
  loading: boolean;
  error: string | null;
  fetchWidelySharedArtifacts: () => Promise<void>;
}

export const useWidelySharedStore = create<WidelySharedState>()((set, get) => ({
  artifacts: [],
  loading: false,
  error: null,

  fetchWidelySharedArtifacts: async () => {
    const { artifacts, error } = get();
    // Cache guard: skip if already loaded successfully in this session
    if (artifacts.length > 0 && !error) return;

    if (!isDemoMode && !adminRateLimiter.canMakeRequest()) {
      set({ error: 'Admin API rate limit reached. Please wait before retrying.' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const result = isDemoMode
        ? getMockWidelySharedArtifacts()
        : await api.fetchWidelySharedArtifacts();
      if (!isDemoMode) {
        adminRateLimiter.trackRequest();
      }
      set({ artifacts: result, loading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to fetch widely shared artifacts',
        loading: false,
      });
    }
  },
}));
