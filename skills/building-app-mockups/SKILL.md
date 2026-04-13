---
name: building-app-mockups
description: Use when designing new UI pages, components, or layouts in a visual
framework (SvelteKit, React, Next.js) — builds alternatives directly as real app
pages at /mockups/a, /mockups/b using the project's actual components and styling,
so design decisions happen in the real app, not in throwaway HTML.
Also use before any significant layout change to compare options side-by-side
without committing to one.
---

# Building App Mockups

## Overview

When working in a visual framework, HTML mockups are double work — you design in HTML, then re-implement in the real framework. Instead, build design alternatives directly as pages in the running app. They use your real components, your real styling, your real data shapes. Design iteration happens at the URL, not in a separate tool. Promotion is move-and-cleanup, not re-implement.

## When to Use

- Designing a new page or significant UI section
- Comparing two or more layout approaches before committing
- When a stakeholder needs to see options side-by-side in the browser
- Before starting a major UI refactor

**Do NOT use for:** backend changes, pure logic, mobile apps, or projects without a file-based router.

## Procedure

### Phase 1: Setup

1. Check `package.json` to identify the framework (SvelteKit, Next.js, Remix, Nuxt, Vite+React, etc.)
2. Identify the component library and styling tools in use (check imports in existing pages)
3. Ask: what is this mockup for? (give it a name — used as the final route when promoting)
4. Ask: how many alternatives? (default: 2 — just A and B)
5. Create the `mockups/` route parent if it doesn't exist yet

**Framework route patterns:**

| Framework | Mockup path |
|-----------|-------------|
| SvelteKit | `src/routes/mockups/a/+page.svelte` |
| Next.js (app) | `app/mockups/a/page.tsx` |
| Next.js (pages) | `pages/mockups/a.tsx` |
| Remix | `app/routes/mockups.a.tsx` |
| Nuxt | `pages/mockups/a.vue` |

### Phase 2: Build Alternatives

For each alternative (a, b, ...):
1. Create the route file using the project's exact framework pattern
2. Implement using the project's real component library — no custom CSS or HTML from scratch unless the project itself does that
3. Each alternative explores a **meaningfully different approach** — different layout, different hierarchy, different information architecture — not just color or spacing tweaks
4. Include enough real content structure to evaluate — no lorem ipsum where real labels exist, use real component names

### Phase 3: Design Loop

1. Report the URLs: `http://localhost:<port>/mockups/a`, `/mockups/b`
2. Describe each alternative in 1–2 sentences so the user knows what they're comparing before opening the browser
3. Wait for feedback — "I prefer B but move the header up" → iterate on B
4. Continue iterating until user says "use A" or "use B" (or names a preference)

### Phase 4: Promote

Once user confirms a choice:

1. Move the winning files to the intended final location:
   - Ask where it should live if not already known: "Where should this end up? (e.g., `src/routes/dashboard/+page.svelte`)"
   - Move the file(s)
2. Update imports or route references if needed
3. Delete the `mockups/` route directory entirely
4. Report: "Promoted `/mockups/b` → `src/routes/dashboard/+page.svelte`. Mockup scaffolding removed."

---

## Why Not HTML Mockups

| HTML mockup | In-app mockup |
|---|---|
| Separate tool, can't use real components | Uses your actual component library |
| Has to be re-implemented after approval | Promoted with move + minor edits |
| Styling diverges from real app | Exact same styling system |
| Agent spends tokens on two implementations | One implementation, iterated |
| Design decisions made outside the real context | Design decisions made in the real app |

---

## Example (SvelteKit + Rokkit)

Task: "Design a new repo settings page — explore a tabbed layout vs a sidebar layout"

Phase 1: Framework = SvelteKit, UI lib = Rokkit, styling = UnoCSS
Phase 2: Create:
- `src/routes/mockups/a/+page.svelte` — tabbed layout using `<Tabs>` from Rokkit
- `src/routes/mockups/b/+page.svelte` — sidebar layout using `<Nav>` from Rokkit
Phase 3: "Visit `/mockups/a` and `/mockups/b`. Option A uses a tabbed interface; option B uses a persistent left sidebar."
Phase 4: User picks B → move to `src/routes/repos/[id]/settings/+page.svelte` → delete `mockups/`

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| Making alternatives too similar | Each alternative should differ in structure, not just styling |
| Using HTML/CSS instead of the real component library | Always use the same components as the rest of the app |
| Leaving mockup pages in the repo after promotion | Always delete the `mockups/` directory as the final step |
| Promoting before asking where it should live | Confirm the final route before moving |
| Building more than 3 alternatives | 2 is almost always enough; 3 max — more creates decision paralysis |
