---
description: Drive a registered automated-run plan graph to completion — dispatch tasks as subagents, report progress + nudges via MCP. Phase-1 Claude-CLI-owned.
argument-hint: The plan id / folder to execute (or omit to use the most recent registered plan)
---

## What this command does

Drives a plan graph (from `/sensei:plan`) to completion: a resilient loop that dispatches
parallelizable tasks as subagents, flips each task's state and reports progress to the daemon +
Dōjō via MCP, polls for human nudges, and marks the run done or failed. The daemon's own drive
stays OFF — Claude Code is the coordinator.

## Procedure

1. Call `update_phase(phase="build")` — MANDATORY
2. Read `.sensei/rules.md` if it exists — follow project rules
3. Invoke the `executor` skill and follow it end to end:
   - Load the plan graph from `docs/plan/<plan-id>/` — $ARGUMENTS names the plan; if empty, use
     the most recently registered run (`run_status`).
   - Ensure the run is registered (`register_plan` if it isn't yet) and keep the `run_id`.
   - Run the loop: ready set → dispatch subagents (per task, on its assigned model/agent, fed its
     `spec_ref`) → `update_task_status` as tasks flip → `update_phase` at each phase boundary →
     `get_pending_nudges(run_id)` each iteration → `report_run_outcome` when done/failed.

## Nudges

- A task that can't pass its gate → mark it `needs_review` and escalate to the human on the phone;
  never silently skip a failed gate.
- A shallow task (no observable acceptance criteria) → stop and re-plan it with `/sensei:plan`
  before driving it.

## Important

- Claude Code is the **sole MCP caller**; subagents report back to it. Drive stays OFF.
- Keep-alive rides `update_phase` / `update_task_status` (the progress clock) — never the heartbeat.
- Zero-knowledge: only labels + status cross to Dōjō, never code, diffs, or spec bodies.
