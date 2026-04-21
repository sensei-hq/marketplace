---
description: Show detected patterns, project conventions, and match patterns for a task
argument-hint: Optional query (e.g. "adapter", "what pattern for API routes")
---

## What this command does

Pattern introspection — shows all detected patterns, naming conventions, directory patterns, and project conventions. Can match a specific task to applicable patterns.

## Procedure

1. Call `log_event(type="command_invoked", data="{\"command\":\"patterns\"}")` — MANDATORY

### If no $ARGUMENTS — show full catalog:

2. Call `match_pattern(description="")` to get all detected design patterns
3. Call `get_project_conventions()` to get naming, directory, and usage conventions
4. Display grouped by category:

   **Design patterns:**
   - adapter-pattern (3 instances): TypeScriptAdapter, PythonAdapter, RustAdapter
   - worker-pattern (2 instances): ScanWorker, IndexWorker

   **Naming conventions:**
   - get_* (12 functions): consistent getter pattern
   - parse_* (5 functions): consistent parser pattern

   **Directory patterns:**
   - adapters/ (3 files): language adapter modules
   - handlers/ (4 files): request handler modules

   **Conventions:**
   - [summary from get_project_conventions]

### If $ARGUMENTS provided — match to task:

2. Call `match_pattern(description="$ARGUMENTS")`
3. Display matching patterns with reference implementations
4. Ask: "Should you follow this pattern for your task?"

## Important

- All MCP calls are MANDATORY
- Show instance count and reference files for each pattern
- If no patterns detected: suggest running `/sensei:analyze` to index the codebase first
