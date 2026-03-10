import type { FabricClient } from './fabricClient';
import type { PaginatedResponse } from './types/common';
import { FabricApiError } from './types/common';
import type {
  AdminWorkspace,
  WorkspaceUser,
  AdminResult,
} from './types/admin';

export function createAdminApi(client: FabricClient) {
  async function listAdminWorkspaces(): Promise<AdminResult<AdminWorkspace[]>> {
    try {
      const workspaces = await client.listAll<AdminWorkspace>(
        '/admin/workspaces',
      );
      return { success: true, data: workspaces };
    } catch (e) {
      if (e instanceof FabricApiError && e.statusCode === 403) {
        return {
          success: false,
          reason: 'access_denied',
          message:
            'Fabric Admin role is required to access admin APIs.',
        };
      }
      return {
        success: false,
        reason: 'error',
        message: e instanceof Error ? e.message : 'Failed to list admin workspaces',
      };
    }
  }

  async function getWorkspaceUsers(
    workspaceId: string,
  ): Promise<AdminResult<WorkspaceUser[]>> {
    try {
      const response = await client.get<PaginatedResponse<WorkspaceUser>>(
        `/admin/workspaces/${workspaceId}/users`,
      );
      return { success: true, data: response.value };
    } catch (e) {
      if (e instanceof FabricApiError && e.statusCode === 403) {
        return {
          success: false,
          reason: 'access_denied',
          message:
            'Fabric Admin role is required to view workspace users.',
        };
      }
      return {
        success: false,
        reason: 'error',
        message: e instanceof Error ? e.message : 'Failed to fetch workspace users',
      };
    }
  }

  return { listAdminWorkspaces, getWorkspaceUsers };
}
