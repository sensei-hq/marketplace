---
name: knowledge-capture
description: Use throughout every session to load sensei's layered memory context, propose new memories when capture triggers fire, and record outcomes when memories shape your output. Calls the MCP knowledge tools (get_layered_context, propose_memory, record_outcome, save_memory, accept_proposal, reject_proposal).
---

# Knowledge Capture

Sensei's knowledge plane stores reusable lessons (memories) at global, project, and stack scopes. This skill tells you when and how to use them.

## At session start (and on /recall)

1. Determine the current project. The MCP layer resolves it from your working directory; you usually don't need to pass `project_id` explicitly.
2. Call `get_layered_context`. The response is the blended set of active memories from global + project + stack-matched scopes, ordered by strength.
3. Treat the returned memories as authoritative for this session — they are the user's accumulated decisions and conventions.

Re-fetch when 60 minutes have passed or when the user explicitly issues `/recall`.

## When to call `propose_memory`

Sensei expects you to capture learnings as proposals first (triage queue), not directly as active memories. Call `propose_memory` ONLY when one of these capture triggers fires — and not otherwise.

| `triage_signal` value | Fires when |
|---|---|
| `revert`         | User reverted code you just suggested in the same session. |
| `correction`     | User edited your output non-trivially (>3 lines diff on what you wrote). |
| `actually`       | User said "actually...", "no, we always...", "remember that...", or "we never...". |
| `repeat_pattern` | The same kind of fix or edit has happened in 2+ sessions in this repo. |
| `override`       | You cited a memory and the user overruled. Also call `record_outcome(violated)` for that memory. |
| `test_failure`   | A test failed on the first run of code you generated, and the user's fix is non-trivial. |

Required fields when calling `propose_memory`:

- `scope`: one of `global`, `project`, `stack`
- `scope_filter`: required when `scope=stack` (e.g. `rust`)
- `type`: memory category (`convention`, `pattern`, `decision`, `preference`, `continuity`, `question`)
- `title`: one-line summary
- `content`: the rule body — what the agent should know
- `triage_signal`: which trigger above fired

Optional:

- `impact`: what breaks if ignored
- `tags`: comma-separated array (`security`, `performance`, `compliance`, etc.)
- `project_id`: only when scope=project AND the daemon hasn't resolved the project from cwd

Do NOT propose memories outside the trigger list. Routine "I noticed you prefer X" observations belong in a `consulted` outcome, not a proposal.

## When to call `record_outcome`

End every turn that involved memories with one batched `record_outcome` call covering each memory you loaded.

| `outcome` | Meaning |
|---|---|
| `applied`   | The memory directly shaped output the user accepted. |
| `consulted` | You loaded it and considered it, but didn't apply (not relevant, or scope mismatch). |
| `violated`  | You applied it and the user reversed the change. |
| `ignored`   | Loaded but irrelevant; record so its strength can decay. |

Batch all outcomes for a turn into a single call:

```
record_outcome({"outcomes":[
  {"memory_id":"abc", "outcome":"applied", "context":"src/api/x.rs"},
  {"memory_id":"def", "outcome":"consulted"},
  ...
]})
```

The daemon's trigger updates each memory's `strength`, `reinforced_count`, `violated_count`, and `status` based on the outcome. Outcomes on archived or rejected memories are silently skipped (you don't need to filter).

## When to call `save_memory`

ONLY on explicit user instruction (`/save`, "save this as a project memory", "remember that we...", etc.). A `save_memory` call writes directly to active state — no triage. Never use it on heuristic detection — that's what `propose_memory` is for.

Same fields as `propose_memory` minus `triage_signal`.

## Accept / reject proposals

The user reviews proposals in the Learnings UI's Triage tab. You may receive instructions like "accept the idempotency proposal" — in that case use the listed memory id with `accept_proposal(id=...)` or `reject_proposal(id=..., reason=...)`. Normally the user clicks through the UI and you don't need to make these calls.

## Failure modes

If `get_layered_context` is unreachable, continue without memories and warn the user once. If `propose_memory` fails, surface the error — don't silently retry. The user will not lose a learning if you tell them clearly that capture failed.
