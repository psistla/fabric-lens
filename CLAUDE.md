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
  api/          → fabricClient (base HTTP), per-resource modules (admin, capacities,
                  workspaces), azurePricing (live SKU rates), demo (mock data), types/
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
| Charts | `CHART_COLORS` (12-color palette), `CHART_TOOLTIP_STYLE`, `CHART_FALLBACK_COLOR` |
| Roles | `ROLE_COLORS` (Admin/Member/Contributor/Viewer color map) |
| Health | `HEALTH_SCORE_WEIGHTS`, `GRADE_THRESHOLDS`, `MAX_REASONABLE_ITEM_COUNT` |
| Security | `ADMIN_ROLE_WARNING_THRESHOLD` (5) |
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
- **Design philosophy:** Precise. Dense. Trustworthy. (instrument panel aesthetic)
- Tailwind v4 utility classes — no custom CSS unless necessary
- Dark mode via Tailwind `dark:` prefix (class-based strategy)
- `@custom-variant dark (&:where(.dark, .dark *));` in CSS entry point
- Semantic color tokens defined as CSS custom properties in `src/index.css` (see DESIGN_GUIDE.md § Color System)
- **Color palette:** Slate-based with blue-tinted dark mode (navy `#0B1120`, not pure black)
- **Brand blue:** `#3B6CE7` (actions, links, focus rings, active states)
- **Health grades:** A=emerald, B=blue, C=amber, D=orange, F=red (consistent across all components)
- **Item types:** Each Fabric item type has a unique color (Lakehouse=blue, Notebook=violet, Pipeline=emerald, etc.)
- **Typography:** Geist Sans + Geist Mono planned; currently system fonts via Tailwind defaults
- **Icons:** Lucide React — 20px for nav, 16px inline, never mix filled/outlined on same surface
- **Motion:** Functional only. 120ms hover, 200ms transitions, 300ms layout shifts. Ease-out only. No bounce/overshoot.
- **Copy tone:** Professional, precise, quietly confident. Empty states guide, errors are actionable, health scores are opportunities not report cards

### File Naming
- Components: PascalCase (`WorkspaceList.tsx`)
- Hooks: camelCase with `use` prefix (`useAuth.ts`)
- Utils/API: camelCase (`fabricClient.ts`)
- Data files: camelCase (`skuSpecs.ts`)
- Types: camelCase file, PascalCase interfaces

## Demo Mode
The app runs in **demo mode** when `VITE_MSAL_CLIENT_ID` is unset or set to `'demo'`.

- Detection: `isDemoMode` flag exported from `src/api/demo.ts`
- Mock data: 3 capacities, 15 workspaces, 54+ items (all 18+ item types), 6 users with role assignments
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
- Two token scopes: Fabric API (`api.fabric.microsoft.com/.default`) and ARM API
- Admin APIs require Fabric Admin role — gracefully degrade for non-admins
- App Registration: SPA type, redirect to localhost:5173 (dev)
- In demo mode, auth is fully bypassed — no Azure AD required

## Health Scoring (100 pts)
Weights are defined in `HEALTH_SCORE_WEIGHTS` constant:

| Criterion | Points |
|-----------|--------|
| Has description | 10 |
| Assigned to capacity | 15 |
| Assigned to domain | 10 |
| Git integration | 15 |
| Naming convention | 10 |
| No stale items (90 days) | 10 |
| Data layer present | 10 |
| Reasonable item count (<100) | 10 |
| Workspace identity (SPN) | 10 |

Grade thresholds: A ≥ 90%, B ≥ 80%, C ≥ 65%, D ≥ 50%, F < 50%
