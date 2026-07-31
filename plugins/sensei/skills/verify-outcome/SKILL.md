---
name: verify-outcome
description: Use before claiming a build/test/deploy passed, or any command "worked" — confirms the REAL result instead of a wrapper that can mask failure (piped exit codes, grep counts, cached responses). Enforces the mandatory "verify the outcome" rule.
---

# Verify the outcome, never a masked wrapper

## Overview

A "green" you didn't actually read is the top FTR-killer: a failing build reported as
passing ships a defect. The signal you check must be the real result — not a proxy that
can report success while the command failed.

## The traps (each has bitten real sessions)

- **Piped exit code** — `cargo … | tail`, `make … | tail`, `… | grep` report the *pipe's*
  exit (usually the last stage's `0`), not the command's. A failed build notifies "exit 0".
- **Count-as-pass** — `grep -c FAILED = 0` also matches when *nothing compiled* (no tests ran).
- **Cached/edge response** — a route's first hit can be a stale 404/200 from an edge cache.
- **Optimistic status field** — an endpoint returning `{ok:true}` after enqueuing async work
  hasn't done the work yet.

## Procedure

1. **Run the command so its own exit code survives.** Don't pipe the status-bearing command
   into `tail`/`grep`. If you must capture output, write to a file and read it, or check
   `${PIPESTATUS[0]}` / `set -o pipefail`.
2. **Read the actual result**, not the notification. For a backgrounded/piped run, open the
   output and look for `error[`, `test result: … failed`, `FAILED`, real panics — and confirm
   the expected pass counts (N passed, not "0 failed" with 0 run).
3. **Assert the specific effect you intended**, not a proxy: the row exists with the right
   value; the deployed route returns the expected status (cache-bust the URL); the file has
   the change. "It ran" ≠ "it did the thing".
4. **If the check itself could be masked, verify the checker.** (Did clippy actually run? Did
   the test binary compile?) A silent no-op looks identical to success.

## Done when
The outcome is confirmed from the real result and the intended effect is asserted — never from
a masked wrapper or an unread notification.
