---
description: Show current workflow state — phase, task, issue, rules, patterns, docs, tools
---

## What this command does

Displays full orientation — "where am I" across all dimensions. Reads local files, no daemon dependency.

## Procedure

1. **Workflow state**: Read `.sensei/state.yaml` if it exists. Display active_phase, active_task, active_issue, last_checkpoint. If missing, say "No active workflow state."

2. **Rules**: Check if `.sensei/rules.md` exists. Count the rules (lines starting with `- **`). Display: "Rules: .sensei/rules.md (N rules loaded)" or "Rules: not configured"

3. **Patterns**: Check if `PATTERNS.md` exists. Count pattern entries. Display count or "not configured."

4. **Docs**: Count files in each phase folder:
   - docs/ideas/
   - docs/analysis/
   - docs/blueprints/
   - docs/experiments/
   - docs/plans/
   Display counts. Skip folders that don't exist.

5. **MCP tools**: Check if sensei MCP tools are available by noting whether the session-start context mentioned them. Display "sensei-mcp connected" or "not connected."

6. **Open issues** (if gh CLI available): Run `gh issue list --state open --limit 5 --json number,title` and display top 5 open issues.

## Output format

```
Phase:      [phase or "none"]
Task:       [task or "none"]
Issue:      #[number] or "none"
Checkpoint: [timestamp or "none"]

Rules:      .sensei/rules.md ([N] rules)
Patterns:   PATTERNS.md ([N] patterns)

Docs:
  ideas/       [N] files
  analysis/    [N] files
  blueprints/  [N] files
  experiments/ [N] files
  plans/       [N] files

Open issues: [top 5 or "no gh CLI" or "no remote"]
```

## Important

- This is a read-only command — it never writes or modifies anything
- Works without daemon — reads local files only
- When daemon `get_workflow_state()` MCP tool becomes available (#79), prefer it over reading state.yaml directly
