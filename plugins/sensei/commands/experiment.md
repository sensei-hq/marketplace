---
description: Try an approach — build a minimal prototype, document findings. Code is discardable.
argument-hint: What to experiment with (e.g. "RxJS for real-time", "Kuzu graph queries")
---

## What this command does

Test an assumption by building a minimal prototype. Code is structured for potential incorporation but is considered discardable. Produces a findings document with a recommendation.

## Procedure

1. Call `update_phase(phase="experiment")` — MANDATORY
2. Call `log_event(type="command_invoked", data="{\"command\":\"experiment\",\"args\":\"$ARGUMENTS\"}")` — MANDATORY
3. Read `.sensei/rules.md` if it exists — follow project rules
4. If $ARGUMENTS is empty, ask: "What assumption do you want to test?"
5. Create a git branch for the experiment: `git checkout -b experiment/<name>`
6. Build the minimal prototype — just enough to test the hypothesis
7. Create a doc in `docs/experiments/` with this structure:

````markdown
---
title: <short title>
description: <one line — what assumption or approach is being tested>
type: experiment
status: experiment
created: <YYYY-MM-DD>
branch: <git branch, if any>
depends_on: []        # the idea or blueprint that motivated this
related_issues: []
references: []        # code, files, or libraries the experiment exercises
---

# <Title>

## Objective
The hypothesis: what we believe, what we're testing, what success looks like.

## Approach
What we built — minimal, just enough to test the hypothesis.

## Constraints
Time box, scope limits, what we're NOT trying to prove.

## Findings
What worked, what didn't, and any surprises.

## Recommendation
- [ ] Incorporate — viable, proceed
- [ ] Modify — partially viable (what to change)
- [ ] Discard — not viable (why)
- [ ] Extend — needs more testing (what's unknown)

## Artifacts
| Artifact | Location | Keep? |
|----------|----------|-------|
````

## Nudges

- If the experiment succeeds: "Viable — ready for `/sensei:analyze` to design the full solution?"
- If it fails: "Not viable. The findings doc is preserved for future reference."
- If it's unclear: "Needs more testing — should we extend this experiment?"

## Important

- Experiments ARE allowed to write code — this is the one phase where code is expected
- But code should be minimal — just enough to test the hypothesis
- Structure code for potential incorporation (not throwaway spaghetti)
- The findings doc is the primary output, not the code
- All MCP calls are MANDATORY
