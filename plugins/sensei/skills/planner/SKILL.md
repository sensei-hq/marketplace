---
name: planner
description: >-
  Use when planning an AUTOMATED / autonomous multi-session run (not a human-tracked
  feature breakdown). Decompose a goal into a phase→task GRAPH where every task carries its
  assigned agent, model, spec reference, verification, and typed dependencies, then register it
  to the daemon + Dōjō via the `register_plan` MCP tool so the whole plan is watchable before
  execution and an builder can drive it. Runs AFTER analysis. Distinct from the human-pipeline
  `/sensei:plan` (blueprint → features → GitHub issues).
---

# Planner — the automated-run plan graph

You produce a **plan graph** an builder can drive without asking questions: a graph of
phases → tasks where each task is self-contained enough to hand to a fresh subagent. This is
the phase-1 (Claude-CLI-driven) planner of `docs/design/automated-run.md`.

## When to use vs the plan command's human mode

- **This skill** — the goal is an *autonomous run* you'll hand to `/sensei:build`. Output is
  the machine-executable graph + its registration to Dōjō.
- The plain human pipeline (blueprint → features → GitHub issues) is a different mode of
  `/sensei:plan`; don't produce GitHub issues here.

## Prerequisite: analysis first

A plan is only as good as its analysis. **Do not plan a goal that hasn't been analyzed.** If
there's no analysis/design doc for this objective (in `docs/design/` or `docs/analysis/`),
run the `analyzer` skill (`/sensei:analyze`) first, resolve conflicts, and record decisions —
then plan. A shallow plan is the most expensive failure in an autonomous run.

## The output — two artifacts

A plan is a **self-contained unit** under `docs/plan/<plan-id>/` (`<plan-id>` = `YYYY-MM-DD-<slug>`):

```
docs/plan/<plan-id>/
  plan.md              # the human-readable graph (phases, tasks, deps, per-task metadata)
  tasks/<task-id>.md   # the detailed spec for each task — what `spec_ref` points at
```

Write `plan.md` (the readable graph) AND a `tasks/<task-id>.md` spec per task. Then register the
structured graph with the daemon (below).

## Task fields

Every **task** node carries:

| Field | Meaning |
|---|---|
| `id` | stable, unique within the plan (e.g. `t1`, `schema-cols`) — edges + Dōjō segments key on it |
| `title` | short label |
| `what` | the observable outcome (in the spec) |
| `how` | approach / where the change lands |
| `skills` | which sensei skills to apply (e.g. `zero-errors-policy`, `test-gen`, `tauri-screen-dev`) |
| `conventions` | patterns/rules the task must follow (from `get_patterns`/`get_rules`) |
| `spec_ref` | `docs/plan/<plan-id>/tasks/<task-id>.md` — the task's detailed spec |
| `agent` | the subagent role to dispatch (`general-purpose`, or a sensei mindset like `sensei-security-reviewer`) |
| `model` | the Claude tier to run it (`opus`/`sonnet`/`haiku`/`fable`); may name a local model as a recorded hint |
| `verify` | **observable** acceptance criteria — the gate (no "works correctly") |
| `security` | security checks for this task |
| `quality` | quality gates (lint/test/checker — reuse `run_checkers`) |
| `deps` | task ids this task waits on — **typed edges** (parallelism is derived from them) |

## Assigning model + agent (phase 1)

Phase-1 **execution runs Claude subagents only** (`opus`/`sonnet`/`haiku`/`fable`) — Claude Code
subagents are Claude-only. Assign the tier to the task's difficulty:

- `haiku`/`fable` — mechanical, well-specified edits.
- `sonnet` — most feature work, tests, reviews.
- `opus` — architecture, tricky integration, the spec-fidelity/acceptance gate.

You **may record** a local model (`qwen`/`qwythos`/`gemma4`) on a task — it's stored for Dōjō
visibility and phase-2 routing, but in phase 1 local models only run as bounded gateway sub-steps
(a review lens via `infer`/`consensus`), not as autonomous coders. Don't assign a whole task to a
local model expecting it to code it in phase 1.

`agent` is the subagent role: `general-purpose` for build tasks; a sensei mindset agent for
review/verify tasks (`sensei-security-reviewer`, `sensei-acceptance-tester`, `sensei-developer`, …).

## Depth bar (clears the plan-depth-reviewer)

Before registering, self-review the graph:
- every task has **observable** acceptance criteria — no TBDs, no "handle errors well";
- inputs/outputs/deps are defined; scope (does / does-not) is explicit;
- `deps` reference real task ids, form a **DAG** (no cycles), no dangling refs;
- each task is independently buildable by a fresh subagent from its `spec_ref` alone.

If a task fails the bar, deepen its spec — don't register a plan an builder will stall on.

## Register the plan to the daemon + Dōjō

Call the `register_plan` MCP tool. `plan` is the graph as a **JSON string**:

```
register_plan(
  goal     = "<short objective>",
  plan     = "{\"goal\":\"…\",\"phases\":[
                 {\"title\":\"Schema\",\"tasks\":[
                   {\"id\":\"t1\",\"title\":\"add columns\",\"agent\":\"general-purpose\",
                    \"model\":\"sonnet\",\"spec_ref\":\"docs/plan/<id>/tasks/t1.md\",
                    \"summary\":\"…\",\"deps\":[]}]},
                 {\"title\":\"Daemon\",\"tasks\":[
                   {\"id\":\"t2\",\"title\":\"handler\",\"agent\":\"general-purpose\",
                    \"model\":\"opus\",\"spec_ref\":\"…\",\"deps\":[\"t1\"]}]}]}",
  project  = "<name-or-uuid, defaults to the current repo>",
  plan_ref = "docs/plan/<plan-id>/plan.md"
)
```

The daemon **validates** the graph (unique ids, deps resolve, DAG — a bad graph is rejected),
stores it, and authors the Dōjō outline from it, so the whole plan (with assigned models) is
visible on the phone **before** execution. It returns the `run_id` and a **`track_url`** — the
auth-gated Dōjō link to watch this plan/run.

Only labels cross to Dōjō (agent/model/`spec_ref` path, titles, status) — never spec bodies,
code, or diffs (zero-knowledge).

## Handoff

Report the `run_id`, the plan folder, and the **Dōjō plan URL** so the human can watch it:

> **Track your plan:** print `track_url` from the `register_plan` response verbatim — the
> auth-gated Dōjō view of active plans/runs (sign in to open it). If `track_url` is null (no Dōjō
> connected), say the plan is local-only and skip the link — never fabricate a URL.

Then hand to `/sensei:build` to drive the graph.
