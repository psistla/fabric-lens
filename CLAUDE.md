# CLAUDE.md — fabric-lens

## What is this project?
fabric-lens is a standalone React SPA providing governance, health intelligence, and inventory management for Microsoft Fabric tenants. It authenticates via MSAL.js (Azure AD) and calls Fabric REST APIs directly from the browser — no backend required. Ships with a fully functional **demo mode** using realistic mock data so the app can be explored without an Azure tenant.

## Tech Stack
- **Framework:** React 19 + TypeScript (strict)
- **Build:** Vite 7
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/vite` — zero-config, no `tailwind.config.ts`)
- **UI Primitives:** Radix UI + class-variance-authority + tailwind-merge
- **State:** Zustand 5
- **Charts:** Recharts 3
- **Auth:** @azure/msal-browser 5 + @azure/msal-react 5
- **Router:** React Router v7
- **Icons:** lucide-react
- **Testing:** Vitest + React Testing Library

## Project Structure
```
src/
  auth/         → MSAL config, AuthProvider, useAuth hook, ProtectedRoute
  api/          → fabricClient (base HTTP), graphClient (MS Graph for group expansion),
                  per-resource modules (admin, capacities, workspaces),
                  azurePricing (live SKU rates), demo (mock data), types/
  data/         → Static data & derived constants (skuSpecs with tiers & rates)
  store/        → Zustand stores (workspace, capacity, security, ui)
  components/
    layout/     → AppShell, Sidebar, Header (demo-mode-aware)
    workspace/  → GovernanceIssues, HealthBadge, HealthDetail
    shared/     → DataTable, StatCard, SearchBar, EmptyState, ErrorBoundary,
                  ExportButton, ItemTypeBadge, LoadingState, StateBadge, Toast
    charts/     → ItemsByTypeChart, WorkspacesByCapacityChart
  pages/        → DashboardPage, WorkspacesPage, WorkspaceDetailPage,
                  CapacityPage, SecurityPage, SettingsPage
  utils/        → healthScore, export (CSV), constants (single source of truth)
