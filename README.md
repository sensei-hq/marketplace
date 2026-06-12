---
organization: Sensei HQ
project: sensei
role: marketplace
tagline: Sensei plugin for Claude Code
summary: Slash commands, specialist agents, auto-applied skills, and lifecycle hooks that keep the AI assistant grounded in your codebase's patterns and session state.
stack: [markdown, json]
---

# sensei

The sensei plugin for Claude Code provides a structured development workflow through 20 slash commands, 8 specialist agents, 9 auto-applied skills, and 5 lifecycle hooks. It keeps Claude grounded in your codebase's actual patterns, tracks session state across interruptions, and guides work through a deliberate idea-to-validated-feature lifecycle.

The plugin communicates with the sensei daemon (MCP server) to index your codebase, track patterns, manage session state, and log events — giving Claude persistent context that survives between sessions.

## Installation

```bash
brew install sensei-hq/tap/sensei && sensei init
```

`sensei init` detects your AI coding platform and installs the plugin automatically. Commands appear as `/sensei:idea`, `/sensei:build`, `/sensei:session`, etc.

---

## Commands

### Phase Commands (7)

Typical flow: `idea → analyze → blueprint → plan → build → validate`

---

#### `/sensei:idea [concept]`

Explore a concept through structured ideation. Asks clarifying questions to understand the problem, constraints, and affected users before any design work begins. Produces a doc in `docs/ideas/`. No code is written.

```
/sensei:idea task scheduler
/sensei:idea offline sync for mobile
```

---

#### `/sensei:analyze [topic]`

Assess feasibility against the existing codebase. Reads the relevant idea doc, scans for related patterns and code via MCP tools, and produces 2–3 approaches with tradeoffs. The user picks an approach. No code is written.

```
/sensei:analyze
/sensei:analyze caching layer
```

---

#### `/sensei:blueprint [topic]`

Design the architecture from a chosen approach. Defines components, interfaces, data flow, and integration points. Reads the relevant analysis doc and produces a doc in `docs/blueprints/`. No code is written.

```
/sensei:blueprint
/sensei:blueprint auth service
```

---

#### `/sensei:experiment [hypothesis]`

Test an assumption by building a minimal prototype on a dedicated git branch. Code is considered discardable. Produces a findings doc in `docs/experiments/` with a recommendation.

```
/sensei:experiment RxJS for real-time updates
/sensei:experiment Kuzu graph queries for the relationship index
```

---

#### `/sensei:plan [blueprint]`

Decompose a blueprint into ordered, implementable features with acceptance criteria and test scenarios. Creates GitHub issues for tracking.

```
/sensei:plan
/sensei:plan auth service
```

---

#### `/sensei:build [issue or description]`

The core implementation command. Picks a planned issue, locates relevant code via MCP, decomposes into testable functions, writes tests first (with user approval), implements, and triggers a review.

```
/sensei:build
/sensei:build #42
/sensei:build add SQL adapter
```

---

#### `/sensei:validate [issue]`

End-to-end verification after implementation. Runs the test suite, checks acceptance criteria from the GitHub issue, and detects documentation drift. Reports pass/fail for each criterion.

```
/sensei:validate
/sensei:validate #42
```

---

### Cross-cutting Commands (4)

---

#### `/sensei:brainstorm [topic]`

Open creative conversation. Routes content to the appropriate `docs/` folder based on the depth reached — casual notes, ideas, analysis, or full blueprints. The primary command for exploration before committing to a phase.

```
/sensei:brainstorm
/sensei:brainstorm ways to reduce startup latency
```

---

#### `/sensei:review [scope]`

Quality check across multiple dimensions: pattern conformance, duplicate detection, test coverage, and documentation drift. Auto-triggered after `/sensei:build`; also available on demand.

```
/sensei:review
/sensei:review modified files
/sensei:review all
```

---

#### `/sensei:persona [action]`

Manage project personas in `.sensei/personas/`. Each persona has goals, pain points, and validation criteria. Use personas to role-play users and validate design decisions.

