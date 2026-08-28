---
description: Stage 1 of 4 — turn a vague ask into a grounded, scoped problem statement, read against the real codebase rather than assumed
argument-hint: An idea, an issue number (e.g. "#42"), or a one-line problem statement
---

# /sensei:analysis — stage 1 of 4

`**analysis** → design → build → complete`

Turn "we should do X" into a problem worth solving, scoped against what is actually there.

Three things happen here — divergent thinking, requirement elicitation, and grounding — and the
third is the one that is usually skipped. **A one-line ask carries an implied model of the
codebase, and that model is where wrong assumptions enter.** By the time it reaches design it has
hardened into prose; by build it has hardened into code.

---

## Step 0 — Resume

Run `/sensei:session`. If this continues existing work, pick up the thread rather than restarting
it. If it is genuinely new, say so.

## Step 1 — Ground before you scope

**Before** brainstorming, before writing anything down: go read.

Invoke the `ground-before-scope` skill. Read the relevant spec's Resolved design, the live schema,
and the actual data — then restate the ask in terms of what you found. This exists as a skill
already and is skipped constantly, which is exactly why it is step 1 of stage 1 rather than
advice.

Concretely, for the subject of the ask:

- What already exists that does part of this? Search for it; do not recall it.
- What does the schema actually say — columns, constraints, enum values?
- What does the real data look like — how many rows, what distribution, what is NULL?

Use the sensei MCP tools (`search`, `get_callers`, `get_patterns`) over grep where they work: the
indexed graph answers "what calls this" properly, and "nothing calls this" is precisely the kind
of claim that later turns out false.

**Write down what you found that surprised you.** Those are the assumptions you were carrying.
They are the most valuable output of this step and they belong in the analysis.

## Step 2 — Diverge

Now brainstorm. `/sensei:brainstorm` and `/sensei:idea` for options, `/sensei:persona` when the
question is who this serves and what they would call success.

Grounding first, deliberately: brainstorming against an imagined codebase generates options that
cannot be built, and they are the ones that sound best.

## Step 3 — Elicit the requirement

What is the actual need under the ask? `/sensei:intake` and `/sensei:analyze` where the ask is an
issue or an external report.

Pin down:

- **Who** benefits, and how they would know it worked.
- **What "done" looks like** — observable, not "works well".
- **What is explicitly out of scope.** An unstated boundary gets crossed.
- **Which ambiguities must be resolved before design**, and which are safe to defer.

## Step 4 — Depth check

Adversarial pass, in parallel, one message:

- `sensei-analyst` — is the problem statement complete enough to design from? Constraints mapped,
  scope defined, success criteria observable?
- `sensei-plan-depth-reviewer` — would this stall an unattended run on an unanswered question?
- `sensei-persona-reviewer` — does this serve the people it claims to, and does it quietly cost
  another persona something?

Independence rules apply: separate agents, blind to each other, `NOT RUN` is never a pass, and
**verify each finding yourself** before acting on it.

## Step 5 — Fix and record

Close the gaps the depth check found — that is work, not a note for later. Then record the analysis
under `docs/analysis/`, and `/sensei:checkpoint` with the slice, what was grounded, and the next
command.

## The gate

`/sensei:design` should not start while:

- "Done" is not observable.
- A load-bearing ambiguity is unresolved and would change the design either way.
- Nothing was read. If this analysis cites no file, schema, or row count, it is an opinion about a
  codebase rather than an analysis of one.

## Wrong gate

- **Grounding produced no surprises.** Either the ask was trivial or you confirmed what you already
  believed. The second is the failure mode — go look at something you did not expect to need.
- **The scope came from the ask.** The ask is a symptom. If the scope is a restatement of the
  one-liner, step 3 did not happen.
- **Options were generated before reading.** They will be plausible and unbuildable.
