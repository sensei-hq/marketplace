---
name: tauri-screen-dev
description: Use when building a new screen/stage in the Sensei desktop app (Tauri + SvelteKit + Svelte 5). Covers the full cycle from state slice to E2E test. Invoke before implementing any new route under (config)/setup/ or (app)/.
---

# Tauri Screen Development

Full-cycle guide for building screens in the Sensei desktop app.
Stack: Tauri 2, SvelteKit (SPA mode, `ssr=false`), Svelte 5 (`$state`/`$derived`), TypeScript, vitest, Playwright.

## Architecture Overview

```
Daemon (Rust, port 7744)
  ↕ REST API + SSE
App (Tauri + SvelteKit)
  ├── +layout.svelte         → hydrate state on mount
  ├── +page.svelte           → reads from singleton state
  ├── singleton state         → $state slices, commitStage()
  ├── contracts.ts            → daemon response interfaces
  ├── loaders.ts              → parallel fetch from daemon
  └── e2e/tests/*.spec.ts    → Playwright (browser + Tauri mode)
```

## Canonical Patterns

### 1. Data Contracts

Every daemon endpoint response has a TypeScript interface in `src/lib/setup/contracts.ts`.
Mock factory functions in `src/lib/setup/mock-contracts.ts` return valid instances.

```typescript
// contracts.ts — source of truth for API shapes
export interface DaemonEntity {
  id: string;
  name: string;
  // ... matches daemon JSON exactly
}

// mock-contracts.ts — test factories
export function mockEntity(overrides: Partial<DaemonEntity> = {}): DaemonEntity {
  return { id: 'e-1', name: 'Test', ...overrides };
}
```

**Rule:** App types mirror daemon responses. No reshaping in the client — if the shape is wrong, fix the daemon endpoint.

### 2. Singleton State

`src/lib/wizard-state.svelte.ts` — one singleton, one slice per stage.

```typescript
class WizardState {
  mySlice = $state<MySlice>({ items: [] });

  // Hydration — called once from layout onMount
  hydrate(data: WizardLoadData): void {
    this.mySlice = { items: [...data.myItems] };
  }

  // Gate — disables Continue when requirements not met
  canAdvance(stageId: string): boolean {
    if (stageId === 'myStage') return this.mySlice.items.length > 0;
    return true;
  }
}
```

