---
name: tauri-playwright-testing
description: Use when writing or debugging E2E tests for a Tauri desktop app with Playwright. Covers globalSetup, build flags, navigation, TauriPage API caveats, and test-mode configuration — generic across any Tauri + SvelteKit or Tauri + web-frontend stack.
tags: ["tauri", "playwright", "testing", "guidelines", "tips", "e2e"]
---

# Tauri Playwright Testing

End-to-end testing guide for Tauri desktop apps using `tauri-plugin-playwright` / `@srsholmes/tauri-playwright`.
Covers the full setup: build flags, globalSetup, navigation, TauriPage API quirks, and build-time test-mode configuration.

Stack: Tauri 2, any web frontend (SvelteKit, React, Vue, etc.), TypeScript, Playwright.

---

## Architecture Overview

```
globalSetup.ts
  ├── Build senseid / sidecar daemons (if any)
  ├── Build Sensei.app --features dev,e2e-testing
  ├── Kill stale process + remove stale socket
  ├── Launch app with test env vars
  └── Wait for Playwright socket (/tmp/tauri-playwright.sock)

tests/*.spec.ts
  └── tauriPage = TauriPage (talks to running app via WebSocket)
```

---

## 1. The e2e-testing Cargo Feature

Add a dedicated feature that activates `tauri-plugin-playwright`. Never enable it in production builds.

**`src-tauri/Cargo.toml`**
```toml
[features]
e2e-testing = ["tauri-plugin-playwright"]

[dependencies]
tauri-plugin-playwright = { version = "0.2", optional = true }
```

**`src-tauri/src/lib.rs`**
```rust
// Add the plugin only in e2e-testing builds
#[cfg(feature = "e2e-testing")]
let builder = builder.plugin(tauri_plugin_playwright::init());
```

Build the test binary:
```bash
cargo tauri build --debug --features e2e-testing
```

---

## 2. Build-Time Test Configuration

**Problem:** Tests need the app to behave differently from production (e.g., skip auto-navigation, use longer timeouts, expose debug state). Doing this at runtime via IPC introduces async races — the behavior may change before the IPC call resolves.

**Solution:** Bake the config into the build via Vite env vars. Vite replaces `import.meta.env.VITE_*` values at build time — they become synchronous constants with no async overhead.

### Building with dev + e2e features in globalSetup

```typescript
execFileSync('cargo', ['tauri', 'build', '--debug', '--features', 'dev,e2e-testing'], {
  cwd: join(APP_REPO, 'src-tauri'),
  stdio: 'inherit',
});
```

Mode is compile-time via the `dev` Cargo feature — no env vars needed.

### Checking mode in the frontend

```typescript
// Build-time port injection from vite.config.ts
declare const __SENSEI_DEFAULT_PORT__: number;
```

```svelte
<!-- Svelte example — skip auto-redirect in e2e builds -->
$effect(() => {
  if (allReady && !isDevBuild) {
    setTimeout(() => goto('/setup'), 900);
  }
});
```

### Why not runtime IPC?

```
// ❌ Race-prone approach
const mode = await invoke('get_app_mode');  // async — may resolve AFTER
if (mode !== 'dev') goto('/setup');         // the effect has already fired

// ✓ Build-time constant
const isDevBuild = import.meta.env.VITE_TEST === 'true';  // synchronous, always ready
```

**Common use cases for build-time flags:**
- Suppress auto-navigation (health/splash screens that redirect on completion)
- Extend timeouts for slow CI environments
- Expose internal state via a debug panel
- Skip animations that interfere with timing-sensitive tests

---

## 3. globalSetup Pattern

