---
name: dry-check
description: Use BEFORE writing any new function, type, constant, or helper — search the indexed code graph (search / get_duplicates / get_callers) for an existing implementation first, and reuse it if one exists. The check is tool-backed, not a guideline; skipping it is how duplicate logic gets shipped.
---

# Search the index before you write it

## Overview

The repo is indexed as a code graph and the daemon exposes tools to query it — so "does
this already exist?" is a lookup, not a guess. Writing a new function without that lookup
is how a fourth near-identical helper gets added and a shared utility gets missed. This is
the DRY rule made operational: the tool is right there, use it.

## Procedure

1. **Before writing a new function / type / constant / helper, search for it** by name AND
   by concept:
   - `search("<what it does>")` — find functions/types by name or concept (not grep).
   - `get_duplicates()` — surfaces near-duplicate functions already in the tree.
   - `get_callers("<related fn>")` / `get_callees(...)` — find where similar work is done.
   - `get_patterns` / `match_pattern` — is there an established pattern for this?
2. **If an implementation exists, reuse it** — import/extend the shared one. If it's close
   but not exact, extend or refactor it rather than adding a parallel copy. Three
   near-identical implementations are a refactor signal, not a reason to add a fourth.
3. **If you believe a new one is justified anyway** (the existing one is wrong to depend on
   here), say *why* explicitly — don't silently duplicate. Per the repo's hard rules, a
   deliberate deviation is raised, not hidden.
4. **Record what you searched** so review can confirm it: name the query/tool you ran and
   what it returned. A reviewer (or `sensei-developer`) will check that the lookup happened
   before net-new code — an unsearched new function is a finding.
5. **Fallback:** if the daemon is unreachable, `Grep`/`Glob` for the symbol + concept and
   say you fell back.

## Done when

You've searched the index (named tool + query) for an existing implementation before
writing net-new code, and either reused what exists or stated why a new one is warranted —
so the "was this already here?" question is answered with a tool result, not an assumption.
