# fabric-lens — Task Backlog

> Tracks planned and in-progress work. See STRATEGY.md for the rationale behind these priorities.
> Phases reflect dependency order: Phase 0 unblocks discoverability, Phase 1 deepens security value,
> Phase 2 closes the consultant delivery gap that makes those security features worth showing to clients.

---

## Phase 0: Discoverability & First Impression

These tasks are independent of all feature work. They affect every visitor today and cost hours, not days.
Do these before or alongside Phase 1 — they do not block each other.

### 0a. SEO meta tags
**Effort:** 30 min | **File:** `index.html`

- [ ] Set a meaningful `<title>`: e.g. "fabric-lens — Microsoft Fabric Governance & Health Dashboard"
- [ ] Add `<meta name="description">` (150–160 chars): what it does, who it's for, that it's free/OSS
- [ ] Add `<meta name="keywords">` with relevant Fabric governance/admin terms
- [ ] Add `<link rel="canonical" href="https://fabric-lens.com">`
- [ ] Verify no `<meta name="robots" content="noindex">` is present (check Vite defaults)

### 0b. Open Graph + social preview
**Effort:** 1–2 hours | **Files:** `index.html` + a new OG image asset

- [ ] Create an OG image (1200×630px) — screenshot or designed graphic showing the dashboard with health grades. Save to `public/og-image.png`
- [ ] Add `<meta property="og:title">`, `og:description`, `og:image`, `og:url`, `og:type`
- [ ] Add Twitter card meta tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)
- [ ] Test preview using a link unfurl checker before marking done

### 0c. Privacy-respecting analytics
**Effort:** 1 hour | **File:** `index.html`

- [ ] Choose between Plausible Analytics or Fathom (both: no cookies, GDPR-compliant, no Google data sharing — appropriate for a tool that handles client tenant data)
- [ ] Add the analytics script tag to `index.html`
- [ ] Configure goals/events for: demo mode entered, security page visited, export triggered, tenant sign-in attempted
- [ ] Verify no PII is captured (user names, tenant IDs must not appear in tracked URLs or events)

### 0d. Public `/about` route
**Effort:** 1–2 days | **Files:** new `src/pages/AboutPage.tsx` + route in `App.tsx`

This is the highest-leverage Phase 0 item. It serves three needs: SEO-indexable content, consultant onboarding reference, and "show this to the client before the session" explainer. Must be accessible without authentication (no `ProtectedRoute` wrapper).

- [ ] Add route `/about` to `App.tsx` — public, no auth guard
- [ ] Add "About / Help" link to sidebar (bottom section, below main nav)
- [ ] Page sections:
  - **What is fabric-lens?** — one paragraph, written for a Fabric admin or consultant (not a developer)
  - **Key capabilities** — 4–5 bullet summary: health scoring, security audit, capacity monitoring, demo mode
  - **How to use this site** — step-by-step walkthrough of demo mode vs. live mode; what you can explore in each
  - **What you need for a Fabric tenant audit** — required Azure permissions (Fabric Admin role, App Registration, scopes), step-by-step connection guide
  - **Health scoring explained** — the 10-check table from CLAUDE.md, written for a non-technical stakeholder
  - **Security audit explained** — what the posture score checks, what admin permissions are required and why
  - **Demo mode** — one sentence: no credentials needed, click "Try Demo"
  - **Links** — GitHub repo, Fabric REST API docs, issue tracker
- [ ] Ensure the page renders fully server-side (static HTML from Vite build) so it is crawlable
- [ ] Use the existing Meridian design tokens — this page should look like the rest of the app, not a separate site

### 0e. Full site visual review ✅ COMPLETE (2026-04-05)
**Effort:** 1–2 days | **Target:** All pages

Audit every page (Dashboard, Workspaces, WorkspaceDetail, Capacity, Security, Settings) against the Meridian design system and "instrument panel" intent. Should happen before Phase 2 (report export) so the visual foundation is solid before generating printable output.

