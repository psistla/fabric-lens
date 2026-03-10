# Fabric Lens

**Governance, health intelligence, and inventory management for Microsoft Fabric tenants.**

Fabric Lens is a standalone React single-page application that connects directly to the Microsoft Fabric REST APIs via MSAL.js (Azure AD) authentication. No backend required -- everything runs in your browser.

---

## Screenshots

| Dashboard | Workspace Explorer |
|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Workspace Explorer](docs/screenshots/workspace-explorer.png) |

| Health Scoring | Capacity Monitor |
|---|---|
| ![Health Scoring](docs/screenshots/health-scoring.png) | ![Capacity Monitor](docs/screenshots/capacity-monitor.png) |

---

## Features

- **Dashboard** -- Tenant-wide overview with key metrics, artifact distribution charts, and capacity utilization at a glance.
- **Workspace Explorer** -- Browse, search, and inspect every workspace in your tenant. View items, role assignments, and configuration details.
- **Health Scoring** -- Automated 100-point health assessment for each workspace based on nine governance checks (descriptions, capacity assignment, Git integration, naming conventions, and more).
- **Capacity Monitor** -- Track capacity SKUs, regions, and states. Visualize utilization over time.
- **Security Audit** -- Review workspace role assignments and access patterns across the tenant. Requires Fabric Admin role.
- **Export** -- Export workspace inventories, health reports, and audit data for offline analysis.
- **Dark Mode** -- Full dark mode support via Tailwind CSS `dark:` variants. Toggle between light and dark themes.
- **Demo Mode** -- Explore the full UI with synthetic data -- no Azure AD credentials required.

---

## Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later
- **Azure AD App Registration** (required only for live data; demo mode works without it)

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-org/fabric-lens.git
cd fabric-lens

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app opens at [http://localhost:5173](http://localhost:5173).

> **Demo Mode:** Launch the app without configuring any environment variables to explore the full UI with synthetic data. No Azure AD credentials are needed.

---

## Azure AD Setup

To connect Fabric Lens to a live Microsoft Fabric tenant, follow these steps:

### 1. Create an App Registration

1. Go to the [Azure Portal](https://portal.azure.com) and navigate to **Azure Active Directory > App registrations > New registration**.
2. Set the **Name** to `Fabric Lens` (or any name you prefer).
3. Under **Supported account types**, select the option that matches your tenant strategy (single-tenant or multi-tenant).
4. Set the **Redirect URI** to `Single-page application (SPA)` with the value `http://localhost:5173`.
5. Click **Register**.

### 2. Configure API Permissions

1. In your new App Registration, go to **API permissions > Add a permission**.
2. Select **Power BI Service**.
3. Choose **Delegated permissions** and add the following scopes:
   - `Workspace.Read.All`
   - `Workspace.ReadWrite.All` (if write operations are needed)
   - `Tenant.Read.All` (for admin APIs)
   - `Capacity.Read.All`
4. Click **Grant admin consent** (requires Global Admin or Privileged Role Administrator).

### 3. Note Your IDs

From the App Registration **Overview** page, copy:

- **Application (client) ID**
- **Directory (tenant) ID**

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_MSAL_CLIENT_ID=<your-client-id>
VITE_MSAL_TENANT_ID=<your-tenant-id>
VITE_MSAL_REDIRECT_URI=http://localhost:5173
VITE_FABRIC_API_BASE=https://api.fabric.microsoft.com/v1
VITE_ARM_API_BASE=https://management.azure.com
```

### 5. Run with Live Data

```bash
npm run dev
```

Log in with an Azure AD account that has access to your Fabric tenant. Users with the **Fabric Admin** role will see additional admin-only features (tenant-wide workspace listing, security audit).

---

## Architecture

```
+------------------------------------------------------------------+
|                        Browser SPA                                |
|                                                                   |
|  +------------------+    +------------------+    +--------------+ |
|  |   React Router   |    |  Zustand Stores  |    |   MSAL.js    | |
|  |                  |    |                  |    |              | |
|  |  /dashboard      |    |  workspaceStore  |    |  login()     | |
|  |  /workspaces     |<-->|  capacityStore   |    |  acquireToken| |
|  |  /capacity       |    |  scanStore       |    |              | |
|  |  /security       |    |  uiStore         |    +-------+------+ |
|  |  /settings       |    +--------+---------+            |        |
|  +------------------+             |                      |        |
|                                   v                      v        |
|                          +--------+---------+    +-------+------+ |
|                          |   fabricClient   |<---| Token inject | |
|                          +--------+---------+    +--------------+ |
+---------------------------|-------+-----|-------------------------+
                            |       |     |
                            v       v     v
                     +------+-+ +---+--+ ++-------+
                     | Fabric | | Admin| |  ARM   |
                     | Core   | | API  | |  API   |
                     | API    | |      | |        |
                     +--------+ +------+ +--------+
```

---

## Key Directories

| Directory | Purpose |
|---|---|
| `src/auth/` | MSAL configuration, AuthProvider, useAuth hook, ProtectedRoute |
| `src/api/` | fabricClient (base HTTP), per-resource API modules, shared types |
| `src/api/types/` | TypeScript interfaces for all API responses |
| `src/store/` | Zustand stores (workspace, capacity, scan, UI) |
| `src/components/layout/` | AppShell, Sidebar, Header |
| `src/components/workspace/` | WorkspaceList, WorkspaceDetail, WorkspaceHealth |
| `src/components/shared/` | DataTable, StatCard, SearchBar, EmptyState, Badge variants |
| `src/components/charts/` | ArtifactDistribution, CapacityTimeline, HealthDistribution |
| `src/pages/` | DashboardPage, WorkspacesPage, CapacityPage, SecurityPage, SettingsPage |
| `src/hooks/` | useFabricApi, usePagination, useDebounce |
| `src/utils/` | healthScore, formatters, constants |

---

## Health Scoring

Each workspace is scored out of **100 points** across nine governance checks:

| Check | Points | Description |
|---|---|---|
| Has description | 10 | Workspace has a non-empty description |
| Assigned to capacity | 15 | Workspace is linked to a Fabric capacity |
| Assigned to domain | 10 | Workspace belongs to a defined domain |
| Git integration | 15 | Workspace is connected to a Git repository |
| Naming convention | 10 | Workspace name follows the configured naming pattern |
| No stale items (90 days) | 10 | All items have been modified within the last 90 days |
| Data layer present | 10 | Workspace contains at least one Lakehouse or Warehouse |
| Reasonable item count | 10 | Workspace contains fewer than 100 items |
| Workspace identity (SPN) | 10 | Workspace has a service principal identity configured |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server at `http://localhost:5173` |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run `tsc --noEmit` for type checking |
| `npm run test` | Run Vitest test suite |

---

## Tech Stack

- **React 18** with TypeScript (strict mode)
- **Vite** for build and development
- **Tailwind CSS** + **shadcn/ui** for styling and components
- **Zustand** for state management
- **Recharts** for data visualization
- **@azure/msal-browser** + **@azure/msal-react** for Azure AD authentication
- **React Router v7** for client-side routing
- **lucide-react** for icons
- **Vitest** + **React Testing Library** for testing

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, coding standards, and the pull request process.

---

## License

MIT

---

## Disclaimer

Fabric Lens is an independent, community-driven project. It is **not** affiliated with, endorsed by, or sponsored by Microsoft Corporation. "Microsoft Fabric" is a trademark of Microsoft Corporation.
