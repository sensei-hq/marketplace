---
description: View, create, or add project rules — enforceable patterns, quality, and process constraints
argument-hint: Optional rule to add (e.g. "use adapter pattern for parsers")
---

## What this command does

Manages the project's rules file (`.sensei/rules.md`) — enforceable rules about how to build in this project. Rules are different from memory (facts) — they are constraints the AI must follow.

## Procedure

### If `.sensei/rules.md` exists:

1. Read the file
2. Display a compact summary of all rules, grouped by section
3. If $ARGUMENTS is provided (a new rule to add):
   - Ask 1-2 clarifying questions about the rule (when does it apply? what's the exception?)
   - Add the rule to the appropriate section (Patterns, Quality, Architecture, Tools, or Process)
   - Confirm: "Added to rules: [rule]. Will be loaded automatically next session."

### If `.sensei/rules.md` does NOT exist:

1. Read the mindsets template from the plugin: use the Read tool on the file at the path `${CLAUDE_PLUGIN_ROOT}/templates/mindsets.md` (this path is relative to the plugin installation — the file contains the analyst, developer, and BAT mindsets)
2. Ask the user: "No rules found for this project. Want me to create one? What patterns or rules should I include?"
3. Create `.sensei/` directory if needed
4. Create `.sensei/rules.md` with:
   - Frontmatter: name, updated date, mindsets reference
   - Sections: Patterns, Quality, Architecture, Tools, Process
   - User's initial rules added to appropriate sections
5. Confirm: "Rules created. Will be loaded automatically next session."

## Important

- Do NOT modify mindsets.md — that ships with the plugin and is universal
- DO modify .sensei/rules.md — that's project-specific and meant to grow
- When adding a rule, always ask at least one clarifying question — don't assume
- Keep rules concise — one line per rule, actionable, testable
