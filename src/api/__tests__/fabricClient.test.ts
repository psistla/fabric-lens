import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { IPublicClientApplication } from '@azure/msal-browser';

vi.mock('@/auth/AuthProvider', () => ({
  msalInstance: null,
  isEffectiveDemoMode: () => false,
}));

import { FabricClient } from '@/api/fabricClient';
import { FabricApiError } from '@/api/types/common';

const msal = {
  getAllAccounts: () => [{ homeAccountId: 'a' }],
  acquireTokenSilent: async () => ({ accessToken: 't' }),
} as unknown as IPublicClientApplication;

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers });
}

describe('FabricClient', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const client = new FabricClient(msal);

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('listAll throws instead of returning partial data when "value" is missing', async () => {
    fetchMock.mockResolvedValueOnce(json({ unexpected: true }));
    await expect(client.listAll('/workspaces')).rejects.toMatchObject({
      statusCode: 502,
      errorCode: 'UnexpectedResponseShape',
    });
  });

  it('listAll URL-encodes the continuation token', async () => {
    fetchMock
      .mockResolvedValueOnce(json({ value: [1], continuationToken: 'a+b/c=' }))
      .mockResolvedValueOnce(json({ value: [2] }));
    expect(await client.listAll<number>('/workspaces')).toEqual([1, 2]);
    expect(fetchMock.mock.calls[1][0]).toContain('continuationToken=a%2Bb%2Fc%3D');
  });

  it('does not retry CapacityLimitExceeded and explains it', async () => {
    fetchMock.mockResolvedValue(json({ errorCode: 'CapacityLimitExceeded' }, 429));
    const err = await client.get('/x').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(FabricApiError);
    expect((err as FabricApiError).errorCode).toBe('CapacityLimitExceeded');
    expect((err as FabricApiError).message).toMatch(/capacity/i);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries RequestBlocked after the Retry-After delay', async () => {
    vi.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(json({ errorCode: 'RequestBlocked' }, 429, { 'Retry-After': '2' }))
      .mockResolvedValueOnce(json({ ok: true }));
    const pending = client.get('/x');
    await vi.advanceTimersByTimeAsync(5000);
    expect(await pending).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('falls back to the default wait when Retry-After is not whole seconds', async () => {
    vi.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(json({}, 429, { 'Retry-After': 'Wed, 21 Oct 2026 07:28:00 GMT' }))
      .mockResolvedValueOnce(json({ ok: true }));
    const pending = client.get('/x');
    await vi.advanceTimersByTimeAsync(10000);
    expect(await pending).toEqual({ ok: true });
  });

  it('retries a 503 only when Retry-After is present', async () => {
    fetchMock.mockResolvedValue(json({}, 503));
    await expect(client.get('/x')).rejects.toMatchObject({ statusCode: 503 });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.useFakeTimers();
    fetchMock.mockReset();
    fetchMock
      .mockResolvedValueOnce(json({}, 503, { 'Retry-After': '1' }))
      .mockResolvedValueOnce(json({ ok: true }));
    const pending = client.get('/x');
    await vi.advanceTimersByTimeAsync(5000);
    expect(await pending).toEqual({ ok: true });
  });

  it('turns a timed-out request into a clear FabricApiError', async () => {
    fetchMock.mockRejectedValue(new DOMException('timed out', 'TimeoutError'));
    await expect(client.get('/x')).rejects.toMatchObject({
      statusCode: 408,
      errorCode: 'RequestTimeout',
    });
  });
});
