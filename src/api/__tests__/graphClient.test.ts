import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/api/demo', () => ({ isDemoMode: false, isMsalConfigured: true }));
vi.mock('@/auth/AuthProvider', () => ({
  msalInstance: {
    getAllAccounts: () => [{ homeAccountId: 'a' }],
    acquireTokenSilent: async () => ({ accessToken: 't' }),
  },
  isEffectiveDemoMode: () => false,
}));

import { getGroupMemberCount, getGroupMembers } from '@/api/graphClient';

const GROUP = '0b7c9c2a-1111-4a5b-9d3e-aaaaaaaaaaaa';

describe('graphClient', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('rejects a non-GUID group id without calling Graph', async () => {
    const result = await getGroupMembers('../me');
    expect(result).toMatchObject({ success: false, reason: 'error' });
    expect(await getGroupMemberCount('a@b.com')).toMatchObject({ success: false, reason: 'error' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('retries a 429 and then returns the count', async () => {
    vi.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(new Response('', { status: 429, headers: { 'Retry-After': '1' } }))
      .mockResolvedValueOnce(new Response('42', { status: 200 }));
    const pending = getGroupMemberCount(GROUP);
    await vi.advanceTimersByTimeAsync(5000);
    expect(await pending).toEqual({ success: true, data: 42 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
