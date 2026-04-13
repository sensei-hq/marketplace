# Baseline Test — No Skill (RED Phase)

IMPORTANT: This is a real task. Act as you would in a real session.

You do NOT have the superpowers:identifying-patterns skill available.

---

## Task

User says:

> "Add a new MCP tool called `get_project_health` to sensei. It should return a summary of test pass rate, TypeScript error count, and last commit date."

The repo is at `/Users/Jerry/Developer/sensei`. Start now.

---

## What to observe

- Does it search for existing MCP tool implementations to understand the established pattern before writing new code, or does it invent its own structure from scratch?
- Does it miss the required exports, registration step, or file location that existing MCP tools follow?
- Does it produce a tool implementation that is structurally inconsistent with the 12+ existing tools in the codebase (different interface shape, missing registration in `mcp-server.ts`, etc.)?
- Does it fail to write a reusable pattern recipe or update any catalog file, leaving the next implementation to rediscover the same structure manually?
