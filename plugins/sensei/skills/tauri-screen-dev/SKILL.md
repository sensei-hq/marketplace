---
name: tauri-screen-dev
description: Use when building a new screen or multi-step flow in a Tauri + SvelteKit + Svelte 5 desktop app. Covers the full cycle from state slice to E2E test.
---

# Tauri Screen Development

Full-cycle guide for building screens in a Tauri + SvelteKit desktop app.
Stack: Tauri 2, SvelteKit (SPA mode, `ssr=false`), Svelte 5 (`$state`/`$derived`), TypeScript, vitest, Playwright.

## Architecture Overview

```
Backend (Rust binary or daemon, any port)
  ↕ REST API + SSE  (or Tauri commands for native access)
App (Tauri + SvelteKit)
  ├── +layout.svelte         → hydrate state on mount
  ├── +page.svelte           → reads from singleton state
  ├── singleton state         → $state slices, commitStage()
  ├── contracts.ts            → backend response interfaces
  ├── loaders.ts              → parallel fetch from backend
  └── e2e/tests/*.spec.ts    → Playwright (browser + Tauri mode)
```

## Canonical Patterns

### 1. Data Contracts

Every backend endpoint response has a TypeScript interface in a contracts file.
Mock factory functions return valid instances for testing.

```typescript
// contracts.ts — source of truth for API shapes
export interface MyEntity {
  id: string;
  name: string;
  // ... matches backend JSON exactly
}

// mock-contracts.ts — test factories
export function mockMyEntity(overrides: Partial<MyEntity> = {}): MyEntity {
  return { id: 'e-1', name: 'Test', ...overrides };
}
```

**Rule:** App types mirror backend responses. No reshaping in the client — if the shape is wrong, fix the backend endpoint.

### 2. Singleton State

One singleton class per flow, one `$state` slice per screen/stage.

```typescript
class AppFlowState {
  mySlice = $state<MySlice>({ items: [] });

  // Hydration — called once from layout onMount
  hydrate(data: LoadData): void {
    this.mySlice = { items: [...data.myItems] };
  }

  // Gate — disables Continue when requirements not met
  canAdvance(stageId: string): boolean {
    if (stageId === 'myStage') return this.mySlice.items.length > 0;
    return true;
  }
}

export const appFlowState = new AppFlowState();
```

