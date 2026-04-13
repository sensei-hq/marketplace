---
description: Show all available sensei commands and skills
---

List all sensei plugin commands and skills available in this session.

Output a formatted summary with two sections:

## Slash Commands

| Command | Description |
|---------|-------------|
| `/session` | Resume session — calls get_session_context() and surfaces open decisions |
| `/checkpoint` | Snapshot current progress for interruption recovery |
| `/backlog` | List open tasks, decisions, and pending questions from the session store |
| `/commit` | Run zero-errors checks then commit |
| `/mockup` | Start a mockup — enforces framework-native build, commits first |
| `/pattern-extract` | Extract a reusable pattern from existing code and write it to PATTERNS.md |
| `/pattern-use` | Look up a pattern by name and apply it to the current task |
| `/feature` | Deep-dive a feature — generates openspec/specs/<capability>/ docs |
| `/product` | Reverse-engineer the full product — generates openspec/product/ docs |
| `/audit` | Audit a capability for OWASP, NFR, and code quality issues |
| `/enable` | Enable an opt-in skill for this project |
| `/disable` | Disable an opt-in skill for this project |
| `/sensei:help` | Show this help |

## Auto-Applied Skills

These activate automatically when the described trigger condition is met — you don't invoke them manually.

| Skill | Triggers when... |
|-------|-----------------|
| `session-management` | Start of every session with sensei MCP available — calls get_session_context() |
| `working-smarter` | Designing UI mockups, starting/completing any implementation task |
| `context-efficiency` | Before loading any code — calls recommend_next() to get minimal file scope |
| `pattern-based-development` | Before implementing any new feature/component — checks PATTERNS.md first |
| `identifying-patterns` | Before implementing a feature that might follow a recurring structure |
| `decomposing-broad-tasks` | Request touches 5+ files or uses "all", "every", "refactor all" |
| `codebase-indexing` | First working on a repo, after major refactor, or llmspec.yaml has TODOs |
| `detecting-doc-drift` | Docs may be out of sync with code, before committing API changes |
| `reformatting-docs` | A doc's structure diverges from the canonical template |
| `guiding-doc-creation` | Before creating or updating any doc in this repo |
| `identify-unknown-libs` | get_lib_docs returns empty sections for a library you're about to use |
| `auditing-skill-descriptions` | Adding new skills or reviewing the skill library for quality |

## Setup

Install/update the plugin so it's active in all sessions:
```
sensei plugin install
```

Restart Claude Code after installing.
