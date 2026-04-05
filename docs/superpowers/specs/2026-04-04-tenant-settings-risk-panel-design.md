# Design: Tenant Settings Risk Panel (Feature 2)

**Date:** 2026-04-04
**Status:** Approved
**Target:** SecurityPage

---

## Overview

Add a `TenantSettingsRiskPanel` to the Security page that surfaces Microsoft Fabric tenant settings classified as high or medium risk that are currently enabled. This gives consultants and Fabric admins immediate visibility into tenant-level configuration risks without navigating the full Fabric Admin portal.

---

## Scope

Show only tenant settings that are both:
1. Classified as high or medium risk (via a static lookup in constants)
2. Currently enabled

Disabled risky settings are not shown. A positive empty state is shown when no risky settings are enabled.

---

## Architecture & Data Flow

### New Files

| File | Purpose |
|------|---------|
| `src/api/types/tenantSettings.ts` | `TenantSetting`, `TenantSettingsResponse`, `RiskyTenantSetting` interfaces |
| `src/api/tenantSettings.ts` | Single `GET /v1/admin/tenantsettings` API call |
| `src/store/tenantSettingsStore.ts` | Zustand store: `settings`, `loading`, `error`, `fetchTenantSettings` — exported as `useTenantSettingsStore` |
| `src/utils/tenantSettingRisks.ts` | Pure `deriveRiskySettings()` function |
| `src/components/security/TenantSettingsRiskPanel.tsx` | Panel component |

### Modified Files

| File | Change |
|------|--------|
| `src/utils/constants.ts` | Add `TENANT_SETTINGS_HIGH_RISK`, `TENANT_SETTINGS_MEDIUM_RISK`, `FABRIC_ADMIN_PORTAL_SETTINGS_URL` |
| `src/api/demo.ts` | Add `getMockTenantSettings()` |
| `src/pages/SecurityPage.tsx` | Destructure store, fire fetch in `handleScanAll`, derive risky settings, mount panel |

### Data Flow

```
SecurityPage
  → handleScanAll()
      → fetchTenantSettings()          [fire-and-forget — parallel, no await]
      → fetchAllWorkspaceUsers(ids)    [existing workspace scan — unchanged]

  → useTenantSettingsStore() → { settings, loading: settingsLoading, error: settingsError, fetchTenantSettings }
  → riskySettings = useMemo(() => deriveRiskySettings(settings), [settings])   [in SecurityPage]
  → TenantSettingsRiskPanel receives riskySettings[], settingsLoading, settingsError, onRetry
      → renders table | empty state | error state | skeleton
```

`deriveRiskySettings()` is called in SecurityPage (not inside the panel) so the derived array is available for future use (e.g. Phase 2 report export) without re-computing in multiple places.

### Store Cache Guard

`fetchTenantSettings()` skips the API call if `settings.length > 0 && !error` — prevents redundant re-fetches on subsequent "Re-scan All" clicks since tenant settings change infrequently.

---

## Type Definitions

### `src/api/types/tenantSettings.ts`

```ts
interface TenantSettingSecurityGroup {
  graphId: string;
  name: string;
}

interface TenantSetting {
  settingName: string;
  enabled: boolean;
  tenantSettingGroup: string;
  canSpecifySecurityGroups: boolean;
  enabledSecurityGroups: TenantSettingSecurityGroup[];
}

interface TenantSettingsResponse {
  value: TenantSetting[];
}

type RiskLevel = 'high' | 'medium';

interface RiskyTenantSetting extends TenantSetting {
  riskLevel: RiskLevel;
}
```

---

## Risk Classification

### Constants (`src/utils/constants.ts`)

