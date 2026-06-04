---
description: Show all available sensei commands, agents, and usage examples
---

## Quick Start

```
/sensei:session                        # Resume — loads context and open decisions
/sensei:idea add a dark mode toggle    # Capture and explore a new idea
/sensei:build                          # Implement the current planned feature
/sensei:review                         # Quality check before committing
```

## Phase Commands

Typical flow: `idea → analyze → blueprint → plan → build → validate`

| Command | Description | Example |
|---------|-------------|---------|
| `/sensei:idea` | Explore a concept — ask clarifying questions, surface constraints, validate the idea before building | `/sensei:idea offline sync for mobile` |
| `/sensei:analyze` | Assess feasibility against existing architecture — constraints, risks, patterns, acceptance criteria | `/sensei:analyze` |
| `/sensei:blueprint` | Design the architecture — components, contracts, data flow, file placement | `/sensei:blueprint` |
| `/sensei:experiment` | Try an approach — build a minimal proof of concept without committing to it | `/sensei:experiment websocket vs SSE` |
| `/sensei:plan` | Decompose a blueprint into implementation steps — ordered tasks with clear acceptance criteria | `/sensei:plan` |
| `/sensei:build` | Implement a feature — locate code, drive TDD, apply patterns, auto-triggers review | `/sensei:build` |
| `/sensei:validate` | Verify implementation — tests pass, patterns followed, docs current, personas satisfied | `/sensei:validate` |

## Cross-cutting Commands

| Command | Description |
|---------|-------------|
| `/sensei:brainstorm` | Open creative conversation — explore ideas without committing to a direction |
| `/sensei:review` | Quality check — pattern conformance, duplicates, test coverage, doc drift, persona validation |
| `/sensei:persona` | Manage project personas — role-play users to validate design decisions |
| `/sensei:agent` | List available agents or invoke one by name |

### `/sensei:persona` sub-actions

| Sub-action | What it does | Example |
|------------|-------------|---------|
| *(none)* or `list` | Show all defined personas and which is active | `/sensei:persona` |
| `add <name>` | Create a new persona interactively (3 questions) | `/sensei:persona add power-user` |
| `switch <name>` | Set a persona as active — filters the session lens | `/sensei:persona switch admin` |
| `validate` | Evaluate current work against each persona's criteria | `/sensei:persona validate` |

### `/sensei:agent` sub-actions

| Sub-action | What it does | Example |
|------------|-------------|---------|
| `list` | Show all available agents with focus and when-to-use | `/sensei:agent list` |
| `use <name> [task]` | Invoke a named agent — runs autonomously and reports findings | `/sensei:agent use sensei-security-reviewer review the auth endpoint` |

## Utility Commands

| Command | Description |
|---------|-------------|
| `/sensei:session` | Resume session — loads context, open decisions, and interrupted work |
| `/sensei:spec` | Reverse-engineer docs — product overview, feature deep-dive, or security audit |
| `/sensei:rules` | View, create, or add project rules — enforceable constraints loaded every session |
| `/sensei:patterns` | Show detected patterns, project conventions, and match patterns for a task |
| `/sensei:checkpoint` | Snapshot current progress for interruption recovery |
| `/sensei:commit` | Run zero-errors checks then commit |
| `/sensei:mockup` | Start a UI mockup — framework-native build at real app routes (commits dirty work first) |
| `/sensei:docs` | Fetch library documentation before writing code that uses it |
| `/sensei:help` | Show this help |

### `/sensei:session` sub-actions

| Sub-action | What it does | Example |
|------------|-------------|---------|
| *(none)* | Full session resume — context, decisions, next recommended task | `/sensei:session` |
| `status` | Show current phase, active task, and recent checkpoints | `/sensei:session status` |
| `refocus` | Re-anchor on active task and rules after drift | `/sensei:session refocus` |
| `backlog` | List open tasks, decisions, and pending items | `/sensei:session backlog` |

### `/sensei:spec` sub-actions

| Sub-action | What it does | Example |
|------------|-------------|---------|
| `product [path]` | Full reverse-engineering — stack, features, architecture, API registry, quality report | `/sensei:spec product` |
| `feature <name>` | Deep-dive a single feature — proposal, spec, flow, design, API, NFR, backlog | `/sensei:spec feature auth` |
| `audit [capability]` | OWASP 2021, NFR, code quality, and drift detection | `/sensei:spec audit payments` |

## Agents

Invoke with `/sensei:agent use <name> [task description]`. Agents run autonomously and produce a structured report.

| Agent | Focus | When to use |
|-------|-------|-------------|
| `sensei-analyst` | Requirements clarity, constraint mapping, scope definition | Before designing or building; when a task needs requirements clarity |
| `sensei-developer` | Implementation review — file placement, delivery path, design validation | When reviewing a proposed design or checking that an implementation plan fits the codebase |
| `sensei-acceptance-tester` | End-to-end acceptance testing from the user's perspective | After implementation to verify acceptance criteria and catch regressions |
| `sensei-security-reviewer` | OWASP top 10, auth, data exposure, injection vectors | When a task involves user input, authentication, data storage, or external communication |
| `sensei-performance-engineer` | Complexity, memory, network costs, scalability limits | When a task involves data processing, queries, loops, or user-facing latency |
| `sensei-ux-designer` | Usability, accessibility, consistency of user-facing surfaces | When a task involves commands, UI components, output formatting, or user-facing messages |
| `sensei-devops-sre` | Deployability, monitoring, rollback safety, failure modes | When a task involves deployment, infrastructure, configuration, or reliability-sensitive changes |
| `sensei-persona-reviewer` | Persona validation — review work from each defined project persona's perspective | After implementation to verify the work serves each persona's goals and criteria |

## Skills (auto-applied)

These activate automatically — you don't invoke them manually.

| Skill | Triggers when... |
|-------|-----------------|
| `codebase-indexing` | First working on a repo, after a major refactor, or when `llmspec.yaml` has placeholders |
| `analyze` | Starting on an unfamiliar repo or after significant changes — structured health check |
| `reverse-engineering` | Reverse-engineering a codebase into product/feature/audit docs (via `/sensei:spec`) |
| `test-gen` | Adding test coverage to untested or under-tested code |
| `refactor` | Improving code structure without changing behaviour |
| `extract-docs` | Generating or updating documentation for a module from its code |
| `building-app-mockups` | Designing new UI pages as real app routes (not standalone files) |
| `ui-state-pattern` | Building a new UI screen — Component → State → Load, swap mock↔real |
| `semantic-styles` | Building any UI — consistent type scale, spacing, and semantic color |
| `semantic-styles-rokkit` | Building or auditing a Rokkit-powered app — token pipeline, dark mode |
| `tauri-screen-dev` | Building a new screen/stage in the Tauri + SvelteKit desktop app |
| `tauri-playwright-testing` | Writing or debugging Playwright E2E tests for the Tauri app |
| `identify-unknown-libs` | `get_lib_docs` returns empty sections — register missing library docs |
| `knowledge-capture` | Session start (load memory) and when a capture trigger fires (correction / revert / "actually") |
