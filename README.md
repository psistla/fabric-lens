# Fabric Lens

**Open-source tenant governance & health intelligence for Microsoft Fabric.**

Fabric Lens is a standalone React SPA that connects directly to Microsoft Fabric REST APIs via MSAL.js authentication. No backend required — everything runs in your browser. Ships with a fully functional **demo mode** so you can explore immediately without an Azure tenant.

[![MIT License](https://img.shields.io/badge/license-MIT-4F46E5.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-4F46E5.svg)](tsconfig.app.json)
[![React](https://img.shields.io/badge/React-19-4F46E5.svg)](package.json)
[![Live Demo](https://img.shields.io/badge/demo-live-4F46E5.svg)](https://fabric-lens.com)
[![Security Policy](https://img.shields.io/badge/security-policy-4F46E5.svg)](SECURITY.md)

> **[Try the live demo](https://fabric-lens.com)** — Explore with sample data in your browser, no setup required.

---

## Screenshots

| Dashboard | Workspaces |
|-----------|------------|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Workspaces](docs/screenshots/workspaces.png) |

| Capacity Monitor | Security Audit |
|-----------------|----------------|
| ![Capacity](docs/screenshots/capacity.png) | ![Security](docs/screenshots/security.png) |

<details>
<summary>Dark Mode</summary>

![Dashboard Dark Mode](docs/screenshots/dashboard-dark.png)

</details>

---

## Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Tenant-wide overview with workspace/item/capacity stats, artifact distribution charts, governance issues, average health score, and the **Health Grid** — a dense color-coded tile map showing every workspace's health grade at a glance, sorted best to worst |
| **Workspace Explorer** | Browse, search, and drill into every workspace. View items, health grades, capacity assignments, OneLake endpoints, and Git status |
| **Health Scoring** | Automated 100-point governance assessment per workspace across 10 checks — description, capacity, domain, Git, naming, active items, data layer, item count, identity, and tag coverage |
| **Capacity Monitor** | Track SKUs, regions, and states with tier-based badges. Cost calculator with **live Azure pricing** from the Azure Retail Prices API |
| **Security Audit** | Cross-workspace role mapping with search, role filter chips, sortable columns, and pagination. Flags over-permissioned users (Admin on 5+ workspaces). Expands Azure AD group memberships via Microsoft Graph (optional) |
| **Incremental Consent** | Core API scopes are acquired at sign-in. Admin API (`Tenant.Read.All`) and Graph API (`GroupMember.Read.All`) scopes are requested on-demand the first time you use those features — users are never prompted for permissions they don't need |
| **Multi-tenant** | Works with any Azure AD tenant — sign in with your organization account. No per-tenant app registration required when using the hosted version |
| **CSV Export** | Export workspace inventories and security audit data for offline analysis |
| **Dark Mode** | Deep dark base (`#0D0F12`) with full semantic token support — not pure black, creates depth without blue-navy tint |
| **Design System** | Semantic CSS custom property token system (`--m-*`) for surfaces, text, borders, and brand colors. Manrope + JetBrains Mono typography, self-hosted |
| **Demo Mode** | Realistic mock data — 3 capacities, 35 workspaces, 200+ items across all 19 item types, 8 users, 4 groups — no Azure credentials needed |

---

## Getting Started

### Option 1: Use the hosted version (recommended)

The fastest way to connect your Fabric tenant — no installation, no configuration, no app registration required.

1. Visit [fabric-lens.com](https://fabric-lens.com)
2. Click **Sign in with Microsoft**
3. Authenticate with your Azure AD account
4. Your tenant admin approves the one-time consent prompt
5. Start exploring your governance posture

> **Note:** Your tenant admin may need to grant admin consent on first sign-in. Fabric Lens requests read-only access to workspace, item, and capacity data. Admin API and Microsoft Graph scopes are requested separately, only when you first use those features.

---

### Option 2: Self-host

For organizations that require self-hosted deployments or want to customize the tool.

```bash
git clone https://github.com/psistla/fabric-lens.git
cd fabric-lens
cp .env.example .env.local
# Edit .env.local with your Azure AD App Registration details
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Without any configuration, the app launches in **demo mode** automatically.

#### App Registration Setup

1. Go to [Azure Portal](https://portal.azure.com) > **Microsoft Entra ID** > **App registrations** > **New registration**
2. Name: `Fabric Lens` (or any name)
3. Supported account types: match your tenant strategy (single or multi-tenant)
4. Redirect URI: select **Single-page application (SPA)** and add both URIs:
   - `http://localhost:5173` (local development)
   - Your production URL (if deploying)
5. Click **Register**

#### API Permissions

In your App Registration > **API permissions** > **Add a permission**:

**Core — required on sign-in:**

| API | Permission | Type |
|-----|-----------|------|
| Power BI Service | `Workspace.Read.All` | Delegated |
| Power BI Service | `Item.Read.All` | Delegated |
| Power BI Service | `Capacity.Read.All` | Delegated |
| Azure Service Management | `user_impersonation` | Delegated |

**Security Audit — requested on demand (first visit to Security page):**

| API | Permission | Type |
|-----|-----------|------|
| Power BI Service | `Tenant.Read.All` | Delegated |

**Group Expansion — requested on demand (opt-in from Settings):**

| API | Permission | Type |
|-----|-----------|------|
| Microsoft Graph | `GroupMember.Read.All` | Delegated |

Click **Grant admin consent** for all permissions (requires admin privileges).

> **Incremental consent:** Fabric Lens only requests elevated permissions when you navigate to features that need them. Users are never prompted for scopes they don't use.

#### Environment Variables

Create `.env.local` in the project root:

| Variable | Description |
|----------|-------------|
| `VITE_MSAL_CLIENT_ID` | Your App Registration client ID |
| `VITE_MSAL_TENANT_ID` | Your Azure AD tenant ID (or `common` for multi-tenant) |
| `VITE_MSAL_REDIRECT_URI` | Your deployment URL (e.g. `http://localhost:5173`) |

Full example (copy from `.env.example`):

```env
VITE_MSAL_CLIENT_ID=<your-client-id>
VITE_MSAL_TENANT_ID=<your-tenant-id-or-common>
VITE_MSAL_REDIRECT_URI=http://localhost:5173
VITE_FABRIC_API_BASE=https://api.fabric.microsoft.com/v1
VITE_ARM_API_BASE=https://management.azure.com
```

For production deployments on Azure Static Web Apps, set these as Application Settings in the portal (Configuration → Application settings) — do not use `.env.local` for deployed environments.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Browser SPA (React 19)                   │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ React Router │  │Zustand Stores│  │     MSAL.js 5      │  │
│  │              │  │              │  │                    │  │
│  │ /dashboard   │  │workspaceStore│  │ Core scopes: login │  │
│  │ /workspaces  │◄►│capacityStore │  │ Admin scopes: lazy │  │
│  │ /capacity    │  │securityStore │  │ Graph scopes: lazy │  │
│  │ /security    │  │uiStore       │  └─────────┬──────────┘  │
│  │ /settings    │  └──────┬───────┘            │             │
│  └─────────────┘          │                    │             │
│                           ▼                    ▼             │
│                  ┌────────┴────────┐  ┌────────┴──────────┐  │
│                  │  fabricClient   │◄─│ Incremental consent│  │
│                  └───┬────┬───┬───┘  └────────────────────┘  │
│                      │    │   │                               │
│  ┌───────────────────┼────┼───┼─────────────────────────┐    │
│  │   Demo Mode       │    │   │   (mock data layer)     │    │
│  │   isDemoMode ──►  │    │   │   3 capacities,         │    │
│  │   bypass auth     │    │   │   35 workspaces,        │    │
│  │   serve mocks     │    │   │   200+ items, 8 users   │    │
│  └───────────────────┼────┼───┼─────────────────────────┘    │
└──────────────────────┼────┼───┼──────────────────────────────┘
                       │    │   │
                       ▼    ▼   ▼
          ┌────────┐ ┌─────┐ ┌─────┐ ┌──────────────────┐
          │ Fabric │ │Admin│ │ ARM │ │ Azure Retail      │
          │Core API│ │ API │ │ API │ │ Prices API        │
          │        │ │     │ │     │ │ (public, no auth) │
          └────────┘ └─────┘ └─────┘ └──────────────────┘
```

**Key design decisions:**
- **No backend** — pure SPA with delegated permissions. Simplest deployment (static hosting), no server-side secrets
- **Incremental consent** — core Fabric + ARM scopes at login; Admin (`Tenant.Read.All`) and Graph (`GroupMember.Read.All`) scopes acquired on-demand the first time a user navigates to a feature that requires them. Consent state persists for the session — no re-prompts on navigation
- **Multi-tenant** — MSAL authority set to `common`; any Azure AD tenant can authenticate against a single app registration. Set `VITE_MSAL_TENANT_ID=common` when self-hosting for the same behavior
- **Live pricing** — Azure Retail Prices API (public, no auth) with 1-hour in-memory cache and graceful fallback
- **Semantic design tokens** — `--m-*` CSS custom properties decouple all component styling from raw hex values; dark mode is a token swap, not a stylesheet override

---

## Health Scoring

Each workspace is scored across ten governance checks. When items are present, the raw score is normalized against a 110-point maximum; when there are no items, tag coverage is skipped and the maximum is 100.

| Check | Points | Description |
|-------|--------|-------------|
| Has description | 10 | Workspace has a non-empty description |
| Assigned to capacity | 15 | Workspace is linked to a Fabric capacity |
| Assigned to domain | 10 | Workspace belongs to a defined domain |
| Workspace identity (SPN + Git) | 25 | SPN configured — enables Git integration and automation |
| Naming convention | 10 | Name follows the configured pattern |
| Active items | 10 | Workspace contains at least one item |
| Data layer present | 10 | Contains at least one Lakehouse or Warehouse |
| Reasonable item count | 10 | Fewer than 100 items |
| Tag coverage | 10 | ≥80% of items tagged (full); ≥50% (half credit); skipped if no items |

**Grades:** A (≥90%) · B (≥80%) · C (≥65%) · D (≥50%) · F (<50%)

---

## Project Structure

```
src/
  auth/           MSAL config, AuthProvider, useAuth (with incremental consent), ProtectedRoute
  api/            fabricClient, resource modules, azurePricing, demo, types/
  data/           SKU specifications and derived pricing (skuSpecs.ts)
  store/          Zustand stores (workspace, capacity, security, ui)
  components/
    layout/       AppShell, Sidebar, Header (demo-mode-aware)
    workspace/    GovernanceIssues, HealthBadge, HealthDetail
    shared/       DataTable, StatCard, SearchBar, EmptyState, ExportButton, ItemTypeBadge, ...
    charts/       ItemsByTypeChart, WorkspacesByCapacityChart
  pages/          Dashboard, Workspaces, WorkspaceDetail, Capacity, Security, Settings
  utils/          healthScore, export (CSV), constants (single source of truth)
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server at `http://localhost:5173` |
| `npm run build` | `tsc -b && vite build` — strict TypeScript + production build |
| `npm run type-check` | `tsc --noEmit` — type checking only |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (single run) |
| `npm run test:watch` | Vitest (watch mode) |

> **Note:** `npm run build` uses `tsc -b` which is stricter than `type-check`. Always run build before committing — it catches unused parameters and locals that type-check may miss.

---

## Tech Stack

| | Technology |
|--|-----------|
| Framework | React 19 + TypeScript (strict) |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) + Meridian `--m-*` CSS tokens |
| Typography | Manrope variable (UI) + JetBrains Mono variable (code/IDs) — self-hosted |
| UI Primitives | Radix UI + class-variance-authority + tailwind-merge |
| State | Zustand 5 |
| Charts | Recharts 3 |
| Auth | @azure/msal-browser 5 + @azure/msal-react 5 |
| Router | React Router v7 |
| Icons | lucide-react |
| Testing | Vitest + React Testing Library |

---

## Design System

Fabric Lens uses the Meridian design system — a set of semantic CSS custom properties that decouple component styling from raw color values.

**Highlights:**
- **Token prefix** — All tokens use `--m-*` (e.g. `--m-bg`, `--m-text`, `--m-primary`, `--m-surface-hover`)
- **Color** — Deep indigo `#4F46E5` primary, warm amber `#B45309` accent (WCAG AA+ on white). Dark mode base `#0D0F12` — not pure black, not blue-navy
- **Health grade colors** — A=emerald (`#15803D`), B=indigo (`#4F46E5`), C=amber (`#B45309`), D=orange (`#EA580C`), F=red (`#DC2626`) — consistent across all components
- **Typography** — Manrope (400/500/600/700) for UI; JetBrains Mono (400/500/600) for IDs, endpoints, and code — both self-hosted via `@fontsource-variable`
- **Component standards** — Cards `rounded-xl`, buttons `rounded-lg`, badges pill-shaped `rounded-full` at `text-[11px] font-semibold uppercase tracking-wide`, table headers `text-[11px] font-semibold uppercase tracking-[0.04em]`
- **Skeletons** — `.m-skeleton` shimmer class (not `animate-pulse`)
- **Motion** — Functional only: 120ms hover, 200ms transitions, 300ms layout shifts. Ease-out. No bounce
- **Design philosophy** — Minimal but not empty. Data-dense but cognitively calm. Instrument panel aesthetic for enterprise Fabric admins

---

## Security

See [SECURITY.md](SECURITY.md) for the vulnerability reporting process, response timelines, and security architecture details.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, coding standards, and the pull request process.

A few things worth knowing before diving in:
- All new UI must use the semantic CSS token system (`--m-*` prefixed custom properties) — no raw hex values in components
- Run `npm run build` (not just `type-check`) before submitting — the strict `tsc -b` build catches unused parameters and locals
- Constants go in `src/utils/constants.ts` — never inline magic numbers or threshold values in components

---

## Star This Repo

If fabric-lens saves you time governing your Fabric tenant, consider starring the repo. It helps others discover the tool and keeps the project visible.

---

## License

MIT — use it, fork it, ship it.

---

## Built By

**Prasanth Sistla** — Senior Architect Consultant

[![LinkedIn](https://img.shields.io/badge/LinkedIn-prasanthsistla-4F46E5?logo=linkedin)](https://www.linkedin.com/in/prasanthsistla/)

---

## Disclaimer

Fabric Lens is an independent, community-driven project. It is **not** affiliated with, endorsed by, or sponsored by Microsoft Corporation. "Microsoft Fabric" is a trademark of Microsoft Corporation.