**Rules:**
- Slices are plain interfaces — no methods, no classes
- Selection/toggle state lives on each entity (`.selected`, `.enabled`), not in a parallel map
- `$state` for mutable data, `$derived` for computed
- Singleton hydrated in layout `onMount`, not in a load function (Svelte runes don't work in SvelteKit load)

### 3. Commit Handler Dictionary

`commitStage()` uses a handler dictionary — one entry per stage. Adding a stage = adding one handler.

```typescript
const COMMIT_HANDLERS: Record<string, CommitFn> = {
  welcome:     async () => {},
  myStage:     async (ws, api) => { await api.saveMyStuff(ws.mySlice.items); },
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

**Rule:** Save on advance. Continue button calls `commitStage()` → POST to daemon → update config key → navigate. Failure = stay on page.

### 4. Layout Integration

The `(config)/+layout.svelte` layout owns:
- **Hydration:** `onMount` → `loadWizardData()` → `wizardState.hydrate(data)`
- **Navigation:** `next()` calls `commitStage()` before `goto(nextPath)`
- **Gates:** Continue button bound to `wizardState.canAdvance(stageId)`
- **Rail:** ticks from `wizardState.isStageComplete(id)`, completed stages are navigable
- **Re-entry:** redirect to `wizardState.firstPendingStage` if all prior stages done

**Rule:** No `+layout.ts` or `+page.ts` load functions. All data loaded in `onMount` because `ssr=false` and `.svelte.ts` runes need the Svelte runtime.

### 5. Page Components

Each page reads from the wizard state singleton. No props from parent, no data from load.

```svelte
<script lang="ts">
  import { wizardState } from '$lib/wizard-state.svelte.js';
  const items = $derived(wizardState.mySlice.items);

  function toggle(id: string) {
    const item = items.find(i => i.id === id);
    if (item) item.selected = !item.selected;
  }
</script>
```

**Rule:** Start from the mockup JSX (`docs/mockups/lib/setup-wizard.jsx`). Match it exactly. Then wire the data.

### 6. SSE / EventManager (Streaming Stages)

Only for stages with live data (e.g., Scan). Most stages are load-once.

```typescript
import { EventManager } from '$lib/events.js';
import { ScanProjectState } from '$lib/scan-state.svelte.js';

const projects = new ScanProjectState();
const events = new EventManager<StateEvent<any>>(url, JSON.parse);
const unsub = events.subscribe(event => {
  if (event.entity === 'project') projects.apply(event);
});

onDestroy(() => unsub());
```

**Event contract:** `{ action: 'add'|'update'|'remove'|'set', entity: string, data: T }`

**Rule:** EventManager stays on the page that needs it. Not part of the shared wizard state.

### 7. Sidecar (Tauri Commands)

Tauri commands in `src-tauri/src/commands/` wrap daemon interactions that need native access (filesystem, process management).

```rust
#[tauri::command]
async fn my_command(param: String) -> Result<serde_json::Value, String> {
    // Call daemon API or run system commands
    Ok(serde_json::json!({ "ok": true }))
}
```

Called from SvelteKit via:
```typescript
import { invoke } from '@tauri-apps/api/core';
const result = await invoke('my_command', { param: 'value' });
```

**Rule:** Use Tauri commands only when you need native access. For daemon API calls, use `senseiApi()` directly from the browser context.

### 8. Config Persistence (jsonb)

Daemon config table uses `jsonb`. Store objects directly — no serialize/deserialize.

```typescript
// Save
await api.setConfig({ 'setup.preferences': ws.preferences });
// Load
const prefs = config['setup.preferences']; // already a JS object
```

**Rule:** Stage completion = `{ 'setup.{stageId}': 'done' }`. Structured data = one key with a JSON object.

## Testing Strategy

### Unit Tests (vitest)

File pattern: `*.spec.svelte.ts` (`.svelte.ts` enables rune support in tests).

```typescript
// my-thing.spec.svelte.ts
import { describe, it, expect } from 'vitest';
import { WizardState } from './wizard-state.svelte.js';
import { mockWizardLoadData } from './setup/mock-contracts.js';

describe('MyFeature', () => {
  it('hydrates correctly', () => {
    const ws = new WizardState();
    ws.hydrate(mockWizardLoadData());
    expect(ws.mySlice.items).toHaveLength(1);
  });
});
```

Run: `bunx vitest run`

### E2E Tests (Playwright via tauri-plugin-playwright)

File pattern: `e2e/tests/*.spec.ts`
Fixtures: `e2e/fixtures.ts` — creates `tauriPage` with mocked IPC.

```typescript
import { test, expect } from '../fixtures';

test('my stage renders data', async ({ tauriPage }) => {
  await tauriPage.goto('/setup/my-stage');
  await expect(tauriPage.locator('.item-card')).toHaveCount(3);
});

test('toggle updates selection', async ({ tauriPage }) => {
  await tauriPage.goto('/setup/my-stage');
  await tauriPage.click('[data-testid="toggle-item-1"]');
  await expect(tauriPage.locator('[data-testid="toggle-item-1"]')).toHaveClass(/selected/);
});

test('Continue advances after selection', async ({ tauriPage }) => {
  await tauriPage.goto('/setup/my-stage');
  await tauriPage.click('.btn-primary');
  await tauriPage.waitForURL('**/setup/next-stage');
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
    run_bootstrap: () => ({ components: [...] }),
    get_platform: () => ({ platform: 'macos', ... }),
  },
});
```

### Type Check

Run: `npx svelte-check --tsconfig ./tsconfig.json`

**Rule (zero-errors-policy):** Every commit must pass `bunx vitest run && npx svelte-check` with 0 errors. Run E2E after each stage is complete.

## Per-Stage Implementation Checklist

When building a new stage:

1. **Read mockup** — find the stage's section in `docs/mockups/lib/setup-wizard.jsx`
2. **Add contract types** — interfaces in `contracts.ts`, factories in `mock-contracts.ts`
3. **Add state slice** — in `wizard-state.svelte.ts`, add the slice + hydration logic
4. **Add commit handler** — one entry in the `COMMIT_HANDLERS` dictionary
5. **Add gate** (if needed) — in `canAdvance()` switch
6. **Write unit tests** — `*.spec.svelte.ts` — hydration, gate, commit
7. **Build page component** — match mockup, read from `wizardState`
8. **Write E2E tests** — `e2e/tests/*.spec.ts` — render, interaction, navigation
9. **Verify** — `bunx vitest run && npx svelte-check && npx playwright test --config e2e/playwright.config.ts`
10. **Commit** — one commit per stage, descriptive message

## Subagent Dispatch Strategy

When implementing multiple independent stages in parallel:

### What to parallelize
- **Independent stages** (e.g., Libraries and Instruments) — different data, different APIs
- **Unit tests + E2E tests** — can be written by different agents
- **Daemon endpoint + app page** — backend and frontend for the same stage

### What to keep sequential
- **Foundation before stages** — contracts, singleton, loaders must exist first
- **Stages with data dependencies** — Scan before Projects (projects need scan results)
- **Layout changes** — only one agent touches the layout at a time

### Agent task boundaries
Each subagent gets:
1. The spec reference (`docs/superpowers/specs/...`)
2. The mockup section to match
3. The specific files to create/modify
4. The test patterns to follow (unit + E2E)
5. The verification commands to run

### Review between agents
After each agent completes:
1. Run full test suite (`bunx vitest run`)
2. Run type check (`npx svelte-check`)
3. Run E2E (`npx playwright test --config e2e/playwright.config.ts`)
4. Visual check in browser
5. Then dispatch next agent

## Naming Conventions

| Concept | Internal (DB/API) | UI Label |
|---------|-------------------|----------|
| Watch root directory | `folders_to_watch` | "Root" |
| Git repository | `folders` (kind=git) | "Repository" |
| Non-git directory | `folders` (kind=sibling/standalone) | "Folder" |
| Project grouping | `projects` | "Project" |
| Stage completion | `setup.{stageId}` config key | Rail ✓ tick |

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/setup/contracts.ts` | Daemon response interfaces |
| `src/lib/setup/mock-contracts.ts` | Test factory functions |
| `src/lib/setup/loaders.ts` | Parallel data fetch from daemon |
| `src/lib/wizard-state.svelte.ts` | Singleton state + commit handlers |
| `src/lib/stage.svelte.ts` | ReactiveStageContext (scan only) |
| `src/lib/events.ts` | EventManager for SSE (scan only) |
| `src/lib/api.ts` | Typed daemon API client |
| `src/lib/appstate.svelte.ts` | App-wide state (port, config) |
| `src/routes/(config)/+layout.svelte` | Wizard layout — hydrate, commit, navigate |
| `src/routes/(config)/stages.ts` | Stage definitions (11 stages, meaning kanji) |
| `e2e/fixtures.ts` | Playwright fixtures with IPC mocks |
| `e2e/playwright.config.ts` | Playwright config (browser mode) |
| `docs/mockups/lib/setup-wizard.jsx` | Source of truth for UI design |
| `docs/superpowers/specs/2026-04-30-wizard-state-architecture-design.md` | Architecture spec |
