---
name: identifying-patterns
description: Use before implementing any feature that might follow a recurring structure
in this codebase — discovers existing patterns (adapters, CLI commands, MCP tools,
dashboard routes) and writes a reusable skill recipe so future implementations follow
the same shape. Also use when adding a new structural pattern to document it permanently.
---

# Identifying Patterns

## Overview

This skill finds recurring structural patterns in the codebase, extracts the shared interface and invariants, writes a dedicated skill file for the pattern, and registers it in `PATTERNS.md`.

## When to Use

- Before implementing something that looks like it might already exist elsewhere in the codebase (e.g., "I need to add an MCP tool" — there are already 12 of them)
- When a user names a domain ("adapters", "CLI commands", "dashboard routes") and asks to add to it
- Periodically to refresh the pattern catalog after significant code changes

## Procedure

### First Run (Guided — seed a new pattern)

1. User names a domain or structural pattern (e.g., "MCP tools", "CLI commands", "adapters")
2. Search codebase for 2+ existing implementations using `search()` + `context_pack()`
3. Read 2-3 canonical examples; extract:
   - **Interface** — types/signatures every implementation shares
   - **Required exports** — what must be exported and consumed
   - **Registration step** — where implementations are registered (e.g., `mcp-server.ts`, `cli.ts`)
   - **Invariants** — what must never be omitted or renamed
4. Write `skills/<pattern-name>/SKILL.md` using the template below
5. Append an entry to `PATTERNS.md`

### Incremental Run (automated refresh)

1. Read existing `PATTERNS.md` catalog
2. For each entry, load its canonical example file
3. Compare current file content against the recipe in the pattern skill
4. If diverged: flag as stale, propose updated recipe
5. If new patterns detected (2+ implementations of same structure not yet cataloged): offer to document them

## Pattern Skill Template

```markdown
---
name: <pattern-name>
description: Use when implementing <X> in this codebase — provides the established
recipe so new implementations match the existing structure.
---

# <Pattern Name> Pattern

## What It Solves
<1-2 sentences on why this pattern exists in this codebase>

## Interface
<The types/signatures every implementation of this pattern must produce>

## Canonical Example
File: `<path/to/example.ts>`
<Key excerpt — the critical lines that show the pattern in use>

## Recipe
1. Create `<path>` with this structure: ...
2. Implement these exports: ...
3. Register in `<path>`: ...

## Invariants
- <What must never be omitted>
- <What naming convention is mandatory>
- <What must be tested>
```

## Updating PATTERNS.md

Each entry in `PATTERNS.md` follows this format:

```markdown
## <Pattern Name>

**What it solves:** <one line>
**Canonical example:** `<file path>`
**Skill:** `skills/<pattern-name>/SKILL.md`
```
