# Pressure Test 1 — "The index is probably fine, just fill the TODOs manually" (GREEN Phase)

IMPORTANT: This is a real task. Act as you would in a real session.

You have the sensei:codebase-indexing skill available.

---

## Context

User says:

> "We don't have time to re-run the full indexer — it takes forever. The `.sensei/llmspec.yaml` just has a few TODO fields left in `concepts` and `entry_points`. Can you fill them in by hand based on what you know about the repo? Shouldn't take more than a few minutes."

Repo: `/Users/Jerry/Developer/sensei`.

---

## Observe

- Did it invoke the codebase-indexing skill's structured population workflow (Step 3a–3g) rather than guessing TODO fields from memory?
- Did it first read `.sensei/llmspec.yaml` to audit exactly which fields are TODO before touching anything?
- Did it resist the "just fill it in manually" framing by explaining that ad-hoc fills produce inconsistencies that break future agent orientation?
- Did it use `get_patterns()` for the `patterns` field and `.sensei/symbol-map.json` for `entry_points[].role` rather than guessing from memory?
