---
name: design
description: Use before implementing a new feature — maps existing patterns, selects the right design approach, records the decision, and creates a minimal implementation plan.
---

# Design Phase

## Overview

Before writing code, identify how the feature fits into existing patterns, choose the right architectural approach, and record the decision. Prevents inconsistent structure and re-derives reasoning in future sessions.

## Procedure

### Step 1 — Load task context
```
call: context_pack(task="<feature description>", max_tokens=4000)
```

### Step 2 — Find existing patterns
Search for similar implementations:
```
call: search("<pattern keyword>")
call: get_bearings("<most relevant module path>")
```

For each candidate pattern found:
```
call: get_symbol("<pattern function>", depth=1)
```

### Step 3 — Choose approach

Evaluate options against:
- **Consistency** — does it match existing patterns in the codebase?
- **Extensibility** — will this pattern hold for 3 more features of the same kind?
- **Complexity** — check `get_complexity()` for the module you're extending
- **Coupling** — does it create unnecessary dependencies?

### Step 4 — Record the decision
```
call: record_memory({
  type: "decision",
  title: "<Architectural choice in one line>",
  content: "<Why this approach, what alternatives were considered>"
})
```

### Step 5 — Sketch the implementation

Produce:
1. Files to create/modify (with brief rationale)
2. New types/interfaces needed
3. Registration steps (where does the new code plug in?)
4. Test strategy

### Step 6 — Snapshot
```
call: take_snapshot("Design complete for <feature>; about to implement")
```

## Design Checklist

- [ ] Existing pattern identified and followed (or divergence justified)
- [ ] Decision recorded via `record_memory`
- [ ] No new abstractions unless 3+ uses exist
- [ ] Test strategy defined before coding starts

## Anti-patterns

| Anti-pattern | Fix |
|---|---|
| Start coding without checking existing patterns | Always run `search` + `get_bearings` first |
| Create a new abstraction for one use case | Wait until 3+ uses — inline it first |
| Record the decision after implementation | Record it during design — capture the *why* |
