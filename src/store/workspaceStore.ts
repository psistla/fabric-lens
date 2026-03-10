import { create } from 'zustand';
import type { Workspace } from '@/api/types/workspace';
import type { Item } from '@/api/types/item';
import {
  isDemoMode,
  mockWorkspaces,
  getMockWorkspaceItems,
  getMockAllWorkspaceItems,
} from '@/api/demo';
import { fabricClient } from '@/api/fabricClientInstance';
import { createWorkspacesApi } from '@/api/workspaces';

const api = createWorkspacesApi(fabricClient);

interface WorkspaceState {
  workspaces: Workspace[];
  allItemsByWorkspace: Record<string, Item[]>;
  selectedWorkspace: Workspace | null;
  selectedWorkspaceItems: Item[];
  loading: boolean;
  error: string | null;
  fetchWorkspaces: () => Promise<void>;
  fetchWorkspaceDetail: (id: string) => Promise<void>;
  fetchWorkspaceItems: (workspaceId: string) => Promise<void>;
  fetchAllItems: () => Promise<void>;
  clearSelection: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()((set, get) => ({
  workspaces: [],
  allItemsByWorkspace: {},
  selectedWorkspace: null,
  selectedWorkspaceItems: [],
  loading: false,
  error: null,

  fetchWorkspaces: async () => {
    set({ loading: true, error: null });
    try {
      const workspaces = isDemoMode
        ? mockWorkspaces
        : await api.listWorkspaces();
      set({ workspaces, loading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to fetch workspaces',
        loading: false,
      });
    }
  },

  fetchWorkspaceDetail: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const workspace = isDemoMode
        ? mockWorkspaces.find((w) => w.id === id) ?? null
        : await api.getWorkspace(id);
      set({ selectedWorkspace: workspace, loading: false });
    } catch (e) {
      set({
        error:
          e instanceof Error ? e.message : 'Failed to fetch workspace detail',
        loading: false,
      });
    }
  },

  fetchWorkspaceItems: async (workspaceId: string) => {
    set({ loading: true, error: null });
    try {
      const items = isDemoMode
        ? getMockWorkspaceItems(workspaceId)
        : await api.listWorkspaceItems(workspaceId);
      set({ selectedWorkspaceItems: items, loading: false });
    } catch (e) {
      set({
        error:
          e instanceof Error ? e.message : 'Failed to fetch workspace items',
        loading: false,
      });
    }
  },

  fetchAllItems: async () => {
    try {
      if (isDemoMode) {
        set({ allItemsByWorkspace: getMockAllWorkspaceItems() });
        return;
      }
      const { workspaces } = get();
      const result: Record<string, Item[]> = {};
      for (const ws of workspaces) {
        result[ws.id] = await api.listWorkspaceItems(ws.id);
      }
      set({ allItemsByWorkspace: result });
    } catch (e) {
      set({
        error:
          e instanceof Error ? e.message : 'Failed to fetch all items',
      });
    }
  },

  clearSelection: () => {
    set({ selectedWorkspace: null, selectedWorkspaceItems: [] });
  },
}));
