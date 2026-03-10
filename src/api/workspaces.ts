import type { FabricClient } from './fabricClient';
import type { Workspace } from './types/workspace';
import type { Item, FabricItemType } from './types/item';

export function createWorkspacesApi(client: FabricClient) {
  return {
    async listWorkspaces(): Promise<Workspace[]> {
      return client.listAll<Workspace>('/workspaces');
    },

    async getWorkspace(id: string): Promise<Workspace> {
      return client.get<Workspace>(`/workspaces/${id}`);
    },

    async listWorkspaceItems(
      workspaceId: string,
      type?: FabricItemType,
    ): Promise<Item[]> {
      const path = type
        ? `/workspaces/${workspaceId}/items?type=${type}`
        : `/workspaces/${workspaceId}/items`;
      return client.listAll<Item>(path);
    },
  };
}
