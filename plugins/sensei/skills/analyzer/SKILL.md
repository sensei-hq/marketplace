---
name: analyzer
description: >-
  Use for DEEP analysis of an objective before planning an automated run — grill the user for
  depth using sensei's code + doc graph lookup, write or extend docs under docs/, run a depth +
  clarity pass, detect conflicts across the docs, resolve them WITH the user, and record the
  decisions. This is the prerequisite the `planner` skill depends on. Distinct from the
  codebase-health-check `analyze` skill (which audits a repo's size/complexity).
---

# Analyzer — depth before planning

Your job is to close every gap that would make an autonomous run stall or go wrong. You leave
behind a doc deep enough that the `planner` can decompose it into an executable graph, and no
unresolved contradictions.

## 1. Ground in the actual code + docs

Use sensei's graph — never guess:
- `search(query)` — find the functions/types/modules the objective touches.
- `get_callers(name)` / `get_callees(name)` — trace how a change ripples.
- `get_patterns(pattern)` / `get_project_conventions()` — the house patterns to follow.
- `get_project_summary()` — stack + structure.
- `get_lib_docs(name)` / `search_lib_docs(query)` — library specifics before you assume an API.
- Every result carries a file path — **Read the file** when you need the real detail.

Read `docs/backlog.md` first (project rule) and any existing design/analysis/decisions docs for
this area, so you extend rather than contradict.

## 2. Grill the user for depth

Ask **one theme at a time** and don't move on until it's specified. Cover the unknowns an
builder can't invent:
- the real problem + who it serves + what "done" looks like (observable);
- constraints, edge cases, failure modes, security/trust boundaries;
- where it fits existing architecture; what it must NOT change (scope);
- data model / interface / migration implications.

Prefer multiple-choice when you can (easier to answer); default sensible choices and confirm
rather than leaving blanks.

## 3. Write / extend the docs

Write to the canonical home per project conventions — a cross-cutting design goes to
`docs/design/<name>.md`; a feasibility assessment to `docs/analysis/`. Follow the existing doc
frontmatter + structure. Extend an existing doc in place rather than adding a near-duplicate.

## 4. Depth + clarity self-pass

Re-read with fresh eyes: any TBD/TODO, vague requirement, or criterion that isn't observable →
fix it. Could any requirement be read two ways? Pick one and make it explicit.

## 5. Conflict detection → resolution → decisions

Scan for **contradictions** between this analysis and existing docs (a design that conflicts
with a decision, two docs that disagree, a constraint the objective violates). For each conflict:
1. surface it plainly to the user;
2. get their resolution (this is a real decision, not a default);
3. **record it** — append a `D-<NAME>` / `AR-n` row to `docs/decisions.md` (the canonical
   decisions log) with the locked answer + why, and update the affected docs so they agree.

A conflict left unrecorded resurfaces mid-run when no human is around to resolve it.

## 6. Handoff

When the objective is fully specified, no TBDs remain, and conflicts are resolved + recorded,
hand to the `planner` skill (`/sensei:plan`) to decompose it into the executable graph.
