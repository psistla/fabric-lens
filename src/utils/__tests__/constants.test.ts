import { describe, it, expect } from 'vitest';
import { POWERBI_ADMIN_API_BASE, POWERBI_SCOPES } from '@/utils/constants';

describe('Power BI constants', () => {
  it('POWERBI_ADMIN_API_BASE is the correct Power BI API root', () => {
    expect(POWERBI_ADMIN_API_BASE).toBe('https://api.powerbi.com/v1.0/myorg');
  });

  it('POWERBI_SCOPES targets the Power BI API resource', () => {
    expect(POWERBI_SCOPES).toEqual(['https://analysis.windows.net/powerbi/api/.default']);
  });
});
