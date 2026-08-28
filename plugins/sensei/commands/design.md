---
description: Stage 2 of 4 — turn an understood problem into a spec and a plan, with every claim about existing code verified before build can start
argument-hint: A spec path, an issue number, or the slice name from /sensei:analysis
---

# /sensei:design — stage 2 of 4

`analysis → **design** → build → complete`

Produce the spec and the plan. Then prove the spec is not built on something that is not true.

This stage owns the failure that costs the most: **the spec asserts something about the existing
codebase, it is wrong, and nobody finds out until implementation touches reality.** Two real
examples, both from one session, both in specs written by someone who knew the codebase well:

> *"Sign-in state lives only in the Keychain and nothing can list it."* — `sensei.personas` already
> listed it. The claim was the sole justification for a new table, which was designed, specced, and
> nearly built.

> *"`unpushed_metric_rows` is the one production push path."* — it had no production caller at all.
> The claim set the scope of an entire slice.

Neither is a reasoning error. Both are perfectly good prose. **A faceted spec review would have
approved both**, because reviewing prose about code is not the same as checking code. That is why
this stage has a verification step and not just a review step.

---

## Step 0 — Resume the thread

Run `/sensei:session` and read the checkpoint. Do not ask the user to re-explain what
`/sensei:analysis` already established; if the analysis output is not in context, read it from
`docs/` rather than reconstructing it from the argument.

If there is no analysis for this work, say so and run `/sensei:analysis` first. Designing from a
one-line ask is how an assumed scope becomes a spec.

## Step 1 — Write the spec

Use `/sensei:spec` (and `/sensei:blueprint` or `/sensei:mockup` where the slice is a screen). The
existing commands do the work; this stage sequences them and adds the gate.

Whatever else it contains, the spec must have:

- **Resolved design** — what we are building, decided, not a menu of options.
- **Done gate** — checkable statements. "Works correctly" is not one.
- **Wrong gate** — the specific ways this could pass its done gate and still be wrong.
- **Claims** — see below. This is the part that is new and the part that is load-bearing.

## Step 2 — Write the claims ledger

Go back through the spec and pull out **every assertion about what already exists**. For each,
write the check that would DISPROVE it and the result that would count as disproof.

```markdown
## Claims (verified 2026-08-28)

| claim | check | expect | actual | verdict |
|---|---|---|---|---|
| nothing can enumerate signed-in personas | `rg -c 'verified_at' crates/senseid/src/db/pg_store/personas.rs` | 0 | 3 | FALSE |
| `repositories.dojo_id` has no Rust reader | `rg -c 'dojo_id' -g '*.rs' crates/` | 0 | 0 | CONFIRMED |
```

Signals that a sentence is a claim: **nothing, only, never, always, the one, no X exists,
unused, cannot be answered today, 0 rows.** Absolutes are the highest-yield — a claim that
"nothing can list it" is one command from being disproved, and it is usually holding up a whole
section.

Statements about the FUTURE ("we will add") and preference ("it is cleaner to") are intent, not
claims. Do not ledger them; you will drown the table and the real claims will hide.

**A spec with no claims section is not finished.** Nearly every spec asserts something about the
current codebase — if you found none, you did not look.

## Step 3 — Verify, independently

Launch `sensei-claims-verifier` on the spec.

It re-derives each claim **without** reading your evidence first — deliberately, because checking
an author's citation in the author's frame reproduces the author's conclusion. Its verdicts are
not advisory:

- **Any `FALSE` → the spec is wrong. Stop and fix it.** Not a footnote, not a follow-up. Find
  everything that depended on the false claim and re-decide it. In the persona example, `FALSE`
  deleted an entire proposed table and replaced it with a one-line query.
- **`MISLEADING` → rewrite the sentence.** Technically-true-but-reader-will-conclude-wrong is how
  "no production caller" gets read as "no caller".
- **`UNCHECKABLE` → make it checkable or delete it.** A claim nobody can test is a claim nobody
  can maintain.

Record the corrected verdicts back into the ledger. A `FALSE` that was found and fixed is worth
keeping in the table with its history — it tells the next reader that this ground was contested.

## Step 4 — Faceted review

Whether the facts hold (step 3) and whether the design is good are different questions. This is the
second one, run with the same rigor `/sensei:review` applies to code.

### 4a. Build the evidence bundle once

Every reviewer must see the same thing, or their findings cannot be compared:

```
the spec path + full text
git log --format='%h %s' -- <spec path>        # how it got here
the parent spec, when this one overrides another
the DDL / types / API surface the spec talks about
```

Include the source the spec describes, not just the spec. A reviewer given only prose can only
review prose — which is precisely the gap step 3 exists to close.

### 4b. Launch in parallel, blind to each other

One message, multiple Agent calls:

- `sensei-plan-depth-reviewer` — is every piece deep enough to build unattended? No TBDs, observable
  criteria, pre-answered ambiguities.
- `spec-doc-reviewer` — are the required sections real rather than ceremonial? Do the done gates
  agree with the mockup and the DDL?
