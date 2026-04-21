---
description: Run zero-errors checks then commit
argument-hint: Optional commit message
---

## Step 1: Zero-errors checkpoint

Run the full check:
```bash
bun run --filter '*' test && bunx tsc --noEmit
```

If any errors: **stop**. Do not commit. Fix all errors first, then run again.

## Step 2: Commit

Only proceed once the above passes with zero errors.

- Review staged changes: `git diff --staged`
- Stage relevant files if not already staged
- Commit with a clear message

If $ARGUMENTS is provided, use it as the commit message. Otherwise write one based on the staged changes.
