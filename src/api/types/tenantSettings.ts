export interface TenantSettingSecurityGroup {
  graphId: string;
  name: string;
}

export interface TenantSetting {
  settingName: string;
  enabled: boolean;
  tenantSettingGroup: string;
  canSpecifySecurityGroups: boolean;
  enabledSecurityGroups: TenantSettingSecurityGroup[];
}

// Note: GET /v1/admin/tenantsettings returns { tenantSettings: [...] }
// NOT the standard { value: [...] } envelope used by other Fabric list endpoints.
export interface TenantSettingsResponse {
  tenantSettings: TenantSetting[];
}

export type RiskLevel = 'high' | 'medium';

export interface RiskyTenantSetting extends TenantSetting {
  riskLevel: RiskLevel;
}
