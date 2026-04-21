---
description: Show all available sensei commands and skills
---

List all sensei plugin commands and skills available in this session.

## Phase Commands

| Command | Description |
|---------|-------------|
| `/sensei:idea` | Capture a new idea |
| `/sensei:analyze` | Deep analysis before designing |
| `/sensei:blueprint` | Architecture and component design |
| `/sensei:experiment` | Spike or prototype |
| `/sensei:plan` | Decompose into implementation steps |
| `/sensei:build` | Implement a feature — locate code, TDD, review |
| `/sensei:validate` | Verify quality — patterns, tests, doc drift |

## Cross-cutting Commands

| Command | Description |
|---------|-------------|
| `/sensei:brainstorm` | Open-ended exploration |
| `/sensei:review` | Code review — patterns, duplication, tests, personas |
| `/sensei:persona` | List, add, or switch project personas |
| `/sensei:rules` | View or edit project rules |
| `/sensei:patterns` | View detected patterns |
| `/sensei:pattern-extract` | Extract a reusable pattern to PATTERNS.md |
| `/sensei:refocus` | Re-anchor on active task and rules |
| `/sensei:status` | Show current workflow state |

## Utility Commands

| Command | Description |
|---------|-------------|
| `/sensei:session` | Resume session — loads context and open decisions |
| `/sensei:checkpoint` | Snapshot current progress |
| `/sensei:commit` | Zero-errors check then commit |
| `/sensei:mockup` | Start a UI mockup |
| `/sensei:get-api-docs` | Fetch library docs before using a dependency |
| `/sensei:help` | Show this help |

## Skills (auto-applied)

These activate automatically — you don't invoke them manually.

| Skill | Triggers when... |
|-------|-----------------|
| `codebase-indexing` | First working on a repo or after major refactor |
| `analyze` | Deep architecture analysis needed |
| `reverse-engineering` | Reverse-engineering an unfamiliar codebase |
| `test-gen` | Adding test coverage to untested code |
| `refactor` | Improving code structure without changing behaviour |
| `extract-docs` | Generating docs from code |
| `building-app-mockups` | Building interactive mockups |
| `identify-unknown-libs` | Library docs missing from index |

## Setup

```
sensei init              # Initialize sensei for this repo
sensei install           # Install binaries and global config
./scripts/install-plugin.sh  # Dev: wire hooks for sensei-dev repo
```

Restart Claude Code after installing or updating.
