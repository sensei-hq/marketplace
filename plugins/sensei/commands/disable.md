---
description: Disable an opt-in skill for this project
argument-hint: Skill name
---

1. Derive project slug from CWD: replace `/` with `-`
2. Config path: `~/.claude/projects/<slug>/sensei.config.json`
3. Read existing config
4. Remove the skill if present
5. Write back
6. Confirm: "Disabled <skill> for this project. Takes effect next session."

If the config file doesn't exist or the skill isn't in the list, say so.
