---
name: test-gen
description: Use when adding test coverage to untested or under-tested code — finds coverage gaps, generates focused unit tests following existing patterns, and verifies they pass.
---

# Test Generation

## Overview

Systematic test coverage from existing code patterns. Finds untested functions, maps their behaviour from implementation, and generates tests that match the project's testing conventions.

## Procedure

### Step 1 — Find the test pattern
```
call: search("describe it expect")
call: get_bearings("<module to test>")
```
Read one existing spec file to establish: import style, mock strategy, assertion patterns, file naming convention (`*.spec.ts` vs `*.test.ts`).

### Step 2 — Identify coverage gaps

For each function in scope:
```
call: get_symbol("<function name>", depth=0)
call: search_code_graph("<function name>.spec")
```
If no spec file references the function — it's untested.

Priority order:
1. Public exports with no tests
2. Functions with complexity > 5 (more branching = more tests needed)
3. Functions on critical paths (many callers)

### Step 3 — Generate tests

For each untested function:
1. Load implementation: `load_context("<file path>")`
2. Identify: happy path, edge cases, error conditions
3. Write tests following the existing pattern:
   - One `describe` block per function
   - One `it` per behaviour (not per line)
   - Mock at the boundary (external I/O, not internal helpers)

### Step 4 — Run and fix

Run the test suite after each test file. Fix failures before moving to the next function.

### Step 5 — Checkpoint
```
call: checkpoint(task_summary="Added tests for <N> functions in <module>")
```

## Test Quality Rules

- **One assertion per test** (unless they're a logical unit)
- **Name describes behaviour**, not implementation: `"returns null when user not found"` not `"tests getUserById"`
- **Mock at boundaries only**: database, HTTP, filesystem — not internal pure functions
- **No `any` in test code** — use proper types or create test fixtures

## Anti-patterns

| Anti-pattern | Fix |
|---|---|
| Testing implementation details | Test observable behaviour (inputs → outputs) |
| Mocking everything | Only mock I/O boundaries |
| Writing tests that can't fail | Include at least one negative case per function |
| Skipping edge cases | Check: null/undefined inputs, empty arrays, error paths |
