---
name: UI Dummy Data Pattern
description: Build UI pages with typed dummy data first, wire real data later — types-first, framework-agnostic approach for rapid UI development
when: Building new UI pages, screens, or dashboards where the backend API may not exist yet or data sources are partially available
category: skill
---

# UI Dummy Data Pattern

Build UI components against well-defined types with dummy data. Wire real data sources later without changing components. Works with any UI framework (SvelteKit, React, Vue, Next.js, etc.).

## When to use

- New dashboard or page where backend endpoints don't exist yet
- Prototyping UI before backend is ready
- Features that depend on external data that may not be available (e.g., ACP capabilities)
- Migrating UI to new data shapes while keeping pages functional
- Using design tools (Claude Design, Figma) to iterate on layout before wiring data

## Procedure

### Step 1: Define types from the design

Start with what the UI NEEDS to show, not what the API returns. Work from mockups, wireframes, or idea docs.

```typescript
// Define the data shape the component needs
interface DashboardData {
  ftr: MetricValue;
  sessionCount: number;
  recentSessions: SessionSummary[];
}

// For data that may not be available, use a quality wrapper
interface MetricValue<T = number> {
  value: T;
  quality: 'exact' | 'estimated' | 'unavailable';
  hint?: string;
}
```

**Key principle:** Types describe what the UI renders, not what the database stores. The translation layer (load function) handles the mapping.

### Step 2: Create dummy data factory

One file that returns realistic dummy data conforming to the types. Not random — hand-crafted to exercise all UI states (empty, normal, error, edge cases).

```typescript
// data/dummy.ts (or fixtures/dashboard.ts)
export function dashboardDummy(): DashboardData {
  return {
    ftr: { value: 0.83, quality: 'exact' },
    sessionCount: { value: 12, quality: 'exact' },
    recentSessions: [
      { id: 's1', task: 'Fix parser bug', outcome: 'completed', ftr: 1.0, turns: 6 },
      { id: 's2', task: 'Add metrics endpoint', outcome: 'completed', ftr: 1.0, turns: 8 },
      { id: 's3', task: 'Refactor auth', outcome: 'partial', ftr: 0.5, turns: 14 },
    ],
  };
}
```

**Include edge cases in dummy data:**
- Empty lists
- Null/unavailable values
- Estimated vs exact metrics
- Long strings that might overflow

### Step 3: Build components against the types

Components take typed props. They never fetch data — they only render.

**SvelteKit:**
```svelte
<script lang="ts">
  import type { DashboardData } from '$lib/types';
  let { data }: { data: DashboardData } = $props();
</script>

<MetricCard label="FTR" value={data.ftr} />
```

**React/Next.js:**
```tsx
function Dashboard({ data }: { data: DashboardData }) {
  return <MetricCard label="FTR" value={data.ftr} />;
}
```

**Vue:**
```vue
<script setup lang="ts">
import type { DashboardData } from '@/types';
const props = defineProps<{ data: DashboardData }>();
</script>
```

### Step 4: Create load functions that return dummy data

The load function is the seam between UI and data. Start with dummy, swap to real later.

**SvelteKit:**
```typescript
// +page.ts
import { dashboardDummy } from '$lib/data/dummy';
export function load() {
  return { dashboard: dashboardDummy() };
}
```

**Next.js:**
```typescript
// page.tsx
import { dashboardDummy } from '@/data/dummy';
export default function Page() {
  const data = dashboardDummy(); // swap to useSWR/fetch later
  return <Dashboard data={data} />;
}
```

### Step 5: Wire real data (when ready)

Replace dummy calls with real API calls. Components don't change.

```typescript
// +page.ts — swap dummy for real
import { senseiApi } from '$lib/api';
export async function load() {
  const api = senseiApi(getPort());
  const metrics = await api.getMetrics(projectId);
  // Transform API response → DashboardData type
  return { dashboard: transformMetrics(metrics) };
}
```

**The transform function** maps API shapes to UI types. This is where MetricValue.quality gets set based on capability availability:

```typescript
function transformMetrics(raw: ApiMetrics): DashboardData {
  return {
    ftr: { value: raw.ftr ?? 0, quality: raw.ftr != null ? 'exact' : 'unavailable' },
    tokens: capabilities.tokenTracking
      ? { value: raw.tokens, quality: 'exact' }
      : { value: estimateTokens(raw.turns), quality: 'estimated', hint: 'Estimated from turns' },
  };
}
```

### Step 6: Handle the three data states in components

Every metric component handles exact, estimated, and unavailable:

```svelte
{#if metric.quality === 'exact'}
  <span class="text-white">{format(metric.value)}</span>
{:else if metric.quality === 'estimated'}
  <span class="text-white/70">{format(metric.value)}</span>
  <Badge>est.</Badge>
{:else}
  <span class="text-white/30">—</span>
  {#if metric.trackingUrl}
    <a href={metric.trackingUrl}>Track</a>
  {/if}
{/if}
```

## Benefits

1. **UI works from day one** — no waiting for backend
2. **Components never change** — only load functions change when wiring real data
3. **Edge cases tested early** — dummy data includes empty, null, overflow states
4. **Design iteration is fast** — change types + dummy data, components adapt
5. **Capability-aware** — MetricValue pattern handles exact/estimated/unavailable gracefully
6. **Framework-agnostic** — the pattern works identically in SvelteKit, React, Vue, etc.

## Anti-patterns

- **Don't fetch in components** — components render props, load functions fetch
- **Don't skip edge cases in dummy data** — if you don't test empty state with dummy, you won't catch it with real data either
- **Don't couple types to API shapes** — UI types describe what's rendered, transform layer handles the mapping
- **Don't use random data generators** — hand-crafted dummy data exercises specific UI states deliberately
