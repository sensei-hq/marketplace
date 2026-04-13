# sensei-marketplace

Skills, plugins, commands, and hooks for the [sensei](https://github.com/anthropics/sensei) AI coding companion.

## Catalog

| Kind | Count | Description |
|------|-------|-------------|
| Skills | 19 | Prompt-based enhancements for AI coding sessions |
| Plugins | 3 | MCP servers (sensei, playwright, firebase) |
| Commands | 13 | Slash commands (/commit, /feature, /audit, etc.) |
| Hooks | 3 | Session lifecycle hooks (start, pre-tool, post-tool) |

## Install

```bash
# List all items
bun run install.ts --list

# Install global skills to ~/.claude/
bun run install.ts --global --scope global

# Install to a project
bun run install.ts --target /path/to/project --role frontend

# Install specific item
bun run install.ts --target . --item detecting-doc-drift

# Install for Cursor instead of Claude Code
bun run install.ts --target . --acp cursor
```

## Catalog Schema

Each item in `catalog.json` has:

| Field | Description |
|-------|-------------|
| `name` | Unique identifier |
| `kind` | skill, plugin, command, or hook |
| `description` | Human-readable description |
| `scope` | `global` (installed once) or `project` (per-repo) |
| `recommended_for` | Project types: all, api, frontend, mobile, library, etc. |
| `stage` | Project stages: init, active, maintenance |
| `path` | Path to the item's content within this repo |
| `mcp_config` | For plugins: MCP server command and args |
| `event` | For hooks: which event triggers it |

## ACP Support

Plugins auto-configure for supported AI Coding Platforms:
- **Claude Code** — `.claude/plugins/<name>/plugin.json`
- **Cursor** — `.cursor/mcp.json`
- **Windsurf** — `.windsurf/mcp.json`
- **Kiro**, **OpenCode**, **Zed** — generic MCP config
