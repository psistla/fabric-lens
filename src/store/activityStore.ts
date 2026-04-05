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
    const { ghostWorkspaces, error } = get();
    // Cache guard: skip if already loaded successfully in this session
    if (ghostWorkspaces.length > 0 && !error) return;

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
      const activityMap = new Map<string, WorkspaceActivity>();
      for (const event of events) {
        const existing = activityMap.get(event.workspaceId);
        const eventDate = new Date(event.creationTime);
        if (!existing || eventDate > existing.lastActivityDate) {
          activityMap.set(event.workspaceId, {
            workspaceId: event.workspaceId,
            workspaceName: event.workspaceName,
            lastActivityDate: eventDate,
            eventCount: (existing?.eventCount ?? 0) + 1,
          });
        } else {
          existing.eventCount++;
        }
      }
      const workspaceActivity = [...activityMap.values()];

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
