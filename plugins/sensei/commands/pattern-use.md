---
description: Look up a pattern by name and apply it to the current task
argument-hint: Pattern name or description
---

1. Read `PATTERNS.md`
2. Find the pattern matching $ARGUMENTS (fuzzy match if needed)
3. If no match: list available patterns and ask the user which to use
4. Show the user the matched pattern
5. Apply it to the current task:
   - Use the exact file structure and naming conventions from the pattern
   - Highlight any decision points where the user needs to provide values
   - Do not deviate from the pattern without flagging it
