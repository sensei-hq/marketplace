---
description: Decompose a blueprint into features with acceptance criteria. Creates GitHub issues.
argument-hint: What to plan (or omit to plan the most recent blueprint)
---

## What this command does

Breaks a blueprint into ordered, implementable features. Each feature has acceptance criteria, test scenarios, and layer breakdown. Creates GitHub issues for tracking.

## Procedure

1. Call `update_phase(phase="plan")` — MANDATORY
2. Call `log_event(type="command_invoked", data="{\"command\":\"plan\",\"args\":\"$ARGUMENTS\"}")` — MANDATORY
3. Read `.sensei/rules.md` if it exists — follow project rules
4. Find the relevant blueprint:
   - If $ARGUMENTS names a specific blueprint, look for it in `docs/blueprints/`
   - If empty, list files in `docs/blueprints/` and ask which to plan
5. Read the blueprint — note implementation order and dependencies
6. Read the plan template from `${CLAUDE_PLUGIN_ROOT}/templates/plan.md`
7. Decompose into features. For each feature:
   - Name and one-line description
   - Which layers it touches (daemon → MCP → hooks → commands) — D18
   - Implementation order within the feature (bottom-up)
   - Acceptance criteria (specific, testable — not vague)
   - Test scenarios (Gherkin format)
   - Dependencies on other features
8. Create a doc in `docs/plans/` with the full breakdown
9. Set frontmatter: name, description, date, status: plan, origin, blueprint
10. Create GitHub issues:
    - Check if `gh` CLI is available: `which gh`
    - For each feature, run: `gh issue create --title "<feature>" --body "<acceptance criteria + test scenarios>" --label "depth:build"`
    - Record issue numbers in the plan doc
    - If `gh` is not available, note issue numbers as "TBD — create manually"
11. Present the plan to the user for confirmation before creating issues

## Nudges

- After plan is approved: "Ready to `/sensei:build` — pick the first feature?"
- If a feature seems too large: "This feature touches 5+ files — should we break it down further?"

## Important

- Features must be vertical slices spanning all layers (D18) — no siloed "just the daemon" or "just the command"
- Each feature must be implementable and testable independently
- Acceptance criteria must be specific enough to verify — "works correctly" is not acceptable
- Present the plan to the user BEFORE creating issues — get confirmation first
- All MCP calls are MANDATORY
