---
description: Session management — resume, show state, re-anchor, or list open work
argument-hint: "(none) | status | refocus | backlog"
---

## What this command does

| Sub-action | Trigger | Purpose |
|---|---|---|
| **resume** | no args | Re-hydrate session context, surface open decisions and blockers |
| **status** | `status` | Full orientation — phase, task, issue, rules, patterns, docs, open issues |
| **refocus** | `refocus` | Re-anchor on current task after drift — compact summary of what matters now |
| **backlog** | `backlog` | List open tasks, decisions, pending questions, and blocked items |

## Procedure

Parse `$ARGUMENTS`: take the first word (lowercased). If empty or absent, run **resume**. Otherwise dispatch to the matching sub-action.

Call `log_event(type="command_invoked", data="{\"command\":\"session\",\"action\":\"$ARGUMENTS\"}")` — record the invocation.

---

### Resume (default — no args)

1. Call `get_workflow_state()` — active phase, task, issue, and last checkpoint.
2. Call `get_layered_context()` — blended memory (decisions, conventions, recent learnings).
3. Review any open decisions or interrupted work those calls surface.
4. Report back to the user: what's in progress, what's pending, any blockers.

---

### Status

1. Call `get_workflow_state()`. Display: phase, task, issue, last checkpoint.
2. Read `.sensei/rules.md`. Count the rules. Display the count.
3. Call `get_patterns(pattern="")`. Display the pattern count.
4. Count files in each of these directories (non-recursive, ignore missing dirs):
   - `docs/ideas/`
   - `docs/analysis/`
   - `docs/blueprints/`
   - `docs/experiments/`
   - `docs/plans/`
5. If the `gh` CLI is available, run: `gh issue list --state open --limit 5 --json number,title` and include the results.
6. Output a formatted block:

```
=== Session Status ===
Phase:      <phase>
Task:       <task>
Issue:      <issue>
Checkpoint: <last checkpoint>

Rules:      <N> loaded
Patterns:   <N> detected

Docs:
  ideas/        <N> files
  analysis/     <N> files
  blueprints/   <N> files
  experiments/  <N> files
  plans/        <N> files

Open Issues (latest 5):
  #<n> <title>
  ...
```

---

### Refocus

1. Read `.sensei/state.yaml`. Extract: `phase`, `task`, `issue`, `active_plan`, `active_issue`.
2. If `active_plan` is set, read that file. Extract the current feature name and acceptance criteria.
3. If `active_issue` is set and `gh` CLI is available, run `gh issue view <active_issue>` and pull the issue title and body.
4. Read `.sensei/rules.md`. Produce a compact bullet summary (one line per rule, no elaboration).
5. Output an orientation block:

```
=== Refocus ===
Phase:   <phase>
Task:    <task>
Issue:   <issue or "none">

Current feature: <feature name or "none">
Acceptance criteria:
  - <criterion>
  - ...

Rules (<N> total):
  - <rule summary>
  - ...

What's left: <brief statement of remaining work based on plan/issue>
```

6. If the conversation history shows the user has drifted from the task, acknowledge it briefly and redirect: "You were working on X — picking up from where we left off."

---

### Backlog

1. Call `get_workflow_state()` and `get_layered_context()` to gather active work and remembered context.
2. From the returned state, extract and categorize:
   - **Open decisions** — choices that have been deferred or need a resolution
   - **Pending tasks** — work that is planned but not started
   - **Blocked items** — work that cannot proceed until something else resolves
   - **Questions** — open questions raised during the session
3. Format as a prioritized list:

```
=== Backlog ===

Open Decisions:
  1. <decision>
  ...

Pending Tasks:
  1. <task>
  ...

Blocked:
  1. <item> — blocked on: <reason>
  ...

Questions:
  1. <question>
  ...
```

If a category is empty, omit it.
