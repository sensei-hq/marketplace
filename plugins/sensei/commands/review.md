---
description: Adversarial whole-slice review — depth-gated specialist reviewers in parallel, deduped and triaged, every critical/high/medium fixed red-first before the commit gate opens
argument-hint: "[git rev-range | --staged | --worktree | scope]  (default: staged, else worktree, else HEAD~1..HEAD)"
---

## What this command does

Checks quality across multiple dimensions, then asks the question a per-file check cannot:
**what did the whole slice get wrong that each part got right?** Auto-triggered after
`/sensei:build`; also available on demand.

**Do not summarize the plan back to the user before starting. Run it.**

## Procedure

1. Call `log_event(type="command_invoked", data="{\"command\":\"review\"}")` — MANDATORY. Review is cross-cutting — do NOT change the workflow phase; it runs within the current phase (typically build or validate).
2. Read `.sensei/rules.md` — rules inform what to check

### Step 0a: Resolve the slice (MANDATORY — before anything else)

Decide what is under review, in this order. Announce which you chose and why, in one line.

1. `$ARGUMENTS` is a rev-range or a flag → use it.
2. Staged changes exist (`git diff --cached --stat` non-empty) → the staged set.
3. Unstaged changes exist (`git diff HEAD --stat` non-empty) → the working tree.
4. Otherwise the tree is clean → **say so explicitly**, then fall back to the most recent
   substantive commit range (skip pure version-bump/formatting commits) and label the run as
   reviewing committed rather than pending work. **Never silently pretend there was a diff** — a
   review of nothing reports clean, and clean is exactly what it must not say.

Build the evidence bundle **once** and hand the same one to every reviewer, so they are all
looking at the same slice:

```
git diff <range> --stat
git diff <range>                 # full patch
git diff <range> --name-only     # changed files
git log <range> --format='%h %s%n%b'
```

If the patch is very large, still pass the **full file list** and the commit messages, and instruct
each reviewer to read changed files in full from disk rather than working from hunks.

### Step 0: Resolve review depth (MANDATORY — do this FIRST)

The gate that decides *how hard* to review, so rigor lands on the changes that matter.

