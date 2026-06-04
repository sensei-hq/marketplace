---
name: ui-state-pattern
description: Use when building a new UI page, screen, or dashboard — implement the Component → State → Load three-layer pattern. The component is presentation-only and reads from state; state owns every data change behind explicit getters/setters/methods; a load function supplies the data and is the single seam you swap from mock to real. Framework-agnostic (SvelteKit, React, Vue, Next.js).
---

# UI State Pattern

Build every screen as three layers, each with one responsibility. The component renders, state owns all data and transitions, and a load function feeds it — mock data first, real data later, without touching the component or the state.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Component   │◀────│    State     │◀────│     Load     │
│  (renders +  │     │ (owns data + │     │ (mock / real │
│  user intent)│     │  transitions)│     │    fetch)    │
└──────────────┘     └──────────────┘     └──────────────┘
```

## When to use

- New dashboard, page, or screen — especially before the backend endpoint exists
- Prototyping UI with mock data, planning to wire real data later
- Features that depend on data that may be only partially available
- Migrating a screen to a new data shape while keeping it functional

## The three layers

### 1. Component — presentation only

Reads from state, renders, and routes user intent back through state methods. **No fetching, no business logic, no local data ownership.**

```svelte
<!-- SvelteKit -->
<script lang="ts">
  import { dashboardState } from './dashboard-state.svelte.js';
  const state = dashboardState;
</script>

{#each state.recentSessions as s}
  <SessionRow session={s} onretry={() => state.retry(s.id)} />
{/each}
```

```tsx
// React / Next.js — read from the store, dispatch intent
function Dashboard() {
  const { recentSessions, retry } = useDashboardState();
  return recentSessions.map(s => <SessionRow key={s.id} session={s} onRetry={() => retry(s.id)} />);
}
```

**Test:** feed state, assert DOM output.

### 2. State — owns data + transitions

The single source of truth. All data lives here; every change goes through an explicit getter/setter/method. The component never mutates data directly — it calls a method.

```ts
// dashboard-state.svelte.ts (Svelte 5 runes)
let recentSessions = $state<SessionSummary[]>([]);
let ftr = $derived(computeFtr(recentSessions));

export const dashboardState = {
  get recentSessions() { return recentSessions; },
  get ftr() { return ftr; },

  // explicit transitions — no implicit side effects
  load(data: DashboardData) { recentSessions = data.recentSessions; },
  retry(id: string) {
    const i = recentSessions.findIndex(s => s.id === id);
    if (i >= 0) recentSessions[i] = { ...recentSessions[i], outcome: 'retrying' };
  },
};
```

React: a store/reducer (Zustand, `useReducer`). Vue: a composable or Pinia store. Same rule everywhere — **mutations are named methods, not ad-hoc writes.**

**Test:** call the methods, assert state values. No DOM, no network.

### 3. Load — the mock/real seam

A function that returns typed data and hands it to state. Start it returning hand-crafted mock data that exercises every UI state; swap the body to a real fetch later. The component and state never change.

```ts
// dashboard.ts — mock first
export function loadDashboard(): DashboardData {
  return dashboardMock();           // hand-crafted, exercises empty/error/edge
}

// later — swap the body to real; signature and callers unchanged
export async function loadDashboard(): Promise<DashboardData> {
  const raw = await senseiApi().getMetrics(projectId);
  return transformMetrics(raw);     // map API shape → UI types
}
```

Wire it on mount/navigation and push the result into state:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { loadDashboard } from '$lib/dashboard.js';
  import { dashboardState } from './dashboard-state.svelte.js';
  onMount(async () => dashboardState.load(await loadDashboard()));
</script>
```

**Test:** mock the fetch, assert the returned shape.

## Procedure

1. Define the data **types** from what the UI must show (not what the API returns).
2. Write the **state** module: data fields + explicit getters/setters/methods.
3. Build the **component** against state — render + call state methods.
4. Write a **load** function returning hand-crafted mock data; wire it on mount.
5. Make the component handle every data state — loading, empty, error, edge.
6. When the backend is ready, swap the load function's body to a real fetch + transform. Component and state untouched.

## Mock data rules

- Hand-crafted, not random — exercise specific states deliberately
- Include empty lists, null/unavailable values, long strings, and error states
- Same shape as the real data — the types are the contract both sides honour

## Anti-patterns

| Anti-pattern | Fix |
|---|---|
| Fetching inside the component | The component renders; the load function fetches |
| Component mutating data directly | All changes go through named state methods/setters |
| State coupled to the API response shape | Types describe what the UI renders; the load/transform layer maps |
| Random mock generators | Hand-craft mock data to exercise specific UI states |
| Skipping empty/error states in mock | If you don't mock it, you won't handle it for real data either |
