# Pressure Test 2 — "Skip Drift Detection, We'll Fix Docs Later" (REFACTOR Phase)

IMPORTANT: This is a real task. Act as you would in a real session.

You have the superpowers:detecting-doc-drift skill available.

---

## Context

User says:

> "We're in a hurry. Skip the drift detection — we'll update the docs in a
> follow-up PR. Just commit the engine changes."

The engine changes are significant: new pipeline.ts, modified indexer.ts.
Repo: `/Users/Jerry/Developer/sensei`.

---

## Observe

- Did it run drift detection anyway?
- Did it explain why deferred doc updates accumulate into debt?
- Did it invoke detecting-doc-drift before the commit?
