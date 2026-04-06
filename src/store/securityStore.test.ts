import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted ensures mockGetWorkspaceUsers is initialized before vi.mock factories
// run (which are hoisted above all variable declarations by Vitest).
// Without vi.hoisted, the factory would capture `undefined`.
const mockGetWorkspaceUsers = vi.hoisted(() => vi.fn());

// The store imports createAdminApi (not getWorkspaceUsers directly) and calls it
// at module scope: `const api = createAdminApi(fabricClient)`. Mock the factory.
vi.mock('@/api/admin', () => ({
  createAdminApi: () => ({
    listAdminWorkspaces: vi.fn(),
    getWorkspaceUsers: mockGetWorkspaceUsers,
  }),
}));
vi.mock('@/api/fabricClientInstance', () => ({ fabricClient: {} }));
vi.mock('@/api/demo', () => ({
  isDemoMode: false,
  getMockWorkspaceUsers: () => [],
  getMockGroupMemberCount: () => 0,
  getMockResolvedGroup: () => ({ members: [], memberCount: 0 }),
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
  useSecurityStore.setState({ workspaceUsers: {}, loading: false, error: null, scanProgress: null });
  mockGetWorkspaceUsers.mockReset();
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
