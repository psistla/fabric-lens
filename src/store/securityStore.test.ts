import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted ensures mockGetWorkspaceUsers is initialized before vi.mock factories
// run (which are hoisted above all variable declarations by Vitest).
// Without vi.hoisted, the factory would capture `undefined`.
const mockGetWorkspaceUsers = vi.hoisted(() => vi.fn());
const mockGetGroupMemberCount = vi.hoisted(() => vi.fn());
const mockGetGroupMembers = vi.hoisted(() => vi.fn());

// The store imports createAdminApi (not getWorkspaceUsers directly) and calls it
// at module scope: `const api = createAdminApi(fabricClient)`. Mock the factory.
vi.mock('@/api/admin', () => ({
  createAdminApi: () => ({
    listAdminWorkspaces: vi.fn(),
    getWorkspaceUsers: mockGetWorkspaceUsers,
  }),
}));
vi.mock('@/api/fabricClientInstance', () => ({ fabricClient: {} }));
vi.mock('@/api/graphClient', () => ({
  getGroupMemberCount: mockGetGroupMemberCount,
  getGroupMembers: mockGetGroupMembers,
}));
vi.mock('@/api/demo', () => ({
  isDemoMode: false,
  isMsalConfigured: true,
  getMockWorkspaceUsers: () => [],
  getMockAllWorkspaceUsers: () => ({}),
  getMockGroupMemberCount: () => 0,
  getMockResolvedGroup: () => ({ members: [], memberCount: 0 }),
}));
// isEffectiveDemoMode returns false so the store exercises live-mode code paths.
vi.mock('@/auth/AuthProvider', () => ({
  msalInstance: null,
  isEffectiveDemoMode: () => false,
}));
// Mock the rate limiter so getRemainingRequests always returns 200
// (avoids test-order sensitivity from the in-memory singleton)
vi.mock('@/utils/rateLimiter', () => ({
  adminRateLimiter: {
    getRemainingRequests: () => 200,
    canMakeRequest: () => true,
    trackRequest: vi.fn(),
    getUsage: () => ({ count: 1, limit: 200, resetAt: new Date() }),
    isApproachingLimit: () => false,
  },
}));
vi.mock('@/components/shared/Toast', () => ({
  useToastStore: { getState: () => ({ addToast: vi.fn() }) },
}));

import { useSecurityStore } from './securityStore';

beforeEach(() => {
  useSecurityStore.setState({
    workspaceUsers: {},
    resolvedGroups: {},
    loading: false,
    error: null,
    scanProgress: null,
  });
  mockGetWorkspaceUsers.mockReset();
  mockGetGroupMemberCount.mockReset();
  mockGetGroupMembers.mockReset();
});

describe('fetchAllWorkspaceUsers', () => {
  it('returns { status: "access_denied" } when first workspace returns 403', async () => {
    mockGetWorkspaceUsers.mockResolvedValue({
      success: false,
      reason: 'access_denied',
      message: 'Forbidden',
    });

    const result = await useSecurityStore.getState().fetchAllWorkspaceUsers(['ws1', 'ws2']);

    expect(result).toEqual({ status: 'access_denied' });
    // Should not have populated workspaceUsers
    expect(useSecurityStore.getState().workspaceUsers).toEqual({});
  });

  it('returns { status: "ok" } when all workspaces succeed', async () => {
    mockGetWorkspaceUsers.mockResolvedValue({
      success: true,
      data: [],
    });

    const result = await useSecurityStore.getState().fetchAllWorkspaceUsers(['ws1']);

    expect(result).toEqual({ status: 'ok' });
  });
});

describe('resolveGroupCount (live)', () => {
  it('stores the Graph transitive member count under the group key', async () => {
    mockGetGroupMemberCount.mockResolvedValue({ success: true, data: 42 });

    await useSecurityStore.getState().resolveGroupCount('grp@x.com', 'Group', 'graph-id');

    expect(mockGetGroupMemberCount).toHaveBeenCalledWith('graph-id');
    expect(useSecurityStore.getState().resolvedGroups['grp@x.com']).toMatchObject({
      memberCount: 42,
      loading: false,
      error: null,
    });
  });

  it('records the Graph failure reason as the group error', async () => {
    mockGetGroupMemberCount.mockResolvedValue({
      success: false,
      reason: 'consent_required',
      message: 'nope',
    });

    await useSecurityStore.getState().resolveGroupCount('grp@x.com', 'Group', 'graph-id');

    expect(useSecurityStore.getState().resolvedGroups['grp@x.com']).toMatchObject({
      memberCount: null,
      error: 'consent_required',
    });
  });
});

describe('resolveGroupMembers (live)', () => {
  it('stores Graph members and their count under the group key', async () => {
    const members = [{ displayName: 'A', userPrincipalName: 'a@x.com' }];
    mockGetGroupMembers.mockResolvedValue({ success: true, data: members });

    await useSecurityStore.getState().resolveGroupMembers('grp@x.com', 'Group', 'graph-id');

    expect(mockGetGroupMembers).toHaveBeenCalledWith('graph-id');
    expect(useSecurityStore.getState().resolvedGroups['grp@x.com']).toMatchObject({
      members,
      memberCount: 1,
      loading: false,
      error: null,
    });
  });

  it('records the Graph failure reason as the group error', async () => {
    mockGetGroupMembers.mockResolvedValue({ success: false, reason: 'error', message: 'boom' });

    await useSecurityStore.getState().resolveGroupMembers('grp@x.com', 'Group', 'graph-id');

    expect(useSecurityStore.getState().resolvedGroups['grp@x.com']).toMatchObject({
      members: [],
      loading: false,
      error: 'error',
    });
  });
});
