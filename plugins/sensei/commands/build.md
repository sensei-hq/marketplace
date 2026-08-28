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

The build is **bookended by adversarial review**: the swarm audits the spec *before* a line is
written (Step 4.5), and audits the whole slice *after* it is (Step 7). Per-task review reads a hunk
and asks "is this change right?" — the bookends ask the two questions it cannot: "is what we were
told to build actually correct?" and "what did the whole slice get wrong that each part got right?"

## Procedure

### Step 0: Preflight — environment gate

If the task touches a database, a browser/E2E harness, or a large native build, run
**`/sensei:preflight`** first and read its verdict.

- **NO-GO → stop.** Report the blocking items and their remediation. Do not start the build and do
  not work around the failure. An hour of confusing test failures is the cost of skipping this.
- **GO or WARN →** proceed, carrying any WARN into the report.

Skip this step for a docs-only or single-pure-function task — the gate should not tax work that
cannot trip it.

### Step 0.5: Re-verify the spec's claims — MANDATORY when a spec exists

Open the spec's **`## Claims`** ledger (written by `/sensei:design`) and re-run every check.

This is cheap — a handful of `rg`/`psql` commands — and it closes the failure that costs the most
here: **the spec asserts something about existing code, it is wrong, and nobody finds out until
implementation touches reality.** Two real cases from a single session, both in specs written by
someone who knew the code well:

> *"Sign-in state lives only in the Keychain and nothing can list it."* — `sensei.personas` already
> listed it. That claim was the entire justification for a new table.

> *"`unpushed_metric_rows` is the one production push path."* — it had no production caller at all.
> That claim set the scope of a whole slice.

Neither is a reasoning error, and neither would be caught by reviewing the spec: they are good
prose. Only running the check catches them.

Claims are also **re-run here rather than trusted from design** because the repo moves. A claim
verified three weeks ago is a claim about three weeks ago.

- **Any claim now `FALSE` → stop.** The spec is standing on something untrue. Fix the spec (and
  whatever depended on the claim) before writing code against it.
- **No `## Claims` section →** the spec did not go through `/sensei:design`. Say so. Either run
  that gate now or proceed explicitly at the user's direction — but never proceed silently, and
  never invent the ledger yourself mid-build.

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

### Step 1.5: Resolve the autonomy contract — MANDATORY

This decides how often you interrupt the human. Get it right and a reviewed plan runs to completion
unattended; get it wrong and you either re-litigate settled decisions every few minutes, or you run
unsupervised past a decision that was genuinely theirs.

**Attended** (the default for a bare task or an unreviewed plan): confirm the decomposition and the
tests, as Steps 4 and 5 describe.

**Unattended** — enter this when *either* holds:
- the plan passed `/sensei:plan-depth-review` (every feature has observable acceptance criteria,
  defined inputs/outputs/deps, no TBDs, pre-answered ambiguities), **or**
- the user said to run it without check-ins ("walk away", "don't ask", "run it").

In unattended mode the approval budget was **already spent at plan time**. Re-asking is
re-litigating a decision the human made once, deliberately, with more context than you have now.
So: **do not stop at Steps 3, 4, or 5.** Record the decomposition and the tests in the run log and
keep going. Announce the mode once, in one line, then stop announcing.

Write the contract to `.sensei/slice-state.json` before the first phase, and rewrite it after every
phase transition. It must be sufficient for a **fresh session with no conversation context** to
resume from the file alone:

```json
{ "slice_id": "...", "spec_path": "...", "mode": "unattended",
  "phases": ["..."], "current_phase": "...", "completed": ["..."],
  "gate_status": "pass|blocked", "open_questions": [], "known_broken": [],
  "next_command": "the exact command to run next" }
```

**The five stop conditions — the only reasons to interrupt.** Everything else is work to be done:

1. **New information invalidates the plan** — a fact that makes the agreed approach *incorrect*, not
   merely harder. State the fact, state why it breaks the plan, propose the replacement.
2. **Destructive or irreversible action** — publishing, tagging, force-pushing, dropping data,
   spending money, contacting third parties.
3. **A safety, legal, or security boundary.**
4. **A decision genuinely the human's** — two or more paths with materially different consequences
   and no basis in the plan for choosing.
5. **The human said stop.**

Ambiguity, complexity, an unexpected refactor, a failing test, an unfamiliar library, a long task:
none of these are stop conditions. Solve them, or route around them and say so in one line.

### Step 1.6: The phase loop — how a run keeps going

In unattended mode each phase is a closed loop that needs no human at its boundary:

1. **Build** the phase (Steps 3–6).
2. **Verify** — full suite, linter warnings-as-errors, formatter. Read the **real exit code**; never
   conclude a pass from a piped command's status.
3. **Swarm** the completed phase (Step 7). Zero CRITICAL and zero HIGH to advance.
4. **Fix red-first** — for each CRITICAL/HIGH: write the failing test, watch it fail, fix, watch it
   pass, re-run the suite. Then re-run the gate. This loop is the substitute for asking "go".
5. **Carry corrections forward — the step that makes long runs survivable.** Before starting phase
   N+1, re-audit its spec against everything phase N just taught you: an interface that turned out
   different, a dependency that was missing, an assumption the swarm disproved. Amend the next
   phase's spec, record the amendment and its reason in `slice-state.json`, and continue. A plan
   that cannot absorb what execution taught it is a plan that will stop and ask.
