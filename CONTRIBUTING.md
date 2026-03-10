# Contributing to Fabric Lens

Thank you for your interest in contributing to Fabric Lens. This guide covers development setup, coding standards, and the pull request workflow.

---

## Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/fabric-lens.git
cd fabric-lens

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app runs at [http://localhost:5173](http://localhost:5173). Demo mode is active by default when no Azure AD environment variables are configured.

---

## Adding a New Module

Follow these six steps when adding a new feature or resource module. Each step builds on the previous one.

### Step 1: Types

Define TypeScript interfaces for the API responses in `src/api/types/`.

```ts
// src/api/types/pipeline.ts

export interface Pipeline {
  id: string;
  displayName: string;
  description: string;
  workspaceId: string;
  createdDate: string;
  lastModifiedDate: string;
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  status: 'InProgress' | 'Succeeded' | 'Failed' | 'Cancelled';
  startTime: string;
  endTime?: string;
  durationMs?: number;
}
```

### Step 2: API Functions

Create a module in `src/api/` that uses `fabricClient` for all HTTP calls.

```ts
// src/api/pipelines.ts

import { fabricClient } from './fabricClient';
import { Pipeline, PipelineRun } from './types/pipeline';
import { PaginatedResponse } from './types/common';

export async function listPipelines(workspaceId: string): Promise<Pipeline[]> {
  const results: Pipeline[] = [];
  let token: string | undefined;

  do {
    const url = token
      ? `/workspaces/${workspaceId}/items?type=DataPipeline&continuationToken=${token}`
      : `/workspaces/${workspaceId}/items?type=DataPipeline`;
    const res = await fabricClient.get<PaginatedResponse<Pipeline>>(url);
    results.push(...res.value);
    token = res.continuationToken;
  } while (token);

  return results;
}

export async function getPipelineRuns(
  workspaceId: string,
  pipelineId: string
): Promise<PipelineRun[]> {
  const res = await fabricClient.get<PaginatedResponse<PipelineRun>>(
    `/workspaces/${workspaceId}/items/${pipelineId}/runs`
  );
  return res.value;
}
```

### Step 3: Zustand Store

Add a store in `src/store/` following the established pattern.

```ts
// src/store/pipelineStore.ts

import { create } from 'zustand';
import { Pipeline } from '../api/types/pipeline';
import { listPipelines } from '../api/pipelines';

interface PipelineStore {
  pipelines: Pipeline[];
  loading: boolean;
  error: string | null;
  fetchPipelines: (workspaceId: string) => Promise<void>;
}

export const usePipelineStore = create<PipelineStore>((set) => ({
  pipelines: [],
  loading: false,
  error: null,

  fetchPipelines: async (workspaceId: string) => {
    set({ loading: true, error: null });
    try {
      const pipelines = await listPipelines(workspaceId);
      set({ pipelines, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch pipelines';
      set({ error: message, loading: false });
    }
  },
}));
```

### Step 4: Components

Create components in `src/components/{feature}/`. Use explicit prop interfaces and Tailwind classes.

```tsx
// src/components/pipeline/PipelineList.tsx

import { Pipeline } from '../../api/types/pipeline';
import { DataTable } from '../shared/DataTable';
import { Badge } from '../shared/Badge';

interface Props {
  pipelines: Pipeline[];
  loading: boolean;
}

export function PipelineList({ pipelines, loading }: Props) {
  if (loading) {
    return <div className="animate-pulse space-y-2">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Pipelines
      </h2>
      <DataTable
        data={pipelines}
        columns={[
          { header: 'Name', accessor: 'displayName' },
          { header: 'Description', accessor: 'description' },
          { header: 'Last Modified', accessor: 'lastModifiedDate' },
        ]}
      />
    </div>
  );
}
```

### Step 5: Page

Create a page component in `src/pages/` that wires the store to the UI.

```tsx
// src/pages/PipelinesPage.tsx

import { useEffect } from 'react';
import { usePipelineStore } from '../store/pipelineStore';
import { PipelineList } from '../components/pipeline/PipelineList';

export function PipelinesPage() {
  const { pipelines, loading, error, fetchPipelines } = usePipelineStore();

  useEffect(() => {
    fetchPipelines('workspace-id');
  }, [fetchPipelines]);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Pipelines
      </h1>
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      <PipelineList pipelines={pipelines} loading={loading} />
    </div>
  );
}
```

### Step 6: Route

Register the new page in `App.tsx`.

```tsx
// In App.tsx, add the route inside your router configuration:

import { PipelinesPage } from './pages/PipelinesPage';

// Inside the route definitions:
<Route path="/pipelines" element={<PipelinesPage />} />
```

---

## Code Style Guide

### TypeScript

- **Strict mode is required.** The project uses `strict: true` in `tsconfig.json`.
- **No `any` types.** Use `unknown` and narrow with type guards when the type is genuinely unknown.
- **Prefer `interface` over `type`** for object shapes.
- All API response shapes must be defined in `src/api/types/`.
- Use discriminated unions for error handling.

### React Components

- **Functional components only.** Do not use class components.
- **Explicit prop interfaces.** Do not use `React.FC`.

```tsx
// Correct
interface Props {
  title: string;
  count: number;
}

export function StatCard({ title, count }: Props) {
  return (
    <div className="rounded-lg border p-4 dark:border-gray-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold">{count}</p>
    </div>
  );
}

// Incorrect -- do not use React.FC
const StatCard: React.FC<Props> = ({ title, count }) => { ... };
```

- Extract reusable logic into custom hooks in `src/hooks/`.
- Co-locate component-specific types within the component file.

### Styling

- Use **Tailwind CSS utility classes**. Avoid writing custom CSS unless absolutely necessary.
- Use **shadcn/ui** for all interactive elements (buttons, dialogs, dropdowns, etc.).
- Support dark mode with Tailwind `dark:` prefix variants on every visual element.

```tsx
// Example: dark mode support
<div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
  <p className="text-gray-500 dark:text-gray-400">Subtitle</p>
</div>
```

### File Naming

| Category | Convention | Example |
|---|---|---|
| Components | PascalCase | `WorkspaceList.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Utilities and API modules | camelCase | `fabricClient.ts` |
| Type files | camelCase file, PascalCase interfaces | `workspace.ts` containing `Workspace` |

### Zustand Stores

Follow this pattern for all stores:

```ts
interface ExampleStore {
  items: Item[];
  loading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
}

export const useExampleStore = create<ExampleStore>((set) => ({
  items: [],
  loading: false,
  error: null,

  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const items = await listItems();
      set({ items, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch items';
      set({ error: message, loading: false });
    }
  },
}));
```

---

## Pull Request Process

### 1. Fork and Branch

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/your-username/fabric-lens.git
cd fabric-lens
git checkout -b feat/your-feature-name
```

### 2. Implement Your Changes

Follow the code style guide above and the module structure described in "Adding a New Module."

### 3. Verify Before Submitting

Run all checks and confirm they pass:

```bash
npm run type-check   # TypeScript compilation with no errors
npm run lint         # ESLint with no warnings or errors
npm run test         # All tests passing
npm run build        # Production build succeeds
```

### 4. Commit Messages

Use the following format for commit messages:

```
type: description
```

Where `type` is one of:

| Type | When to use |
|---|---|
| `feat` | A new feature or capability |
| `fix` | A bug fix |
| `refactor` | Code restructuring with no behavior change |
| `docs` | Documentation changes only |
| `test` | Adding or updating tests |
| `chore` | Build config, dependencies, tooling, or other maintenance |

Examples:

```
feat: add pipeline monitoring page
fix: correct pagination token handling in admin API calls
refactor: extract health score calculation into utility function
docs: add Azure AD setup instructions to README
test: add unit tests for health score calculations
chore: update Tailwind CSS to v3.4
```

### 5. Submit a Pull Request

1. Push your branch to your fork.
2. Open a pull request against the `main` branch of the upstream repository.
3. Fill in the PR template with a description of your changes and any relevant context.
4. Ensure all CI checks pass.
5. A maintainer will review your PR and may request changes.

---

Thank you for contributing to Fabric Lens.
