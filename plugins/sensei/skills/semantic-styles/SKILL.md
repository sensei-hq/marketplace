---
name: semantic-styles
description: Use when building any UI — establishes how to write styles that feel consistent and professional across the entire application rather than per-component. Covers type scale, spacing system, semantic color, border-radius, and how to avoid the "every screen slightly different" problem. For Rokkit-powered apps, use semantic-styles-rokkit instead.
---

# Semantic Styles

## Why this matters

The most common reason an app feels "off" is not that any individual screen looks bad
— it is that every screen made its own independent sizing decisions.

One screen uses `font-size: 13px`, another uses `font-size: 12.5px`. One card has
`padding: 14px 16px`, the next has `padding: 12px 14px`. Individually invisible.
Cumulatively: the whole app feels slightly out of phase with itself, like a song where
every instrument is a semitone flat in different places.

The fix is not a design system document. It is a **small set of named constraints** that
every screen uses, adjustable in one place. When the constraints are wrong you fix them
once; when they are right everything snaps into cohesion.

---

## Rule 1 — Name your sizes, do not invent them

**What:** Define a type scale of 5–7 named sizes. Use only those.

**Why:** Once you have more than ~6 different font sizes in an app, the variations stop
carrying meaning. The user does not perceive the difference between 12.5px and 13px —
they only perceive "similar content treated differently for no clear reason." Fractional
pixel sizes (`9.5px`, `11.5px`, `12.5px`) are almost always an accident of someone
copying a value rather than a deliberate choice.

**How:** Pick a scale and name it. Example for a dense data app:

| Name | Size | Tailwind | Use for |
|------|------|----------|---------|
| `display` | 24px | `text-2xl` | Page titles |
| `heading` | 20px | `text-xl` | Section headings |
| `title` | 14px | `text-sm` | Card titles, labels |
| `body` | 13px | `text-[13px]` | Primary body text |
| `caption` | 12px | `text-xs` | Metadata, secondary labels |
| `micro` | 10px | `text-[10px]` | Badges, counts, faint annotations |

**Impact:** When you restrict to this set, screens stop looking slightly misaligned
with each other. Visual hierarchy becomes readable because sizes now carry meaning
(heading > title > body) rather than being arbitrary.

**Anti-patterns:**
- `font-size: 9.5px` — if content is that secondary, hide or de-emphasise it, do not
  shrink it to be almost illegible
- `font-size: 11.5px` — pick 11 or 12, not the midpoint
- More than 7 sizes in an app — audit and collapse

---

## Rule 2 — Use a single spacing unit

**What:** All gap, padding, and margin values must be multiples of 4px. Use Tailwind's
scale directly: `p-1` (4px), `p-2` (8px), `p-3` (12px), `p-4` (16px), `p-6` (24px),
`p-8` (32px).

**Why:** Arbitrary spacing (`gap: 10px`, `margin: 6px`, `padding: 14px`) accumulates
across a screen until layouts feel slightly misaligned. A consistent 4px grid eliminates
this because every element's edge naturally aligns with other elements — they are all
multiples of the same unit.

**How — mapping common values:**

| Avoid | Use instead | Tailwind |
|-------|------------|---------|
| `gap: 6px` | 4px or 8px | `gap-1` or `gap-2` |
| `gap: 10px` | 8px or 12px | `gap-2` or `gap-3` |
| `padding: 14px 16px` | 12px/16px or 16px | `px-4 py-3` |
| `padding: 22px` | 20px or 24px | `py-5` or `py-6` |
| `margin: 6px 0` | 4px or 8px | `mt-1` or `mt-2` |

**Why halves work:** `gap-2.5` (10px) and `gap-1.5` (6px) are acceptable when
you need intermediate steps — they are still on a 2px sub-grid and therefore composable.
Fully arbitrary values (`gap: 11px`) are not.

**Impact:** Screens start to feel like they were designed by the same hand. Adjacent
cards, form rows, and list items align because they all increment by the same unit.

---

## Rule 3 — Use semantic colors, not raw values

**What:** Never write a color as a hex value, RGB value, or arbitrary custom property
in a component. Always reference a semantic role + shade level.

**Why:** When a raw color appears in a component (`color: #3D3730`), it is opaque —
the reader cannot tell what role that color plays. When the surface shade changes (dark
mode, theme update, brand refresh), every raw value must be found and changed manually.
When you use `text-surface-z9` (primary text) or `text-primary-z5` (accent text), the
meaning is clear and the whole app adapts when the palette is updated in config.

