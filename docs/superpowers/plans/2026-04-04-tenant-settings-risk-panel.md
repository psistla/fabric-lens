# Tenant Settings Risk Panel Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a TenantSettingsRiskPanel to the Security page that surfaces enabled high/medium risk Fabric tenant settings, giving consultants and admins immediate visibility into tenant-level configuration exposure.

**Architecture:** A new Zustand store fetches `GET /v1/admin/tenantsettings` in parallel with the existing workspace scan when "Scan All" is clicked. A pure derivation function filters and classifies the results, and the panel component renders the filtered list as a table with risk badges.

**Tech Stack:** React 19, TypeScript (strict), Zustand 5, Tailwind CSS v4 (Meridian tokens), Vitest + React Testing Library, Lucide React icons.

**Spec:** `docs/superpowers/specs/2026-04-04-tenant-settings-risk-panel-design.md`

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `src/api/types/tenantSettings.ts` | `TenantSetting`, `TenantSettingsResponse`, `RiskLevel`, `RiskyTenantSetting` types |
| Create | `src/api/tenantSettings.ts` | Single `GET /v1/admin/tenantsettings` call |
| Create | `src/utils/tenantSettingRisks.ts` | Pure `deriveRiskySettings()` function |
| Create | `src/store/tenantSettingsStore.ts` | Zustand store — `useTenantSettingsStore` |
| Create | `src/components/security/TenantSettingsRiskPanel.tsx` | Panel UI component |
| Create | `src/utils/__tests__/tenantSettingRisks.test.ts` | Unit tests for `deriveRiskySettings()` |
| Modify | `src/utils/constants.ts` | Add `TENANT_SETTINGS_HIGH_RISK`, `TENANT_SETTINGS_MEDIUM_RISK`, `FABRIC_ADMIN_PORTAL_SETTINGS_URL` |
| Modify | `src/api/demo.ts` | Add `getMockTenantSettings()` |
| Modify | `src/pages/SecurityPage.tsx` | Wire store, trigger fetch, derive, mount panel |

---

## Chunk 1: Foundation — Types, Constants, and Derivation Utility

### Task 1: Add constants

**Files:**
- Modify: `src/utils/constants.ts`

- [ ] **Step 1: Add the three new constants at the end of `src/utils/constants.ts`**

  Open `src/utils/constants.ts` and append after the last existing export:

  ```ts
  // -- Tenant Settings Risk --

  /** Tenant settings that represent high-risk exposure when enabled. */
  export const TENANT_SETTINGS_HIGH_RISK: string[] = [
    'PublishToWeb',
    'ExternalSharingEnabled',
    'AllowExternalDataSharing',
    'ExportToCsv',
    'ExportToExcel',
    'ExportToImage',
    'PrintDashboardsAndReports',
    'AllowServicePrincipalsCreateAndUseProfiles',
  ];

  /** Tenant settings that represent medium-risk exposure when enabled. */
  export const TENANT_SETTINGS_MEDIUM_RISK: string[] = [
    'EmbedContent',
    'AllowServicePrincipalsUseReadonlyAdminApisEnabled',
    'ServicePrincipalAccess',
    'EnableFabricCopilot',
  ];

  /** Deep link to the Fabric Admin Portal tenant settings page. */
  export const FABRIC_ADMIN_PORTAL_SETTINGS_URL =
    'https://app.fabric.microsoft.com/admin-portal/tenantSettings';
  ```

  Note: `BlockResourceKeyAuthentication` is intentionally excluded — it is a security-hardening control; enabling it is a positive signal, not a risk. Add an inline comment so future developers don't add it back:

  ```ts
  // Note: BlockResourceKeyAuthentication intentionally excluded — enabling it
  // is a security-hardening control (positive signal), not a risk indicator.
  ```

- [ ] **Step 2: Verify build passes**

  ```bash
  npm run build
  ```

  Expected: zero errors. Constants are pure data — no behaviour to test.

