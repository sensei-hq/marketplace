---
name: Mindsets
description: Three mindsets for quality AI-assisted development — analyst, developer, business acceptance tester
---

# Mindsets

Apply these in sequence: Analyst → Developer → BAT. Each catches what the previous doesn't.

## Analyst mindset

Before designing or building anything, understand the problem:

1. **What problem are we solving?** — State the problem in the user's words, not technical terms. If you can't explain it simply, you don't understand it yet.
2. **Who benefits and how?** — Which user persona? What changes for them? What's the before/after?
3. **What are the constraints?** — Budget, time, technical limitations, dependencies. What's off the table?
4. **What are the acceptance criteria?** — How does the user know this is done? Not "tests pass" — what does the user observe?
5. **What are the edge cases?** — What happens with empty input, missing data, concurrent access, first-time use, migration from prior state?
6. **What are we NOT building?** — Scope boundaries prevent creep. Explicitly state what's out of scope.

If requirements are unclear, surface the ambiguity. Do not fill gaps with assumptions — ask.

## Developer mindset

Before writing any code or creating any file, answer these questions:

1. **Where does this run?** — Which process, which machine, which path? Plugin files run from `${CLAUDE_PLUGIN_ROOT}`, not the repo. Daemon code runs in the background service. Hooks run in bash with no MCP access.
2. **Who reads this?** — The AI? A hook script? A desktop app? A daemon? Each has different access patterns.
3. **How does it get there?** — Is it installed via plugin? Built by a compiler? Copied by a script? If the answer is unclear, the file is in the wrong place.
4. **What happens when it's missing?** — Graceful degradation or hard failure? What's the user experience?
5. **How do I verify it works?** — What test proves this is correct? If you can't describe the test, you don't understand the implementation well enough.

When in doubt, ask. Do not assume. A question costs one turn. A wrong assumption costs a rewrite.

## Business acceptance tester mindset

After implementation, verify from the user's perspective — not just "does the code work" but "does this deliver value":

1. **Walk the user journey** — Start from the trigger (user types a command, session starts, context compacts). Follow every step. Does it flow naturally?
2. **Test the happy path end-to-end** — Not unit by unit. The full flow: input → processing → output → side effects. Does the user see the right result?
3. **Test the first-time experience** — No config, no state, no prior sessions. What happens? Is it helpful or confusing?
4. **Test the failure path** — Service down, connection lost, file missing, permissions wrong. Does the user get a clear message or a silent failure?
5. **Test the correction path** — User says "that's wrong." Does the system learn? Is the correction captured? Will it be different next time?
6. **Verify against acceptance criteria** — Go back to the issue. Read each criterion. Is it met? Not "probably" — demonstrate it.
7. **Check for regressions** — Did this change break something that was working? Run the full suite, not just the new tests.
