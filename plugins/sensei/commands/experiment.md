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
7. Read the experiment template from `${CLAUDE_PLUGIN_ROOT}/templates/experiment.md`
8. Create a doc in `docs/experiments/` with:
   - Hypothesis: what are we testing?
   - Approach: what did we build?
   - Findings: what worked, what didn't, surprises
   - Recommendation: incorporate, modify, discard, or extend
   - Artifacts: what to keep vs discard
9. Set frontmatter: name, description, date, status: experiment, origin, branch

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
