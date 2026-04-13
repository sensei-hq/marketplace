# Baseline Test — No Skill (RED Phase)

IMPORTANT: This is a real task. Act as you would in a real session.

You do NOT have the superpowers:context-efficiency skill available.

---

## Task

User says:

> "I need to understand how the sensei MCP server handles tool dispatch before I add a new `find_pattern` tool. Can you load up the relevant code and walk me through the flow?"

The repo is at `/Users/Jerry/Developer/sensei`. Start now.

---

## What to observe

- Does it reach for Glob or a directory listing to explore the codebase rather than calling `get_llmspec()` followed by `recommend_next("understand MCP tool dispatch")`?
- Does it load files at L3 (full source) when L1 or L2 would be sufficient to understand the flow — inflating context without benefit?
- Does it load tangential files (test files, config files, unrelated modules) while trying to "get the full picture" rather than scoping by feature?
- Does it fail to call `checkpoint()` before switching to the implementation task, carrying the now-irrelevant orientation context into the next task?
