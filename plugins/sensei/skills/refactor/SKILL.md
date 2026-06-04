---
name: refactor
description: Use when improving code structure without changing behaviour — finds complexity hotspots, maps dependencies, applies targeted refactors, and verifies no regressions.
---

# Refactor Phase

## Overview

Structured approach to safe, targeted refactoring. Starts from the code graph, not intuition. Each change is scoped to the minimal blast radius.

## Procedure

### Step 1 — Identify targets
```
call: get_duplicates()
call: get_communities()
```
Pick the highest-value targets: duplicated logic and tightly-coupled clusters. For each candidate, map the blast radius:
```
call: search("<function name>")
call: get_callers("<function name>")
call: get_callees("<function name>")
```
Who calls it and what it calls defines how far a change reaches.

### Step 2 — Load context
```
call: get_layered_context()
```
Then `Read` the target file(s) so you refactor against the real implementation, not a summary.

### Step 3 — Apply refactor

Refactor types and their rules:

| Type | Rule |
|---|---|
| **Extract function** | If a block has a clear single responsibility and is > 10 lines |
| **Reduce parameters** | If a function takes > 4 params, group related ones into an object |
| **Flatten nesting** | If nesting is deep, use early returns to reduce branching |
| **Remove duplication** | Only extract if used in 3+ places (confirm with `get_duplicates`) |
| **Rename for clarity** | If the name doesn't match what the function does |

**Do NOT:**
- Change behaviour (even "obvious" fixes — separate PR)
- Refactor untested code without adding tests first
- Extract for the sake of DRY when < 3 uses

### Step 4 — Verify

After each refactor:
1. Run the project's test command (zero failures required)
2. Re-walk callers: `get_callers("<refactored fn>")` — confirm nothing downstream broke
3. Confirm the blast radius shrank — duplication gone (`get_duplicates`), coupling reduced

### Step 5 — Record and checkpoint
```
call: propose_memory(scope="project", type="pattern", title="Refactor: <what changed>", content="<approach used>", triage_signal="repeat_pattern")
call: log_event(type="checkpoint", data="{\"summary\":\"Refactored <N> functions in <module>\"}")
```

## Complexity Thresholds

Assess branching by reading the function (cyclomatic complexity isn't a callable tool — it's the desktop graph overlay). Use these thresholds as judgment:

| Score | Action |
|---|---|
| 1–5 | No action needed |
| 6–10 | Monitor; refactor if it's on the hot path |
| 11–20 | Refactor before extending |
| > 20 | Priority refactor — do not add features here |

## Anti-patterns

| Anti-pattern | Fix |
|---|---|
| Refactoring by intuition | Start from `get_duplicates` / `get_communities` + the call graph |
| Refactoring without tests | Add tests first, then refactor |
| Big-bang refactor (whole module at once) | One function at a time, verify after each |
| Changing behaviour during refactor | Separate PR for behaviour changes |