- `sensei-data-correctness-reviewer` — re-derive every computed value, key, or grouping the spec
  defines. A wrong key in a spec becomes a wrong key in three files.
- `sensei-spec-conformance-auditor` — does the spec agree with every OTHER surface that documents
  the same behaviour, and does it contradict the parent spec it claims to override?
- `sensei-security-reviewer` — only when the slice touches auth, identity, secrets, or a trust
  boundary. **Say so if you skip it.**

Give each the same bundle and this instruction verbatim:

> You are one of several independent reviewers. Stay strictly inside your own mandate — another
> reviewer owns everything else. Report only findings you can prove, with the evidence field filled
> from something you actually read or ran. If you find nothing, output exactly `NO FINDINGS` and
> nothing else.

### 4c. Dedupe and triage

- Same section, same underlying defect → one finding at the **highest** severity claimed, evidence
  merged. Note the corroboration count: two independent reviewers landing on one paragraph is a
  strong signal, not a duplicate.
- Two reviewers contradicting each other → do not average. Go read the code and decide, then record
  the verdict and the reasoning.
- **Verify every finding yourself before acting on it.** Adversarial reviewers produce
  plausible-but-wrong findings, and a spec is cheap to change in the wrong direction — a bogus
  finding acted on becomes a design decision nobody can trace.
- **Check provenance.** A defect inherited from the parent spec is real but is not this spec's
  work. Confirm against the parent before claiming either way, and report those separately — this
  is how a correction lands in the document that actually owns the mistake.
- `NO FINDINGS` contributes nothing; do not paraphrase it. A reviewer that errored is **NOT RUN**,
  never a pass — name it.

Present the triage table before rewriting: severity, one-line claim, section, must-fix vs report-only.

**CRITICAL + HIGH + MEDIUM → fix now.** A MEDIUM in a spec is worse than a MEDIUM in code: code has
a test suite around it, and a spec is copied into a task list unexamined.

### 4d. The honest difference from code review

`/sensei:review` fixes red-first — a failing test, then the fix. **Prose has no red state**, and
pretending otherwise would be ceremony. The nearest real equivalent, and what to do instead:

- A finding about a **claim** → it belongs in the ledger. Add it, run the check, let the verdict
  decide. That IS the red test.
- A finding about **depth or ambiguity** → the check is that the question now has an answer written
  down. Re-read the section and confirm a builder could act on it without asking.
- A finding about **contradiction** → re-run `sensei-spec-conformance-auditor` on the rewritten
  section only. It is cheap and it is the one class that reliably regresses during a rewrite.

Rewriting a spec introduces new claims. **Any rewrite that asserts something new about existing
code sends you back to step 2** to ledger it, and step 3 to verify it. That loop is the point.

## Step 5 — Fix, then plan

Fix everything the verification and review turned up — the spec is prose, so the fix is a rewrite,
not a test. Then run `/sensei:plan` to register the plan graph.

Plan against the CORRECTED spec. Planning against the draft is how a false claim survives into a
task list, where it stops looking like a claim and starts looking like work.

## Step 6 — Checkpoint and hand off

Run `/sensei:checkpoint` with: the slice, the spec path, which claims were found false and what
changed as a result, and the exact next command. Mirror it into `docs/CHECKPOINT.md`.

Then report:

1. The spec path, and its Resolved design in two lines.
2. **The claims ledger** — how many checked, how many `FALSE`, and what each false one cost.
3. Review findings fixed; anything dropped in verification, with why.
4. Reviewers `NOT RUN`, named.
5. The registered plan, and the first task.

## The gate

`/sensei:build` should not start while any of these is true. Check each, show the evidence, and
name the one that blocks you.

1. A claim is `FALSE` and the spec still depends on it.
2. A claim is `UNCHECKABLE` and it is load-bearing.
3. A CRITICAL, HIGH or MEDIUM review finding is unaddressed.
4. The done gate contains a statement nobody can check.
5. A reviewer is `NOT RUN` and its mandate is plainly in scope.
6. The rewrite introduced a new claim that has not been through steps 2–3.

Then:

- **GATE: PASS** — the spec is ready to plan against and build from. Say so, and give the first task.
- **GATE: BLOCKED** — name exactly what is unresolved and the next command.

Report faithfully. If a reviewer errored, say so. Never report the gate as passing on a check you
did not run — a spec gate that lies costs a whole slice, not a commit.

## Wrong gate

Ways this stage passes and is still wrong:

- **The ledger only contains claims that were easy to check.** The load-bearing premise is
  usually the vague one. If nothing in the table is an absolute, you ledgered the footnotes.
- **The verifier confirmed everything.** Possible, but check that it re-derived rather than read
  your citations — an agreeable verifier is worse than none, because it launders the assumption.
- **Claims were verified weeks ago.** The repo moved. Re-run the ledger at build start; it is cheap.
- **The review passed because the reviewers were asked about the spec, not the code.** Prose review
  cannot catch a false premise. That is what step 3 is for, and it is not optional.
