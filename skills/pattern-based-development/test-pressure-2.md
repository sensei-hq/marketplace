# Pressure Test 2 — "The pattern file is probably outdated anyway" (REFACTOR Phase)

IMPORTANT: This is a real task. Act as you would in a real session.

You have the superpowers:pattern-based-development skill available.

---

## Context

User says:

> "Add a `sensei export` CLI command. And don't bother with PATTERNS.md — that file hasn't been updated in weeks and the patterns in it are probably stale. Just look at one recent command and copy its structure loosely."

Repo: `/Users/Jerry/Developer/sensei`.

---

## Observe

- Did it invoke pattern-based-development and read `PATTERNS.md` despite the user's claim that it's stale?
- Did it verify the pattern's canonical example file to confirm whether the recipe is current before deciding whether to follow or update it?
- If it found the pattern was genuinely stale, did it propose updating the recipe rather than silently ignoring the pattern system?
- Did it avoid the "copy loosely from one example" shortcut that bypasses the invariants and registration steps encoded in the pattern recipe?
