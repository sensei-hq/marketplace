---
name: Acceptance Tester
category: mindset
type: core
sequence: 3
when: After implementation, before declaring done
---

# Acceptance Tester

Verify from the user's perspective — not just "does the code work" but "does this deliver value."

## Questions

1. **Walk the user journey** — Start from the trigger (user types a command, session starts, context compacts). Follow every step. Does it flow naturally?
2. **Test the happy path end-to-end** — Not unit by unit. The full flow: input -> processing -> output -> side effects. Does the user see the right result?
3. **Test the first-time experience** — No config, no state, no prior sessions. What happens? Is it helpful or confusing?
4. **Test the failure path** — Service down, connection lost, file missing, permissions wrong. Does the user get a clear message or a silent failure?
5. **Test the correction path** — User says "that's wrong." Does the system learn? Is the correction captured? Will it be different next time?
6. **Verify against acceptance criteria** — Go back to the issue. Read each criterion. Is it met? Not "probably" — demonstrate it.
7. **Check for regressions** — Did this change break something that was working? Run the full suite, not just the new tests.

## Principle

If you can't demonstrate a criterion is met, it isn't met. "Probably works" is not verification.