```

## Code Conventions

### TypeScript
- `strict: true` — no `any` types anywhere
- `noUnusedLocals` and `noUnusedParameters` enabled in tsconfig
- Prefer `interface` over `type` for object shapes
- All API responses fully typed in `src/api/types/`
- `PrincipalType` (`'User' | 'Group'`) distinguishes individual users from security groups in admin types
- `GroupMember` interface for expanded group membership data
- Discriminated unions for error handling
- Co-locate component-specific types (e.g. `SortKey`, `SortDir`) in the component file

### React Components
- Functional components only — **no `React.FC`**
- Explicit prop types via `interface Props`:
  ```tsx
  interface Props { title: string; count: number }
  export function StatCard({ title, count }: Props) { ... }
  ```
- Custom hooks for all reusable logic (prefix with `use`)
- Complex pages use chained `useMemo` for derived data pipelines:
  ```tsx
  const filtered = useMemo(() => /* search + filter */, [data, search, filters]);
  const sorted   = useMemo(() => /* column sort */,     [filtered, sortKey, sortDir]);
  const paged    = useMemo(() => /* paginate slice */,   [sorted, page]);
  ```

### API Layer
- ALL Fabric API calls go through `src/api/fabricClient.ts`
- Token injection via MSAL is automatic in fabricClient
- Continuation token pagination:
  ```ts
  async function listAll<T>(endpoint: string): Promise<T[]> {
    const results: T[] = [];
    let token: string | undefined;
    do {
      const url = token ? `${endpoint}?continuationToken=${token}` : endpoint;
      const res = await fabricClient.get<PaginatedResponse<T>>(url);
      results.push(...res.value);
      token = res.continuationToken;
    } while (token);
    return results;
  }
  ```
- Admin APIs are rate-limited to 200 req/hr (constant: `ADMIN_RATE_LIMIT`)

### Constants Pattern
All magic numbers, thresholds, colors, and config values live in `src/utils/constants.ts` as named exports — never hardcoded in components. Key groups:

| Group | Examples |
|-------|---------|
| Rate Limiting | `ADMIN_RATE_LIMIT` (200), `DEFAULT_RETRY_AFTER_MS` (5000) |
| UI Timing | `SEARCH_DEBOUNCE_MS` (300), `TOAST_DISMISS_MS` (5000), `DEMO_PROGRESS_DELAY_MS` (80) |
| Charts | `CHART_COLORS` (Meridian 12-color sequence: indigo→amber→violet→...), `CHART_TOOLTIP_STYLE` (dark panel), `CHART_FALLBACK_COLOR` (#495057) |
| Roles | `ROLE_COLORS` (Admin=#DC2626, Member=#4F46E5, Contributor=#15803D, Viewer=#495057) |
| Health | `HEALTH_SCORE_WEIGHTS`, `GRADE_THRESHOLDS`, `MAX_REASONABLE_ITEM_COUNT` |
| Security | `ADMIN_ROLE_WARNING_THRESHOLD` (5), `GROUP_EXPAND_INITIAL_COUNT` (3) |
| Graph | `GRAPH_SCOPES` (`GroupMember.Read.All`) |
| Pricing | `CU_RATE_PER_HOUR` (0.18 USD) |

When adding new values, add them to constants.ts and import — do not inline.

### State Management (Zustand 5)
- One store per domain: `workspaceStore`, `capacityStore`, `securityStore`, `uiStore`
- Pattern:
  ```ts
  interface WorkspaceStore {
    workspaces: Workspace[];
    loading: boolean;
    error: string | null;
    fetchWorkspaces: () => Promise<void>;
  }
  ```

### Styling & Design System
- **Design guide:** See `DESIGN_GUIDE.md` for the full look & feel specification
- **Design philosophy:** Minimal but not empty. Data-dense but cognitively calm. Calm, confident visual language. (instrument panel aesthetic)
- Tailwind v4 utility classes — no custom CSS unless necessary
- Dark mode via Tailwind `dark:` prefix (class-based strategy)
- `@custom-variant dark (&:where(.dark, .dark *));` in CSS entry point
- **Token prefix:** All design tokens use `--m-*` prefix (e.g. `--m-bg`, `--m-text`, `--m-primary`)
- Semantic color tokens defined as CSS custom properties in `src/index.css` (see DESIGN_GUIDE.md § Color System)
- **Primary font:** Manrope (400/500/600/700) via `@fontsource-variable/manrope` — self-hosted, no CDN
- **Code font:** JetBrains Mono (400/500/600) via `@fontsource-variable/jetbrains-mono` — self-hosted
- **Primary color:** Deep indigo `#4F46E5` (actions, links, focus rings, active states)
- **Accent color:** Warm amber `#B45309` (accent-700, text-safe on white — 5.02:1 contrast)
- **Dark mode base:** `#0D0F12` (neutral-950) — not pure black, not blue-navy
- **Health grades:** A=emerald(`#15803D`), B=indigo(`#4F46E5`), C=amber(`#B45309`), D=orange(`#EA580C`), F=red(`#DC2626`) — consistent across all components
- **Item types:** Each Fabric item type has a unique color (Lakehouse=indigo, Notebook=violet, Pipeline=green, etc.)
- **Card radius:** `rounded-xl` (12px)
- **Button radius:** `rounded-lg` (8px)
- **Badge style:** pill (`rounded-full`), `text-[11px]`, `font-semibold`, `uppercase`, `tracking-wide`
- **Table headers:** `text-[11px] font-semibold uppercase tracking-[0.04em]`
- **Skeleton shimmer:** use `.m-skeleton` class (defined in `index.css`) — never `animate-pulse`
- **Touch targets:** minimum 44×44px
- **Accessibility:** WCAG AA+ baseline. Focus ring: `2px solid var(--m-primary)`. Color is never the sole state indicator — always pair with icon or text.
- **Icons:** Lucide React — 20px for nav, 16px inline, never mix filled/outlined on same surface
- **Motion:** Functional only. 120ms hover, 200ms transitions, 300ms layout shifts. Ease-out only. No bounce/overshoot.
- **Copy tone:** Professional, precise, quietly confident. Empty states guide, errors are actionable, health scores are opportunities not report cards
- **Design token source of truth:** `src/index.css` — all CSS custom properties, dark mode overrides, animations, and skeleton shimmer. See also `meridian-tokens.css` (root, gitignored) for the portable standalone reference
- **Component behavior rules:** `DESIGN_GUIDE.md` — full specification for patterns, anti-patterns, accessibility, and component standards. See also `meridian-prompt-stem.md` (root, gitignored) for the AI prompt stem used when generating new Meridian-styled artifacts