- [x] Check consistent card patterns, table styles, loading/empty states across all pages
- [x] Verify color token usage — no hardcoded Tailwind palette classes (e.g. `text-indigo-600`), everything through `--m-*` tokens
- [x] Verify spacing and typography consistency (headers, body, captions, badge sizes)
- [x] Verify dark mode correctness on every page and panel
- [x] Output: a prioritised list of targeted fixes, then implement them

**Fixes implemented:** Replaced hardcoded Tailwind palette classes with semantic tokens in `ErrorBoundary`, `SecurityFindingsPanel`, and `GovernanceIssuesPanel`. Centralised chart hex colors (`GRADE_COLORS`, `ITEM_DOT_COLORS`, `CHART_FALLBACK_COLOR`) into `constants.ts` via new `HEALTH_GRADE_COLORS` export. Global grep confirms zero palette color violations remain across `src/components/` and `src/pages/`.

### 0f. UX audit + targeted improvements ✅ COMPLETE (2026-04-05)
**Effort:** 2–3 days | **Target:** Security page, Dashboard, Demo flow

- [x] **Security page pre-scan state** — replaced generic icon + "Click Scan All" with a descriptive card: "Run a security audit" headline, 6-bullet list of what gets surfaced, inline Scan All button with `~30s · rate limited to 200 req/hr` note
- [x] **Security panel ordering** — reordered 11 panels into four audience groups: Summary → Tenant-wide risks → Access risks → Drill-down
- [x] **Dashboard landing** — promoted `SecurityQuickView` to full-width above the health grid with a value-proposition empty state ("Uncover hidden access risks", 3 metric previews, "Load security data" CTA); Health Grade Distribution chart made standalone full-width below
- [x] **Demo discoverability** — added "Try →" pill badge to Security nav item in demo mode; disappears once user visits `/security` (sessionStorage persistence); 5 unit tests added (`Sidebar.test.tsx`)

---

## Phase 1: Security Depth

Extends the Security page with three new panels. Build order: 2 → 3 → 1 (complexity ascending, and Feature 1 has a scope blocker that needs resolving independently).

### Feature 2: Tenant Settings Risk Panel ✅ COMPLETE (2026-04-05)
**Effort:** Low (~300 LOC) | **Target:** SecurityPage

Single API call, single response, no pagination. Establishes the store/panel pattern reused by Feature 3.

- [x] **2a. Verify API response shape** — `GET /v1/admin/tenantsettings` returns `{ tenantSettings: [...] }` (NOT `{ value: [...] }` like standard Fabric list endpoints)
- [x] **2b. Type the response** (`src/api/types/tenantSettings.ts`) — `TenantSetting`, `TenantSettingsResponse`, `RiskyTenantSetting`, `RiskLevel`
- [x] **2c. Define risk classifications** (`src/utils/tenantSettingRisks.ts`) — `deriveRiskySettings()` pure function; called in SecurityPage (not panel) so result is reusable for Phase 2 report
- [x] **2d. Add constants** (`src/utils/constants.ts`) — `TENANT_SETTINGS_HIGH_RISK`, `TENANT_SETTINGS_MEDIUM_RISK`, `FABRIC_ADMIN_PORTAL_SETTINGS_URL`
- [x] **2e. API module** (`src/api/tenantSettings.ts`) — factory pattern via `createTenantSettingsApi(client)`
- [x] **2f. Store** (`src/store/tenantSettingsStore.ts`) — cache guard: skips fetch if `settings.length > 0 && !error`; demo and rate-limit gated
- [x] **2g. Demo data** (`src/api/demo.ts`) — `getMockTenantSettings()`: 3 high enabled, 3 medium enabled, 4 disabled
- [x] **2h. Panel component** (`src/components/security/TenantSettingsRiskPanel.tsx`) — 4 states: loading/error/empty/data; table with Setting, Group, Risk badge, Scope columns
- [x] **2i. Wire into SecurityPage** — fires alongside workspace scan in `handleScanAll`; panel placed between SecurityFindingsPanel and SpofWorkspacesPanel
- [x] **2j. Build check** — 102/102 tests pass, `npm run build` clean

