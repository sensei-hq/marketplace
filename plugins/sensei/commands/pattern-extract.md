---
description: Extract a reusable pattern from existing code and write it to PATTERNS.md
argument-hint: Description of the pattern to extract
---

## Extracting a Pattern

Goal: document a recurring implementation structure so future features can follow it instead of re-inventing it.

1. Identify the code to extract from (ask the user if $ARGUMENTS is vague)
2. Read the relevant files and identify:
   - The repeating structure (what files, what shape)
   - The key decision points (what varies vs what's fixed)
   - The naming conventions
3. Write the pattern to `PATTERNS.md` using this format:

```markdown
## Pattern: <Name>

**When to use:** <trigger condition>

**Structure:**
- File 1: `<path pattern>` — <responsibility>
- File 2: `<path pattern>` — <responsibility>

**Key conventions:**
- <convention 1>
- <convention 2>

**Example:**
<minimal concrete example>
```

4. Confirm the pattern was added and show the user the written entry.