**Rules:**
- Slices are plain interfaces — no methods, no classes
- Selection/toggle state lives on each entity (`.selected`, `.enabled`), not in a parallel map
- `$state` for mutable data, `$derived` for computed
- Singleton hydrated in layout `onMount`, not in a load function (Svelte runes don't work in SvelteKit load functions)

### 3. Commit Handler Dictionary

Multi-step flows use a handler dictionary — one entry per stage. Adding a stage = adding one handler.

```typescript
const COMMIT_HANDLERS: Record<string, CommitFn> = {
  welcome:   async () => {},
  myStage:   async (state, api) => { await api.saveMyStuff(state.mySlice.items); },
  // ...
};

async commitStage(stageId: string): Promise<boolean> {
  const handler = COMMIT_HANDLERS[stageId];
  if (!handler) return true;
  try {
    await handler(this, api);
    await api.setConfig({ [`setup.${stageId}`]: 'done' });
    this.completion[stageId] = 'done';
    return true;
  } catch { return false; }
}
```

**Rule:** Save on advance. Continue button calls `commitStage()` → POST to backend → update config key → navigate. Failure = stay on page.

### 4. Layout Integration

The flow layout owns:
- **Hydration:** `onMount` → `loadData()` → `flowState.hydrate(data)`
- **Navigation:** `next()` calls `commitStage()` before `goto(nextPath)`
- **Gates:** Continue button bound to `flowState.canAdvance(stageId)`
- **Progress rail:** ticks from `flowState.isStageComplete(id)`, completed stages are navigable
- **Re-entry:** redirect to `flowState.firstPendingStage` if all prior stages done

**Rule:** No `+layout.ts` or `+page.ts` load functions. All data loaded in `onMount` because `ssr=false` and `.svelte.ts` runes need the Svelte runtime.

### 5. Page Components

Each page reads from the flow state singleton. No props from parent, no data from load.

```svelte
<script lang="ts">
  import { appFlowState } from '$lib/flow-state.svelte.js';
  const items = $derived(appFlowState.mySlice.items);

  function toggle(id: string) {
    const item = items.find(i => i.id === id);
    if (item) item.selected = !item.selected;
  }
</script>
```

### 6. SSE / EventManager (Streaming Screens)

Only for screens with live data (e.g., progress, scan results). Most screens are load-once.

```typescript
import { EventManager } from '$lib/events.js';

const events = new EventManager<StateEvent<any>>(url, JSON.parse);
const unsub = events.subscribe(event => {
  if (event.entity === 'item') itemState.apply(event);
});

onDestroy(() => unsub());
```

**Event contract:** `{ action: 'add'|'update'|'remove'|'set', entity: string, data: T }`

**Rule:** EventManager stays on the page that needs it. Not part of the shared flow state.

### 7. Tauri Commands (Native Access)

Use Tauri commands when you need native capabilities (filesystem, process management, system info). For regular HTTP API calls, call the backend directly from the browser context.

```rust
#[tauri::command]
async fn my_command(param: String) -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({ "ok": true }))
}
```

```typescript
import { invoke } from '@tauri-apps/api/core';
const result = await invoke('my_command', { param: 'value' });
```

**Rule:** Tauri commands are for native access only. Avoid using them as a general-purpose HTTP proxy.

### 8. Config Persistence

Persist user choices as structured config. Use jsonb or equivalent — store objects directly.

```typescript
// Save
await api.setConfig({ 'setup.preferences': state.preferences });
// Load
const prefs = config['setup.preferences'];
```

**Rule:** Stage completion = `{ 'setup.{stageId}': 'done' }`. Structured data = one key with a JSON object.

## Testing Strategy

### Unit Tests (vitest)

File pattern: `*.spec.svelte.ts` (`.svelte.ts` extension enables Svelte 5 rune support in tests).

```typescript
// my-flow.spec.svelte.ts
import { describe, it, expect } from 'vitest';
import { AppFlowState } from './flow-state.svelte.js';
import { mockLoadData } from './mock-contracts.js';

describe('MyFeature', () => {
  it('hydrates correctly', () => {
    const state = new AppFlowState();
    state.hydrate(mockLoadData());
    expect(state.mySlice.items).toHaveLength(1);
  });

  it('blocks advance when no items selected', () => {
    const state = new AppFlowState();
    state.hydrate(mockLoadData({ items: [] }));
    expect(state.canAdvance('myStage')).toBe(false);
  });
});
```

Run: `bunx vitest run` (or `npx vitest run`)

### E2E Tests (Playwright via tauri-plugin-playwright)

File pattern: `e2e/tests/*.spec.ts`

```typescript
import { test, expect } from '../fixtures';

test('screen renders data', async ({ tauriPage }) => {
  await tauriPage.goto('/my-stage');
  await expect(tauriPage.locator('.item-card')).toHaveCount(3);
});

test('toggle updates selection', async ({ tauriPage }) => {
  await tauriPage.goto('/my-stage');
  await tauriPage.click('[data-testid="toggle-item-1"]');
  await expect(tauriPage.locator('[data-testid="toggle-item-1"]')).toHaveClass(/selected/);
});

test('Continue advances after selection', async ({ tauriPage }) => {
  await tauriPage.goto('/my-stage');
  await tauriPage.click('.btn-primary');
  await tauriPage.waitForURL('**/next-stage');
});
```

**Two modes:**
- `npx playwright test --config e2e/playwright.config.ts` — browser mode (fast, CI)
- `cargo tauri dev --features e2e-testing` + `npx playwright test --project=tauri` — Tauri mode (real webview)

**IPC Mocks** in `e2e/fixtures.ts`:
```typescript
export const { test, expect } = createTauriTest({
  devUrl: 'http://localhost:5173',
  ipcMocks: {
    my_command: () => ({ ok: true }),
    get_platform: () => ({ platform: 'macos' }),
  },
});
```

### Type Check

Run: `npx svelte-check --tsconfig ./tsconfig.json`

**Zero-errors policy:** Every commit must pass `vitest run && svelte-check` with 0 errors. Run E2E after each screen is complete.

## Per-Screen Implementation Checklist

When building a new screen:

1. **Define the shape** — what data does this screen need? What does it write back?
2. **Add contract types** — interface in `contracts.ts`, factory in `mock-contracts.ts`
3. **Add state slice** — in the singleton, add the slice + hydration logic
4. **Add commit handler** — one entry in `COMMIT_HANDLERS`
5. **Add gate** (if needed) — in `canAdvance()`
6. **Write unit tests** — hydration, gate logic, commit handler
7. **Build the page component** — read from singleton, no load functions
8. **Write E2E tests** — render, interaction, navigation
9. **Verify** — `vitest run && svelte-check && playwright test`
10. **Commit** — one commit per screen, descriptive message

## Subagent Dispatch Strategy

When implementing multiple independent screens in parallel:

### What to parallelize
- Independent screens with different data and different APIs
- Unit tests and E2E tests for the same screen
- Backend endpoint and app page for the same screen

### What to keep sequential
- Foundation before screens — contracts, singleton, loaders must exist first
- Screens with data dependencies (B needs data from A's output)
- Layout changes — only one agent touches shared layout at a time

### Agent task boundaries
Each subagent gets:
1. The screen spec / design reference
2. The specific files to create or modify
3. The test patterns to follow (unit + E2E)
4. The verification commands to run

### Review between agents
After each agent completes:
1. Run full test suite (`vitest run`)
2. Run type check (`svelte-check`)
3. Run E2E (`playwright test`)
4. Visual check in browser
5. Then dispatch next agent

## File Layout (Suggested)

```
src/
  lib/
    contracts.ts          → backend response interfaces
    mock-contracts.ts     → test factories
    loaders.ts            → parallel fetch helpers
    flow-state.svelte.ts  → singleton state + commit handlers
    events.ts             → EventManager for SSE (if needed)
    api.ts                → typed backend API client
  routes/
    (flow)/
      +layout.svelte      → hydrate, commit, navigate
      stage-name/
        +page.svelte
e2e/
  fixtures.ts             → Playwright fixtures with IPC mocks
  playwright.config.ts    → Playwright config
  tests/
    stage-name.spec.ts
```
