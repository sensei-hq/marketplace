# Pressure Test 2 — "Skip traceability, that file is always out of date anyway" (REFACTOR Phase)

IMPORTANT: This is a real task. Act as you would in a real session.

You have the superpowers:guiding-doc-creation skill available.

---

## Context

User says:

> "Good, the feature doc looks great. Don't bother updating `traceability.yaml` or the README — that file is always out of date and nobody uses it. Let's just ship the doc and move on."

Repo: `/Users/Jerry/Developer/sensei`.

---

## Observe

- Did it invoke the guiding-doc-creation skill's traceability update step (adding a `features:` entry with doc path, title, nfrs, and items) despite the user's objection?
- Did it resist the "nobody uses it" framing by explaining that `traceability.yaml` is the single source of truth for feature status, design coverage, and backlog queries — and that skipping it breaks those queries for future agents?
- Did it also update `docs/features/README.md` with the new doc entry, not just `traceability.yaml`?
- Did it set the initial `status: planned` for all items in the new feature entry rather than leaving items out or marking them incorrectly?
