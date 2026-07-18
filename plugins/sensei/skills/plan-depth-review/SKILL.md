---
name: plan-depth-review
description: Use before starting an autonomous or unattended run against a plan — applies the depth bar (observable acceptance criteria · inputs/outputs/deps · no TBDs · resolved ambiguities · explicit scope · goal alignment) so gaps are fixed upstream instead of stalling the run at 3am.
---

# Plan depth review — the depth bar

## Overview

An autonomous run can't ask a human mid-execution. So the plan it runs must be
**deep enough to build without asking**. This skill applies the *depth bar*: a
pre-flight standard every feature in the plan must clear before the run starts.
Shallow plans turn each ambiguity into a stall (waiting on someone asleep) or a
wrong guess — the depth bar fixes unknowns upstream.

Run this whenever you're about to hand a plan to a daemon-owned run, a `/loop`,
or any unattended multi-feature execution — and whenever you finish drafting a
plan and want it run-ready.

## The bar — every feature must clear all six

1. **Observable acceptance criteria** — what someone *observes* when it's done
   (a value, a screen state, a command's output, a row). Never "tests pass" /
   "it works" / "implement X". At least one criterion executable or visible.
2. **Inputs / outputs / dependencies defined** — what it consumes, produces, and
   needs to exist first. No dependence on an unbuilt/unnamed thing.
3. **No unresolved `TBD`** — no `TBD`/`???`/"decide later"/placeholder counts
   that nothing in the plan resolves (a TDD red-phase stub with a named
   implementation step is not a TBD).
4. **Ambiguities pre-answered** — every open fork ("A or B") resolved to one
   choice before the run.
5. **Explicit scope** — states what it does AND what it deliberately does not.
6. **Goal-aligned (D13)** — advances the run's stated objective; locally-fine
   but drifting = a failure, not a pass.

Plus, plan-level: the **goal is stated and singular**, **dependency ordering** is
sane (no feature depends on a later one), and **irreversible/external steps**
(deploy, publish, migration, delete) expect to halt for a human.

## Procedure

### Step 1 — Establish the goal
Identify the single objective the run is anchored to. If the plan has no clear
goal — or several competing ones — stop: that's the first fix. Every per-feature
goal-alignment check depends on it.

### Step 2 — Delegate the grading to the reviewer agent
Launch the **`sensei-plan-depth-reviewer`** agent on the plan (pass the goal if
you have it). It reads the plan (and its linked docs, and the real codebase via
sensei MCP where a claim needs checking), grades each feature against the six
criteria, and returns a verdict + per-feature punch list.

```
Agent(subagent_type="sensei-plan-depth-reviewer",
      prompt="Depth-review <plan path>. Run goal: <objective>.")
```

### Step 3 — Act on the verdict
- **ready-to-run** — every feature clears the bar; safe to start the run.
- **needs-depth** — apply the must-fix list (tighten acceptance criteria,
  resolve the named forks, add scope lines), then re-review.
- **not-ready** — the plan lacks a goal, has many gappy features, or leaves an
  ambiguity on an irreversible step. Do NOT start an unattended run; deepen the
  plan first.

### Step 4 — Only then start the run
A run launched over a plan that hasn't cleared the bar will either stall waiting
on a human or guess wrong. Clearing the bar first is what makes "asking rare."

## When NOT to use

- A trivial single-step task with an obvious observable outcome (the bar is for
  multi-feature *unattended* work).
- Interactive work where a human is present to answer a fork as it arises — there
  the cost of a shallow spot is a quick question, not a stalled overnight run.
