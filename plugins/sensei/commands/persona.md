---
description: List, add, or switch project personas — role-play users to validate design decisions
argument-hint: Optional action (e.g. "list", "add end-user", "switch admin")
---

## What this command does

Manages project-specific personas in `.sensei/personas/`. Each persona is a markdown file with frontmatter (goals, pain points, validates) and freeform content (journey maps, examples, frustrations).

## Procedure

### Step 1: Load personas

1. Read all `.sensei/personas/*.md` files — if directory is empty or missing, report "No personas defined yet" and offer to create one
2. Read `.sensei/mindsets.md` — load specialist mindsets for reference

### Step 2: Handle action

**If $ARGUMENTS is empty or "list":**
- Display all defined personas with their description and goals
- Show which persona is currently active (if any from session context)

**If $ARGUMENTS starts with "add":**
- Extract the persona name from the argument (e.g. "add end-user")
- Ask 3 questions conversationally (not as a survey):
  1. "Who is this persona? One sentence."
  2. "What are their top 3 goals when using this system?"
  3. "What frustrates them? What should we watch for?"
- Create `.sensei/personas/<name>.md` with frontmatter + freeform sections
- Confirm: "Added [name] persona. Use `/sensei:persona switch [name]` to activate."

**If $ARGUMENTS starts with "switch":**
- Extract the persona name
- Validate `.sensei/personas/<name>.md` exists
- Set as active persona for the session (store in session context)
- Display the persona summary: "Now viewing through [name]'s eyes: [description]"
- Show their validation criteria as a checklist

**If $ARGUMENTS starts with "validate":**
- Load the active persona (or all if none active)
- For each persona, evaluate the current work against their `validates` criteria
- Report pass/fail for each criterion

### Step 3: Log

- Call `log_event(type="command_invoked", data="{\"command\":\"persona\",\"action\":\"$ACTION\"}")` when available

## Persona file format

```markdown
---
name: End User
description: Non-technical user accessing the dashboard
goals:
  - See quality trends
  - Understand what went wrong
  - Get actionable advice
pain_points:
  - Too much jargon
  - No guidance on next steps
validates:
  - Is the language plain?
  - Is there a clear call to action?
  - Does it load in <2s?
---

# End User

Freeform content: journey maps, examples, scenarios, acceptance stories.
```

## Important

- Personas supplement mindsets, they don't replace them
- Core mindsets (analyst, developer, acceptance tester) apply to every task
- Specialist mindsets (UX, security, performance, DevOps) apply by domain
- Personas add project-specific user perspectives on top
- When validating, consider each persona independently — what's fine for a developer may confuse an end-user
