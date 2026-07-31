---
description: Build the work — drive a registered plan graph to completion, or implement a single task with TDD
argument-hint: A plan id/folder to drive, an issue number (e.g. "#42"), or a task description
---

## What this command does

The core build command — two modes, picked from the argument:

- **Plan-drive** — given a registered plan graph (from `/sensei:plan`) or a plan id/folder, run it
  to completion via the `builder` skill: dispatch parallelizable tasks as subagents, flip each
  task's state, and report progress + nudges to the daemon + Dōjō.
- **Single task** — given an issue or description, implement one feature: locate code via MCP,
  decompose into testable functions, write tests first (with approval), implement, and review.

## Procedure

### Step 1: Set phase and pick the mode

1. Call `update_phase(phase="build")` — MANDATORY
2. Call `log_event(type="command_invoked", data="{\"command\":\"build\",\"args\":\"$ARGUMENTS\"}")` — MANDATORY
3. Read `.sensei/rules.md` — follow all project rules
4. **Pick the mode:**
   - $ARGUMENTS names a plan id/folder (`docs/plan/<id>/`), **or** a registered run exists for this
     project (`run_status`) and no specific issue was given → **Plan-drive mode** (Step 2A).
   - $ARGUMENTS is an issue (`#42`) or a task description → **Single-task mode** (Step 2B).
   - $ARGUMENTS is empty and there's no registered run → `gh issue list --state open --limit 5
     --json number,title,labels`, ask the user which to work on, then Single-task mode.

### Step 2A: Plan-drive mode — invoke the `builder` skill

Invoke the **`builder`** skill and follow it end to end:

- Load the plan graph from `docs/plan/<plan-id>/` — $ARGUMENTS names the plan; if empty, use the
  most recently registered run (`run_status`).
- Ensure the run is registered (`register_plan` if it isn't yet) and keep the `run_id`.
- Run the loop: ready set → dispatch subagents (per task, on its assigned model/agent, fed its
  `spec_ref`) → `update_task_status` as tasks flip → `update_phase` at each phase boundary →
  `get_pending_nudges(run_id)` each iteration → `report_run_outcome` when done/failed.
- **Nudges:** a task that can't pass its gate → mark it `needs_review` and escalate to the human on
  the phone; never silently skip a failed gate. A shallow task (no observable acceptance criteria)
  → stop and re-plan it with `/sensei:plan` before driving it.
- Claude Code is the **sole MCP caller**; subagents report back to it. The daemon's own drive stays
  OFF. Keep-alive rides `update_phase` / `update_task_status` (the progress clock) — never the
  heartbeat. Zero-knowledge: only labels + status cross to Dōjō, never code, diffs, or spec bodies.

Skip Steps 2B–7 in this mode (each task's own build happens inside the loop's subagents).

### Step 2B: Single-task — pick the task

1. If $ARGUMENTS specifies an issue number (e.g. "#42"): run `gh issue view 42 --json
   title,body,labels`, then `update_phase(phase="build", issue="42", task="<issue title>")`.
2. If $ARGUMENTS is a description: use it as the task, then `update_phase(phase="build", task="$ARGUMENTS")`.

### Step 3: Locate relevant code — MANDATORY

Before writing ANY code, use MCP tools to find the right files:

1. Call `search()` with keywords from the task to find candidate symbols — MANDATORY
2. Call `match_pattern(description="<task description>")` to find applicable patterns — MANDATORY
3. Call `get_callers()` on symbols you plan to modify to understand blast radius
4. Call `get_callees()` to understand dependencies
5. If using a third-party library, call `get_lib_docs()` first
6. **`dry-check` before net-new code — MANDATORY.** Before writing any new function/type/helper, `search()` + `get_duplicates()` for an existing implementation and reuse it if one exists. Don't add a fourth near-identical helper; the tool answers "is this already here?" (review verifies this happened).

If `match_pattern()` returns results:
- Show the user: "Found pattern: [name] ([N] instances). Reference: [file]. Should I follow this pattern?"
- If yes: follow the pattern structure exactly
- If unsure: ask a clarifying question

Call `log_event(type="locate", data="{\"tools_used\":[...],\"symbols_found\":[...],\"files_identified\":[...],\"pattern_matched\":\"...\"}")` — MANDATORY

Do NOT skip the locate step. Do NOT use grep or manual file reading as a substitute for MCP tools.

### Step 4: Decompose into testable functions

Before writing code, plan the structure:

1. Identify pure functions needed (data transformation, no side effects)
2. Identify the orchestrator (thin wrapper that calls pure functions + handles side effects)
3. Identify boundaries (DB, filesystem, HTTP — mock at these boundaries)
4. If `.sensei/personas/*.md` exist: consider each persona's goals — does the decomposition serve their needs?

Present the decomposition to the user:
"I'll create [N] functions:
 - `function_a(params) → ReturnType` (pure, unit testable)
 - `function_b(params) → ReturnType` (pure, unit testable)
 - `orchestrator(params)` (calls both, handles side effects)

Does this decomposition make sense?"

Wait for user confirmation before proceeding.

### Step 5: Write tests FIRST — present for approval

1. Write test cases for each pure function
2. Present tests to the user:
   "Here are the test cases for `function_a`:
    - given X → returns Y
    - given empty input → returns empty
    - given edge case → handles correctly

   Do these cover the right behavior? Anything to add?"
3. Wait for user approval
4. Do NOT implement until tests are approved

### Step 6: Implement

1. Write implementation to make approved tests pass
2. Run tests after each function
3. Follow the pattern from Step 3 if one was matched

### Step 7: Review + commit

1. Run `/sensei:review` (auto-trigger after implementation)
2. Or: check pattern conformance, duplicates, test coverage manually
3. Call `log_event(type="issue_completed", data="{\"issue\":N,\"files_modified\":[...]}")` — MANDATORY
4. Suggest `/sensei:commit` to run the zero-errors check and commit with the issue reference.

## Important

- **Plan-drive mode** delegates entirely to the `builder` skill; **single-task mode** runs Steps 3–7.
- ALL MCP calls in Steps 3–4 (single-task) are MANDATORY — do not skip, do not use fallbacks
- Decomposition (Step 4) must be presented and confirmed before coding
- Tests (Step 5) must be presented and approved before implementation
- If `match_pattern()` finds a pattern, follow it unless the user explicitly says not to
- One issue at a time — complete this before starting the next
- Ask questions conversationally, not as a survey
