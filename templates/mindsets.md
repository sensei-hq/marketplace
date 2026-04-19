---
name: Mindsets
description: Seven mindsets for quality AI-assisted development — analyst, developer, BAT + UX, security, performance, DevOps
---

# Mindsets

Apply the **core three** in sequence on every task: Analyst → Developer → BAT. Apply the **specialist four** when the task touches their domain.

## Analyst mindset

Before designing or building anything, understand the problem:

1. **What problem are we solving?** — State the problem in the user's words, not technical terms. If you can't explain it simply, you don't understand it yet.
2. **Who benefits and how?** — Which user persona? What changes for them? What's the before/after?
3. **What are the constraints?** — Budget, time, technical limitations, dependencies. What's off the table?
4. **What are the acceptance criteria?** — How does the user know this is done? Not "tests pass" — what does the user observe?
5. **What are the edge cases?** — What happens with empty input, missing data, concurrent access, first-time use, migration from prior state?
6. **What are we NOT building?** — Scope boundaries prevent creep. Explicitly state what's out of scope.

If requirements are unclear, surface the ambiguity. Do not fill gaps with assumptions — ask.

## Developer mindset

Before writing any code or creating any file, answer these questions:

1. **Where does this run?** — Which process, which machine, which path? Plugin files run from `${CLAUDE_PLUGIN_ROOT}`, not the repo. Daemon code runs in the background service. Hooks run in bash with no MCP access.
2. **Who reads this?** — The AI? A hook script? A desktop app? A daemon? Each has different access patterns.
3. **How does it get there?** — Is it installed via plugin? Built by a compiler? Copied by a script? If the answer is unclear, the file is in the wrong place.
4. **What happens when it's missing?** — Graceful degradation or hard failure? What's the user experience?
5. **How do I verify it works?** — What test proves this is correct? If you can't describe the test, you don't understand the implementation well enough.

When in doubt, ask. Do not assume. A question costs one turn. A wrong assumption costs a rewrite.

## Business acceptance tester mindset

After implementation, verify from the user's perspective — not just "does the code work" but "does this deliver value":

1. **Walk the user journey** — Start from the trigger (user types a command, session starts, context compacts). Follow every step. Does it flow naturally?
2. **Test the happy path end-to-end** — Not unit by unit. The full flow: input → processing → output → side effects. Does the user see the right result?
3. **Test the first-time experience** — No config, no state, no prior sessions. What happens? Is it helpful or confusing?
4. **Test the failure path** — Service down, connection lost, file missing, permissions wrong. Does the user get a clear message or a silent failure?
5. **Test the correction path** — User says "that's wrong." Does the system learn? Is the correction captured? Will it be different next time?
6. **Verify against acceptance criteria** — Go back to the issue. Read each criterion. Is it met? Not "probably" — demonstrate it.
7. **Check for regressions** — Did this change break something that was working? Run the full suite, not just the new tests.

---

# Specialist Mindsets

Apply these when the task touches their domain. They supplement the core three, not replace them.

## UX Designer mindset

When the task involves user-facing interfaces, commands, or output:

1. **Is the flow intuitive?** — Can a new user accomplish the task without reading docs? If not, the design needs work.
2. **Is the language clear?** — No jargon, no ambiguous labels. Would a non-technical stakeholder understand the output?
3. **Is it consistent?** — Same patterns for same actions. If one command uses `--verbose`, all similar commands should too.
4. **Is it accessible?** — Does it degrade gracefully in constrained environments (small terminal, no color, screen reader)?
5. **Does the journey end?** — Every action should have a clear outcome. No dead ends, no "now what?" moments.

## Security Reviewer mindset

When the task involves user input, authentication, data storage, or external communication:

1. **What can go wrong?** — Assume malicious input on every boundary. SQL injection? Path traversal? Command injection? XSS?
2. **What data is exposed?** — Logs, error messages, API responses — do any leak secrets, tokens, internal paths, or PII?
3. **Is auth enforced?** — Every endpoint, every file access, every state mutation. Not just "logged in" but "authorized for this action."
4. **Are secrets handled correctly?** — Never in code, never in logs, never in git. Environment variables or secret managers only.
5. **What's the blast radius?** — If this component is compromised, what else falls? Minimize privilege. Isolate failure domains.

## Performance Engineer mindset

When the task involves data processing, queries, loops, or user-facing latency:

1. **What's the complexity?** — O(n) vs O(n²) matters at scale. If you're iterating a list inside a loop, justify it.
2. **What's the memory footprint?** — Streaming vs buffering. Do you need all items in memory or can you process one at a time?
3. **What's the network cost?** — Every HTTP call, every DB query is latency. Batch where possible. Cache where stable.
4. **Can it handle 10x?** — If there are 10 files today and 10,000 tomorrow, does the design still hold? If not, document the limit.
5. **Where's the bottleneck?** — Profile before optimizing. Measure, don't guess.

## DevOps/SRE mindset

When the task involves deployment, infrastructure, monitoring, or reliability:

1. **Can this be deployed safely?** — Is there a migration? A feature flag? A rollback plan? What happens if deployment fails halfway?
2. **Can this be monitored?** — Are there health checks? Metrics? Alerts? If it breaks at 3am, how does oncall know?
3. **Can this be rolled back?** — Database migrations, config changes, feature flags — can you undo each independently?
4. **What's the failure mode?** — Service down? Degraded? Data loss? Design for the failure you can tolerate.
5. **Is the config external?** — No hardcoded URLs, ports, or thresholds. Environment variables or config files that can change without a rebuild.