1. Get the changed paths: `git diff --name-only` (or the scope's files).
2. Call `resolve_risk_class(paths=[...], task="<current task>")` → `{class, reasons}`.
3. Set the depth from `class` and state it (+ reasons) at the top of the report:
   - **approve** — identity / auth / money / secrets / schema / governance touched. Run ALL checks below **and** an adversarial pass: for each finding try to *refute* it, and actively hunt an input that breaks the change; require **live verification evidence** (the actual test-run tail, a `psql` count, a `curl :7744` status, a Playwright run for UI) — never "looks correct"; and state explicitly that this change needs **human sign-off**.
   - **review** — production source. Run all checks with real verification (do not assume-green; run the tests).
   - **auto** — docs / tests / config only. A light pass suffices; note the class and skip the heavy adversarial pass.

### Check 1: Pattern conformance

1. Get modified files from `git diff --name-only` (or all files if scope is "all")
2. Call `match_pattern()` to get all detected patterns for the project
3. For each modified file containing classes/types:
   - Call `get_pattern_for(symbol)` for key symbols
   - If symbol belongs to a pattern: verify it follows the pattern's conventions
   - If symbol looks like it should belong to a pattern but doesn't: flag it
4. Log findings: `log_event(type="review_finding", data="{\"check\":\"pattern\",\"...\"}")` — MANDATORY

### Check 2: Duplication (+ dry-check)

1. Call `get_duplicates()` — returns functions with identical signatures in different files + same-name functions across files
2. Flag any duplicates involving modified files
3. For each NET-NEW function/type, confirm a `dry-check` was done — the author searched (`search`/`get_duplicates`/`get_callers`) for an existing implementation before writing it. An unsearched net-new function that overlaps existing code is a finding.
4. Log findings — MANDATORY

### Check 3: Project conventions

1. Call `get_project_conventions()` — returns naming patterns, directory conventions, design patterns
2. Check if modified code follows established conventions
3. Flag deviations

### Check 4: Test-intent audit (not just coverage)

Green tests that assert a fallback or a mock prove nothing — audit the tests against the requirement:

1. For each modified function, confirm a test exists **and** that it would FAIL if the feature regressed — name the production change that breaks it. If nothing meaningful would, the test is vacuous.
2. Flag tests that assert a fallback / default / fixture / mock value instead of the real resolved value (grep the code-under-test for `unwrap_or_default` / `unwrap_or(` / `.ok()` / mock names, and confirm no test locks in the masked value), plus vacuous assertions (`assert!(true)`, `is_ok()` with no value check, happy-path-only).
3. Map each acceptance criterion → a test that would fail on its regression; flag uncovered criteria.
4. On **review** or **approve** depth (Step 0), dispatch the `sensei-test-reviewer` agent for the full audit including a mutation spot-check (break the code → the test must fail → restore). On **auto** depth the lightweight check above suffices.

### Check 5: Doc drift

1. Check if modified code files are referenced in any docs
2. If a doc references a modified file, flag it for review

### Check 6: Persona validation

1. Read `.sensei/personas/*.md` — if any exist:
2. For each persona (or just the active one if set):
   - Evaluate modified code/features against the persona's `validates` criteria
   - Flag any criterion that isn't met
3. If no personas are defined, skip this check

### Check 7: Whole-slice adversarial swarm (depth **review** or **approve** only)

Checks 1–6 read the diff. This one asks the question a diff cannot answer: **what did the whole
slice get wrong that each part got right?** It is the post-implementation counterpart to the
spec audit `/sensei:build` runs at Step 4.5.

Dispatch **in parallel — one message, multiple Agent calls**, each blind to the others.
Independence is the point; a shared draft collapses five perspectives into one:

- `sensei-failure-mode-reviewer` — unbounded waits, poison pills, partial application reported as
  success, discarded rollback/cleanup errors.
- `sensei-data-correctness-reviewer` — re-derives every computed value rather than trusting the
  test as an oracle. Wrong denominators, wrong keys, domain-vs-range mistakes, fabricated defaults.
- `sensei-spec-conformance-auditor` — implementation vs every doc surface, **and** the spec itself.
- `sensei-security-reviewer` — secrets escaping to a second sink, injection, data exposure.
- `sensei-test-reviewer` — tests asserting the wrong property (already dispatched by Check 4; do
  not dispatch it twice — fold its findings in here).

Give each the **same evidence bundle** from Step 0a, the repo path, and this instruction verbatim:

> You are one of several independent reviewers. Stay strictly inside your own mandate — another
> reviewer owns everything else. Report only findings you can prove, with the evidence field
> filled from something you actually read or ran. If you find nothing, output exactly
> `NO FINDINGS` and nothing else.

Skip a reviewer only when its mandate is genuinely absent. In practice: run them all — a slice with
no test files still needs test-quality, because it checks for the *missing* test. If you do skip
one, **say which and why**; a silent skip reads as a clean result.

Then **dedupe and triage**:
- Same file and line within ±3, same defect → one finding at the **highest** severity claimed. Merge
  the evidence and red-test fields from every reviewer that found it. Note the corroboration count;
  two independent reviewers on one line is a strong signal, not a dup.
- Same defect at different call sites → keep separate; each needs its own fix.
- Two reviewers contradicting each other → do not average. Read the code and decide, and record why.
- **Verify every finding you intend to fix, yourself.** Adversarial reviewers produce
  plausible-but-wrong findings. Reproduce it or trace it in source until you are convinced. Say
  which you dropped and why — a dropped finding is a result, not an omission.
- **Check provenance.** A defect that is pre-existing at HEAD is real but is not this slice's work.
  Confirm with `git show HEAD:<path>` before claiming either way, and report those separately
  rather than folding an unrelated behaviour change into the fix.
- An agent returning `NO FINDINGS` contributes nothing; do not paraphrase it. An agent that errored
  is **NOT RUN**, never a pass — name it.

Present the triage table before fixing: severity, one-line claim, file:line, must-fix vs report-only.

- **CRITICAL + HIGH + MEDIUM → fix now.** No deferral to a follow-up issue. A MEDIUM is a defect
  with a *narrower trigger*, not one that matters less — "unlikely input" is a prediction, and the
  reviewers only rank what they can see.
- **LOW → report only.**

Fixing MEDIUMs makes the change set large, so keep it reviewable by **grouping fixes by concern,
not by severity**: everything touching one subsystem lands together as its own commit. Say up front
which groups you identified. If two findings share a root cause, fix the cause once and say it
closes both.

### Step 8: Fix each must-fix, red first

One finding at a time, group by group:

1. **Write the failing test first**, from the finding's red-test field. It asserts the property, not
   the current output.
2. **Run it and show the actual failure output.** If it passes on the first run, the test or the
   finding is wrong — stop and resolve that before touching production code. A test that never went
   red proves nothing.
3. Implement the smallest fix that makes it pass.
4. Green — show the output.
5. **Run the full suite** and confirm nothing else broke.
6. Only then, the next finding.

Never batch the implementation and the test together, and never write the production change before
the red test exists.

You will introduce defects while fixing. Two habits catch them: run the **full** suite after each
fix, not just the new test; and for any guard-style test that is green on arrival, apply the
mutation it claims to catch and confirm it goes red — **in a scratch copy, never the working tree.**

If a fix is larger than expected, that is work to be done, not grounds to re-rank it downward. If
one is genuinely blocked, finish every other must-fix and report exactly what remains and what
unblocks it.

### Step 9: The commit gate

The gate opens only when **all** of these hold. Check each and show the evidence.

1. Zero CRITICAL, HIGH and MEDIUM findings remain unfixed.
2. Every fix has a test observed to fail before it and pass after.
3. The full test suite passes.
4. The linter passes with warnings as errors.
5. The formatter check passes.

**Verify the real exit status, never a masked wrapper.** Run each gate command on its own and read
its exit code. Do not pipe to `tail`/`head` and read the pipe's status. Do not accept
`grep -c FAILED` returning 0 as evidence — that also matches when nothing compiled. Prefer the
project's own scripts over invoking tools directly.

Then:

- **GATE: PASS** — the slice is clean and ready to commit. **Do not commit.** That is the user's
  call; hand them the state.
- **GATE: BLOCKED** — name exactly what is failing and the next command.

### Report

In this order:

1. The slice reviewed, and how it was resolved (Step 0a) — including "the tree was clean" when it was.
2. Depth class and reasons (Step 0).
3. Reviewers run; any **NOT RUN**, named.
4. Findings fixed — severity, claim, the red test, the fix.
5. Findings dropped in verification, and why.
6. LOW findings, and anything pre-existing at HEAD, carried forward for the user's decision.
7. The gate result with its evidence.

## Important

- All MCP calls are MANDATORY
- Log every finding as a review_finding event — this feeds metrics
- Be specific: "sql.rs doesn't implement LanguageAdapter" not "pattern issue found"
- Suggest fixes, not just problems
- **Report faithfully.** If a suite failed, show the output. If a step was skipped, say so. Never
  report the gate as passing on unexecuted commands.
