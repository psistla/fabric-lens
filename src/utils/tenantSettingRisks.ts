import type { TenantSetting, RiskyTenantSetting } from '@/api/types/tenantSettings';
import {
  TENANT_SETTINGS_HIGH_RISK,
  TENANT_SETTINGS_MEDIUM_RISK,
} from '@/utils/constants';

export function deriveRiskySettings(settings: TenantSetting[]): RiskyTenantSetting[] {
  const results: RiskyTenantSetting[] = [];
  for (const s of settings) {
    if (!s.enabled) continue;
    if (TENANT_SETTINGS_HIGH_RISK.includes(s.settingName)) {
      results.push({ ...s, riskLevel: 'high' });
    } else if (TENANT_SETTINGS_MEDIUM_RISK.includes(s.settingName)) {
      results.push({ ...s, riskLevel: 'medium' });
    }
  }
  return results.sort((a, b) => {
    if (a.riskLevel !== b.riskLevel) return a.riskLevel === 'high' ? -1 : 1;
    return a.settingName.localeCompare(b.settingName);
  });
}
