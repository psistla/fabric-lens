import type { FabricClient } from './fabricClient';
import type { TenantSetting, TenantSettingsResponse } from './types/tenantSettings';

export function createTenantSettingsApi(client: FabricClient) {
  return {
    async fetchTenantSettings(): Promise<TenantSetting[]> {
      const res = await client.get<TenantSettingsResponse>('/admin/tenantsettings');
      return res.tenantSettings;
    },
  };
}