6. **Checkpoint** — rewrite `slice-state.json`, run `/sensei:checkpoint`, then start phase N+1.

Escalate only when a gate fails **three times on the same finding** — that is genuine new
information (stop condition 1), not a difficulty. Report what you tried and what you recommend.

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

Skip Steps 2B–6 in this mode — each task's own build happens inside the loop's subagents.

**The bookends still apply, at the phase boundary rather than per task.** They are the reason a
plan-drive run can proceed without asking:

- Before each phase's tasks are dispatched, run **Step 4.5** against that phase's spec, amended with
  what the previous phase taught you.
- After a phase's tasks report complete, run **Step 7** against the phase's whole slice — not each
  task's diff, because the defects that escape are the ones no single task contains.
- Then the Step 1.6 loop: verify → swarm → fix red-first → carry corrections into the next phase's
  spec → checkpoint → dispatch the next phase.

A task that cannot pass its gate after three attempts on the same finding escalates (stop
condition 1). Everything else the loop resolves on its own.

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
- **Attended:** "Found pattern: [name] ([N] instances). Reference: [file]. Should I follow this pattern?"
- **Unattended:** follow the highest-confidence pattern, state which in one line, and continue.
  Ask only if two patterns conflict and the plan does not say which governs (stop condition 4).
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

**Attended:** wait for confirmation before proceeding.
**Unattended:** record the decomposition in `slice-state.json` and proceed without waiting — the
plan already authorized this shape. Stop only if the decomposition cannot satisfy the spec's
acceptance criteria, which is stop condition 1.

### Step 4.5: Pre-implementation swarm — audit the spec BEFORE writing anything

**This runs before tests, not after.** Tests encode the spec; if the spec is wrong, the tests bake
the error in and the suite goes green around a defect. Auditing after the fact is too late.

Dispatch these agents **in parallel — one message, multiple Agent calls** — against the spec, the
issue body, the matched pattern, and the Step 4 decomposition:

- `sensei-spec-conformance-auditor` — **the primary gate.** Its second mandate is auditing the spec
  *itself*. Every identifier the spec names must exist with that exact name and kind; every path
  must match the real layout on disk; every dependency an example needs must be in the manifest;
  every assertion must target the right axis.
- `sensei-data-correctness-reviewer` — when the task computes, groups, keys, counts, or transforms
  anything: re-derive the intended values from the definition and confirm the spec's own numbers,
  denominators, and units are right.
- `sensei-failure-mode-reviewer` — when the task touches I/O, a subprocess, a multi-step mutation,
  or an error path: check that the spec actually says what happens on partial failure.

Specs have shipped real, costly errors of exactly this shape: a proposed table colliding with an
existing view; a scope named `analytics.view` where the code uses `analytics.read`; a missing
`chrono` dependency; assertions written against `.range()` where the property belongs to
`.domain()`. Each survived per-task review and propagated straight into the tests.

**Gate:** if the swarm reports a spec defect, **stop and get the spec corrected before Step 5.**
Present the defects, the correction, and confirm it. Do not "implement it as written and note the
discrepancy" — that is how the error reaches production with a green suite around it.

An agent returning `NO FINDINGS` contributes nothing; do not paraphrase it. An agent that errored is
**NOT RUN**, never a pass — say which and why. Log the outcome:
`log_event(type="spec_audit", data="{\"defects\":N,\"blocked\":true|false}")` — MANDATORY.

### Step 5: Write tests FIRST — present for approval

1. Write test cases for each pure function
2. Present tests to the user:
   "Here are the test cases for `function_a`:
    - given X → returns Y
    - given empty input → returns empty
    - given edge case → handles correctly

   Do these cover the right behavior? Anything to add?"
3. **Attended:** wait for approval. **Unattended:** proceed — but the tests must still be written
   and observed to **fail** before any implementation exists. Autonomy removes the human's approval,
   never the red step.
4. Do NOT implement until the tests exist and have been seen to fail

### Step 6: Implement

1. Write implementation to make approved tests pass
2. Run tests after each function
3. Follow the pattern from Step 3 if one was matched

### Step 7: Post-implementation swarm + commit

1. Run `/sensei:review` (auto-trigger after implementation). At **review** or **approve** depth it
   dispatches the whole-slice adversarial swarm — the counterpart to Step 4.5, now reviewing what
   was actually built rather than what was specified. Review the **whole slice**, not each task's
   own diff: the defects that escape are the ones no single hunk contains.
2. Or: check pattern conformance, duplicates, test coverage manually
3. Call `log_event(type="issue_completed", data="{\"issue\":N,\"files_modified\":[...]}")` — MANDATORY
4. Suggest `/sensei:commit` to run the zero-errors check and commit with the issue reference.

## Important

- **Plan-drive mode** delegates entirely to the `builder` skill; **single-task mode** runs Steps 3–7.
- ALL MCP calls in Steps 3–4 (single-task) are MANDATORY — do not skip, do not use fallbacks
- Decomposition (Step 4) and tests (Step 5) are **confirmed** in attended mode and **recorded** in
  unattended mode — see the autonomy contract (Step 1.5). The red-first discipline is not optional
  in either mode.
- In unattended mode, interrupt **only** on the five stop conditions. Ambiguity, complexity, a
  failing test, or a long task are work to be done, not reasons to hand the run back.
- If `match_pattern()` finds a pattern, follow it unless the user explicitly says not to
- One issue at a time — complete this before starting the next
- Ask questions conversationally, not as a survey