**Semantic roles:**

| Role | Meaning |
|------|---------|
| `surface` | The neutral background scale — paper, card, borders, text |
| `primary` | The main accent/brand color |
| `secondary` | Secondary accent, often used for tags, secondary actions |
| `accent` | Tertiary highlight |
| `success` | Positive feedback, completed state |
| `warning` | Caution, near-deadline states |
| `danger` | Destructive actions, errors |
| `info` | Informational callouts |

**How:** Each role has a shade scale (z0–z10). Light → dark within the role:
- `z0–z2` — very light tints (backgrounds, badges, hover states)
- `z3–z5` — mid-range (accent fills, interactive elements)
- `z6–z7` — medium-dark (secondary text, borders)
- `z8–z9` — dark (primary text, strong borders)
- `z10` — deepest (rarely used)

**Impact:** Switching themes, adjusting palette intensity, or adding dark mode becomes
a config change rather than a grep-and-replace across hundreds of components.

---

## Rule 4 — Limit border radius to three values

**What:** Use at most three radius sizes in an application: a standard radius (for
cards, inputs, buttons), a small radius (for badges, chips, inline elements), and
a pill radius (for tags, toggles, avatars). Name them in config.

**Why:** Mixing `border-radius: 4px`, `5px`, `6px`, `8px`, `10px` across an app
produces a texture that reads as inconsistency. Human perception is sensitive to
slight mismatches in curvature — screens feel like they were built by different people
even if the visual difference is just 2px.

**How:**

| Name | Value | Use for |
|------|-------|---------|
| `sm` | 2–4px | Chips, inline badges |
| `md` | 6–8px | Cards, inputs, buttons (the default) |
| `lg` | 10–12px | Large panels, modals |
| `full` | 9999px | Avatars, toggles, pill tags |

**Impact:** Curvature becomes part of the design language rather than noise.
"Sharp/soft/rounded" reads as a deliberate personality, not random deviation.

---

## Rule 5 — Write styles as utilities, not component-local CSS

**What:** Prefer Tailwind/UnoCSS utility classes directly on elements over `<style>`
block CSS rules.

**Why:** `<style>` block CSS accumulates per-component state that is invisible at the
usage site. A reviewer reading `<div class="section-page">` cannot see that it has
`padding: 24px; background: var(--paper-2)` without finding the `<style>` block.
Utility classes (`p-6 bg-surface-z1`) are fully visible at the element, making
review and maintenance faster.

Component-local CSS is appropriate for:
- Complex pseudo-selector chains (`:focus-within`, `::before`)
- Animations and transitions
- Scrollbar styling
- Third-party overrides

Everything else should be a utility class.

**Impact:** Any developer can read a component and understand its visual intent without
scanning two separate sections. "What does this element look like?" is answered at
a glance.

---

## Applying these rules — screen-by-screen process

When migrating or building a screen:

1. **Identify the content hierarchy** — what is the page title, section title, body text, caption? Map each to the type scale.
2. **Map spacing rhythmically** — pick a base unit for this screen's density (compact: base=4px, comfortable: base=8px) and apply consistently.
3. **Replace every color reference** with a semantic utility class.
4. **Check consistency with adjacent screens** — open two screens side by side and verify spacing/sizing rhythm matches.
5. **Remove `<style>` block rules** that only set spacing, color, or font-size — move to utilities.

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| `font-size: 9.5px` | Fractional px suggests an accident, not a choice | Use `text-[10px]` or reconsider whether this content needs to be shown |
| `color: var(--paper-3)` in a component | Semantic meaning unclear, breaks on theme change | `bg-surface-z2` |
| `border-radius: 5px` next to `border-radius: 6px` | Perceived as inconsistency | Align to one value from your radius preset |
| `gap: 10px` next to `gap: 12px` | Same density, different grid → slight misalignment | Use `gap-3` (12px) for both |
| Separate `<style>` rule per layout class | Visual properties hidden from usage site | Inline as utilities |
| `margin: 0 0 8px; font-size: 13px; color: var(--sumi-3)` all on one class | Per-component CSS accumulates, invisible from template | `mb-2 text-[13px] text-surface-z5` |
