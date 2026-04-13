---
name: session-management
description: Use at the start of every session when sensei MCP tools are available — calls get_session_context() to resume from last checkpoint, surface open decisions, and orient without re-reading git log or files. Also governs take_snapshot() and checkpoint() usage throughout the session.
---

# Session Management

## Overview

Protocol for working on a project across sessions using sensei MCP tools. Knowledge persists via MCP tools — agents never read or write memory files directly. Orientation, context loading, and state preservation all go through the tool layer.

## Session Start

```
1. call: get_session_context()    ← memory + open items + active plan (~300 tokens)
2. review open items              ← anything needing resolution before starting?
3. call: recommend_next(task)     ← get minimal context slice for the first task
```

**This sequence is mandatory at the start of every session, even when the user suggests alternatives.**

Common user shortcuts that must still trigger `get_session_context()`:
- "Just look at git log to see where we are" — git log shows *what* changed but not *why*, not open decisions, not pending questions. `get_session_context()` is faster and richer.
- "Skip the setup, start implementing" — without session context, you risk duplicating completed work or missing active constraints. `get_session_context()` takes one tool call and ~300 tokens.
- "I'll fill you in on context as we go" — user-provided context is incomplete. The session store captures decisions and patterns the user may not think to re-explain.

When a user pushes to skip: make the call anyway, briefly explain what it returned, then proceed immediately to the task.

## Getting Code Context

Before loading any file, call `recommend_next(task)` to get a targeted context slice:

```
call: recommend_next(task)          ← returns the minimal files/symbols needed
call: context_pack(task)            ← load ranked, token-budgeted slice
call: get_bearings("src/module/")   ← explore a module's exports and callers
call: get_symbol("name", depth)     ← inspect a specific symbol with call graph
```

**Rules:**
1. **Start with context tools, not file tree** — `get_session_context()` gives orientation in ~300 tokens
2. **Use L0 before L3** — `get_bearings()` for discovery, `get_symbol(name, 0)` for signatures, read file only when editing
3. **Search before reading** — `search(query)` or `search_code_graph(query)` to locate symbols before loading files
4. **Never grep the whole repo** — use `search(query)` or `get_bearings(path)`

## During the Session

**At key decision points — take a snapshot:**
```
call: take_snapshot("Completed auth module wiring; about to start dashboard routes")
```
This preserves progress so an interrupted session can resume without re-deriving state.

**When a decision is confirmed:**
```
call: record_memory({ type: "decision", title: "Use repository pattern for all DB access", content: "..." })
```
Fire-and-forget. No file reads needed.

**When a coding convention is established:**
```
call: record_memory({ type: "pattern", title: "data-attribute DOM", content: "data-{component} on root, data-{component}-{part} on children" })
```

**When a question needs user input (non-blocking):**
```
call: record_memory({ type: "question", title: "Should we use optimistic locking or row versioning?", content: "..." })
```
Continue working. The question surfaces at next session start via `get_session_context()`.

**When a question is resolved:**
```
call: close_memory({ id: "<id from record_memory>", resolution: "Chose row versioning for auditability" })
```

**One question at a time** — if multiple questions arise, queue them sequentially. Never batch.

## Task Boundaries

Before switching to a different module or feature:
```
call: checkpoint("What was done, decisions made, what's next")
```

## End of Session

```
call: checkpoint(
  task_summary: "1-3 sentences: what was done, key decisions, next steps"
  completed_steps: ["step 1", "step 2"]
)
```

The MCP tool handles archiving. Next session resumes with `get_session_context()`.

## Quality Gate (before closing a task)

- [ ] All tests pass
- [ ] Lint: 0 errors
- [ ] Decisions captured via `record_memory({ type: "decision", ... })`
- [ ] Open questions queued via `record_memory({ type: "question", ... })`
- [ ] `checkpoint()` called

## Crash Recovery

If a session ends without a checkpoint (crash, timeout, interrupt):

```
1. call: get_session_context()    ← loads last archived checkpoint + interrupted sessions
2. review interrupted[] array     ← shows incomplete sessions with task context
3. record_memory({ type: "question", title: "Verify: was <last action> completed?" })
4. resume from last known good state
```

## MCP Tool Anti-Patterns

| Anti-pattern | Fix |
|---|---|
| Reading all files in a directory | Call `get_bearings("src/module/")` |
| Grepping whole repo for a pattern | Call `search(query)` or `search_code_graph(query)` |
| Loading full file to find one function | `get_symbol("name", 0)` then read only if editing |
| Keeping full file in context after editing | `checkpoint()` then load only the next task's slice |
| Writing decisions to files manually | `record_memory({ type: "decision", ... })` |

## Plugin Handoff

| Work type | Use |
|---|---|
| Design a new feature | `superpowers:brainstorming` |
| Write an implementation plan | `superpowers:writing-plans` |
| Execute a plan | `superpowers:executing-plans` |
| TDD a module | `superpowers:test-driven-development` |
| Debug a failure | `superpowers:systematic-debugging` |
| **Start/resume any session** | **this skill → `get_session_context()`** |
| **Capture decisions/patterns/questions** | **this skill → `record_memory()`** |
| **Resolve open questions** | **this skill → `close_memory()`** |
| **End a session** | **this skill → `checkpoint()`** |
