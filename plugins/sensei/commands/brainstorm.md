---
description: Open creative conversation — explore ideas, routes content to the right folder by depth
argument-hint: Topic to brainstorm (optional)
---

## What this command does

The primary creative command. One conversation can produce artifacts at multiple depth levels. The AI routes content to the appropriate folder based on how deep the conversation goes. (Decision D11)

## Procedure

1. Call `update_phase(phase="brainstorm")` — MANDATORY
2. Call `log_event(type="command_invoked", data="{\"command\":\"brainstorm\",\"args\":\"$ARGUMENTS\"}")` — MANDATORY
3. Read `.sensei/rules.md` if it exists — follow project rules
4. If $ARGUMENTS is provided, start the conversation there. If empty, ask: "What's on your mind?"
5. Engage in open conversation. Ask clarifying questions. Explore options.
6. As the conversation produces artifacts, route them by depth:

   | Depth signal | Target folder | Doc structure |
   |-------------|---------------|---------------|
   | Problem statement, concept, "what if" | `docs/ideas/` | as defined by `/sensei:idea` |
   | Feasibility, tradeoffs, options with pros/cons | `docs/analysis/` | as defined by `/sensei:analyze` |
   | Architecture, components, interfaces, data flow | `docs/blueprints/` | as defined by `/sensei:blueprint` |
   | Findings from trying something | `docs/experiments/` | as defined by `/sensei:experiment` |
   | Task breakdown, acceptance criteria | `docs/plans/` | as defined by `/sensei:plan` |

7. Before writing to a folder, ask: "This is getting into [analysis/blueprint/plan] territory — should I write it to `docs/[folder]/`?"
8. Use frontmatter `depends_on:` to trace lineage between docs created in the same brainstorm
9. Call `log_event(type="phase_transition", data="{\"from\":\"brainstorm\",\"to\":\"[depth]\"}")` when routing content — MANDATORY

## Nudges

- When enough ideas have been explored: "We've covered the problem space well — ready for `/sensei:analyze`?"
- When the user wants to go deeper: use the appropriate phase command instead of continuing in brainstorm
- When the conversation stalls: "What aspect should we explore next?"

## Important

- Brainstorm is a container — content finds its natural level (D12)
- Always ask before writing to a folder — don't assume the depth
- Keep the conversation flowing — this is not a structured process, it's exploration
- All MCP calls are MANDATORY
- Ask questions conversationally (2-3 max per turn), not as a survey
