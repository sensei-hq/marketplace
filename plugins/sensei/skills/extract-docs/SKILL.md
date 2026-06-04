---
name: extract-docs
description: Use to generate or update documentation for a module — extracts exports, infers behaviour from implementation, and writes accurate docstrings or markdown documentation.
---

# Documentation Extraction

## Overview

Generate accurate, minimal documentation from existing code. Avoids writing docs that drift from implementation by grounding every statement in what the code actually does.

## Procedure

### Step 1 — Map the module
```
call: search("<module path or key symbol>")
```
`Read` the module's entry file to enumerate its exports. This is the documentation surface.

### Step 2 — Load each export
For each exported symbol:
```
call: get_callers("<name>")
call: get_callees("<name>")
```
Note: signature, what it calls, what calls it. For complex functions, `Read` the implementation directly.

### Step 3 — Write documentation

**For functions:**
- One-line summary: what it does (not how)
- Parameters: type + purpose for each
- Return value: what it returns and when it might be null/undefined/throw
- Side effects: if any (writes to DB, emits events, etc.)

**For types/interfaces:**
- Purpose: what concept does this represent?
- Required vs optional fields
- Invariants: what must always be true about a valid value of this type?

**For modules:**
- What problem does this module solve?
- Key exports and their relationships
- What NOT to use this module for

### Step 4 — Validate against implementation

Before finalising each doc:
- Every parameter described must exist in the signature
- Every return case described must be reachable in the code
- No "may" or "might" for behaviour that's deterministic

### Step 5 — Record coverage
```
call: propose_memory(scope="project", type="decision", title="Documented: <module name>", content="<N> exports documented; coverage complete as of <date>", triage_signal="docs_extracted")
```

## Documentation Anti-patterns

| Anti-pattern | Fix |
|---|---|
| "Returns the result" | Describe what the result IS |
| Documenting private internals | Document public exports only |
| Copy-pasting the implementation | Summarise the intent, not the steps |
| "This function..." | Start with the verb: "Loads...", "Returns...", "Validates..." |
| Adding @param for obvious params | Only document params that aren't obvious from the type |
