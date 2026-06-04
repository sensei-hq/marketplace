---
description: Assess feasibility against existing code — produce options with tradeoffs. No code.
argument-hint: What to analyze (or omit to analyze the most recent idea doc)
---

## What this command does

Feasibility assessment. Reads prior idea docs, scans the codebase for related patterns and existing code, and produces 2-3 approaches with tradeoffs. The user picks an approach. No code is written.

## Procedure

1. Call `update_phase(phase="analyze")` — MANDATORY
2. Call `log_event(type="command_invoked", data="{\"command\":\"analyze\",\"args\":\"$ARGUMENTS\"}")` — MANDATORY
3. Read `.sensei/rules.md` if it exists — follow project rules
4. Find the relevant idea doc:
   - If $ARGUMENTS names a specific idea, look for it in `docs/ideas/`
   - If empty, list files in `docs/ideas/` and ask which to analyze
5. Read the idea doc to understand the problem
6. Scan the codebase using MCP tools — MANDATORY:
   - `search()` for related symbols and patterns
   - `get_patterns()` for structural patterns in the codebase
   - `get_project_summary()` for project context
7. Create a doc in `docs/analysis/` with this structure:

````markdown
---
title: <short title>
description: <one line — what is being assessed and why>
type: analysis
status: analysis-complete
created: <YYYY-MM-DD>
depends_on:           # the idea doc(s) this assesses
  - docs/ideas/<file>.md
related_issues: []
references: []        # code symbols, files, or libraries the analysis touches
---

# <Title>

## Objective
The question this analysis answers and the decision it informs.

## Current state
What exists in the codebase today — relevant patterns, components, gaps. Reference specific files and symbols.

## Feasibility
Can this be done with the current architecture? Technical risks and effort.

## Approaches
### Option A: <name>
- Pros:
- Cons:
- Effort:

### Option B: <name>
- Pros:
- Cons:
- Effort:

## Recommendation
Which option and why; what was traded off.
````

8. Present the options to the user — do NOT pick silently

## Nudges

- If the user picks an approach: "Ready for `/sensei:blueprint` to design the architecture?"
- If none of the options feel right: "Should we `/sensei:experiment` to test an assumption?"

## Important

- This is analysis — no code, no implementation details
- Present options with tradeoffs. Let the user decide. Do not pick for them.
- Use MCP tools for codebase scanning — do not grep or read files manually
- All MCP calls are MANDATORY
