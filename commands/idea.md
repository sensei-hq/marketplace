---
description: Explore a concept — ask clarifying questions, document the problem space. No code.
argument-hint: What to explore (e.g. "task scheduler", "caching layer")
---

## What this command does

Structured ideation. The AI asks questions to understand the problem before proposing solutions. Output is a document in `docs/ideas/`. No code is written.

## Procedure

1. Call `update_phase(phase="ideate")` — MANDATORY
2. Call `log_event(type="command_invoked", data="{\"command\":\"idea\",\"args\":\"$ARGUMENTS\"}")` — MANDATORY
3. Read `.sensei/rules.md` if it exists — follow project rules
4. If $ARGUMENTS is provided, use it as the starting point. If empty, ask: "What concept do you want to explore?"
5. Ask 2-3 clarifying questions (not all at once — conversational):
   - What problem does this solve?
   - Who is affected?
   - What constraints exist?
6. Read the idea template from `${CLAUDE_PLUGIN_ROOT}/templates/idea.md`
7. Create a doc in `docs/ideas/` following the template. Use a descriptive filename (kebab-case).
8. Set frontmatter: name, description, date (today), status: idea, origin
9. Do NOT write code. Do NOT propose solutions. Stay in the problem space.

## Nudges

- If the conversation goes deep into feasibility or tradeoffs: "This is getting into analysis territory — should we move to `/sensei:analyze`?"
- If the user starts describing architecture: "That sounds like a blueprint — want to switch to `/sensei:blueprint`?"
- If the user isn't sure what they want: "Sounds like this needs an experiment — consider `/sensei:experiment`?"

## Important

- This is an ideation phase — problem space only, no solution design
- All MCP calls are MANDATORY — do not skip update_phase or log_event
- Ask questions conversationally (2-3 max per turn), not as a survey
- The output doc should be understandable by someone who wasn't in the conversation
