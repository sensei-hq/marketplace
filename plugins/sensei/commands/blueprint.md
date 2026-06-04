---
description: Design the architecture — components, interfaces, data flow. No code.
argument-hint: What to blueprint (or omit to blueprint the most recent analysis)
---

## What this command does

High-level architecture from a chosen approach. Defines components, their interfaces, how data flows between them, and integration points. No code is written.

## Procedure

1. Call `update_phase(phase="blueprint")` — MANDATORY
2. Call `log_event(type="command_invoked", data="{\"command\":\"blueprint\",\"args\":\"$ARGUMENTS\"}")` — MANDATORY
3. Read `.sensei/rules.md` if it exists — follow project rules
4. Find the relevant analysis doc:
   - If $ARGUMENTS names a specific analysis, look for it in `docs/analysis/`
   - If empty, list files in `docs/analysis/` and ask which to blueprint
5. Read the analysis doc — note the chosen approach
6. Create a doc in `docs/blueprints/` with this structure:

````markdown
---
title: <short title>
description: <one line — what system or component this architects>
type: blueprint
status: blueprint
created: <YYYY-MM-DD>
depends_on:           # the idea + analysis docs this builds on
  - docs/ideas/<file>.md
  - docs/analysis/<file>.md
related_issues: []
references: []        # existing components, files, or libraries this integrates with
---

# <Title>

## Objective
2-3 sentences: what this component/system does, its role, and the key design decision that shapes everything.

## Architecture
Diagram of components and how they connect (ASCII or mermaid).

## Components
### <Component>
Responsibilities, interfaces, what it owns and depends on.

## Data flow
How data moves through the system; what triggers what.

## Integration points
| Integration | Method | Notes |
|-------------|--------|-------|

## Dependencies
| Dependency | Status | Impact if missing |
|-----------|--------|-------------------|

## Implementation order
Bottom-up, innermost layer first (D18).

## Personas
If `.sensei/personas/*.md` define personas, consider each one here.
| Persona | Key goal | Acceptance from their perspective |
|---------|----------|-----------------------------------|

## Out of scope
What this blueprint does NOT cover, and where it's tracked instead.
````

7. Do NOT write code. Architecture level only.

## Nudges

- When the blueprint is complete: "Ready to `/sensei:plan` — decompose into implementable features?"
- If assumptions need testing: "This part is uncertain — consider `/sensei:experiment` first?"

## Important

- This is architecture — no implementation code
- Include a clear implementation order (D18: bottom-up, innermost layer first)
- Diagrams are expected — use mermaid for flow, ASCII for structure
- All MCP calls are MANDATORY
