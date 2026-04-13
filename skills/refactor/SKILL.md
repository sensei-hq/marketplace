---
name: refactor
description: Use when improving code structure without changing behaviour — finds complexity hotspots, maps dependencies, applies targeted refactors, and verifies no regressions.
---

# Refactor Phase

## Overview

Structured approach to safe, targeted refactoring. Starts from complexity data, not intuition. Each change is scoped to the minimal blast radius.

## Procedure

### Step 1 — Identify targets
```
call: get_complexity(limit=10, min_complexity=8)
```
Pick the highest-value targets: high complexity + high call frequency.

For each candidate:
```
call: get_symbol("<function name>", depth=2)
```
Map who calls it and what it calls — this defines the blast radius.

### Step 2 — Load context
```
call: context_pack(task="refactor <function name> in <file>")
```

### Step 3 — Apply refactor

Refactor types and their rules:

| Type | Rule |
|---|---|
| **Extract function** | If a block has a clear single responsibility and is > 10 lines |
| **Reduce parameters** | If a function takes > 4 params, group related ones into an object |
| **Flatten nesting** | If complexity > 8, use early returns to reduce nesting depth |
| **Remove duplication** | Only extract if used in 3+ places |
| **Rename for clarity** | If the name doesn't match what the function does |

**Do NOT:**
- Change behaviour (even "obvious" fixes — separate PR)
- Refactor untested code without adding tests first
- Extract for the sake of DRY when < 3 uses

### Step 4 — Verify

After each refactor:
1. Run tests (zero failures required)
2. Re-check callers: `get_symbol("<refactored fn>", depth=1)`
3. Confirm complexity dropped: `get_complexity(min_complexity=1)`

### Step 5 — Record and snapshot
```
call: record_memory({ type: "pattern", title: "Refactor: <what changed>", content: "<approach used>" })
call: take_snapshot("Refactored <N> functions in <module>")
```

## Complexity Thresholds

| Score | Action |
|---|---|
| 1–5 | No action needed |
| 6–10 | Monitor; refactor if it's on the hot path |
| 11–20 | Refactor before extending |
| > 20 | Priority refactor — do not add features here |

## Anti-patterns

| Anti-pattern | Fix |
|---|---|
| Refactoring by intuition | Start from `get_complexity` data |
| Refactoring without tests | Add tests first, then refactor |
| Big-bang refactor (whole module at once) | One function at a time, verify after each |
| Changing behaviour during refactor | Separate PR for behaviour changes |
