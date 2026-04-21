---
description: List available agents or invoke one by name
argument-hint: list | use <agent-name> [task description]
---

## What this command does

Lists all available mindset-based agents or dispatches one by name. Agents are autonomous subagents — each carries a specialist mindset with its own questions, procedure, and report format. Use them to get a focused expert perspective on any task.

## Procedure

### Step 1: Parse action

Read the first word of $ARGUMENTS:

- Empty or `list` → go to **List agents**
- `use` → go to **Use agent**
- Anything else → show **Usage example**

---

### List agents

Display this table:

| Agent name | Description | When to use |
|---|---|---|
| `sensei-analyst` | Problem analysis — requirements clarity, constraint mapping, scope definition | Before designing or building; when a task needs requirements clarity |
| `sensei-developer` | Implementation review — file placement, delivery path, design validation | When reviewing a proposed design or checking that an implementation plan fits the codebase |
| `sensei-acceptance-tester` | End-to-end acceptance testing from the user's perspective | After implementation to verify acceptance criteria are met and no regressions introduced |
| `sensei-security-reviewer` | Security audit — OWASP top 10, auth, data exposure, injection vectors | When a task involves user input, authentication, data storage, or external communication |
| `sensei-performance-engineer` | Performance analysis — complexity, memory, network costs, scalability limits | When a task involves data processing, queries, loops, or user-facing latency |
| `sensei-ux-designer` | UX review — usability, accessibility, consistency of user-facing surfaces | When a task involves commands, UI components, output formatting, or user-facing messages |
| `sensei-devops-sre` | Ops readiness — deployability, monitoring, rollback safety, failure modes | When a task involves deployment, infrastructure, configuration, or reliability-sensitive changes |
| `sensei-persona-reviewer` | Persona validation — review work from each defined project persona's perspective | After implementation to validate that the work serves each persona's goals and criteria |

Usage:

```
/sensei:agent use <agent-name> [task description]
```

Example:

```
/sensei:agent use sensei-security-reviewer review the new auth endpoint
```

---

### Use agent

1. Extract the agent name — the second word of $ARGUMENTS (after `use`)
2. Extract the task description — everything after the agent name (may be empty)
3. Validate the agent name against this list of valid names:
   - `sensei-analyst`
   - `sensei-developer`
   - `sensei-acceptance-tester`
   - `sensei-security-reviewer`
   - `sensei-performance-engineer`
   - `sensei-ux-designer`
   - `sensei-devops-sre`
   - `sensei-persona-reviewer`
4. If the name is not in the list, report:
   > Unknown agent: `<name>`. Run `/sensei:agent list` to see available agents.
   Then stop.
5. Dispatch the agent using the Agent tool:
   - `subagent_type`: `sensei:<agent-name>` (e.g. `sensei:sensei-security-reviewer`)
   - `prompt`: the task description if provided, otherwise an empty string (the agent will use its default procedure)
6. When the agent completes, present its findings directly — do not summarize or filter the report.

---

### Usage example

If an unrecognized action was given, show:

```
Usage:
  /sensei:agent list                              — show all available agents
  /sensei:agent use <agent-name> [description]   — invoke a named agent

Examples:
  /sensei:agent list
  /sensei:agent use sensei-analyst clarify requirements for the export feature
  /sensei:agent use sensei-security-reviewer
  /sensei:agent use sensei-acceptance-tester verify issue #42
```

## Important

- Agent names are exact — use the full name including the `sensei-` prefix
- The task description is optional; if omitted the agent will apply its default procedure to the current context
- Agents operate autonomously — they read the codebase and produce a structured report without further prompting
- Core mindsets (analyst → developer → acceptance tester) apply to every task; specialist agents (security, performance, UX, DevOps, persona) apply by domain
