---
description: Stage 4 of 4 — verify the slice against reality, close the loop on docs and issues, and record what was learned
argument-hint: Optional slice name or issue number; defaults to the active phase
---

# /sensei:complete — stage 4 of 4

`analysis → design → build → **complete**`

The other three stages have adversarial review built in. This one does not, deliberately: there is
nothing left to argue about. What remains is proving the thing works outside the test suite, and
leaving the next session able to pick it up.

---

## Step 0 — Resume

Run `/sensei:session`. Establish what the slice claimed to deliver, so "complete" is measured
against the spec's done gate rather than against what happened to get built.

## Step 1 — Run the done gate, for real

Take the spec's **Done gate**, item by item, and demonstrate each one. Not "the code does this" —
show the observation.

Invoke `data-reality-check`. Query the rows, call the endpoint, run the installed binary. A green
suite proves the code matches its tests; it says nothing about whether the tests asserted the thing
the user asked for.

Where the slice has one, `done-gate-verifier` runs the gates independently and reports evidence per
item — use it rather than self-assessing.

**Any gate item you cannot demonstrate is not done.** Say which, and why. Reporting three of five
and calling it complete is worse than saying three of five.

## Step 2 — Hunt the wrong gate

The spec's **Wrong gate** lists the ways this could pass and still be wrong. `done-gate-verifier`
asks "is the good state present?"; run `wrong-gate-hunter` to ask the opposite — "is the bad state
absent?" They are different questions and a slice can pass one while failing the other.

## Step 3 — Verify what shipped, not what was built

If the slice produced an artifact — a binary, a package, a deployed worker — **install it and re-run
the original reproduction**. `verify-deploy` covers this.

A fix that works in the working tree and not in the shipped artifact is not a fix, and this is the
step that catches a build that silently packaged the wrong thing.

## Step 4 — Close the loop

- **Docs** — `/sensei:docs`. Anything the slice made untrue in a README, skill, or spec is now
  drift, and drift compounds.
- **Spec** — mark the done gates that now pass. Record decisions taken during build that the spec
  did not anticipate, especially deviations and why.
- **Claims ledger** — update it. Claims that changed during build should show their new verdict; a
  ledger nobody maintains is worse than none, because it looks authoritative.
- **Issue** — `/sensei:commit` for the zero-errors check and the issue reference.
- **Backlog** — anything found and deliberately not fixed goes to `docs/backlog.md` with the
  reasoning. A known gap in the backlog is a decision; the same gap in nobody's head is a bug.

## Step 5 — Record what was learned

`/sensei:checkpoint`, mirrored into `docs/CHECKPOINT.md`: the slice, what is done, what remains,
the exact next command, open questions, anything known-broken.

Then, and this is the part that pays forward: **capture what surprised you.** Invoke
`knowledge-capture`. Specifically —

- Assumptions that turned out false, and what the truth was. These are the seed of the next
  design's claims ledger.
- Facts that were expensive to establish and are not written anywhere (a port, a normalisation
  quirk, a tool that reports success on a partial apply).
- Anything the process itself got wrong, which is a `docs/backlog.md` entry about the process.

## The gate

The slice is complete when every one of these holds:

1. Every done-gate item demonstrated against real data or a real artifact.
2. No wrong-gate anti-pattern tripping.
3. The shipped artifact reproduces the fix, where the slice shipped one.
4. Docs, spec and claims ledger reflect what is now true.
5. Checkpoint written, in both places.

## Wrong gate

- **"The tests pass" standing in for the done gate.** The most common one. Green means the code
  matches the test.
- **Verified in the working tree, never in the artifact.** The build can package the wrong thing,
  and nothing else catches it.
- **Docs left for later.** Later is a different session with none of this context.
- **A partial completion reported as done.** Say three of five. Scaling the work down is the user's
  call, not yours.
- **Nothing recorded as learned.** If the slice taught you nothing, either it was trivial or the
  lesson is walking out the door with your context.
