---
name: working-smarter
description: Use when designing UI mockups, building new features, or starting/completing any implementation task — enforces commit-first discipline, framework-native mockups with native data loading patterns, zero-errors checkpoints, and i18n-aware promotion.
---

# Working Smarter

## Before Starting Any New Feature

**Commit everything first. No exceptions.**

1. Check for uncommitted work:
   ```bash
   git status
   ```

2. If anything is dirty — commit it:
   ```bash
   git add -p   # stage selectively, or git add <specific files>
   git commit -m "chore: commit work in progress before starting <feature>"
   ```
   Never discard uncommitted changes without inspecting them. If something belongs to a different feature, commit it with a clear message so it's safe.

3. Run the baseline zero-errors check:
   ```bash
   bun run --filter '*' test && bunx tsc --noEmit
   ```
   Fix all errors before writing new code. A dirty baseline means the new feature inherits broken state.

Only once the working tree is clean and tests pass do you start the new work.

---

## Building UI Mockups in the Framework

**Build design alternatives directly in the app's framework — never as standalone HTML.**

HTML mockups create a rework cycle: prototype → approve → rewrite in the real framework → done. You pay the cost twice. Building in the framework collapses that to: build in Svelte/React/Vue → approve → move the route → done.

### Where to put mockups

```
src/routes/
  mockups/
    a/       ← design variant A
    b/       ← design variant B
```

- `/mockups/*` requires no auth (fast iteration, shareable for review)
- Each variant is a complete, working page using the project's real component library
- Use real components, real tokens, real styling — no raw HTML divs or hardcoded colors
- Add a switcher pill to every mockup page linking to the other variants

**Framework route patterns:**

| Framework | Mockup path |
|-----------|-------------|
| SvelteKit | `src/routes/mockups/a/+page.svelte` |
| Next.js (app) | `app/mockups/a/page.tsx` |
| Remix | `app/routes/mockups.a.tsx` |
| Nuxt | `pages/mockups/a.vue` |

Each alternative should differ in **structure** (layout, hierarchy, information architecture) — not just color or spacing. Two alternatives is almost always enough; three max.

### Design loop

1. Report URLs: `http://localhost:<port>/mockups/a`, `/mockups/b`
2. Describe each option in 1–2 sentences so the user knows what they're comparing
3. Iterate on feedback until user picks a winner

### Data Loading in Mockups

**Use the framework's native data loading pattern from day one — never hardcode data inline in the component.**

The mockup phase uses a hardcoded API endpoint that returns static data. The component fetches from that endpoint exactly as it will in production. When the mockup is promoted, only the API implementation changes — the component, route, and data contract are already correct.

**SvelteKit pattern:**

```
src/routes/mockups/a/
  +page.svelte          ← component — fetches from /api/mockups/a
  +page.ts              ← client load: calls fetch('/api/mockups/a')
src/routes/(server)/api/mockups/a/
  +server.ts            ← GET handler returning hardcoded data
```

`+page.ts` (client load):
```typescript
export async function load({ fetch }) {
  const res = await fetch('/api/mockups/a')
  return { data: await res.json() }
}
```

`(server)/api/mockups/a/+server.ts` (hardcoded data):
```typescript
import { json } from '@sveltejs/kit'
export function GET() {
  return json({
    items: [
      { id: 1, label: 'Alpha', status: 'active' },
      { id: 2, label: 'Beta',  status: 'pending' },
    ]
  })
}
```

`+page.svelte`:
```svelte
<script>
  let { data } = $props()
</script>
{#each data.items as item}
  <div>{item.label}</div>
{/each}
```

**Framework equivalents:**

| Framework | Load pattern | Hardcoded API location |
|-----------|-------------|----------------------|
| SvelteKit | `+page.ts` load fn | `(server)/api/mockups/<name>/+server.ts` |
| Next.js (app) | `page.tsx` async component or `route.ts` | `app/api/mockups/<name>/route.ts` |
| Remix | `loader` function in route file | same file or separate `_api.mockups.<name>.ts` |
| Nuxt | `useAsyncData` / `useFetch` in `<script setup>` | `server/api/mockups/<name>.get.ts` |

**When the mockup is promoted:** swap the hardcoded API handler for the real backend call. The component and load function are untouched.

### Promoting the winner

```bash
# Move the winning route to its final location
mv src/routes/mockups/a/ src/routes/<final-path>/
```

Then delete the entire `mockups/` directory — never leave losing variants in the repo.

### Internationalization

**If the codebase uses i18n, ask before promoting:**

> "This codebase uses [i18n library]. Should I include internationalized strings when moving the mockup?"

On confirmation, during the move:
- Replace all hardcoded user-visible strings with translation keys
- Add the new keys to the base locale file (e.g. `messages/en.json`, `locales/en.ts`)
- Do not add translations for other locales — leave those as the key value or a TODO comment so translators can fill them in

Do not internationalize on your own initiative — only on explicit user confirmation. Some mockups get promoted with strings intentionally left hardcoded for review first.

---

## Zero-Errors Checkpoints

**The codebase is either clean or it is not. There is no "pre-existing" category.**

Run before AND after every implementation task:

```bash
bun run --filter '*' test && bunx tsc --noEmit
```

**Checkpoint 1 — before writing a single line:** if errors exist, fix them first. Do not start the feature on a broken baseline.

**Checkpoint 2 — before marking complete:** run again. Zero errors = done. Any errors = not done.

Forbidden rationalizations:
- "No new errors introduced by my changes" — new vs. pre-existing is irrelevant
- "The same N errors as before" — N is not zero
- "Errors in files I didn't touch" — you are responsible for the whole codebase
- "These are pre-existing and unrelated" — fix them or document a tracked exception

The only acceptable exception: errors structurally impossible to fix in the current task (e.g., a CI-generated file). Required handling: document in CLAUDE.md exactly why, create a follow-up task, get explicit user acknowledgment.

---

## Quick Reference

```
Starting a new feature?
  → git status                           # anything dirty?
  → git add + git commit                 # commit it, even if WIP
  → bun run --filter '*' test && bunx tsc --noEmit
  → fix any errors before writing new code
  → NOW start the feature

New design to explore?
  → mkdir src/routes/mockups/a/ + mockups/b/
  → Build with real components + real tokens
  → Add load fn + hardcoded API endpoint (not inline data in component)
  → Add switcher pill to compare variants
  → Report URLs, iterate, pick winner

Design approved?
  → mv src/routes/mockups/a/ src/routes/<final-path>/
  → Swap hardcoded API handler for real backend call
  → If i18n codebase: ask user → replace hardcoded strings + add keys to base locale
  → Delete the entire mockups/ directory

Feature complete?
  → bun run --filter '*' test && bunx tsc --noEmit
  → Fix any errors before marking done
  → Commit
```
