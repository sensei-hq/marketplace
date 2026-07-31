---
name: recall-canon
description: Use before designing or re-opening a decision — check the loaded memory index / governance rules for a prior settled decision, and if one exists, cite and apply it instead of re-deriving. Stops re-litigating decisions the user already made.
---

# Recall the canon before re-deriving

## Overview

A settled decision that isn't recalled gets re-derived — often wrongly, and repeatedly. The
same wrong model can resurface across days if the canonical decision lives on disk but isn't in
the loaded index. Before designing, look for the answer that already exists.

## Procedure

1. **Before opening a design or a "should we…" question, search the canon:** the loaded memory
   index (MEMORY.md), governance rules (`get_rules`), and layered context (`get_layered_context`
   / `search`). Look for a prior decision on this exact topic.
2. **If a settled decision exists, cite it and apply it** — do not re-open or re-argue it. If
   you think it's wrong, raise *that* explicitly with the user; don't silently re-derive a
   different answer.
3. **If you find yourself re-explaining a model the user has corrected before**, stop — that's
   the signal a canonical decision exists and isn't loaded.
4. **When a decision is made or corrected, record it once in the LOADED index** (not just a
   detached file): a one-line pointer in MEMORY.md, a governance rule via `save_memory`, or a
   dated decision doc that the index references. A decision only reachable off-index will be
   re-derived.
5. **Keep the distinction clean** — e.g. don't conflate two orthogonal axes the canon separates
   (a settled model has its boundaries stated; honor them).

## Done when
You've confirmed no settled decision already answers the question — or you've found it, cited
it, and applied it — before deriving anything new.