### File Naming
- Components: PascalCase (`WorkspaceList.tsx`)
- Hooks: camelCase with `use` prefix (`useAuth.ts`)
- Utils/API: camelCase (`fabricClient.ts`)
- Data files: camelCase (`skuSpecs.ts`)
- Types: camelCase file, PascalCase interfaces

## Demo Mode
The app runs in **demo mode** when `VITE_MSAL_CLIENT_ID` is unset or set to `'demo'`.

- Detection: `isDemoMode` flag exported from `src/api/demo.ts`
- Mock data: 3 capacities, 35 workspaces, 200+ items (all 19 item types), 8 users, 4 groups with role assignments
- UI behavior:
  - Amber banner at top: "DEMO MODE — Exploring with sample data. Sign in to connect your Fabric tenant."
  - Header shows flask icon + "Demo" label (not user avatar)
  - User menu shows "Sign in to tenant" (not "Sign out")
  - `ProtectedRoute` bypasses auth check in demo mode
  - Stores call mock data functions instead of live API
- Switching to live: Set `VITE_MSAL_CLIENT_ID` to a real Azure AD app registration client ID

## Live Pricing Integration
The Capacity page fetches real-time Azure SKU pricing via the public Azure Retail Prices API:

- Module: `src/api/azurePricing.ts`
- API: `https://prices.azure.com/api/retail/prices` (no auth required)
- Always fetches in **USD** — no multi-currency support
- 1-hour TTL cache (in-memory) to avoid redundant API calls
- Graceful fallback: if the API fails, the app uses derived rates from `CU_RATE_PER_HOUR` constant
- `buildSkuSpecsWithRates()` in `src/data/skuSpecs.ts` merges live rates onto default specs
- SKU tiers (gray/blue/indigo/purple) are assigned by capacity unit count for visual grouping

## Client-Side Data Patterns

### Filter → Sort → Paginate Pipeline
Used in SecurityPage (and recommended for any large data table):
```
rawData
  → filteredData  (search text + filter chips, via useMemo)
    → sortedData  (column header sort, via useMemo)
      → pagedData (slice for current page, via useMemo)
        → <table> renders only the current page
```
- Auto-reset page to 1 when search/filter changes
- `SearchBar` component provides built-in 300ms debounce
- Pagination: 25 rows/page with prev/next + smart page numbers (ellipsis for large counts)
- Footer shows: "Showing 1–25 of 142 users (filtered from 380)"

### Recharts Patterns
- Tooltip formatter signature must use optional params to match Recharts types:
  ```tsx
  formatter={(value?: number, name?: string) => { ... }}
  ```
- Always set `itemStyle={{ color: '#e2e8f0' }}` on dark-themed tooltips for text visibility
- Use `CHART_TOOLTIP_STYLE` from constants for consistent dark tooltip backgrounds
- Use `CHART_COLORS` from constants for consistent series colors

## Environment Variables
```
VITE_MSAL_CLIENT_ID=       # Azure AD App Registration client ID (omit or 'demo' for demo mode)
VITE_MSAL_TENANT_ID=       # Azure AD tenant ID (or "common" for multi-tenant)
VITE_MSAL_REDIRECT_URI=    # http://localhost:5173
VITE_FABRIC_API_BASE=      # https://api.fabric.microsoft.com/v1
VITE_ARM_API_BASE=          # https://management.azure.com
```