```typescript
// e2e/globalSetup.ts
import { execFileSync, spawn } from 'child_process';
import { existsSync, writeFileSync, unlinkSync } from 'fs';

const SOCKET   = '/tmp/tauri-playwright.sock';
const PID_FILE = '/tmp/my-app-e2e-pid';

export default async function globalSetup(): Promise<void> {
  // 1. Build any required sidecar binaries
  execFileSync('cargo', ['build', '-p', 'my-sidecar'], {
    cwd: DAEMON_REPO, stdio: 'inherit',
  });

  // 2. Build the Tauri app (e2e-testing feature + build-time test flags)
  execFileSync('cargo', ['tauri', 'build', '--debug', '--features', 'e2e-testing'], {
    cwd: APP_REPO,
    stdio: 'inherit',
    env: { ...process.env, VITE_E2E: 'true' },
  });

  // 3. Kill any stale process from a previous run
  try { execFileSync('/usr/bin/pkill', ['-x', 'my-app-binary'], { stdio: 'ignore' }); } catch {}
  await sleep(500);

  // 4. Remove stale socket (plugin will refuse to start if it exists)
  try { unlinkSync(SOCKET); } catch {}

  // 5. Launch the app with test environment variables
  const proc = spawn(APP_BINARY, [], {
    env: {
      ...process.env,
      MY_APP_MODE: 'dev',
      MY_APP_DB: 'my-app-test',
      MY_SCHEMA_PATH: join(PROJECT_ROOT, 'database'),  // local schema, avoid GitHub downloads
    },
    detached: true,
    stdio: 'ignore',
  });

  proc.unref();
  writeFileSync(PID_FILE, String(proc.pid));

  // 6. Wait for the Playwright socket (app is ready when socket appears)
  await waitForSocket(SOCKET, 60_000);
}

async function waitForSocket(path: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (existsSync(path)) return;
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for ${path}`);
}
```

---

## 4. Fixtures

```typescript
// e2e/fixtures.ts
import { createTauriTest } from '@srsholmes/tauri-playwright';

export const { test, expect } = createTauriTest({
  devUrl: 'tauri://localhost',     // required by config type, unused in socket mode
  mcpSocket: '/tmp/tauri-playwright.sock',
});
```

---

## 5. Navigation in Built Tauri Apps

### The Problem

WKWebView (macOS) / WebView2 (Windows) breaks after a full page reload — the initial SvelteKit mount produces an empty DOM. `window.location.href = url` and `page.goto(url)` both trigger full reloads.

### What Works

Use the frontend router's own `goto()` function for navigation:

```typescript
// e2e/helpers.ts
export async function navigateTo(tauriPage, route: string): Promise<void> {
  await tauriPage.evaluate(`
    (async function() {
      await new Promise(r => setTimeout(r, 200));
      try {
        // SvelteKit dev server: import navigation module
        var nav = await import('/node_modules/@sveltejs/kit/src/runtime/app/navigation.js');
        await nav.goto(${JSON.stringify(route)});
      } catch {
        // Built Tauri app: anchor click triggers client-side routing
        var a = document.createElement('a');
        a.href = ${JSON.stringify(route)};
        document.body.appendChild(a);
        a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        document.body.removeChild(a);
      }
    })()
  `);
  await sleep(800);  // wait for route transition
}
```

### Limitation: Nested Flows

**Important:** In built apps, the anchor-click fallback works for top-level navigation but may fail for routes inside multi-step wizard/flow layouts. If a layout enforces sequential access (e.g., step 3 is inaccessible until step 2 is complete), direct URL navigation will land you on the wrong page.

**Fix: Navigate via UI interactions instead**

```typescript
test.describe('Wizard — Step 3', () => {
  // Direct URL navigation doesn't work inside wizard flows — navigate via button clicks
  test.beforeEach(async ({ tauriPage }) => {
    await navigateTo(tauriPage, '/wizard/step-1');
    await expect(tauriPage.locator('.btn-next')).toBeEnabled({ timeout: 10_000 });
    await tauriPage.click('.btn-next');  // triggers internal goto() → step 2
    await tauriPage.waitForURL('/wizard/step-2', { timeout: 10_000 });
    await tauriPage.click('.btn-next');  // step 2 → step 3
    await tauriPage.waitForURL('/wizard/step-3', { timeout: 10_000 });
  });

  test('renders step 3 content', async ({ tauriPage }) => {
    await expect(tauriPage.locator('.step-3-title')).toBeVisible();
  });
});
```

---

## 6. TauriPage API Caveats (`@srsholmes/tauri-playwright`)

### 6.1 `.first()` and `.nth()` — Selector Indexing

TauriPage's locator `nth(index)` generates two things:
- **CSS selector:** `${selector}:nth-match(${index})` — used by CSS-only operations
- **jsFind:** `document.querySelectorAll(${selector})[${index}]` — used by action methods

`:nth-match()` is 1-indexed. So:
- `:nth-match(0)` = **invalid** (first element would be `:nth-match(1)`)
- `:nth-match(1)` = first element ✓

`.first()` calls `.nth(0)`, which produces `:nth-match(0)` — **invalid for CSS operations**.

```typescript
// ❌ .first() — produces :nth-match(0) which is invalid
const item = tauriPage.locator('.item').first();
await expect(item).toHaveValue('x');  // ← will fail: invalid CSS selector

