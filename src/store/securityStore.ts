import { create } from 'zustand';
import type { WorkspaceUser, ResolvedGroup } from '@/api/types/admin';
import {
  getMockWorkspaceUsers,
  getMockGroupMemberCount,
  getMockResolvedGroup,
} from '@/api/demo';
import { isEffectiveDemoMode } from '@/auth/AuthProvider';
import { fabricClient } from '@/api/fabricClientInstance';
import { createAdminApi } from '@/api/admin';
import { ADMIN_RATE_LIMIT, DEMO_PROGRESS_DELAY_MS } from '@/utils/constants';
import { adminRateLimiter, type RateLimitUsage } from '@/utils/rateLimiter';
import { useToastStore } from '@/components/shared/Toast';

const api = createAdminApi(fabricClient);

function trackAdminRequest(set: (partial: Partial<SecurityState>) => void): void {
  adminRateLimiter.trackRequest();
  const usage = adminRateLimiter.getUsage();
  set({ rateLimitUsage: usage });
  if (adminRateLimiter.isApproachingLimit()) {
    useToastStore.getState().addToast(
      'info',
      `Approaching Fabric Admin API rate limit (${usage.count}/${usage.limit} requests this hour). Data may be incomplete.`,
    );
  }
}

export type FetchResult =
  | { status: 'ok' }
  | { status: 'access_denied' }
  | { status: 'error'; message: string };

interface SecurityState {
  workspaceUsers: Record<string, WorkspaceUser[]>;
  resolvedGroups: Record<string, ResolvedGroup>;
  isAdmin: boolean | null; // null = not yet checked
  loading: boolean;
  error: string | null;
  scanProgress: { completed: number; total: number } | null;
  rateLimitUsage: RateLimitUsage | null;
  checkAdminAccess: () => Promise<void>;
  fetchWorkspaceUsers: (workspaceId: string) => Promise<void>;
  fetchAllWorkspaceUsers: (workspaceIds: string[]) => Promise<FetchResult>;
  resolveGroupCount: (groupUpn: string, displayName: string) => Promise<void>;
  resolveGroupMembers: (groupUpn: string, displayName: string) => Promise<void>;
}

export const useSecurityStore = create<SecurityState>()((set, get) => ({
  workspaceUsers: {},
  resolvedGroups: {},
  isAdmin: null,
  loading: false,
  error: null,
  scanProgress: null,
  rateLimitUsage: null,

  checkAdminAccess: async () => {
    if (isEffectiveDemoMode()) {
      set({ isAdmin: true });
      return;
    }
    set({ loading: true, error: null });
    try {
      const result = await api.listAdminWorkspaces();
      if (result.success) {
        set({ isAdmin: true, loading: false });
      } else if (result.reason === 'access_denied') {
        // 403 — user genuinely lacks the Fabric Admin role
        set({ isAdmin: false, loading: false });
      } else {
        // Non-403 error (network, server, token issue) — don't block as if role is missing
        set({ isAdmin: null, error: result.message, loading: false });
      }
    } catch (e) {
      // Unexpected error — leave isAdmin: null so user can retry
      set({
        isAdmin: null,
        error: e instanceof Error ? e.message : 'Failed to check admin access',
        loading: false,
      });
    }
  },

  fetchWorkspaceUsers: async (workspaceId: string) => {
    try {
      if (isEffectiveDemoMode()) {
        const users = getMockWorkspaceUsers(workspaceId);
        set((state) => ({
          workspaceUsers: { ...state.workspaceUsers, [workspaceId]: users },
        }));
        return;
      }
      if (!adminRateLimiter.canMakeRequest()) {
        set({ error: `Admin API rate limit reached (${ADMIN_RATE_LIMIT} req/hr). Try again later.` });
        return;
      }
      const result = await api.getWorkspaceUsers(workspaceId);
      if (result.success) {
        trackAdminRequest(set);
        set((state) => ({
          workspaceUsers: {
            ...state.workspaceUsers,
            [workspaceId]: result.data,
          },
        }));
      }
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to fetch workspace users',
      });
    }
  },

  fetchAllWorkspaceUsers: async (workspaceIds: string[]) => {
    const remaining = adminRateLimiter.getRemainingRequests();
    const toFetch = workspaceIds.slice(0, remaining);

    set({
      loading: true,
      error: null,
      scanProgress: { completed: 0, total: toFetch.length },
    });

    if (isEffectiveDemoMode()) {
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
      return { status: 'ok' };
    }

    const allUsers: Record<string, WorkspaceUser[]> = {};
    for (let i = 0; i < toFetch.length; i++) {
      const wsId = toFetch[i];
      const result = await api.getWorkspaceUsers(wsId);
      if (i === 0 && !result.success && result.reason === 'access_denied') {
        set({ loading: false, scanProgress: null });
        return { status: 'access_denied' };
      }
      if (result.success) {
        allUsers[wsId] = result.data;
      }
      trackAdminRequest(set);
      set({
        scanProgress: { completed: i + 1, total: toFetch.length },
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

    return { status: 'ok' };
  },

  resolveGroupCount: async (groupUpn: string, displayName: string) => {
    const existing = get().resolvedGroups[groupUpn];
    if (existing?.memberCount !== null && existing?.memberCount !== undefined) return;

    if (isEffectiveDemoMode()) {
      const count = getMockGroupMemberCount(groupUpn);
      set((state) => ({
        resolvedGroups: {
          ...state.resolvedGroups,
          [groupUpn]: {
            groupId: groupUpn,
            displayName,
            memberCount: count,
            members: state.resolvedGroups[groupUpn]?.members ?? [],
            loading: false,
            error: null,
          },
        },
      }));
      return;
    }

    // Live mode: would call Microsoft Graph API GET /groups/{id}/members/$count
    // For now, set as unknown until resolveGroupMembers is called
    set((state) => ({
      resolvedGroups: {
        ...state.resolvedGroups,
        [groupUpn]: {
          groupId: groupUpn,
          displayName,
          memberCount: null,
          members: [],
          loading: false,
          error: null,
        },
      },
    }));
  },

  resolveGroupMembers: async (groupUpn: string, displayName: string) => {
    const existing = get().resolvedGroups[groupUpn];
    if (existing?.members && existing.members.length > 0) return;

    set((state) => ({
      resolvedGroups: {
        ...state.resolvedGroups,
        [groupUpn]: {
          groupId: groupUpn,
          displayName,
          memberCount: existing?.memberCount ?? null,
          members: [],
          loading: true,
          error: null,
        },
      },
    }));

    if (isEffectiveDemoMode()) {
      // Simulate brief loading delay
      await new Promise((r) => setTimeout(r, 400));
      const resolved = getMockResolvedGroup(groupUpn, displayName);
      set((state) => ({
        resolvedGroups: {
          ...state.resolvedGroups,
          [groupUpn]: resolved,
        },
      }));
      return;
    }

    // Live mode: would call Microsoft Graph API GET /groups/{id}/members
    // This requires User.Read.All or GroupMember.Read.All consent
    // For now, set consent_required error as placeholder
    set((state) => ({
      resolvedGroups: {
        ...state.resolvedGroups,
        [groupUpn]: {
          groupId: groupUpn,
          displayName,
          memberCount: existing?.memberCount ?? null,
          members: [],
          loading: false,
          error: 'consent_required',
        },
      },
    }));
  },
}));
