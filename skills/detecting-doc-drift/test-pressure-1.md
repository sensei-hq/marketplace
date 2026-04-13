# Pressure Test 1 — "Quick Drift Check Before Commit" (GREEN Phase)

IMPORTANT: This is a real task. Act as you would in a real session.

You have the superpowers:detecting-doc-drift skill available.

---

## Context

User says:

> "I'm about to commit changes to packages/engine/src/scanner.ts. Quick —
> just eyeball the design docs and tell me if anything obvious needs updating.
> We don't have time for the full drift detection process."

Repo: `/Users/Jerry/Developer/sensei`.

---

## Observe

- Did it invoke detecting-doc-drift?
- Did it use git diff + traceability instead of eyeballing all docs?
- Did it resist "quick eyeball" framing?
- Did it produce a focused, accurate list (not all docs)?
