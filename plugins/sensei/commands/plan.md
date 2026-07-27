---
description: Decompose a blueprint into features with acceptance criteria. Creates GitHub issues.
argument-hint: What to plan (or omit to plan the most recent blueprint)
---

## What this command does

Breaks a blueprint into ordered, implementable features. Each feature has acceptance criteria, test scenarios, and layer breakdown. Creates GitHub issues for tracking.

## Modes

- **Automated-run mode** — when the goal is for an autonomous run you'll hand to `/sensei:build`
  (a plan **graph** with per-task agent/model/spec-ref, registered to Dōjō): invoke the **`planner`**
  skill and follow it instead of the GitHub-issue flow below. It produces a machine-executable graph
  under `docs/plan/<plan-id>/` and registers it via `register_plan`. Planning needs analysis first —
  if there's no analysis/design doc for the objective, run `/sensei:analyze` first.
- **Human-tracked mode** (the procedure below) — decompose a blueprint into features + GitHub issues
  for a person to pick up.

## Procedure

1. Call `update_phase(phase="plan")` — MANDATORY
2. Call `log_event(type="command_invoked", data="{\"command\":\"plan\",\"args\":\"$ARGUMENTS\"}")` — MANDATORY
3. Read `.sensei/rules.md` if it exists — follow project rules
4. Find the relevant blueprint:
   - If $ARGUMENTS names a specific blueprint, look for it in `docs/blueprints/`
   - If empty, list files in `docs/blueprints/` and ask which to plan
5. Read the blueprint — note implementation order and dependencies
6. Create a doc in `docs/plans/` with this structure:

````markdown
---
title: <short title>
description: <one line — what is being decomposed into work>
type: plan
status: plan
created: <YYYY-MM-DD>
depends_on:           # the blueprint this plan implements
  - docs/blueprints/<file>.md
related_issues: []    # GitHub issue numbers, filled in after creation
references: []
milestone: <GitHub milestone, if any>
---

# <Title>

## Objective
What blueprint this decomposes and the scope of the plan.

## Features
### Feature 1: <name>
- **Issue:** #<number> (once created)
- **Layers:** daemon → MCP → hooks → commands (D18) — list those touched, bottom-up
- **Depends on:** <other features>
- **Acceptance criteria:** specific, testable bullets (not "works correctly")
- **Test scenarios:** Gherkin (Given / When / Then)

## Dependency graph
Which features block which (mermaid or list).
````

   Each feature must be a vertical slice (spans all layers, D18), independently implementable and testable.
7. Create GitHub issues:
   - Check if `gh` CLI is available: `which gh`
   - For each feature, run: `gh issue create --title "<feature>" --body "<acceptance criteria + test scenarios>" --label "depth:build"`
   - Record issue numbers back into the plan doc's `related_issues` frontmatter
   - If `gh` is not available, note issue numbers as "TBD — create manually"
8. Present the plan to the user for confirmation BEFORE creating issues

## Nudges

- After plan is approved: "Ready to `/sensei:build` — pick the first feature?"
- If a feature seems too large: "This feature touches 5+ files — should we break it down further?"

## Important

- Features must be vertical slices spanning all layers (D18) — no siloed "just the daemon" or "just the command"
- Each feature must be implementable and testable independently
- Acceptance criteria must be specific enough to verify — "works correctly" is not acceptable
- Present the plan to the user BEFORE creating issues — get confirmation first
- All MCP calls are MANDATORY