| Sub-action | What it does |
|---|---|
| *(none)* or `list` | Display all defined personas with goals |
| `add <name>` | Interactively create a new persona file |
| `switch <name>` | Make a persona active for the session |
| `validate` | Check current work against all persona criteria |

```
/sensei:persona list
/sensei:persona add end-user
/sensei:persona switch admin
/sensei:persona validate
```

---

#### `/sensei:agent [action]`

List available agents or dispatch one by name for a focused specialist review.

| Sub-action | What it does |
|---|---|
| *(none)* or `list` | Show all available agents with descriptions |
| `use <name> [task]` | Invoke a named agent on a task |

```
/sensei:agent list
/sensei:agent use security-reviewer
/sensei:agent use performance-engineer review the query loop in db/queries.rs
```

---

### Utility Commands (9)

---

#### `/sensei:session [action]`

Session management and orientation.

| Sub-action | What it does |
|---|---|
| *(none)* | Resume — re-hydrate context, surface open decisions and blockers |
| `status` | Full orientation — phase, task, issue, rules, patterns, open issues |
| `refocus` | Re-anchor on the current task after drift |
| `backlog` | List open tasks, decisions, pending questions, and blocked items |

```
/sensei:session
/sensei:session status
/sensei:session refocus
/sensei:session backlog
```

---

#### `/sensei:spec [mode] [argument]`

Reverse-engineer structured documentation from the codebase.

| Sub-action | What it does |
|---|---|
| `product [path]` | Full reverse-engineering: stack, DB, feature map, architecture, API registry, quality report |
| `feature <name>` | Deep-dive: proposal, GIVEN/WHEN/THEN spec, flow diagrams, technical design, API docs, NFR evaluation, backlog |
| `audit [name]` | OWASP 2021, NFR, code quality, and drift detection for one capability or the full product |

```
/sensei:spec product
/sensei:spec feature authentication
/sensei:spec audit payments
```

---

#### `/sensei:rules [rule to add]`

View and manage `.sensei/rules.md` — enforceable constraints about how to build in this project. With no argument, displays a compact summary grouped by section. With an argument, adds a new rule interactively.

```
/sensei:rules
/sensei:rules use adapter pattern for all parsers
```

---

#### `/sensei:patterns [query]`

Show detected design patterns, naming conventions, directory patterns, and project conventions from the sensei index. Optionally match a task description to applicable patterns.

```
/sensei:patterns
/sensei:patterns adapter
/sensei:patterns what pattern for API routes
```

---

#### `/sensei:checkpoint [description]`

Snapshot current progress for safe interruption and recovery. Records state so the next `/sensei:session` can resume exactly where work stopped.

```
/sensei:checkpoint finished auth middleware, starting token refresh
```

---

#### `/sensei:commit [message]`

Run zero-errors checks (tests + type checking), then commit. Will not proceed if any errors are found.

```
/sensei:commit
/sensei:commit add rate limiting to auth endpoints
```

---

#### `/sensei:mockup [description]`

Start a UI mockup at a real app route using the project's actual components and design tokens. Enforces framework-native build (no standalone HTML files). Commits any dirty work before starting.

```
/sensei:mockup settings page with notification preferences
/sensei:mockup dashboard with activity feed
```

---

#### `/sensei:docs <library> [component]`

Fetch current library documentation from the sensei index before writing code that uses it. Avoids relying on stale training data.

```
/sensei:docs sveltekit routing
/sensei:docs @supabase/supabase-js auth
```

---

#### `/sensei:help`

Show all available sensei commands, agents, and usage examples.

```
/sensei:help
```

---

## Agents

Agents are mindset-driven subagents invoked via `/sensei:agent use <name>`. Each carries a specialist perspective with its own questions, procedure, and report format.

