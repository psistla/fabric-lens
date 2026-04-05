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
| `src/api/types/tenantSettings.ts` | `TenantSetting` and `TenantSettingsResponse` interfaces |
| `src/api/tenantSettings.ts` | Single `GET /v1/admin/tenantsettings` API call |
| `src/store/tenantSettingsStore.ts` | Zustand store: `settings`, `loading`, `error`, `fetchTenantSettings` |
| `src/utils/tenantSettingRisks.ts` | Pure derivation function: filters + classifies + sorts enabled risky settings |
| `src/components/security/TenantSettingsRiskPanel.tsx` | Panel component |

### Modified Files

| File | Change |
|------|--------|
| `src/utils/constants.ts` | Add `TENANT_SETTINGS_HIGH_RISK` and `TENANT_SETTINGS_MEDIUM_RISK` arrays |
| `src/api/demo.ts` | Add `getMockTenantSettings()` |
| `src/pages/SecurityPage.tsx` | Wire store, trigger fetch, mount panel |

### Data Flow

```
SecurityPage
  → handleScanAll()
      → fetchTenantSettings()   [fires in parallel with workspace scan, no await]
          → isDemoMode? getMockTenantSettings() : GET /v1/admin/tenantsettings
  → tenantSettingsStore { settings, loading, error }
  → TenantSettingsRiskPanel
      → deriveRiskySettings(settings)  [filters enabled + classified, sorts high→medium]
      → renders table | empty state | error state | skeleton
```

The store is independent — no prop drilling through SecurityPage beyond triggering the fetch. The panel reads directly from `useTenantSettingsStore`.

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
```

---

## Risk Classification

### Constants (`src/utils/constants.ts`)

```ts
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

export const TENANT_SETTINGS_MEDIUM_RISK: string[] = [
  'EmbedContent',
  'AllowServicePrincipalsUseReadonlyAdminApisEnabled',
  'ServicePrincipalAccess',
  'BlockResourceKeyAuthentication',
  'EnableFabricCopilot',
];
```

### Derivation Utility (`src/utils/tenantSettingRisks.ts`)

```ts
type RiskLevel = 'high' | 'medium';

interface RiskyTenantSetting extends TenantSetting {
  riskLevel: RiskLevel;
}

// Pure function — filters to enabled + classified settings, sorted high→medium then alpha
function deriveRiskySettings(settings: TenantSetting[]): RiskyTenantSetting[]
```

---

## Store

### `src/store/tenantSettingsStore.ts`

Follows `capacityStore` pattern exactly.

```ts
interface TenantSettingsState {
  settings: TenantSetting[];
  loading: boolean;
  error: string | null;
  fetchTenantSettings: () => Promise<void>;
}
```

`fetchTenantSettings()`:
- `isDemoMode` → calls `getMockTenantSettings()`
- Live → `GET /v1/admin/tenantsettings` via `fabricClientInstance`
- Uses `adminRateLimiter` (costs 1 request toward the 200/hr limit)
- Sets `error` string on any failure (403, 5xx, network) — never throws

---

## Demo Data

`getMockTenantSettings()` in `src/api/demo.ts` returns 10 settings:

| Setting | Enabled | Risk |
|---------|---------|------|
| `PublishToWeb` | ✓ | High |
| `ExternalSharingEnabled` | ✓ | High |
| `ExportToExcel` | ✓ | High |
| `EmbedContent` | ✓ | Medium |
| `EnableFabricCopilot` | ✓ | Medium |
| `ServicePrincipalAccess` | ✓ | Medium |
| `AllowExternalDataSharing` | ✗ | High |
| `ExportToCsv` | ✗ | High |
| `BlockResourceKeyAuthentication` | ✗ | Medium |
| `AllowServicePrincipalsCreateAndUseProfiles` | ✗ | High |

Panel renders 6 enabled risky settings (3 high + 3 medium).

---

## Panel Component

### Props

```ts
interface Props {
  settings: TenantSetting[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}
```

### States

**Loading:** 3 skeleton rows using `.m-skeleton` class.

**Error:** Muted warning card — `AlertTriangle` icon + "Tenant settings unavailable — check admin permissions" + Retry button. Does not block other panels.

**Empty:** `ShieldCheck` icon + "No high or medium risk settings are currently enabled" — positive signal, consistent with `SpofWorkspacesPanel` empty state tone.

**Data:** Table sorted high→medium, then alphabetically within each tier.

### Table Columns

| Column | Source | Notes |
|--------|--------|-------|
| Setting Name | `settingName` | Humanised from camelCase (e.g. "Publish To Web") |
| Group | `tenantSettingGroup` | Raw value from API |
| Risk | `riskLevel` | Pill badge: red (`--m-error`) for High, amber (`--m-accent`) for Medium |
| Scope | `enabledSecurityGroups` | "All users" if empty, "N groups" if scoped |

### Header

- `ShieldAlert` icon (error color when risks present, tertiary when empty)
- Title: "Tenant Settings Risk" (11px, semibold, uppercase, tracked)
- Count badge: "3 high · 2 medium" (error-bg styling) — hidden when empty

### Footer

Guidance copy: "Review these settings in the Microsoft Fabric Admin Portal to determine if they should be restricted to specific security groups."

---

## SecurityPage Wiring

### Trigger

`fetchTenantSettings()` called inside `handleScanAll()` in parallel — no `await` before workspace scan starts:

```ts
const handleScanAll = useCallback(async () => {
  fetchTenantSettings(); // fire and forget — parallel
  // ... existing workspace scan logic
}, [...]);
```

### Panel Placement

Inside `{hasScanned && (...)}` block, after `SecurityFindingsPanel` and before `SpofWorkspacesPanel`:

```tsx
{hasScanned && (
  <>
    <SecurityPostureCard ... />
    <SecurityFindingsPanel ... />
    <TenantSettingsRiskPanel   // ← new, tenant-level findings
      settings={settings}
      loading={settingsLoading}
      error={settingsError}
      onRetry={fetchTenantSettings}
    />
    <SpofWorkspacesPanel ... />  // ← workspace-level findings below
    ...
  </>
)}
```

---

## Fallback Handling

The tenant settings API requires Fabric Administrator role — the same role already required to reach the SecurityPage. Additional incremental consent is not needed (`Tenant.Read.All` scope is already acquired).

Failure scenarios handled gracefully:
- **403** (PIM elevation expired, delegated admin restriction): error state in panel, other panels unaffected
- **5xx / network error**: same error state
- **Empty response**: valid — empty state shown

---

## Build Requirement

`npm run build` must pass with zero TypeScript errors before the feature is considered complete.
