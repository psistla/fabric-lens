import { create } from 'zustand';
import type { Capacity } from '@/api/types/capacity';
import { isDemoMode, mockCapacities } from '@/api/demo';
import { fabricClient } from '@/api/fabricClientInstance';
import { createCapacitiesApi } from '@/api/capacities';

const api = createCapacitiesApi(fabricClient);

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
      const capacities = isDemoMode
        ? mockCapacities
        : await api.listCapacities();
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