```ts
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

Note: `BlockResourceKeyAuthentication` is excluded — blocking resource key auth is a security-hardening control (enabling it is positive). Including it as a risk when enabled would be semantically incorrect.

### Derivation Utility (`src/utils/tenantSettingRisks.ts`)

```ts
// Pure function — no side effects, no imports from store
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
  // Sort: high before medium, then alphabetically within each tier
  return results.sort((a, b) => {
    if (a.riskLevel !== b.riskLevel) return a.riskLevel === 'high' ? -1 : 1;
    return a.settingName.localeCompare(b.settingName);
  });
}
```

---

## Store

### `src/store/tenantSettingsStore.ts`

Follows `capacityStore` pattern. Export name: `useTenantSettingsStore`.

```ts
interface TenantSettingsState {
  settings: TenantSetting[];
  loading: boolean;
  error: string | null;
  fetchTenantSettings: () => Promise<void>;
}
```

`fetchTenantSettings()`:
- **Cache guard:** if `settings.length > 0 && !error`, return immediately (no API call). This means re-clicking "Scan All" within the same session will not re-fetch tenant settings — force-refresh within a session is out of scope for this feature.
- `isDemoMode` → calls `getMockTenantSettings()`
- Live → `GET /v1/admin/tenantsettings` via `fabricClientInstance`
- Uses `adminRateLimiter` from `@/utils/rateLimiter` (costs 1 request toward the 200/hr limit)
- Sets `error` string on any failure (403, 5xx, network) — never throws

---

## Demo Data

`getMockTenantSettings()` in `src/api/demo.ts` returns 10 settings. All `settingName` values must exactly match strings in the classification constants for `deriveRiskySettings()` to classify them correctly.

| `settingName` | `enabled` | Risk |
|---|---|---|
| `PublishToWeb` | `true` | High |
| `ExternalSharingEnabled` | `true` | High |
| `ExportToExcel` | `true` | High |
| `EmbedContent` | `true` | Medium |
| `EnableFabricCopilot` | `true` | Medium |
| `ServicePrincipalAccess` | `true` | Medium |
| `AllowExternalDataSharing` | `false` | High |
| `ExportToCsv` | `false` | High |
| `AllowServicePrincipalsCreateAndUseProfiles` | `false` | High |
| `AllowServicePrincipalsUseReadonlyAdminApisEnabled` | `false` | Medium |

Panel renders 6 enabled risky settings (3 high + 3 medium). `tenantSettingGroup` values can be realistic strings such as `"Export and sharing settings"`, `"Integration settings"`, `"Developer settings"`.

---

## Panel Component

### Props

```ts
interface Props {
  settings: RiskyTenantSetting[];   // pre-derived by SecurityPage via deriveRiskySettings()
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}
```

### States

**Loading:** Skeleton table with 3 rows using `.m-skeleton` class. Three rows is sufficient to indicate tabular structure without producing a large layout shift when 6 rows load.

**Error:** Muted warning card — `AlertTriangle` icon + "Tenant settings unavailable — check admin permissions" + Retry button (`onRetry`). The retry button is not disabled during the concurrent workspace scan; settings and scan are independent operations.

**Empty:** `ShieldCheck` icon + "No high or medium risk settings are currently enabled" — positive signal, same tone as `SpofWorkspacesPanel` empty state.

**Data:** Table sorted by the order of `settings` prop (already sorted high→medium, then alpha by `deriveRiskySettings()`).

### Table Columns

| Column | Source | Notes |
|--------|--------|-------|
| Setting Name | `settingName` | Humanised from camelCase by inserting a space before each uppercase letter that follows a lowercase letter. Example: `PublishToWeb` → `Publish To Web`, `AllowExternalDataSharing` → `Allow External Data Sharing`. Use a simple regex: `s.replace(/([a-z])([A-Z])/g, '$1 $2')` |
| Group | `tenantSettingGroup` | Raw value from API |
| Risk | `riskLevel` | Pill badge: red (`--m-error-bg` / `--m-error-text`) for High, amber (`--m-accent-subtle` / `--m-accent`) for Medium |
| Scope | `enabledSecurityGroups` | `"All users"` if `enabledSecurityGroups.length === 0`, `"N groups"` otherwise |

### Header

- `ShieldAlert` icon — error color when `settings.length > 0`, tertiary color when empty
- Title: `"Tenant Settings Risk"` (11px, semibold, uppercase, tracking-[0.06em])
- Count badge (hidden when empty): derived as `settings.filter(s => s.riskLevel === 'high').length` + `" high · "` + `settings.filter(s => s.riskLevel === 'medium').length` + `" medium"`. Uses error-bg styling.

### Footer

```
"Review these settings in the Microsoft Fabric Admin Portal to determine if they should be
 restricted to specific security groups."
```

Link text: `"Open Admin Portal"` → `FABRIC_ADMIN_PORTAL_SETTINGS_URL` (from constants). Opens in new tab (`target="_blank" rel="noreferrer"`).

---

## SecurityPage Wiring

### Destructuring

```ts
const {
  settings,
  loading: settingsLoading,
  error: settingsError,
  fetchTenantSettings,
} = useTenantSettingsStore();
```

Aliases (`settingsLoading`, `settingsError`) avoid collision with existing `loading` and `error` from `useSecurityStore`.

### Derived Settings

```ts
const riskySettings = useMemo(
  () => deriveRiskySettings(settings),
  [settings],
);
```

### Trigger

```ts
const handleScanAll = useCallback(() => {
  void fetchTenantSettings();                     // fire-and-forget — parallel
  const ids = workspaces.map((w) => w.id);
  void fetchAllWorkspaceUsers(ids);               // existing — unchanged
}, [workspaces, fetchAllWorkspaceUsers, fetchTenantSettings]);
```

### Panel Placement (full updated render order inside `{hasScanned && ...}`)

Tenant-level configuration findings (TenantSettingsRiskPanel) are placed before workspace-level structural findings (SpofWorkspacesPanel, SpnGovernancePanel) to present configuration risk before operational risk.

```tsx
{hasScanned && (
  <>
    <SecurityPostureCard posture={securityPosture} />
    <SecurityFindingsPanel findings={securityFindings} />
    <TenantSettingsRiskPanel                        {/* ← NEW: tenant-level before workspace-level */}
      settings={riskySettings}
      loading={settingsLoading}
      error={settingsError}
      onRetry={fetchTenantSettings}
    />
    <SpofWorkspacesPanel workspaceUsers={workspaceUsers} workspaces={workspaces} />
    {effectiveAccessSummary && <EffectiveAccessCard summary={effectiveAccessSummary} />}
    <SpnGovernancePanel userSummaries={userSummaries} />
    <AccessConcentrationChart workspaceUsers={workspaceUsers} userSummaries={userSummaries} />
    {overPermissioned.length > 0 && (...)}
    {/* WorkspacePivotTable */}
  </>
)}
```

---

## Fallback Handling

The tenant settings API requires Fabric Administrator role — the same role already required to reach the SecurityPage. Additional incremental consent is not needed (`Tenant.Read.All` scope is already acquired by the existing admin consent flow).

Failure scenarios handled gracefully by the store's `error` field:
- **403** (PIM elevation expired, delegated admin restriction): panel shows error state, other panels unaffected
- **5xx / network error**: same error state
- **Empty response**: valid — empty state shown

---

## Build Requirement

`npm run build` must pass with zero TypeScript errors before the feature is considered complete. Run `npm run build` (not just `npm run type-check`) as the build step is stricter.
