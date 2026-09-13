import type { TenantSettingsResponse } from '@/api/types/tenantSettings';
import { getMockTenantSettings } from '@/api/demo';
import { fabricClient } from '@/api/fabricClientInstance';
import { createAdminListStore } from './adminListStore';

export const useTenantSettingsStore = createAdminListStore(
  async () =>
    (await fabricClient.get<TenantSettingsResponse>('/admin/tenantsettings')).tenantSettings,
  getMockTenantSettings,
  'Failed to fetch tenant settings',
);
