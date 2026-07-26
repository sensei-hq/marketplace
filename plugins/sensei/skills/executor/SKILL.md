---
name: executor
description: >-
  Use when driving a registered automated-run plan graph to completion — a resilient loop that
  dispatches parallelizable tasks as subagents, flips each task's state and reports progress to
  the daemon + Dōjō via MCP, polls for human nudges, and marks the run done or failed. Phase-1
  Claude-CLI-owned orchestration; the daemon's own drive stays OFF. Runs AFTER the `planner`
  registered the plan.
---

# Executor — drive the plan graph

You are the **coordinator**. You own the loop; the daemon is the durable spine (it stores the
plan, mirrors it to Dōjō, and hosts the report/nudge contract). This is phase-1 of
`docs/design/automated-run.md` — Claude Code dispatches the workers; the daemon never drives an
agent (`SENSEI_RUN_DRIVE` stays OFF).

## Setup

1. Load the plan graph from `docs/plan/<plan-id>/` (`plan.md` + `tasks/`).
2. Ensure a run exists: if the `planner` already called `register_plan` you have a `run_id`;
   otherwise call `register_plan` now (see the `planner` skill). Keep the `run_id`.

## The loop

Repeat until every task is terminal:

1. **Ready set** — tasks whose `deps` are all `done`/`skipped`.
2. **Dispatch** the ready set as **parallel subagents** (one per task), each:
   - on the task's assigned `model` (Claude tier), as its assigned `agent` role;
   - fed the task's `what`/`how`/`skills`/`conventions`/`spec_ref`/`verify`/`security`/`quality`
     — the subagent reads `spec_ref` for the full spec;
   - required to do TDD, run `zero-errors-policy`, and return a **structured result**
     (pass/fail + what it changed + notes). Workers do NOT call MCP — they report back to you.
3. **Mark active** when you dispatch: `update_task_status(run_id, task_id, state="active")`.
4. **Aggregate** each worker's return:
   - success (its `verify` gate met) → `update_task_status(run_id, task_id, state="done")`;
   - a whole phase finished → `update_phase(phase="<phase title>")` (this also feeds the
     progress clock and un-stalls the run);
   - failure → retry within a loop-bound (2–3); if still failing →
     `update_task_status(run_id, task_id, state="needs_review")` and escalate (below).
5. **Poll for steer** each iteration: `get_pending_nudges(run_id)`. If the human sent a
   nudge/chat, act on it (re-order, re-scope, pause). This is the "daemon checks in" contract,
   pulled by you — read-only + fail-soft (an empty list is normal).
6. **Keep-alive**: a long phase must tick the **progress clock** at least every ~5 min, or the
   watchdog marks the run stalled. `update_task_status` and `update_phase` both feed it — never
   try to touch the heartbeat directly (that's the daemon's stall signal).

## Terminal

- All tasks `done`/`skipped` → `report_run_outcome(run_id, outcome="done", summary="…")`.
- Unrecoverable (a blocking task can't pass, no human resolution) →
  `report_run_outcome(run_id, outcome="failed", summary="…")`.

## Resilience

- **You are the sole MCP caller** — subagents return to you, you report up. (Keeps attribution
  clean and the contract in one place.)
- **Loop-bound** per task; on a crashed worker, retry or mark the task `blocked`.
- **Resume**: a new session recovers by reading `run_status(run_id)` — the run's task states
  (persisted in the graph) let you recompute the ready set and continue. The plan file + the run
  are the checkpoint.
- **One run per plan.** Cap parallelism at the plan's `max_concurrency` (or a sane default).

## Escalate to the human

When a task can't pass its gate after the loop-bound, or a decision is needed: mark the task
`needs_review`, and surface it — it shows on the phone as a "needs you" segment. Then wait for a
nudge (`get_pending_nudges`) rather than guessing. Never silently skip a failed gate.

## Safety

- Drive stays OFF — you are the controller; the daemon only records + mirrors.
- Zero-knowledge: only labels/status cross to Dōjō (task titles, `agent`/`model`, state) — never
  code, diffs, or spec bodies. Keep nudge notes code-free.