## Key Fabric REST API Endpoints
```
# Core APIs (user-scoped)
GET  /v1/workspaces                              # List workspaces
GET  /v1/workspaces/{id}                         # Workspace detail (capacity, endpoints)
GET  /v1/workspaces/{id}/items                   # All items in workspace
GET  /v1/workspaces/{id}/items?type=Lakehouse    # Filter by item type
GET  /v1/capacities                              # List capacities (id, SKU, region, state)

# Admin APIs (Fabric Admin role required, 200 req/hr limit)
GET  /v1/admin/workspaces                        # All tenant workspaces
GET  /v1/admin/workspaces/{id}/users             # Role assignments
POST /v1/admin/workspaces/getInfo                # Trigger Scanner API scan
GET  /v1/admin/workspaces/scanResult/{scanId}    # Poll scan results
```

All list endpoints return `{ value: T[], continuationToken?: string }`.

## Common Item Types
```
Lakehouse | Notebook | Pipeline | Warehouse | Report | SemanticModel |
Dashboard | DataPipeline | Dataflow | Eventstream | KQLDatabase |
KQLQueryset | MirroredDatabase | MirroredWarehouse | MLExperiment |
MLModel | PaginatedReport | SQLEndpoint | SparkJobDefinition
```

## Running Locally
```bash
npm install
npm run dev          # Dev server at http://localhost:5173
npm run build        # tsc -b && vite build (strict — catches unused params)
npm run lint         # ESLint
npm run type-check   # tsc --noEmit (slightly less strict than build)
npm run test         # Vitest (single run)
npm run test:watch   # Vitest (watch mode)
```

> **Note:** `npm run build` uses `tsc -b` which is stricter than `npm run type-check` (`tsc --noEmit`). The build will catch unused parameters and locals that type-check may miss. Always run `build` before committing.

## Adding a New Feature
1. Types → `src/api/types/`
2. API functions → `src/api/{resource}.ts`
3. Static data/specs → `src/data/{resource}.ts` (if applicable)
4. Store → `src/store/{resource}Store.ts`
5. Constants → `src/utils/constants.ts` (any thresholds, colors, config values)
6. Components → `src/components/{feature}/`
7. Page → `src/pages/`
8. Route → `App.tsx`
9. Demo data → `src/api/demo.ts` (add mock data for demo mode)
10. **Design audit** → Verify against `DESIGN_GUIDE.md` checklist (colors, spacing, dark mode, copy tone)

## Auth Notes
- MSAL uses popup login (falls back to redirect if popups blocked)
- Three token scopes: Fabric API (`api.fabric.microsoft.com/.default`), ARM API, and Microsoft Graph (`GroupMember.Read.All` for group expansion)
- **Incremental consent:** Core Fabric + ARM scopes are acquired on initial login. Admin API and Graph scopes are requested on-demand from SecurityPage and SettingsPage respectively — users are only prompted when they first use those features
- Graph scope is opt-in — requested via incremental consent popup from Settings page
- Admin APIs require Fabric Admin role — gracefully degrade for non-admins
- App Registration: SPA type, redirect to localhost:5173 (dev) or fabric-lens.com (prod)
- **Multi-tenant:** When `VITE_MSAL_TENANT_ID=common`, the MSAL authority is `https://login.microsoftonline.com/common` — supports any Azure AD tenant
- In demo mode, auth is fully bypassed — no Azure AD required

## Health Scoring (up to 110 pts)
Weights are defined in `HEALTH_SCORE_WEIGHTS` constant. Score is normalized: maxTotal is 110 when items are present, 100 when the workspace has no items (tag coverage is skipped).

| Criterion | Points |
|-----------|--------|
| Has description | 10 |
| Assigned to capacity | 15 |
| Assigned to domain | 10 |
| Git integration | 15 |
| Naming convention | 10 |
| Active items (has ≥1 item) | 10 |
| Data layer present | 10 |
| Reasonable item count (<100) | 10 |
| Workspace identity (SPN) | 10 |
| Tag coverage (≥80%=10, ≥50%=5, skipped if no items) | 10 |

Grade thresholds: A ≥ 90%, B ≥ 80%, C ≥ 65%, D ≥ 50%, F < 50%