---

### Feature 3: Widely Shared Objects Panel ✅ COMPLETE (2026-04-05)
**Effort:** Low (~350 LOC) | **Target:** SecurityPage

API uses Power BI Admin base (`api.powerbi.com`) with `POWERBI_SCOPES` — not the Fabric base. `FabricClient` was extended with a per-request `scopes` override to support this (also unblocks Feature 1). Response envelope is `artifactAccessEntities` (not `value`), requiring a custom pagination loop.

- [x] **3a. Verify API response shape** — confirmed via Microsoft docs: Power BI Admin API at `api.powerbi.com`; envelope is `artifactAccessEntities`; no workspaceId/date fields in response
- [x] **3b. Type the response** (`src/api/types/widelyShared.ts`) — `WidelySharedArtifact`, `WidelySharedArtifactSharer` (optional), `WidelySharedResponse`
- [x] **3c. API module** (`src/api/widelyShared.ts`) — custom pagination loop; passes `POWERBI_SCOPES` on every call
- [x] **3d. Store** (`src/store/widelySharedStore.ts`) — cache guard, rate-limited, demo-branched
- [x] **3e. Demo data** (`src/api/demo.ts`) — 6 artifacts covering all 5 artifactTypes: Report, Dashboard, Dataset→SemanticModel, PaginatedReport, Dataflow
- [x] **3f. Panel component** (`src/components/security/WidelySharedPanel.tsx`) — 4 states; exhaustive `toItemType` map; `sharer` null guard
- [x] **3g. Wire into SecurityPage** — store hook, fetch in `handleScanAll`, panel after `TenantSettingsRiskPanel`
- [x] **3h. Build check** — 109/109 tests pass, `npm run build` clean

---

### Feature 1: Ghost Workspace Detection ✅ COMPLETE (2026-04-05)
**Effort:** Medium (~450 LOC) | **Target:** SecurityPage

Scope blocker resolved in Feature 3 (`POWERBI_SCOPES` via `FabricClient` scopes override). Uses `POWERBI_SCOPES` + `POWERBI_ADMIN_API_BASE` already in constants. Cache guard uses `lastFetchedAt` (not array length) so zero-ghost tenants don't re-fetch. Demo: 4 ghost workspaces (Grade D, 95–180 days) + 3 Grade F with no events.

- [x] **1a. Resolve OAuth scope** — resolved in Feature 3: `POWERBI_SCOPES` passed via `FabricClient.get()` scopes override; MSAL handles consent automatically.
- [x] **1b. Add constants** (`src/utils/constants.ts`) — `GHOST_WORKSPACE_THRESHOLD_DAYS` (90), `ACTIVITY_LOG_LOOKBACK_DAYS` (30) in dedicated `// -- Ghost workspaces --` section.
- [x] **1c. Type the response** (`src/api/types/activityEvents.ts`) — `ActivityEvent`, `ActivityEventsResponse` (envelope: `activityEventEntities`, pagination: `continuationUri`), `WorkspaceActivity`.
- [x] **1d. API module** (`src/api/activityEvents.ts`) — factory pattern; single-quoted datetime params per Power BI OData spec; `continuationUri` used as full next URL.
- [x] **1e. Derivation utility** (`src/utils/ghostWorkspaces.ts`) — pure function; 8 unit tests; imports named constants from constants.ts.
- [x] **1f. Store** (`src/store/activityStore.ts`) — two-map aggregation for correct `eventCount`; `lastFetchedAt` cache guard.
- [x] **1g. Demo data** (`src/api/demo.ts`) — `getMockWorkspaceActivity()`: 166 events; 4 ghost workspaces at 95–180 days; 3 Grade F with no events.
- [x] **1h. Panel component** (`src/components/security/GhostWorkspacesPanel.tsx`) — 4 states; `--health-*` CSS tokens for grade badges; `GHOST_WORKSPACE_THRESHOLD_DAYS` interpolated; `useMemo` for derived data.
- [x] **1i. Placement** — SecurityPage, after WidelySharedPanel.
- [x] **1j. Build check** — 117/117 tests pass, `npm run build` clean.

