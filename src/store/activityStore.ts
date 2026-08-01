import { create } from 'zustand';
import type { Workspace } from '@/api/types/workspace';
import type { GhostWorkspace } from '@/utils/ghostWorkspaces';
import { deriveGhostWorkspaces, latestActivityByWorkspace } from '@/utils/ghostWorkspaces';
import { getMockWorkspaceActivity } from '@/api/demo';
import { isEffectiveDemoMode } from '@/auth/AuthProvider';
import { fabricClient } from '@/api/fabricClientInstance';
import { createActivityEventsApi } from '@/api/activityEvents';
import { adminRateLimiter } from '@/utils/rateLimiter';
import {
  GHOST_WORKSPACE_THRESHOLD_DAYS,
  ACTIVITY_LOG_LOOKBACK_DAYS,
} from '@/utils/constants';

const api = createActivityEventsApi(fabricClient);

interface ActivityState {
  ghostWorkspaces: GhostWorkspace[];
  loading: boolean;
  error: string | null;
  /** True when the window returned no events at all, which is a data problem, not an all-clear. */
  noActivityData: boolean;
  /** Days consumed out of the lookback window, for the scan progress indicator. */
  scanProgress: { completed: number; total: number } | null;
  lastFetchedAt: Date | null;
  fetchActivityEvents: (workspaces: Workspace[]) => Promise<void>;
}

export const useActivityStore = create<ActivityState>()((set, get) => ({
  ghostWorkspaces: [],
  loading: false,
  error: null,
  noActivityData: false,
  scanProgress: null,
  lastFetchedAt: null,

  fetchActivityEvents: async (workspaces: Workspace[]) => {
    const { lastFetchedAt, error, loading } = get();
    // Cache guard: skip if already loaded successfully in this session
    if (lastFetchedAt !== null && !error) return;
    // In-flight guard: the page effect and Scan All can both fire this, and a 28-day walk is
    // slow enough for the calls to overlap.
    if (loading) return;

    // The scan costs one request per day of the window. A partial walk would silently report
    // workspaces as inactive purely because their day never got fetched, so refuse rather than
    // start one that cannot finish.
    if (!isEffectiveDemoMode() && adminRateLimiter.getRemainingRequests() < ACTIVITY_LOG_LOOKBACK_DAYS) {
      set({ error: 'Admin API rate limit reached. Please wait before retrying.' });
      return;
    }

    set({ loading: true, error: null, noActivityData: false, scanProgress: null });
    try {
      let lastActivityMap: Map<string, Date>;
      if (isEffectiveDemoMode()) {
        lastActivityMap = latestActivityByWorkspace(getMockWorkspaceActivity());
      } else {
        lastActivityMap = await api.fetchLatestActivityByWorkspace(ACTIVITY_LOG_LOOKBACK_DAYS, {
          onProgress: (completed, total) => set({ scanProgress: { completed, total } }),
        });
      }

      // Zero events across the whole window means the log is unreadable, not that the tenant is
      // idle. Without this guard every workspace falls through as a ghost and the panel confidently
      // reports the entire tenant dead.
      if (lastActivityMap.size === 0 && workspaces.length > 0) {
        set({
          ghostWorkspaces: [],
          noActivityData: true,
          loading: false,
          scanProgress: null,
          lastFetchedAt: new Date(),
        });
        return;
      }

      const ghostWorkspacesResult = deriveGhostWorkspaces(
        lastActivityMap,
        workspaces,
        GHOST_WORKSPACE_THRESHOLD_DAYS,
        ACTIVITY_LOG_LOOKBACK_DAYS,
      );

      set({
        ghostWorkspaces: ghostWorkspacesResult,
        loading: false,
        scanProgress: null,
        lastFetchedAt: new Date(),
      });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to fetch activity events',
        loading: false,
        scanProgress: null,
      });
    }
  },
}));
