---
description: Resume session — calls get_session_context() and surfaces open decisions
---

Call `get_session_context(task_description="session startup")`.

Then:
1. Review any open decisions or interrupted work it returns
2. Call `recommend_next(task)` if you're about to start a specific task
3. Report back to the user: what's in progress, what's pending, any blockers
