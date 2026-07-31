---
name: ground-before-scope
description: Use before starting a task from a title or one-line ask — read the spec's Resolved design + the live schema/data first, then restate the task from what you found. Prevents building the wrong thing from an assumed scope.
---

# Ground before you scope

## Overview

The task title is a pointer, not the spec. Scoping from the title repeatedly builds the wrong
thing: a "wire the policies tab" that the resolved design says stays a constant explainer; a
"buildable" screen blocked on a table that doesn't exist. The codebase already holds the real
scope — read it before committing to an approach.

## Procedure

1. **Read the spec's *Resolved design* / decisions section**, not just the summary. The
   decision may invert the obvious task (keep it constant; defer it; it's a different concept
   than the name implies).
2. **Query the live schema + data** the task touches. Does the table/column/enum exist? Is
   there data, or is it empty? Is the dependency (a namespace, a seam, an endpoint) actually
   present, or listed under "Depends on" as not-yet-built?
3. **Trace the real read/write path** for what you're changing (sensei `search`/`get_callers`,
   or grep) — who produces this, who consumes it, what's the current source (fixture vs real)?
4. **Restate the task in one sentence from what you found**, and check it against the title. If
   they disagree, the grounding wins — the title was a guess.
5. **If a dependency is missing**, say so and stop; don't invent it (a fake namespace, a
   fabricated fixture) to make the task "buildable".

## Done when
You can state the task's true scope, its dependencies' real status, and the exact
files/paths it touches — before writing code.
