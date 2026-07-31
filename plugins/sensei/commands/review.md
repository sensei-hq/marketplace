---
description: Quality check — pattern conformance, duplicates, test coverage, doc drift
argument-hint: Optional scope (e.g. "modified files" or "all")
---

## What this command does

Checks code quality across multiple dimensions. Auto-triggered after `/sensei:build` features. Also available on demand.

## Procedure

1. Call `log_event(type="command_invoked", data="{\"command\":\"review\"}")` — MANDATORY. Review is cross-cutting — do NOT change the workflow phase; it runs within the current phase (typically build or validate).
2. Read `.sensei/rules.md` — rules inform what to check

### Step 0: Resolve review depth (MANDATORY — do this FIRST)

The gate that decides *how hard* to review, so rigor lands on the changes that matter.

1. Get the changed paths: `git diff --name-only` (or the scope's files).
2. Call `resolve_risk_class(paths=[...], task="<current task>")` → `{class, reasons}`.
3. Set the depth from `class` and state it (+ reasons) at the top of the report:
   - **approve** — identity / auth / money / secrets / schema / governance touched. Run ALL checks below **and** an adversarial pass: for each finding try to *refute* it, and actively hunt an input that breaks the change; require **live verification evidence** (the actual test-run tail, a `psql` count, a `curl :7744` status, a Playwright run for UI) — never "looks correct"; and state explicitly that this change needs **human sign-off**.
   - **review** — production source. Run all checks with real verification (do not assume-green; run the tests).
   - **auto** — docs / tests / config only. A light pass suffices; note the class and skip the heavy adversarial pass.

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

### Check 6: Persona validation

1. Read `.sensei/personas/*.md` — if any exist:
2. For each persona (or just the active one if set):
   - Evaluate modified code/features against the persona's `validates` criteria
   - Flag any criterion that isn't met
3. If no personas are defined, skip this check

### Report

Present findings grouped by severity:
- Violations (pattern not followed, missing tests)
- Warnings (duplication, convention deviations)
- Info (doc drift suggestions, persona validation notes)

## Important

- All MCP calls are MANDATORY
- Log every finding as a review_finding event — this feeds metrics
- Be specific: "sql.rs doesn't implement LanguageAdapter" not "pattern issue found"
- Suggest fixes, not just problems