- [ ] **Step 3: Commit**

  ```bash
  git add src/utils/constants.ts
  git commit -m "feat: add tenant settings risk constants"
  ```

---

### Task 2: Create type definitions

**Files:**
- Create: `src/api/types/tenantSettings.ts`

- [ ] **Step 1: Create the types file**

  Create `src/api/types/tenantSettings.ts`:

  ```ts
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
  ```

- [ ] **Step 2: Verify build passes**

  ```bash
  npm run build
  ```

  Expected: zero errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/api/types/tenantSettings.ts
  git commit -m "feat: add TenantSetting types"
  ```

---

### Task 3: Create and test the derivation utility

This is a pure function — ideal for TDD. Write the tests first, watch them fail, then implement.

**Files:**
- Create: `src/utils/tenantSettingRisks.ts`
- Create: `src/utils/__tests__/tenantSettingRisks.test.ts`

- [ ] **Step 1: Write the failing tests**

  Create `src/utils/__tests__/tenantSettingRisks.test.ts`:

  ```ts
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
        makeSetting('EmbedContent', true),        // medium
        makeSetting('PublishToWeb', true),         // high
      ]);
      expect(result[0].riskLevel).toBe('high');
      expect(result[1].riskLevel).toBe('medium');
    });

    it('sorts alphabetically within the same risk tier', () => {
      const result = deriveRiskySettings([
        makeSetting('PublishToWeb', true),              // high
        makeSetting('ExternalSharingEnabled', true),    // high
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
  ```

- [ ] **Step 2: Run tests to verify they fail**

  ```bash
  npm run test -- tenantSettingRisks
  ```

  Expected: `FAIL` — `deriveRiskySettings` is not defined yet.

- [ ] **Step 3: Create the implementation**

  Create `src/utils/tenantSettingRisks.ts`:

  ```ts
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
  ```

- [ ] **Step 4: Run tests to verify they pass**

  ```bash
  npm run test -- tenantSettingRisks
  ```

  Expected: all 8 tests pass.

- [ ] **Step 5: Verify build passes**

  ```bash
  npm run build
  ```

  Expected: zero errors.

- [ ] **Step 6: Commit**

  ```bash
  git add src/utils/tenantSettingRisks.ts src/utils/__tests__/tenantSettingRisks.test.ts
  git commit -m "feat: add deriveRiskySettings utility with tests"
  ```

---

## Chunk 2: Data Layer — API Module, Demo Data, and Store

### Task 4: Create the API module

**Files:**
- Create: `src/api/tenantSettings.ts`

The API module is a thin wrapper around `fabricClient`. Follow the pattern in `src/api/capacities.ts` — a factory function that takes a `FabricClient` and returns named methods.

- [ ] **Step 1: Create the API module**

  Create `src/api/tenantSettings.ts`:

  ```ts
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
  ```

  Note: `fabricClient.get<T>(path)` prepends the Fabric API base URL automatically. The admin path `/admin/tenantsettings` maps to `GET /v1/admin/tenantsettings`.

  Note: Unlike standard Fabric list endpoints which return `{ value: T[] }`, the tenant settings endpoint returns `{ tenantSettings: T[] }`. The `TenantSettingsResponse` type reflects this and `res.tenantSettings` is the correct accessor.

- [ ] **Step 2: Verify build passes**

  ```bash
  npm run build
  ```

  Expected: zero errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/api/tenantSettings.ts
  git commit -m "feat: add tenantSettings API module"
  ```

---

### Task 5: Add demo data

**Files:**
- Modify: `src/api/demo.ts`

- [ ] **Step 1: Add the `getMockTenantSettings` import type and function**

  Open `src/api/demo.ts`. Add the import for `TenantSetting` at the top alongside the other type imports:

  ```ts
  import type { TenantSetting } from './types/tenantSettings';
  ```

  Then add the mock data function at the end of the file. All `settingName` values must exactly match the strings in `TENANT_SETTINGS_HIGH_RISK` / `TENANT_SETTINGS_MEDIUM_RISK` constants (defined in Task 1 in `src/utils/constants.ts`) — `deriveRiskySettings()` does exact string matching and silently drops settings with unrecognised names:

  ```ts
  export function getMockTenantSettings(): TenantSetting[] {
    return [
      // --- High risk, enabled ---
      {
        settingName: 'PublishToWeb',
        enabled: true,
        tenantSettingGroup: 'Export and sharing settings',
        canSpecifySecurityGroups: false,
        enabledSecurityGroups: [],
      },
      {
        settingName: 'ExternalSharingEnabled',
        enabled: true,
        tenantSettingGroup: 'Export and sharing settings',
        canSpecifySecurityGroups: true,
        enabledSecurityGroups: [{ graphId: 'grp-001', name: 'External Partners' }],
      },
      {
        settingName: 'ExportToExcel',
        enabled: true,
        tenantSettingGroup: 'Export and sharing settings',
        canSpecifySecurityGroups: false,
        enabledSecurityGroups: [],
      },
      // --- Medium risk, enabled ---
      {
        settingName: 'EmbedContent',
        enabled: true,
        tenantSettingGroup: 'Integration settings',
        canSpecifySecurityGroups: false,
        enabledSecurityGroups: [],
      },
      {
        settingName: 'EnableFabricCopilot',
        enabled: true,
        tenantSettingGroup: 'Copilot and Azure OpenAI Service',
        canSpecifySecurityGroups: true,
        enabledSecurityGroups: [
          { graphId: 'grp-002', name: 'AI Pilot Group' },
          { graphId: 'grp-003', name: 'Data Science Team' },
        ],
      },
      {
        settingName: 'ServicePrincipalAccess',
        enabled: true,
        tenantSettingGroup: 'Developer settings',
        canSpecifySecurityGroups: false,
        enabledSecurityGroups: [],
      },
      // --- High risk, disabled ---
      {
        settingName: 'AllowExternalDataSharing',
        enabled: false,
        tenantSettingGroup: 'Export and sharing settings',
        canSpecifySecurityGroups: false,
        enabledSecurityGroups: [],
      },
      {
        settingName: 'ExportToCsv',
        enabled: false,
        tenantSettingGroup: 'Export and sharing settings',
        canSpecifySecurityGroups: false,
        enabledSecurityGroups: [],
      },
      {
        settingName: 'AllowServicePrincipalsCreateAndUseProfiles',
        enabled: false,
        tenantSettingGroup: 'Developer settings',
        canSpecifySecurityGroups: false,
        enabledSecurityGroups: [],
      },
      // --- Medium risk, disabled ---
      {
        settingName: 'AllowServicePrincipalsUseReadonlyAdminApisEnabled',
        enabled: false,
        tenantSettingGroup: 'Developer settings',
        canSpecifySecurityGroups: false,
        enabledSecurityGroups: [],
      },
    ];
  }
  ```

- [ ] **Step 2: Verify build passes**

  ```bash
  npm run build
  ```

  Expected: zero errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/api/demo.ts
  git commit -m "feat: add getMockTenantSettings demo data"
  ```

---

### Task 6: Create the Zustand store

**Files:**
- Create: `src/store/tenantSettingsStore.ts`

Follow the pattern in `src/store/capacityStore.ts` exactly. Key differences: uses `adminRateLimiter` (like `securityStore`), has a cache guard to skip redundant fetches.

- [ ] **Step 1: Create the store**

  Create `src/store/tenantSettingsStore.ts`:

  ```ts
  import { create } from 'zustand';
  import type { TenantSetting } from '@/api/types/tenantSettings';
  import { isDemoMode, getMockTenantSettings } from '@/api/demo';
  import { fabricClient } from '@/api/fabricClientInstance';
  import { createTenantSettingsApi } from '@/api/tenantSettings';
  import { adminRateLimiter } from '@/utils/rateLimiter';

  const api = createTenantSettingsApi(fabricClient);

  interface TenantSettingsState {
    settings: TenantSetting[];
    loading: boolean;
    error: string | null;
    fetchTenantSettings: () => Promise<void>;
  }

  export const useTenantSettingsStore = create<TenantSettingsState>()((set, get) => ({
    settings: [],
    loading: false,
    error: null,

    fetchTenantSettings: async () => {
      const { settings, error } = get();
      // Cache guard: skip if already loaded successfully in this session
      if (settings.length > 0 && !error) return;

      if (!isDemoMode && !adminRateLimiter.canMakeRequest()) {
        set({ error: 'Admin API rate limit reached. Please wait before retrying.' });
        return;
      }

      set({ loading: true, error: null });
      try {
        const result = isDemoMode
          ? getMockTenantSettings()
          : await api.fetchTenantSettings();
        if (!isDemoMode) {
          adminRateLimiter.trackRequest();
        }
        set({ settings: result, loading: false });
      } catch (e) {
        set({
          error: e instanceof Error ? e.message : 'Failed to fetch tenant settings',
          loading: false,
        });
      }
    },
  }));
  ```

  Important notes:
  - The cache guard (`if (settings.length > 0 && !error) return`) means re-clicking "Scan All" in the same session will not re-fetch. This is intentional — tenant settings change infrequently and force-refresh is out of scope.
  - `adminRateLimiter.trackRequest()` is called **after** a successful fetch (not before), consistent with how `securityStore` accounts for requests.
  - `trackRequest()` is gated behind `!isDemoMode` — demo mode uses a synchronous mock and must not consume rate-limit slots since the shared `adminRateLimiter` singleton persists across all stores in the same session.

- [ ] **Step 2: Verify build passes**

  ```bash
  npm run build
  ```

  Expected: zero errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/store/tenantSettingsStore.ts
  git commit -m "feat: add useTenantSettingsStore"
  ```

---

## Chunk 3: UI — Panel Component and SecurityPage Wiring

### Task 7: Create the panel component

**Files:**
- Create: `src/components/security/TenantSettingsRiskPanel.tsx`

The panel follows the structure of `src/components/security/SpofWorkspacesPanel.tsx`. Study that file before writing this one — match its header/badge/table/footer layout exactly. Uses Meridian design tokens via CSS custom properties (e.g. `var(--m-error)`, `var(--m-accent)`).

- [ ] **Step 1: Create the component**

  Create `src/components/security/TenantSettingsRiskPanel.tsx`:

  ```tsx
  import { AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';
  import type { RiskyTenantSetting } from '@/api/types/tenantSettings';
  import { FABRIC_ADMIN_PORTAL_SETTINGS_URL } from '@/utils/constants';

  interface Props {
    settings: RiskyTenantSetting[];
    loading: boolean;
    error: string | null;
    onRetry: () => void;
  }

  function humanise(settingName: string): string {
    return settingName.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  function scopeLabel(enabledSecurityGroups: RiskyTenantSetting['enabledSecurityGroups']): string {
    return enabledSecurityGroups.length === 0
      ? 'All users'
      : `${enabledSecurityGroups.length} group${enabledSecurityGroups.length > 1 ? 's' : ''}`;
  }

  export function TenantSettingsRiskPanel({ settings, loading, error, onRetry }: Props) {
    // Loading state
    if (loading) {
      return (
        <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
          <div className="flex items-center gap-2 border-b border-[var(--m-border)] px-4 py-3">
            <ShieldAlert className="h-4 w-4 text-[var(--m-text-tertiary)]" />
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)]">
              Tenant Settings Risk
            </h2>
          </div>
          <div className="divide-y divide-[var(--m-border)]">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="m-skeleton h-4 w-48" />
                <div className="m-skeleton h-4 w-32" />
                <div className="m-skeleton h-5 w-16 rounded-full" />
                <div className="m-skeleton h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
          <div className="flex items-center gap-2 border-b border-[var(--m-border)] px-4 py-3">
            <ShieldAlert className="h-4 w-4 text-[var(--m-text-tertiary)]" />
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)]">
              Tenant Settings Risk
            </h2>
          </div>
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-[var(--m-warning-text)]">
              <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--m-warning)]" />
              Tenant settings unavailable — check admin permissions
            </div>
            <button
              onClick={onRetry}
              className="shrink-0 rounded-lg px-3 py-1 text-xs font-semibold text-[var(--m-primary)] ring-1 ring-[var(--m-primary)]/40 transition-colors hover:bg-[var(--m-primary-subtle)]"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    // Empty state
    if (settings.length === 0) {
      return (
        <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
          <div className="flex items-center gap-2 border-b border-[var(--m-border)] px-4 py-3">
            <ShieldAlert className="h-4 w-4 text-[var(--m-text-tertiary)]" />
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)]">
              Tenant Settings Risk
            </h2>
          </div>
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <ShieldCheck className="h-7 w-7 text-[var(--m-success)]" />
            <p className="text-sm font-medium text-[var(--m-text)]">
              No high or medium risk settings are currently enabled.
            </p>
            <p className="text-xs text-[var(--m-text-secondary)]">
              No tenant-level configuration risks detected.
            </p>
          </div>
        </div>
      );
    }

    const highCount = settings.filter((s) => s.riskLevel === 'high').length;
    const mediumCount = settings.filter((s) => s.riskLevel === 'medium').length;

    return (
      <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--m-border)] px-4 py-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[var(--m-error)]" />
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)]">
              Tenant Settings Risk
            </h2>
          </div>
          <span className="rounded-full bg-[var(--m-error-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--m-error-text)]">
            {highCount} high · {mediumCount} medium
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--m-border)] bg-[var(--m-surface)]">
                <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                  Setting
                </th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                  Group
                </th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                  Risk
                </th>
                <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                  Scope
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--m-border)]">
              {settings.map((s) => (
                <tr key={s.settingName} className="hover:bg-[var(--m-surface-hover)]">
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-[var(--m-text)]">
                      {humanise(s.settingName)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[var(--m-text-secondary)]">
                    {s.tenantSettingGroup}
                  </td>
                  <td className="px-4 py-2.5">
                    {s.riskLevel === 'high' ? (
                      <span className="rounded-full bg-[var(--m-error-bg)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--m-error-text)]">
                        High
                      </span>
                    ) : (
                      <span className="rounded-full bg-[var(--m-accent-subtle)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--m-accent)]">
                        Medium
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-[var(--m-text-secondary)]">
                    {scopeLabel(s.enabledSecurityGroups)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--m-border)] bg-[var(--m-surface)] px-4 py-2 text-[11px] text-[var(--m-text-tertiary)]">
          <span>
            Review these settings in the Fabric Admin Portal to determine if they should be
            restricted to specific security groups.
          </span>
          <a
            href={FABRIC_ADMIN_PORTAL_SETTINGS_URL}
            target="_blank"
            rel="noreferrer"
            className="ml-4 shrink-0 text-[var(--m-primary)] hover:underline"
          >
            Open Admin Portal
          </a>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Verify build passes**

  ```bash
  npm run build
  ```

  Expected: zero errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/security/TenantSettingsRiskPanel.tsx
  git commit -m "feat: add TenantSettingsRiskPanel component"
  ```

---

### Task 8: Wire into SecurityPage

**Files:**
- Modify: `src/pages/SecurityPage.tsx`

This is the final wiring step. Make four targeted changes to SecurityPage:
1. Add imports
2. Destructure the new store
3. Add `useMemo` for `riskySettings`
4. Update `handleScanAll`
5. Mount the panel

- [ ] **Step 1: Add imports**

  At the top of `src/pages/SecurityPage.tsx`, add to the existing import block:

  ```ts
  // Add to existing store imports
  import { useTenantSettingsStore } from '@/store/tenantSettingsStore';

  // Add to existing security component imports
  import { TenantSettingsRiskPanel } from '@/components/security/TenantSettingsRiskPanel';

  // Add to existing utils imports
  import { deriveRiskySettings } from '@/utils/tenantSettingRisks';
  ```

- [ ] **Step 2: Destructure the store**

  Near the top of the component body, after the existing store destructurings, add:

  ```ts
  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
    fetchTenantSettings,
  } = useTenantSettingsStore();
  ```

  The aliases (`settingsLoading`, `settingsError`) are required — `loading` and `error` are already used by `useSecurityStore()`.

- [ ] **Step 3: Add `riskySettings` derivation**

  After the existing `useMemo` calls (e.g. after `effectiveAccessSummary`), add:

  ```ts
  const riskySettings = useMemo(
    () => deriveRiskySettings(settings),
    [settings],
  );
  ```

- [ ] **Step 4: Update `handleScanAll`**

  Find the existing `handleScanAll`:

  ```ts
  const handleScanAll = useCallback(() => {
    const ids = workspaces.map((w) => w.id);
    void fetchAllWorkspaceUsers(ids);
  }, [workspaces, fetchAllWorkspaceUsers]);
  ```

  Replace with:

  ```ts
  const handleScanAll = useCallback(() => {
    void fetchTenantSettings();
    const ids = workspaces.map((w) => w.id);
    void fetchAllWorkspaceUsers(ids);
  }, [workspaces, fetchAllWorkspaceUsers, fetchTenantSettings]);
  ```

- [ ] **Step 5: Mount the panel**

  Inside the `{hasScanned && (...)}` block, insert `TenantSettingsRiskPanel` between `SecurityFindingsPanel` and `SpofWorkspacesPanel`:

  ```tsx
  {/* Security Findings Panel */}
  <SecurityFindingsPanel findings={securityFindings} />

  {/* Tenant Settings Risk Panel */}
  <TenantSettingsRiskPanel
    settings={riskySettings}
    loading={settingsLoading}
    error={settingsError}
    onRetry={fetchTenantSettings}
  />

  {/* SPOF Workspaces Panel */}
  <SpofWorkspacesPanel workspaceUsers={workspaceUsers} workspaces={workspaces} />
  ```

- [ ] **Step 6: Run full build (not just type-check)**

  ```bash
  npm run build
  ```

  `npm run build` uses `tsc -b` which is stricter than `npm run type-check`. It catches unused parameters and locals. Expected: zero errors.

- [ ] **Step 7: Run all tests**

  ```bash
  npm run test
  ```

  Expected: all tests pass including the new `tenantSettingRisks` suite.

- [ ] **Step 8: Commit**

  ```bash
  git add src/pages/SecurityPage.tsx
  git commit -m "feat: wire TenantSettingsRiskPanel into SecurityPage"
  ```

---

## Final Verification

- [ ] **Smoke test in demo mode**

  ```bash
  npm run dev
  ```

  1. Open `http://localhost:5173` — demo mode loads automatically (no env vars needed)
  2. Navigate to the Security page
  3. Click "Scan All"
  4. Verify `TenantSettingsRiskPanel` appears between SecurityFindingsPanel and SpofWorkspacesPanel
  5. Verify the panel shows 6 rows: 3 high (ExternalSharingEnabled, ExportToExcel, PublishToWeb) and 3 medium (EmbedContent, EnableFabricCopilot, ServicePrincipalAccess) — sorted high before medium, alpha within tier
  6. Verify the count badge shows "3 high · 3 medium"
  7. Verify the "Open Admin Portal" link is present in the footer
  8. Verify dark mode toggle (if available) shows correct colors

- [ ] **Final build check**

  ```bash
  npm run build
  ```

  Expected: zero errors, zero warnings about unused imports.
