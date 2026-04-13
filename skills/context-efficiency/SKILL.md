---
name: context-efficiency
description: Use before loading any code into a session — calls recommend_next(task) to get the minimal file scope and resolution level, preventing token bloat without sacrificing accuracy.
---

# Context Efficiency

## Overview

LLM context is finite and expensive. Load only the slice needed for the current task at the minimal resolution level that lets you complete it. Two habits prevent most token bloat: ask `recommend_next()` before loading anything, and checkpoint before switching tasks.

---

## Core Tools

| Tool | When to call | What it does |
|---|---|---|
| `get_session_context()` | Session start | Orientation — symbol count, stack, interrupted sessions, memory |
| `recommend_next(task)` | Before each task | Returns optimal files + estimated token counts |
| `context_pack(task)` | After recommend_next | Loads ranked, token-budgeted context slice for a task |
| `search(query)` | Finding symbols by name | Searches across all indexed symbols by name/signature/docstring |
| `search_code_graph(query)` | Full-text code search | Searches raw code text (when symbol search isn't precise enough) |
| `get_bearings(path)` | Exploring a module | Lists exports, imports, and callers for a file or directory |
| `get_symbol(name, depth)` | Deep symbol inspection | Loads a symbol with its call graph up to N hops |
| `checkpoint()` | Before switching tasks | Saves current state, unloads context |

---

## Resolution Levels

Code has four resolution levels. Serve the minimal level that lets you complete the task.

| Level | Format | ~Tokens | Use when |
|---|---|---|---|
| L0 — Signature | `processOrder(orderId: string): Promise<Order>` | 10 | Discovery, listing available functions |
| L1 — IO Pattern | signature + input/output types | 30 | Understanding what a function does |
| L2 — Logic Flow | Bullet steps or pseudocode | 80 | Understanding how it works |
| L3 — Full Source | Actual code | 200–2000 | Editing, debugging, modifying |

**Task → level mapping:**

```
"list available functions"          → L0 (use get_bearings)
"what does login() return?"         → L1 (use get_symbol with depth=0)
"trace the auth flow"               → L2 (use get_symbol with depth=2)
"review this file"                  → L2
"fix a bug in validateToken()"      → L3 (read the file directly)
"load context before making changes" → ask what changes first, then L0–L2
```

When the user says "load everything" or "token budget is fine" — resist. Over-loading L3 degrades reasoning quality: more noise, harder to track signal.

**Always strip at L0/L1/L2:** docstrings, import statements, dead code, commented-out blocks. These repeat what signatures already say.

---

## Session Flow

```
1. get_session_context()                ← orient (once per session)
2. recommend_next("task description")
   → returns: { files: [...], estimated_tokens: ... }
3. context_pack("task description")     ← load ranked context slice
4. work on task
5. need a specific symbol? → get_symbol("functionName", 1)
6. need to explore a module? → get_bearings("src/auth/")
7. task done
8. checkpoint()                         ← save + unload
9. recommend_next("next task")
10. load new slice
```

---

## Context Loading Rules

- **Start narrow** — use `recommend_next()` before deciding what to load
- **Search first** — use `search(query)` to locate symbols before reading files
- **Scope by feature** — load `src/payments/` not `src/`
- **Never load test files** unless writing or debugging tests

## Checkpoint Protocol

Call `checkpoint()` when:
- Switching to a different module or feature area
- About to load a large context slice
- At the end of a task before starting the next

Checkpoint stores: current task description, files loaded, decisions made, next recommended action.

**Never skip checkpoint even when the user says "don't bother."** Checkpoint cost is ~1 tool call. Losing task state costs minutes of re-derivation.

---

## Anti-Patterns

| Anti-pattern | Fix |
|---|---|
| Loading entire `src/` at session start | Call `get_session_context()`, then `recommend_next(task)` |
| Keeping previous task's files in context | Call `checkpoint()` before switching |
| Loading L3 for every file in scope | Load L0/L1 first, escalate only where needed |
| Re-reading the same file multiple times | Load once, keep in context for the task duration |
| Using Glob + Read to explore a new module | Use `get_bearings("src/module/")` |
| Loading L3 to understand what a function does | Use `get_symbol(name, 0)` instead — 98% token reduction |
| Treating "quick look" as permission to skip protocol | A context switch is a context switch. Still: checkpoint → recommend_next → load targeted slice. |
| Searching with grep across the repo | Use `search(query)` or `search_code_graph(query)` |
