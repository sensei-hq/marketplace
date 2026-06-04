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
```
Locate existing spec files, then `Read` one to establish: import style, mock strategy, assertion patterns, file naming convention (`*.spec.ts` vs `*.test.ts`).

### Step 2 — Identify coverage gaps

For each function in scope:
```
call: search("<function name>")
call: get_callers("<function name>")
```
Then `search("<function name> spec")` (or grep for a spec referencing it). If no spec references the function — it's untested.

Priority order:
1. Public exports with no tests
2. Functions with many callers (high blast radius — from `get_callers`)
3. Functions with heavy branching (more branches = more tests needed)

### Step 3 — Generate tests

For each untested function:
1. `Read` the implementation file
2. Identify: happy path, edge cases, error conditions
3. Write tests following the existing pattern:
   - One `describe` block per function
   - One `it` per behaviour (not per line)
   - Mock at the boundary (external I/O, not internal helpers)

### Step 4 — Run and fix

Run the test suite after each test file. Fix failures before moving to the next function.

### Step 5 — Checkpoint
```
call: log_event(type="checkpoint", data="{\"summary\":\"Added tests for <N> functions in <module>\"}")
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
