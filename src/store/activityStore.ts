import { create } from 'zustand';
import type { Workspace } from '@/api/types/workspace';
import type { ActivityEvent, WorkspaceActivity } from '@/api/types/activityEvents';
import type { GhostWorkspace } from '@/utils/ghostWorkspaces';
import { deriveGhostWorkspaces } from '@/utils/ghostWorkspaces';
import { isDemoMode, getMockWorkspaceActivity } from '@/api/demo';
import { fabricClient } from '@/api/fabricClientInstance';
import { createActivityEventsApi } from '@/api/activityEvents';
import { adminRateLimiter } from '@/utils/rateLimiter';
import {
  GHOST_WORKSPACE_THRESHOLD_DAYS,
  ACTIVITY_LOG_LOOKBACK_DAYS,
} from '@/utils/constants';

const api = createActivityEventsApi(fabricClient);

interface ActivityState {
  workspaceActivity: WorkspaceActivity[];
  ghostWorkspaces: GhostWorkspace[];
  loading: boolean;
  error: string | null;
  lastFetchedAt: Date | null;
  fetchActivityEvents: (workspaces: Workspace[]) => Promise<void>;
}

export const useActivityStore = create<ActivityState>()((set, get) => ({
  workspaceActivity: [],
  ghostWorkspaces: [],
  loading: false,
  error: null,
  lastFetchedAt: null,

  fetchActivityEvents: async (workspaces: Workspace[]) => {
    const { lastFetchedAt, error } = get();
    // Cache guard: skip if already loaded successfully in this session
    if (lastFetchedAt !== null && !error) return;

    if (!isDemoMode && !adminRateLimiter.canMakeRequest()) {
      set({ error: 'Admin API rate limit reached. Please wait before retrying.' });
      return;
    }

    set({ loading: true, error: null });
    try {
      let events: ActivityEvent[];
      if (isDemoMode) {
        events = getMockWorkspaceActivity();
      } else {
        const now = new Date();
        const start = new Date(now.getTime() - ACTIVITY_LOG_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
        const endDateTime = now.toISOString();
        const startDateTime = start.toISOString();
        events = await api.fetchActivityEvents(startDateTime, endDateTime);
      }

      const ghostWorkspacesResult = deriveGhostWorkspaces(
        events,
        workspaces,
        GHOST_WORKSPACE_THRESHOLD_DAYS,
        ACTIVITY_LOG_LOOKBACK_DAYS,
      );

      // Build workspaceActivity from events: group by workspaceId, track latest date and count
      const lastDateMap = new Map<string, Date>();
      const countMap = new Map<string, { name: string; count: number }>();

      for (const event of events) {
        const eventDate = new Date(event.creationTime);
        const existing = lastDateMap.get(event.workspaceId);
        if (!existing || eventDate > existing) {
          lastDateMap.set(event.workspaceId, eventDate);
        }
        const meta = countMap.get(event.workspaceId);
        if (!meta) {
          countMap.set(event.workspaceId, { name: event.workspaceName, count: 1 });
        } else {
          meta.count++;
        }
      }

      const workspaceActivity: WorkspaceActivity[] = [];
      for (const [workspaceId, lastDate] of lastDateMap.entries()) {
        const meta = countMap.get(workspaceId)!;
        workspaceActivity.push({
          workspaceId,
          workspaceName: meta.name,
          lastActivityDate: lastDate,
          eventCount: meta.count,
        });
      }

      if (!isDemoMode) {
        adminRateLimiter.trackRequest();
      }

      set({
        workspaceActivity,
        ghostWorkspaces: ghostWorkspacesResult,
        loading: false,
        lastFetchedAt: new Date(),
      });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to fetch activity events',
        loading: false,
      });
    }
  },
}));
