---
description: Quality check — pattern conformance, duplicates, test coverage, doc drift
argument-hint: Optional scope (e.g. "modified files" or "all")
---

## What this command does

Checks code quality across multiple dimensions. Auto-triggered after `/sensei:build` features. Also available on demand.

## Procedure

1. Call `update_phase(phase="review")` — MANDATORY (only if not already in a review triggered by /sensei:build)
2. Call `log_event(type="command_invoked", data="{\"command\":\"review\"}")` — MANDATORY
3. Read `.sensei/rules.md` — rules inform what to check

### Check 1: Pattern conformance

1. Get modified files from `git diff --name-only` (or all files if scope is "all")
2. Call `match_pattern()` to get all detected patterns for the project
3. For each modified file containing classes/types:
   - Call `get_pattern_for(symbol)` for key symbols
   - If symbol belongs to a pattern: verify it follows the pattern's conventions
   - If symbol looks like it should belong to a pattern but doesn't: flag it
4. Log findings: `log_event(type="review_finding", data="{\"check\":\"pattern\",\"...\"}")` — MANDATORY

### Check 2: Duplication

1. Call `get_duplicates()` — returns functions with identical signatures in different files + same-name functions across files
2. Flag any duplicates involving modified files
3. Log findings — MANDATORY

### Check 3: Project conventions

1. Call `get_project_conventions()` — returns naming patterns, directory conventions, design patterns
2. Check if modified code follows established conventions
3. Flag deviations

### Check 4: Test coverage

1. Check if modified functions have corresponding tests
2. Flag untested new functions

### Check 5: Doc drift

1. Check if modified code files are referenced in any docs
2. If a doc references a modified file, flag it for review

### Report

Present findings grouped by severity:
- Violations (pattern not followed, missing tests)
- Warnings (duplication, convention deviations)
- Info (doc drift suggestions)

## Important

- All MCP calls are MANDATORY
- Log every finding as a review_finding event — this feeds metrics
- Be specific: "sql.rs doesn't implement LanguageAdapter" not "pattern issue found"
- Suggest fixes, not just problems
