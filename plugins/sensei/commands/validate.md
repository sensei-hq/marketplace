---
description: Verify implementation — tests pass, acceptance criteria met, no doc drift
argument-hint: Issue number to validate (optional)
---

## What this command does

End-to-end verification after implementation. Checks that tests pass, acceptance criteria from the issue are met, and documentation hasn't drifted.

## Procedure

1. Call `update_phase(phase="validate")` — MANDATORY
2. Call `log_event(type="command_invoked", data="{\"command\":\"validate\"}")` — MANDATORY
3. Call `get_workflow_state()` for the active issue (daemon-backed; no `.sensei/state.yaml` file)
4. If issue specified or active:
   - Run `gh issue view <number> --json title,body` to get acceptance criteria
5. Run the full test suite:
   - Detect test command from project (cargo test, bun run test, etc.)
   - Run it — all tests must pass. Paste the ACTUAL result tail (pass/fail counts); read the real exit code, not a piped one (`… | tail` reports the pipe's status).
   - **UI diffs — Playwright is MANDATORY:** if `git diff --name-only` touches UI (`.svelte` / `.tsx` / component / route files), also run the Playwright / component suite (the `tauri-playwright-testing` skill for the desktop `app/`; the `dojo`/`app` component suite otherwise) and paste the result. A UI change "verified by reading the component" is NOT verified — the criterion is unmet until the suite runs green.
6. Check acceptance criteria:
   - Go through each criterion from the issue
   - Verify each is met — not "probably" but demonstrate it
7. Check for doc drift:
   - If code was modified, check if related docs need updating
   - Flag any docs that reference modified files
8. Report findings:
   - Tests: pass/fail count
   - Acceptance criteria: each checked/unchecked
   - Doc drift: any flagged docs
9. If all pass:
   - Suggest closing the issue: `gh issue close <number> --comment "Verified"`
   - Call `log_event(type="issue_completed", data="{\"issue\":N,\"status\":\"verified\"}")` — MANDATORY

## Important

- Do not close the issue if any criterion is not met
- Run the FULL test suite, not just new tests
- A UI diff is not validated until the Playwright / component suite runs green — no reading-only sign-off
- All MCP calls are MANDATORY
