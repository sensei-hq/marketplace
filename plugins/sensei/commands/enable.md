---
description: Enable an opt-in skill for this project
argument-hint: Skill name (e.g. session-management)
---

Available opt-in skills:
- `session-management`
- `codebase-indexing`
- `identifying-patterns`
- `guiding-doc-creation`
- `running-benchmarks`
- `auditing-skill-descriptions`

If $ARGUMENTS is empty or invalid, list the above and ask which to enable.

Steps:
1. Derive project slug from CWD: replace `/` with `-`
   Example: `/Users/Jerry/Developer/myapp` → `-Users-Jerry-Developer-myapp`
2. Config path: `~/.claude/projects/<slug>/sensei.config.json`
3. Read existing config (or start with `{"skills":[]}`)
4. Add the skill if not already present
5. Write back
6. Confirm: "Enabled <skill> for this project. Takes effect next session."