| Agent | Focus | Model | When to use |
|---|---|---|---|
| `analyst` | Problem analysis, requirements clarity, constraint mapping | sonnet | Before designing — when scope or requirements are unclear |
| `developer` | Implementation review, file placement, design validation | sonnet | Before coding — to validate an implementation plan against the codebase |
| `acceptance-tester` | End-to-end testing, acceptance criteria, regression detection | sonnet | After implementation — to verify user journeys work as intended |
| `security-reviewer` | OWASP top 10, auth issues, data exposure, injection vectors | sonnet | When the task involves user input, authentication, or external communication |
| `performance-engineer` | Algorithmic complexity, memory usage, network costs, scalability | sonnet | When the task involves queries, loops, data processing, or user-facing latency |
| `ux-designer` | Usability, accessibility, consistency of user-facing interfaces | sonnet | When the task involves commands, UI components, output formatting, or messages |
| `devops-sre` | Deployability, monitoring, rollback safety, operational readiness | sonnet | When the task involves deployment, infrastructure, configuration, or reliability |
| `persona-reviewer` | Validates work against defined persona goals and criteria | sonnet | After implementation to confirm the work serves each persona's needs |

---

## Skills

Skills are prompt-based enhancements that are auto-applied when their trigger conditions are met. They do not require explicit invocation.

| Skill | When it applies |
|---|---|
| `codebase-indexing` | First session on a repo, after a major refactor, or when `llmspec.yaml` has placeholder values |
| `analyze` | Starting work on an unfamiliar repo or after significant changes — runs a structured codebase health check |
| `reverse-engineering` | Generating product docs, feature specs, or audit reports (used by `/sensei:spec`) |
| `test-gen` | Adding test coverage to untested or under-tested code — finds coverage gaps and follows existing patterns |
| `refactor` | Improving code structure without changing behavior — maps dependencies, applies targeted refactors, verifies no regressions |
| `extract-docs` | Generating or updating documentation for a module — extracts exports and infers behavior from implementation |
| `building-app-mockups` | Designing new UI pages or components — builds alternatives as real app routes, not standalone files |
| `identify-unknown-libs` | When `get_lib_docs` returns empty sections — guides through registering missing library docs |
| `ui-state-pattern` | Building a new UI screen — Component → State → Load pattern; presentation-only components, state owns changes, load swaps mock↔real |

---

## Hooks

Hooks run automatically at lifecycle events and require no user action.

| Hook | Event | What it does |
|---|---|---|
| `session-start` | Claude Code startup, resume, clear, or compact | Injects mindsets, rules, and personas into context; creates a session on the daemon; reports daemon health |
| `user-prompt` | Every prompt submitted | Captures prompt context and active task/phase from state — helps track work patterns |
| `pre-compact` | Before Claude Code compacts conversation history | Preserves session state and rules so context survives compaction |
| `pre-tool` | Before any tool executes | Logs tool usage events to the daemon with current phase and task context |
| `post-tool` | After any tool executes | Records tool outputs and exit codes to the daemon for session history |

---

## Workflow Walkthrough

A typical feature from concept to ship:

```
/sensei:session                        # Resume — loads context, open decisions, active phase

/sensei:idea add rate limiting         # Explore the concept, ask clarifying questions
                                       # → produces docs/ideas/rate-limiting.md

/sensei:analyze                        # Assess feasibility, scan existing patterns
                                       # → produces docs/analysis/rate-limiting.md with 2-3 approaches

/sensei:blueprint                      # Design components and interfaces for the chosen approach
                                       # → produces docs/blueprints/rate-limiting.md

/sensei:plan                           # Decompose into features, create GitHub issues
                                       # → issues #44, #45, #46 created

/sensei:build #44                      # Implement the first feature (TDD, MCP-grounded)
/sensei:agent use security-reviewer    # Specialist review of auth/input handling
/sensei:validate #44                   # Verify tests pass and acceptance criteria are met

/sensei:checkpoint                     # Snapshot progress before stopping
/sensei:commit                         # Zero-errors check then commit
```

At any point:

```
/sensei:session refocus                # Re-anchor after drift
/sensei:session backlog                # See what's still open
/sensei:review                         # Quality check — patterns, coverage, doc drift
/sensei:patterns                       # See what conventions apply to the current task
```
