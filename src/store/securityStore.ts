import { create } from 'zustand';
import type { WorkspaceUser } from '@/api/types/admin';
import { isDemoMode, getMockWorkspaceUsers } from '@/api/demo';
import { fabricClient } from '@/api/fabricClientInstance';
import { createAdminApi } from '@/api/admin';
import { ADMIN_RATE_LIMIT, DEMO_PROGRESS_DELAY_MS } from '@/utils/constants';

const api = createAdminApi(fabricClient);

interface SecurityState {
  workspaceUsers: Record<string, WorkspaceUser[]>;
  isAdmin: boolean | null; // null = not yet checked
  loading: boolean;
  error: string | null;
  scanProgress: { completed: number; total: number } | null;
  requestCount: number;
  checkAdminAccess: () => Promise<void>;
  fetchWorkspaceUsers: (workspaceId: string) => Promise<void>;
  fetchAllWorkspaceUsers: (workspaceIds: string[]) => Promise<void>;
}

export const useSecurityStore = create<SecurityState>()((set, get) => ({
  workspaceUsers: {},
  isAdmin: null,
  loading: false,
  error: null,
  scanProgress: null,
  requestCount: 0,

  checkAdminAccess: async () => {
    if (isDemoMode) {
      set({ isAdmin: true });
      return;
    }
    set({ loading: true, error: null });
    try {
      const result = await api.listAdminWorkspaces();
      if (result.success) {
        set({ isAdmin: true, loading: false });
      } else if (result.reason === 'access_denied') {
        set({ isAdmin: false, loading: false });
      } else {
        set({ isAdmin: false, error: result.message, loading: false });
      }
    } catch (e) {
      set({
        isAdmin: false,
        error: e instanceof Error ? e.message : 'Failed to check admin access',
        loading: false,
      });
    }
  },

  fetchWorkspaceUsers: async (workspaceId: string) => {
    try {
      if (isDemoMode) {
        const users = getMockWorkspaceUsers(workspaceId);
        set((state) => ({
          workspaceUsers: { ...state.workspaceUsers, [workspaceId]: users },
        }));
        return;
      }
      const result = await api.getWorkspaceUsers(workspaceId);
      if (result.success) {
        set((state) => ({
          workspaceUsers: {
            ...state.workspaceUsers,
            [workspaceId]: result.data,
          },
          requestCount: state.requestCount + 1,
        }));
      }
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to fetch workspace users',
      });
    }
  },

  fetchAllWorkspaceUsers: async (workspaceIds: string[]) => {
    const { requestCount } = get();
    const remaining = ADMIN_RATE_LIMIT - requestCount;
    const toFetch = workspaceIds.slice(0, remaining);

    set({
      loading: true,
      error: null,
      scanProgress: { completed: 0, total: toFetch.length },
    });

    if (isDemoMode) {
      // Simulate batch with small delay for visible progress
      const allUsers: Record<string, WorkspaceUser[]> = {};
      for (let i = 0; i < toFetch.length; i++) {
        allUsers[toFetch[i]] = getMockWorkspaceUsers(toFetch[i]);
        set({
          scanProgress: { completed: i + 1, total: toFetch.length },
        });
        // Tiny delay so progress bar is visible in demo
        await new Promise((r) => setTimeout(r, DEMO_PROGRESS_DELAY_MS));
      }
      set((state) => ({
        workspaceUsers: { ...state.workspaceUsers, ...allUsers },
        loading: false,
        scanProgress: null,
      }));
      return;
    }

    const allUsers: Record<string, WorkspaceUser[]> = {};
    for (let i = 0; i < toFetch.length; i++) {
      const wsId = toFetch[i];
      const result = await api.getWorkspaceUsers(wsId);
      if (result.success) {
        allUsers[wsId] = result.data;
      }
      set({
        scanProgress: { completed: i + 1, total: toFetch.length },
        requestCount: get().requestCount + 1,
      });
    }

    set((state) => ({
      workspaceUsers: { ...state.workspaceUsers, ...allUsers },
      loading: false,
      scanProgress: null,
    }));

    if (toFetch.length < workspaceIds.length) {
      set({
        error: `Rate limit: scanned ${toFetch.length} of ${workspaceIds.length} workspaces. ${workspaceIds.length - toFetch.length} skipped (${ADMIN_RATE_LIMIT} req/hr limit).`,
      });
    }
  },
}));
