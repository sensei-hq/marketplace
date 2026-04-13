---
name: detecting-doc-drift
description: Use when you suspect design docs are out of sync with code, before committing changes that affect documented APIs or flows, or when setting up a repo to catch drift automatically.
---

# Doc Drift Detector

## Overview

Design docs, code, and public docs drift apart silently. This skill uses `git diff` against the last indexed commit combined with a traceability matrix (`.index/traceability.json`) to flag exactly which docs need attention when code changes. Only docs that cover changed files are flagged — no false positives.

## When to Use

- Before merging a PR that changes documented behaviour
- After a refactor to verify all three doc layers (design, code, public) stay in sync
- To set up automated drift detection on a new repo

## Check Drift

```
call: check_drift()
```

Returns a report of docs whose linked code files have changed since the last index commit:

```
3 doc(s) drifted since a3f8c21:

docs/design/03-mcp-server.md: code changed — src/index.ts, src/tools/query.ts
docs/design/07-drift.md: code changed — src/tools/drift.ts
README.md: code changed — packages/sensei/package.json

Run: sensei index   after updating docs to clear drift
```

## Traceability Matrix

`.index/traceability.json` maps each doc to the source files it covers. Populated from:

1. **Manual** — declare in `.llmspec.yaml` under `docs[].covers[]` (authoritative)
2. **Auto-detected** — `sensei index` scans docs for filename/symbol mentions

```yaml
# .llmspec.yaml
docs:
  - path: docs/design/03-mcp-server.md
    covers:
      - src/index.ts
      - src/tools/query.ts
```

## Pre-Commit Hook

Install with:
```bash
sensei hooks install --drift
```

This writes `.git/hooks/pre-commit`:
```sh
#!/bin/sh
sensei drift --fail-on-drift
exit $?
```

The hook runs `check_drift()` against staged changes. Blocks commit if any linked docs are stale.

## Resolving Drift

1. `sensei drift` — see which docs are flagged and which code files triggered them
2. For each drifted doc: `git diff <hash>..HEAD -- <code-file>` to see what changed
3. Update the doc to reflect the change
4. `sensei index` — updates `lastIndexedCommit`, clears drift
5. Commit code + doc changes together

## Common Mistakes

| Mistake | Fix |
|---|---|
| Updating code without updating design docs | `sensei drift` before committing |
| Docs without traceability entries | Add `covers:` to `.llmspec.yaml` for key docs |
| Re-indexing without updating docs | Drift clears but docs are still wrong — update first |