---

## Phase 2: Consultant Delivery

These features transform fabric-lens from a monitoring dashboard into a consulting tool. They depend on Phase 1 being complete — a generated report is more valuable when it includes tenant settings risk and widely shared objects data.

### Generate Report export
**Effort:** Medium | **Target:** Dashboard or new Report route

The #1 missing feature for the consultant persona. Consultants need a formatted deliverable to hand to the client after an audit session. CSV rows are not that.

- [ ] **Design the report layout first** — agree on sections before writing code:
  - Cover: tenant name, audit date, overall health grade
  - Executive summary: 3–5 top findings in plain English
  - Health scores: per-workspace grade distribution chart + top 5 worst workspaces
  - Security posture: score, grade, check-by-check breakdown
  - Tenant settings: high-risk enabled settings (from Feature 2)
  - Widely shared objects: count + list (from Feature 3)
  - Ghost workspaces: inactive workspace list (from Feature 1)
  - Recommendations: top 5 governance actions, sorted by recoverable points
- [ ] Implement as a client-side rendered print view (`/report` route or modal) using `window.print()` with a `@media print` stylesheet — no PDF library dependency
- [ ] "Generate Report" button on DashboardPage (or a toolbar action) — only visible when data is loaded
- [ ] Report must look professional when printed or saved as PDF from browser
- [ ] Demo mode must produce a complete report using mock data (critical for consultant demos)

### Static benchmarks
**Effort:** Low | **Target:** DashboardPage ScoreRing + WorkspaceDetailPage

- [ ] Define benchmark values as constants — synthetic medians based on demo data distribution (e.g. median tenant health: B / 78%, median security posture: 72)
- [ ] Show benchmark reference line on health grade distribution chart
- [ ] Show "vs. typical" comparison on ScoreRing tooltip or label
- [ ] Keep copy honest — label as "typical" or "reference" not "industry average" since these are synthetic

### Guided limited-access flow
**Effort:** Low–Medium | **Target:** SecurityPage

Consultants rarely get Fabric Admin role on day one. The current hard gate ("Admin role required") leaves them with nothing. A limited-access mode should show what IS available and guide them on what to request.

- [ ] Detect limited access (403 on admin API check) and show a "Limited Access Mode" state instead of a hard error card
- [ ] In limited access mode, show: workspace inventory, health scores, capacity view, item counts — everything derivable from user-scoped APIs
- [ ] Add a clear panel: "To unlock security audit, request Fabric Administrator role" with a link to Microsoft docs on how to grant it
- [ ] Update demo data to include a simulated limited-access scenario (useful for consultant demos when explaining the permission model to clients)

---

## Icebox

Deferred — valid ideas, not yet planned.

- **Multi-tenant UX / tenant switcher** — consultants audit multiple clients; right now switching tenants requires a full logout/login cycle. Needs UX design and likely a session history store.
- **My Workspaces view** — filter to workspaces where current user has a role. Opens fabric-lens to non-admin workspace owners. Needs user identity context from MSAL.
- **Historical health trending** — store point-in-time health snapshots. Requires a persistence strategy (localStorage, IndexedDB, or external).
- **Sensitivity label / Purview integration** — item-level classification coverage. Requires Microsoft Purview APIs and additional consent.
- **Domain governance analysis** — `domainId` already on workspaces; surface assignment coverage and cross-domain access patterns.
- **Landing page redesign** — replace the app-as-landing with a marketing hero section before the demo/sign-in prompt. High value for SEO and first impressions but requires copy, design, and AppShell restructuring. Deliberate choice to defer until the `/about` page (Phase 0d) validates what messaging resonates.
