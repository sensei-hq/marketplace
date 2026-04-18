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
6. Read the blueprint template from `${CLAUDE_PLUGIN_ROOT}/templates/blueprint.md`
7. Create a doc in `docs/blueprints/` with:
   - Overview (2-3 sentences)
   - Architecture diagram (ASCII or mermaid)
   - Components with responsibilities
   - Data flow between components
   - Integration points with external systems
   - Dependencies and what breaks if they're missing
   - Implementation order (bottom-up, innermost layer first)
8. Set frontmatter: name, description, date, status: blueprint, origin (idea doc), analysis (analysis doc)
9. Do NOT write code. Architecture level only.

## Nudges

- When the blueprint is complete: "Ready to `/sensei:plan` — decompose into implementable features?"
- If assumptions need testing: "This part is uncertain — consider `/sensei:experiment` first?"

## Important

- This is architecture — no implementation code
- Include a clear implementation order (D18: bottom-up, innermost layer first)
- Diagrams are expected — use mermaid for flow, ASCII for structure
- All MCP calls are MANDATORY
