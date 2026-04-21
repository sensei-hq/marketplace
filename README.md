# sensei-marketplace

Skills, commands, agents, and hooks for the [sensei](https://github.com/mizukisu/sensei-dev) AI coding companion.

## Install

```bash
# Via sensei (recommended — handles marketplace registration + plugin install)
sensei init

# Or manually via Claude Code
claude plugin marketplace add mizukisu/sensei-marketplace
claude plugin install sensei
```

Commands appear as `/sensei:session`, `/sensei:analyze`, etc.

## Contents

| Kind | Description |
|------|-------------|
| Commands | Slash commands (`/sensei:analyze`, `/sensei:build`, `/sensei:commit`, etc.) |
| Skills | Prompt-based enhancements (codebase indexing, test gen, refactor, etc.) |
| Agents | Mindset-driven subagents (analyst, developer, acceptance tester, etc.) |
| Hooks | Session lifecycle hooks (start, pre-tool, post-tool) |

## ACP Support

`sensei init` auto-detects installed AI coding platforms:
- **Claude Code** — installs as a plugin (commands, skills, agents, hooks, MCP)
- **Cursor** — `.cursor/mcp.json`
- **Windsurf** — `.windsurf/mcp.json`
- **Zed**, **Kiro**, **OpenCode**, **VS Code** — MCP config
