import { create } from 'zustand';
import type { Capacity } from '@/api/types/capacity';
import { mockCapacities } from '@/api/demo';
import { isEffectiveDemoMode } from '@/auth/AuthProvider';
import { fabricClient } from '@/api/fabricClientInstance';

interface CapacityState {
  capacities: Capacity[];
  loading: boolean;
  error: string | null;
  fetchCapacities: () => Promise<void>;
  getCapacityById: (id: string) => Capacity | undefined;
}

export const useCapacityStore = create<CapacityState>()((set, get) => ({
  capacities: [],
  loading: false,
  error: null,

  fetchCapacities: async () => {
    set({ loading: true, error: null });
    try {
      const capacities = isEffectiveDemoMode()
        ? mockCapacities
        : await fabricClient.listAll<Capacity>('/capacities');
      set({ capacities, loading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to fetch capacities',
        loading: false,
      });
    }
  },

  getCapacityById: (id: string) => {
    return get().capacities.find((c) => c.id === id);
  },
}));
