---
organization: Sensei HQ
project: sensei
role: marketplace
tagline: Sensei plugin for Claude Code
summary: Slash commands, specialist agents, auto-applied skills, and lifecycle hooks that keep the AI assistant grounded in your codebase's patterns and session state.
stack: [markdown, json]
---

# sensei

The sensei plugin for Claude Code provides a structured development workflow through 25 slash commands, 14 specialist agents, 24 auto-applied skills, lifecycle hooks, and a mods module (Claude Code 2.1.300+). It keeps Claude grounded in your codebase's actual patterns, tracks session state across interruptions, and guides work through a deliberate idea-to-validated-feature lifecycle.

The plugin communicates with the sensei daemon (MCP server) to index your codebase, track patterns, manage session state, and log events — giving Claude persistent context that survives between sessions.

## Installation

```bash
brew install sensei-hq/tap/sensei && sensei init
```

`sensei init` detects your AI coding platform and installs the plugin automatically. Commands appear as `/sensei:idea`, `/sensei:build`, `/sensei:session`, etc.

---

## Commands

### Front door and staged flow (5)

Start with `/sensei:intake`. It classifies the chunk of work and recommends a playbook. The staged flow `analysis → design → build → complete` verifies every claim about existing code before build starts, and closes the loop on docs and issues at the end.

| Command | What it does |
|---|---|
| `/sensei:intake [what you want to do]` | The front door: clarify intent, classify the chunk, and recommend-and-confirm a playbook before any work |
| `/sensei:analysis [idea \| #issue \| problem]` | Stage 1 of 4: turn a vague ask into a grounded, scoped problem statement, read against the real codebase |
| `/sensei:design [spec \| #issue \| slice]` | Stage 2 of 4: a spec and a plan, every claim about existing code verified before build |
| `/sensei:build [plan \| #issue \| task]` | Stage 3: drive a registered plan graph to completion, or implement one task with TDD (detailed below) |
| `/sensei:complete [slice \| #issue]` | Stage 4 of 4: verify the slice against reality, close the loop on docs and issues, record what was learned |
| `/sensei:preflight [--fix \| --quick]` | Prove the environment is sane before work: disk, services, ports, runtime target, artifact freshness |

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

| Agent | Focus | Model |
|---|---|---|
| `analyst` | Problem analysis before designing or building | sonnet |
| `developer` | Verify the implementation approach before coding | sonnet |
| `acceptance-tester` | Acceptance testing from the user's perspective | sonnet |
| `security-reviewer` | OWASP top 10, auth, data exposure, injection | sonnet |
| `performance-engineer` | Complexity, memory, network cost, scalability | sonnet |
| `ux-designer` | Usability, accessibility, consistency | sonnet |
| `devops-sre` | Deployability, monitoring, rollback safety | sonnet |
| `persona-reviewer` | Review against each persona's goals | sonnet |
| `plan-depth-reviewer` | Pre-flight depth gate for an autonomous run's plan | sonnet |
| `test-reviewer` | Audits the tests against the need, not just the code | sonnet |
| `claims-verifier` | Re-derives every claim a spec makes about existing code | inherits |
| `data-correctness-reviewer` | Re-derives every computed value from inputs and spec | opus |
| `failure-mode-reviewer` | Hangs, partial application, swallowed failures | opus |
| `spec-conformance-auditor` | Diffs the implementation against every spec surface | opus |

The `model:` in an agent's frontmatter is its default. With a `routing.risk_models` map configured (see *Mods* below), a spawned agent runs on the model its change's risk class maps to instead.

---

## Skills

Skills are prompt-based enhancements that are auto-applied when their trigger conditions are met. They do not require explicit invocation.

| Skill | When it applies |
|---|---|
| `analyzer` | Deep analysis of an objective before planning an automated run |
| `blast-radius` | Before changing a shared type, table, column or enum: enumerate every consumer first |
| `builder` | Driving a registered automated-run plan graph to completion |
| `building-app-mockups` | New UI: build alternatives as real app routes, not standalone files |
| `codebase-indexing` | First session on a repo, or after a major refactor |
| `data-reality-check` | Before declaring done: query the real state that proves the claim |
| `dry-check` | Before writing a new function or type: search the code graph for an existing one |
| `extract-docs` | Generating or updating documentation for a module |
| `ground-before-scope` | Before starting from a title: read the spec and live schema, then restate the task |
| `identify-unknown-libs` | When `get_lib_docs` returns empty sections |
| `knowledge-capture` | Every session: load layered memory, propose and record memories |
| `plan-depth-review` | Before an unattended run: apply the plan depth bar |
| `planner` | Planning an automated, multi-session run |
| `recall-canon` | Before re-opening a decision: check for a prior settled one |
| `refactor` | Improving structure without changing behaviour |
| `reverse-engineering` | Reverse-engineering a codebase into product docs, feature specs or an audit |
| `semantic-styles` | Consistent styling across an application |
| `semantic-styles-rokkit` | Rokkit token pipeline, from palettes to utility classes |
| `tauri-playwright-testing` | E2E tests for a Tauri app with Playwright |
| `tauri-screen-dev` | A new screen or multi-step flow in a Tauri + SvelteKit app |
| `test-gen` | Adding coverage to untested code, following existing patterns |
| `ui-state-pattern` | A new screen: Component → State → Load |
| `verify-deploy` | Changes that only take effect through a built or deployed artifact |
| `verify-outcome` | Before claiming a command worked: check the real result, not a wrapper |

---

## Hooks

Hooks run automatically at lifecycle events and require no user action. They are declared in the plugin manifest.

| Hook | Event | What it does |
|---|---|---|
| `session-start` | Startup, resume, clear, compact | Injects session context, rules and workflow state; reports daemon health |
| `pre-compact` | Before history is compacted | Preserves session state and rules so they survive compaction |
| `forward` | Prompts, tool calls (before, after, failed), notifications, stop, subagent stop, session end | Sends each event to the daemon (`/hook/event`), dead-lettering to `~/.sensei/events.jsonl` when it is unreachable |
| `nudge` | Before a tool call | Suggests `/sensei:intake` once per session when no playbook was confirmed |

## Mods (Claude Code 2.1.300+)

`hooks/hooks.json` names a mods module (`hooks/sensei.ts`) that runs inside Claude Code. It reaches what shell hooks cannot.

| Part | What it does | Default |
|---|---|---|
| Usage | Reports each session's context fill, rate-limit windows and `/cost` total (`SessionMeasure`), and each turn's token counts and model (`TurnComplete`). Cost lands in `activity.sessions.list_cost_usd` (list price, not billed spend) | always on |
| Model routing | A spawned agent with no model of its own runs on the model its change's risk class maps to, when the daemon config `routing.risk_models` is set, e.g. `{"approve":"opus","review":"sonnet","auto":"haiku"}`. No map means no override | off until configured |
| Relay gate (`relayGate`) | Puts each tool call to the daemon's `/hook/gate`. It only ever tightens a decision (a decline denies the call) and fails open | off |
| Run drive (`runDrive`) | Submits a run's dōjō nudges as prompts, each once, for a run this session started | off |

Turn the options on in the plugin's `/config` rows, or in settings:

```json
{ "pluginConfigs": { "sensei": { "options": { "relayGate": true, "runDrive": true } } } }
```

Set the routing map on the daemon:

```bash
curl -X PUT localhost:7744/api/config -H 'Content-Type: application/json' \
  -d '{"routing.risk_models": "{\"approve\":\"opus\",\"review\":\"sonnet\",\"auto\":\"haiku\"}"}'
```

A misspelt map is rejected with 400; an empty value clears it.

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
