import { describe, it, expect } from 'vitest';
import { deriveRiskySettings } from '@/utils/tenantSettingRisks';
import type { TenantSetting } from '@/api/types/tenantSettings';

function makeSetting(
  settingName: string,
  enabled: boolean,
  tenantSettingGroup = 'General',
): TenantSetting {
  return {
    settingName,
    enabled,
    tenantSettingGroup,
    canSpecifySecurityGroups: false,
    enabledSecurityGroups: [],
  };
}

describe('deriveRiskySettings', () => {
  it('returns empty array when given no settings', () => {
    expect(deriveRiskySettings([])).toEqual([]);
  });

  it('excludes disabled settings even if classified as high risk', () => {
    const result = deriveRiskySettings([
      makeSetting('PublishToWeb', false),
    ]);
    expect(result).toHaveLength(0);
  });

  it('excludes enabled settings not in either risk list', () => {
    const result = deriveRiskySettings([
      makeSetting('SomeUnknownSetting', true),
    ]);
    expect(result).toHaveLength(0);
  });

  it('includes enabled high-risk settings with riskLevel "high"', () => {
    const result = deriveRiskySettings([
      makeSetting('PublishToWeb', true),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].riskLevel).toBe('high');
    expect(result[0].settingName).toBe('PublishToWeb');
  });

  it('includes enabled medium-risk settings with riskLevel "medium"', () => {
    const result = deriveRiskySettings([
      makeSetting('EmbedContent', true),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].riskLevel).toBe('medium');
  });

  it('sorts high-risk before medium-risk', () => {
    const result = deriveRiskySettings([
      makeSetting('EmbedContent', true),
      makeSetting('PublishToWeb', true),
    ]);
    expect(result[0].riskLevel).toBe('high');
    expect(result[1].riskLevel).toBe('medium');
  });

  it('sorts alphabetically within the same risk tier', () => {
    const result = deriveRiskySettings([
      makeSetting('PublishToWeb', true),
      makeSetting('ExternalSharingEnabled', true),
    ]);
    expect(result[0].settingName).toBe('ExternalSharingEnabled');
    expect(result[1].settingName).toBe('PublishToWeb');
  });

  it('preserves all TenantSetting fields on the returned items', () => {
    const input = makeSetting('PublishToWeb', true, 'Export and sharing settings');
    input.canSpecifySecurityGroups = true;
    input.enabledSecurityGroups = [{ graphId: 'g1', name: 'Finance' }];
    const result = deriveRiskySettings([input]);
    expect(result[0].tenantSettingGroup).toBe('Export and sharing settings');
    expect(result[0].canSpecifySecurityGroups).toBe(true);
    expect(result[0].enabledSecurityGroups).toHaveLength(1);
  });
});
