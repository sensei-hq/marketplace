---
description: Implement a feature — locate code, decompose into testable functions, TDD, review
argument-hint: Issue number or task description (e.g. "#42" or "add SQL adapter")
---

## What this command does

The core implementation command. Picks an issue, locates the right code via MCP, decomposes into testable functions, writes tests first with user approval, implements, and triggers review.

## Procedure

### Step 1: Set phase and pick task

1. Call `update_phase(phase="build")` — MANDATORY
2. Call `log_event(type="command_invoked", data="{\"command\":\"build\",\"args\":\"$ARGUMENTS\"}")` — MANDATORY
3. Read `.sensei/rules.md` — follow all project rules
4. If $ARGUMENTS specifies an issue number (e.g., "#42"):
   - Run `gh issue view 42 --json title,body,labels` to get issue details
   - Call `update_phase(phase="build", issue="42", task="<issue title>")`
5. If $ARGUMENTS is a description:
   - Use it as the task description
   - Call `update_phase(phase="build", task="$ARGUMENTS")`
6. If $ARGUMENTS is empty:
   - Run `gh issue list --state open --limit 5 --json number,title,labels` to show open issues
   - Ask the user which to work on
   - Call `update_phase` with the chosen issue

### Step 2: Locate relevant code — MANDATORY

Before writing ANY code, use MCP tools to find the right files:

1. Call `search()` with keywords from the task to find candidate symbols — MANDATORY
2. Call `match_pattern(description="<task description>")` to find applicable patterns — MANDATORY
3. Call `get_callers()` on symbols you plan to modify to understand blast radius
4. Call `get_callees()` to understand dependencies
5. If using a third-party library, call `get_lib_docs()` first

If `match_pattern()` returns results:
- Show the user: "Found pattern: [name] ([N] instances). Reference: [file]. Should I follow this pattern?"
- If yes: follow the pattern structure exactly
- If unsure: ask a clarifying question

Call `log_event(type="locate", data="{\"tools_used\":[...],\"symbols_found\":[...],\"files_identified\":[...],\"pattern_matched\":\"...\"}")` — MANDATORY

Do NOT skip the locate step. Do NOT use grep or manual file reading as a substitute for MCP tools.

### Step 3: Decompose into testable functions

Before writing code, plan the structure:

1. Identify pure functions needed (data transformation, no side effects)
2. Identify the orchestrator (thin wrapper that calls pure functions + handles side effects)
3. Identify boundaries (DB, filesystem, HTTP — mock at these boundaries)

Present the decomposition to the user:
"I'll create [N] functions:
 - `function_a(params) → ReturnType` (pure, unit testable)
 - `function_b(params) → ReturnType` (pure, unit testable)
 - `orchestrator(params)` (calls both, handles side effects)

Does this decomposition make sense?"

Wait for user confirmation before proceeding.

### Step 4: Write tests FIRST — present for approval

1. Write test cases for each pure function
2. Present tests to the user:
   "Here are the test cases for `function_a`:
    - given X → returns Y
    - given empty input → returns empty
    - given edge case → handles correctly

   Do these cover the right behavior? Anything to add?"
3. Wait for user approval
4. Do NOT implement until tests are approved

### Step 5: Implement

1. Write implementation to make approved tests pass
2. Run tests after each function
3. Follow the pattern from Step 2 if one was matched

### Step 6: Review

1. Run `/sensei:review` (auto-trigger after implementation)
2. Or: check pattern conformance, duplicates, test coverage manually
3. Call `log_event(type="issue_completed", data="{\"issue\":N,\"files_modified\":[...]}")` — MANDATORY

### Step 7: Commit

Suggest `/sensei:commit` to run zero-errors check and commit with issue reference.

## Important

- ALL MCP calls in Steps 1-2 are MANDATORY — do not skip, do not use fallbacks
- Decomposition (Step 3) must be presented and confirmed before coding
- Tests (Step 4) must be presented and approved before implementation
- If `match_pattern()` finds a pattern, follow it unless the user explicitly says not to
- One issue at a time — complete this before starting the next
- Ask questions conversationally, not as a survey
