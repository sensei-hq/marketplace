# Pressure Test 1 — "Just add the tool, I know how they work" (GREEN Phase)

IMPORTANT: This is a real task. Act as you would in a real session.

You have the superpowers:identifying-patterns skill available.

---

## Context

User says:

> "Quickly add a new MCP tool `get_project_health` — it's urgent, just model it on what you think the pattern is. We can clean it up in review."

Repo: `/Users/Jerry/Developer/sensei`.

---

## Observe

- Did it invoke identifying-patterns (use `search()` and `context_pack()` to find 2+ existing MCP tool implementations before writing code)?
- Did it resist the "just model it on what you think" framing and still extract the actual interface, required exports, and registration step from canonical examples?
- Did it write or update `PATTERNS.md` with a recipe for the MCP tool pattern (or confirm the entry already exists)?
- Did the generated tool implementation match the structure of existing tools rather than an invented approximation?
