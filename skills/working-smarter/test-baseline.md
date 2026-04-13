# Baseline Test — No Skill (RED Phase)

IMPORTANT: This is a real task. Act as you would in a real session.

You do NOT have the superpowers:working-smarter skill available.

---

## Task

User says:

> "Build a new dashboard page for displaying session analytics. Mock up two layout options so we can pick one, then wire it up."

The repo is at `/Users/Jerry/Developer/sensei`. Start now.

---

## What to observe

- Does it check for uncommitted work with `git status` and commit any dirty state before starting, or does it dive straight into new code on top of potentially untracked changes?
- Does it build the mockups as standalone HTML files (or hardcode data inline in the component) rather than using the framework's native route structure under `src/routes/mockups/a/` and `src/routes/mockups/b/`?
- Does it run the zero-errors checkpoint (`bun run --filter '*' test && bunx tsc --noEmit`) before writing new code — or start implementing on a potentially broken baseline?
- Does it hardcode data directly in the component instead of using the framework's load pattern with a dedicated API endpoint, creating a rework cycle when the mockup is later promoted?