// ✓ Action methods (.click, .fill, .selectOption) — use jsFind (0-indexed array access)
// These work correctly even with .first() / .nth(0)
await tauriPage.locator('.item').first().click();  // ← works: uses querySelectorAll(...)[0]

// ✓ Assertions: avoid multi-match locators entirely
// Scope with a unique parent or use evaluate to read values
const val = await tauriPage.evaluate(`document.querySelectorAll('.item')[0].value`);
```

**Rule of thumb:**
- Locator **actions** (`.click()`, `.fill()`, `.selectOption()`, `.inputValue()`) → `.nth(0)` / `.first()` are fine, use the jsFind path
- Locator **assertions** (`expect().toHaveValue()`, `expect().toContainText()`) → avoid `.first()`, use a unique selector or evaluate

### 6.2 `page.evaluate()` + Synchronous State Updates = Timeout

**Problem:** `tauriPage.evaluate(script)` sends the script to the WebView and waits for a response over the WebSocket. If the script calls `dispatchEvent()` which triggers a framework state update (Svelte, React, Vue), the framework's synchronous render loop can block the WebSocket response for long enough to hit the 30s timeout.

```typescript
// ❌ May timeout — dispatchEvent triggers Svelte reactive update, blocks socket response
await tauriPage.evaluate(`
  const sel = document.querySelector('.my-select');
  sel.value = 'daily';
  sel.dispatchEvent(new Event('change', { bubbles: true }));
`);

// ✓ Use the locator's selectOption — generates an async _actionScript with proper polling
await tauriPage.locator('.my-select').nth(0).selectOption('daily');
const val = await tauriPage.locator('.my-select').nth(0).inputValue();
```

**Why locator actions are safer:** `_actionScript` generates an async function with a polling loop (`while (Date.now() < deadline)`). Each iteration yields via `await new Promise(r => setTimeout(r, 50))`, which lets the WebView process other messages (including the socket response) between checks.

**When you must use `page.evaluate()` with state-changing code:** wrap in an async IIFE and return a value explicitly. The async yield allows the WebView to process socket messages.

```typescript
// ✓ Async IIFE — yields control, allows socket to respond
await tauriPage.evaluate(`
  (async () => {
    const sel = document.querySelector('.my-select');
    sel.value = 'daily';
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(r => setTimeout(r, 10));  // yield
    return sel.value;
  })()
`);
```

### 6.3 Prefer Locator Actions over `page.evaluate()`

| Task | Avoid | Prefer |
|------|-------|--------|
| Click element | `evaluate("el.click()")` | `locator.click()` |
| Fill input | `evaluate("el.value = 'x'")` | `locator.fill('x')` |
| Select option | `evaluate("sel.value = 'x'; sel.dispatchEvent(...)")` | `locator.selectOption('x')` |
| Read value | `evaluate("el.value")` | `locator.inputValue()` |
| Read text | `evaluate("el.textContent")` | `locator.textContent()` |
| Click by text | `evaluate("...find(b => b.textContent === 'X')?.click()") ` | Use evaluate (no other option) — safe for read-only |

`page.evaluate()` is appropriate for:
- Reading values (no state changes)
- Clicking elements by text content (no `.locator(:text)` equivalent in TauriPage)
- Checking computed state without triggering updates

---

## 7. Handling Auto-Navigating Pages

Many apps have pages that navigate away automatically after a condition is met (e.g., a bootstrap health check that redirects when all services are ready). This causes tests to fight the app for control of the page.

**Fix:** Suppress auto-navigation in e2e builds.

```typescript
// In your SvelteKit page / React component
const isE2E = import.meta.env.VITE_E2E === 'true';  // set by globalSetup build env

