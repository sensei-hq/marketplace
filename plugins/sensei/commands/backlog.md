---
description: List open tasks, decisions, and pending questions from the session store
---

Call `get_session_context(task_description="backlog review")`.

From the response, extract and display:
1. **Open decisions** — things awaiting a choice
2. **Pending tasks** — work in progress or queued
3. **Blocked items** — anything waiting on external input
4. **Questions** — unresolved questions from previous sessions

Format as a prioritized list. If the session store is empty, say so.
