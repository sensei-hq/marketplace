---
description: The front door — clarify intent, classify the chunk, and recommend-and-confirm a playbook before any work.
argument-hint: What you want to do (or omit to describe it in the dialogue)
---

## What this command does

The front door for any new chunk of work. Runs a short clarifying dialogue, classifies the
chunk along three axes (lifecycle/intent/risk), and recommends a playbook — confirming with
the user before adopting it. Nothing is built here; this is orientation before work starts.

## Procedure

1. Call `get_intake_guide()` — MANDATORY. Returns the grounding `frame`, the per-axis
   elicitation prompts (`axes`), and the playbook `catalog`. Adopt the `frame` as your posture
   for the rest of the dialogue.
2. Run a short clarifying dialogue with the user, guided by the axis prompts — determine:
   - **lifecycle**: `greenfield` | `stable` (infer from the project's spine/existing code; ask only if unclear)
   - **intent**: `explore` | `ux` | `feature` | `enhancement` | `bug`
   - **risk**: `low` | `high` (use the code graph — `get_callers()`/`get_communities()` on the
     touched area — to judge blast-radius)
   Ask only what you cannot infer. One question at a time.
3. Call `recommend_playbook(lifecycle, intent, risk, session_id=<current session>)`. It returns
   `playbook`, `rationale`, and `opening_tone`.
4. **Recommend-and-confirm**: tell the user the recommended playbook and the one-line
   `rationale`. If `risk = high`, you MUST get explicit confirmation. On agreement, call
   `recommend_playbook(..., confirm="true")` to record the confirmed run.
5. Adopt the returned `opening_tone` as the posture for the next stage, and proceed under the
   chosen playbook. (Playbooks are named routes today; follow the tone + when-to-use.)
6. Call `log_event(type="command_invoked", data="{\"command\":\"intake\",\"args\":\"$ARGUMENTS\"}")` — MANDATORY.

## Important

- This is classification, not implementation — no code, no design docs.
- Do not skip `get_intake_guide` — it grounds the frame and axis prompts; don't invent your own.
- If `risk = high`, do not proceed without explicit user confirmation of the recommended playbook.
- All MCP calls are MANDATORY.
