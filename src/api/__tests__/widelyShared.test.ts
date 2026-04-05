import { vi, describe, it, expect } from 'vitest';
import { createWidelySharedApi } from '@/api/widelyShared';
import type { WidelySharedArtifact, WidelySharedResponse } from '@/api/types/widelyShared';
import type { FabricClient } from '@/api/fabricClient';
import { POWERBI_SCOPES, POWERBI_ADMIN_API_BASE } from '@/utils/constants';

function makeArtifact(id: string): WidelySharedArtifact {
  return {
    artifactId: id,
    displayName: `Item ${id}`,
    artifactType: 'Report',
    accessRight: 'Read',
    shareType: 'Link',
  };
}

const BASE_URL = `${POWERBI_ADMIN_API_BASE}/admin/widelySharedArtifacts/linksSharedToWholeOrganization`;

describe('createWidelySharedApi', () => {
  it('returns all artifacts from a single page', async () => {
    const mockGet = vi.fn().mockResolvedValueOnce({
      artifactAccessEntities: [makeArtifact('a1'), makeArtifact('a2')],
    } satisfies WidelySharedResponse);

    const api = createWidelySharedApi({ get: mockGet } as unknown as FabricClient);
    const result = await api.fetchWidelySharedArtifacts();

    expect(result).toHaveLength(2);
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(BASE_URL, POWERBI_SCOPES);
  });

  it('follows continuationToken across multiple pages', async () => {
    const mockGet = vi.fn()
      .mockResolvedValueOnce({
        artifactAccessEntities: [makeArtifact('a1')],
        continuationToken: 'tok123',
      } satisfies WidelySharedResponse)
      .mockResolvedValueOnce({
        artifactAccessEntities: [makeArtifact('a2')],
      } satisfies WidelySharedResponse);

    const api = createWidelySharedApi({ get: mockGet } as unknown as FabricClient);
    const result = await api.fetchWidelySharedArtifacts();

    expect(result).toHaveLength(2);
    expect(result[0].artifactId).toBe('a1');
    expect(result[1].artifactId).toBe('a2');
    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(mockGet.mock.calls[1][0]).toContain('continuationToken=tok123');
    expect(mockGet.mock.calls[1][1]).toEqual(POWERBI_SCOPES);
  });

  it('returns empty array when no artifacts exist', async () => {
    const mockGet = vi.fn().mockResolvedValueOnce({
      artifactAccessEntities: [],
    } satisfies WidelySharedResponse);

    const api = createWidelySharedApi({ get: mockGet } as unknown as FabricClient);
    const result = await api.fetchWidelySharedArtifacts();

    expect(result).toHaveLength(0);
    expect(mockGet).toHaveBeenCalledTimes(1);
  });
});