$effect(() => {                                       // Svelte 5
  if (allGatesReady && !isE2E) {
    setTimeout(() => router.push('/home'), 900);
  }
});
```

The page still shows a manual Continue button, which tests can click explicitly if they need to advance.

---

## 8. Test Isolation Considerations

### State Persists Between Tests

The Tauri app runs for the entire test suite. DB state, localStorage, and Svelte/React store state from test N carry over to test N+1.

**Patterns:**

```typescript
// Reset known fields in beforeEach
test.beforeEach(async ({ tauriPage }) => {
  await navigateTo(tauriPage, '/wizard/step-1');
  await tauriPage.locator('.name-input').fill('');  // clear state from previous test
});

// Or reset via a dedicated test-mode IPC command
test.beforeEach(async ({ tauriPage }) => {
  await tauriPage.evaluate(`window.__RESET_STATE?.();`);
});
```

### Use a Dedicated Test Database

Set `MY_APP_DB_NAME=my-app-test` in the launch env. Create it in globalSetup and drop it in globalTeardown. This prevents test runs from polluting dev data and allows tests to start from a known schema state.

---

## 9. globalTeardown Pattern

```typescript
// e2e/globalTeardown.ts
import { readFileSync, unlinkSync } from 'fs';

export default async function globalTeardown(): Promise<void> {
  const pid = parseInt(readFileSync('/tmp/my-app-e2e-pid', 'utf-8'), 10);
  try { process.kill(pid); } catch {}
  try { unlinkSync('/tmp/my-app-e2e-pid'); } catch {}
}
```

---

## 10. Playwright Config

```typescript
// e2e/playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  globalSetup: './globalSetup.ts',
  globalTeardown: './globalTeardown.ts',
  timeout: 60_000,
  retries: 0,        // deterministic — no retries on flaky infra
  workers: 1,        // Tauri app is single-instance; no parallelism

  projects: [{
    name: 'tauri',
    testDir: './tests',
    use: {
      // TauriPage fixture connects to the socket, not a browser URL
    },
  }],
});
```

---

## 11. Quick Debugging Reference

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Tests navigate to wrong page in wizard | Anchor-click to inner route ignored by layout | Use `beforeEach` that navigates via button clicks |
| `tauriPage command 'eval' failed: timeout` | `dispatchEvent` triggered framework state update, blocked socket | Use locator `.selectOption()` / `.click()` instead |
| `expect().toHaveValue()` fails on `.nth(0)` result | CSS `:nth-match(0)` is invalid — TauriPage 1-indexed CSS | Use `evaluate` to read value, or a unique parent scope |
| App redirects away during test | Auto-navigation on condition met | Suppress in e2e build via `import.meta.env.VITE_E2E` |
| Socket never appears | App crashed on launch or wrong binary path | Check stderr; verify PID file; add a longer wait |
| Tests pass in browser mode, fail in Tauri mode | WKWebView differences; full reload broke SvelteKit mount | Use `navigateTo` helper (anchor click, no reload) |
| State from test N bleeds into test N+1 | Persistent DB or in-memory store | Reset in `beforeEach`; use isolated test DB |
| IPC call returns different shape than expected | Mocked IPC diverged from real command | Run in Tauri mode (real IPC), add schema snapshot test |

---

## 12. Checklist Before Writing Tests

- [ ] `e2e-testing` Cargo feature added, never enabled in production
- [ ] `globalSetup.ts` builds with `--features e2e-testing` + relevant `VITE_*` vars
- [ ] Auto-navigating pages guarded by `import.meta.env.VITE_E2E`
- [ ] Stale socket removed in globalSetup before launch
- [ ] Dedicated test DB configured (separate from dev DB)
- [ ] `beforeEach` resets any state that persists between tests
- [ ] Wizard flows navigated via button clicks, not direct URL
- [ ] Locator actions used over `page.evaluate` for state-changing interactions
- [ ] `globalTeardown.ts` kills the app process and cleans up PID file
