import type { FabricClient } from './fabricClient';
import type { WidelySharedArtifact, WidelySharedResponse } from './types/widelyShared';
import { POWERBI_SCOPES, POWERBI_ADMIN_API_BASE } from '@/utils/constants';

const ENDPOINT = `${POWERBI_ADMIN_API_BASE}/admin/widelySharedArtifacts/linksSharedToWholeOrganization`;

export function createWidelySharedApi(client: FabricClient) {
  return {
    async fetchWidelySharedArtifacts(): Promise<WidelySharedArtifact[]> {
      const results: WidelySharedArtifact[] = [];
      let token: string | undefined;
      do {
        const url = token ? `${ENDPOINT}?continuationToken=${token}` : ENDPOINT;
        const res = await client.get<WidelySharedResponse>(url, POWERBI_SCOPES);
        results.push(...res.artifactAccessEntities);
        token = res.continuationToken;
      } while (token);
      return results;
    },
  };
}
