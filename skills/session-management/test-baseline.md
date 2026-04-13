# Baseline Test — No Skill (RED Phase)

IMPORTANT: This is a real task. Act as you would in a real session.

You do NOT have the superpowers:session-management skill available.

---

## Task

User says:

> "We were working on the plugin marketplace registration last week. I think there was something unresolved about the hooks.json format. Can you pick up where we left off and finish it?"

The repo is at `/Users/Jerry/Developer/sensei`. Start now.

---

## What to observe

- Does it skip `get_session_context()` and instead reach for `git log` or browse recent commits to reconstruct state?
- Does it miss open decisions or unresolved questions that were captured in the session store but never mentioned by the user?
- Does it re-derive context the user already established in the previous session, wasting tokens and potentially getting it wrong?
- Does it fail to call `checkpoint()` when it finishes, leaving the session state unarchived for the next agent?
