---
name: analyze
description: Use when starting work on an unfamiliar repo or after significant changes — runs a structured codebase health check covering size, stack, complexity hotspots, and interrupted sessions.
---

# Codebase Analysis

## Overview

Structured entry point for understanding an existing repo. Produces a health report covering: symbol/file counts, stack, top complexity hotspots, interrupted work, and recommended starting points.

## Procedure

### Step 1 — Orient
```
call: get_session_context(task_description="codebase analysis")
```
Note: symbol count, file count, stack, interrupted sessions, recent decisions.

### Step 2 — Complexity report
```
call: get_complexity(limit=20, min_complexity=5)
```
Identify files and functions with high cyclomatic complexity. Flag anything > 10 as a refactor candidate.

### Step 3 — Entry points
For each top-level module in the codebase:
```
call: get_bearings("src/")
```
Map exports → callers → dependencies.

### Step 4 — Summarise findings

Produce a structured report:

```
## Codebase Health Report

**Size:** N functions across M files
**Stack:** [typescript | python | go | ...]
**Complexity hotspots:**
  - `path/to/file.ts` — max complexity: N (function: name)
  ...
**Interrupted sessions:** N (check interrupted[] for recovery context)
**Recommended starting points:** (from get_bearings results)
```

### Step 5 — Record observations
If you find architectural issues or open questions:
```
call: record_memory({ type: "question", title: "...", content: "..." })
```

## When NOT to use
- When you already have a clear task — skip straight to `context_pack(task)` + `get_symbol`
- For single-file review — use `load_context` directly

## Anti-patterns

| Anti-pattern | Fix |
|---|---|
| Reading every file in src/ | Use `get_bearings` for module-level overview |
| Grepping for all functions | Use `search(query)` |
| Skipping complexity check | High-complexity files are where bugs live |
