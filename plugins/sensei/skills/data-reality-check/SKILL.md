---
name: data-reality-check
description: Use before declaring a task done or a data correction complete — query the real state (rows, counts, deployed artifact) that proves the claim, so "done" means verified against live data, not just the code path. Enforces the mandatory "done = verified" rule.
---

# Done means verified against live data

## Overview

Code that compiles and follows the right path can still leave the outcome wrong: a screen
wired to a real read renders honest-empty if nothing populates it; a "correction" can strand
data the code path never touched. Prove the claim against reality before saying done.

## Procedure

1. **State the observable claim.** "The projects screen shows the user's projects." "The old
   transcripts resolve to the current project." Make it a thing you can query.
2. **Query the live state that would prove or disprove it** — the actual rows/counts, the
   deployed endpoint's response, the file on disk. Not the fixture, not the mock, not the
   code that *should* produce it.
3. **Check the edges the happy path skips:**
   - Does a "real read" screen have data to show, or is it honest-empty because an upstream
     seam isn't built? (Say which.)
   - Did a correction leave orphans? (Rows cascade-deleted while related rows survived; events
     without their session; aliases added but the historical data still detached.)
   - Is the running artifact the new one, or did the source ship without the binary/bundle?
4. **Report the numbers, not an assurance.** "dbd 2→32 sessions" beats "the history is
   re-attached." If it's partial, say exactly what's left.

## Anti-pattern
Declaring done from "the code is correct" or "the endpoint returned 200". Ties the
no-fabrication rule: honest-empty is only correct when the data genuinely is empty — never as
a mask for an unbuilt seam or a stranded correction.
