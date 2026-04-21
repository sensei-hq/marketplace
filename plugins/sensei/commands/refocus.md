---
description: Re-anchor on current task after drift or compaction — reload state, plan, rules
---

## What this command does

When the AI has drifted from the current task or context has been compacted, this command re-reads everything needed to get back on track.

## Procedure

1. **Read workflow state**: Read `.sensei/state.yaml`. Extract active_phase, active_task, active_issue. If missing, say "No active workflow state — use a phase command to set one."

2. **Read active plan**: If state has active_plan, read that file. Extract the current feature and its acceptance criteria.

3. **Read active issue**: If state has active_issue and gh CLI is available, run `gh issue view [number] --json title,body,labels` to get current issue details.

4. **Read rules**: Read `.sensei/rules.md` and output a compact summary (section headers + rule count per section).

5. **Output orientation**:
   - "Current phase: [phase]"
   - "Active task: [task]"
   - "Issue: #[number] — [title]"
   - "Acceptance criteria: [from plan or issue]"
   - "Rules: [count] rules loaded across [N] sections"
   - "What's left: [remaining items from plan if available]"

6. **Acknowledge drift** (if applicable): If the conversation context shows work unrelated to the active task, acknowledge it: "I had drifted to [topic]. Returning to: [active task]."

## Important

- This command FLUSHES tangential context — after refocus, the AI should work only on the active task
- Read-only — never modifies files
- Works without daemon — reads local files and gh CLI
- When daemon `get_workflow_state()` MCP tool becomes available (#79), prefer it over reading state.yaml directly
