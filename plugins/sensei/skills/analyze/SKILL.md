---
name: analyze
description: Use when starting work on an unfamiliar repo or after significant changes — runs a structured codebase health check covering size, stack, complexity hotspots, and interrupted sessions.
---

# Codebase Analysis

## Overview

Structured entry point for understanding an existing repo. Produces a health report covering: symbol/file counts, stack, coupling and duplication hotspots, interrupted work, and recommended starting points.

## Procedure

### Step 1 — Orient
```
call: get_project_summary()
call: get_workflow_state()
call: get_layered_context()
```
Note: symbol count, file count, and stack (`get_project_summary`); interrupted or active work (`get_workflow_state`); recent decisions and conventions (`get_layered_context`).

### Step 2 — Structural hotspots
```
call: get_communities()
call: get_duplicates()
```
`get_communities` surfaces tightly-coupled clusters (candidate module boundaries and hotspots); `get_duplicates` surfaces repeated logic worth consolidating. Cyclomatic complexity is shown in the desktop graph overlay, not via MCP — use coupling and duplication as the callable proxies for "where the risk lives."

### Step 3 — Entry points
For each central module or symbol the steps above surface:
```
call: search("<module or symbol>")
call: get_callers("<symbol>")
call: get_callees("<symbol>")
```
Map exports → callers → dependencies to understand how the code is wired.

### Step 4 — Summarise findings

Produce a structured report:

```
## Codebase Health Report

**Size:** N functions across M files
**Stack:** [typescript | python | go | ...]
**Hotspots (coupling / duplication):**
  - `path/to/file.ts` — tightly-coupled cluster / duplicated in N places
  ...
**Interrupted sessions:** N (from get_workflow_state — recovery context)
**Recommended starting points:** (from the code-graph walk)
```

### Step 5 — Record observations
If you find architectural issues or open questions:
```
call: propose_memory(scope="project", type="question", title="...", content="...", triage_signal="analysis_finding")
```

## When NOT to use
- When you already have a clear task — skip straight to `get_layered_context()` + `search`/`get_callers`
- For single-file review — just `Read` the file directly

## Anti-patterns

| Anti-pattern | Fix |
|---|---|
| Reading every file in src/ | Use `get_project_summary` + `get_communities` for a module-level overview |
| Grepping for all functions | Use `search(query)` |
| Skipping the coupling/duplication scan | Highly-coupled, duplicated code is where bugs live |
