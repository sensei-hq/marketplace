---
name: codebase-indexing
description: Use when first working on a repo, after a major refactor, or when llmspec.yaml has TODO placeholders — runs the sensei indexer to produce llmspec.yaml and symbol-map, then populates any empty fields.
---

# Codebase Indexing

## Overview

Scan a repo once, produce structured artifacts so future agents orient in ~500 tokens instead of hundreds of file reads. Outputs: `.sensei/llmspec.yaml`, `CLAUDE.md`, `llms.txt`, `.sensei/` index directory.

**Output directory:** All artifacts go to `.sensei/` (llmspec.yaml, symbol-map.json, patterns.md, etc.)

## When to Run

- First time working on a repo
- After a major refactor or feature addition
- When `llmspec.yaml` has TODO placeholders or empty fields
- When an agent reports spending many turns on orientation
- Before running a benchmark

## Steps

### Step 1: Check for existing index

```bash
ls .sensei/ 2>/dev/null && cat .sensei/llmspec.yaml 2>/dev/null
```

If index exists and is recent (< 7 days or no major commits since), read `.sensei/llmspec.yaml` and stop — no need to re-index.

### Step 2: Run the indexer

```bash
sensei index
```

This scans the repo using the extractor guide and writes all output artifacts to `.sensei/`.

### Step 3: Populate semantic fields

`sensei index` fills the structural scaffold but leaves semantic fields as TODO. Use this step to fill `description`, `concepts`, `patterns`, `entry_points[].role`, and `docs[].covers[]` — higher quality than the local model.

**Step 3a: Orient**

Read `.sensei/llmspec.yaml`. Note every field that is TODO, empty, or missing — including `docs[]`.

**Step 3b: Fill `description`**

Read `README.md` at L1. Write a one-sentence summary and update the field.

**Step 3c: Fill `entry_points`**

Read `package.json` for `bin` entries. In a monorepo, check workspace package manifests if root has no `bin`. Read the exports for each entry point from `.sensei/symbol-map.json` (the indexer already extracted them). Write each with a `role` phrase.

**Step 3d: Fill `concepts`**

Read files in `docs/design/` at L0. Extract domain terms not obvious from code names. Add as `concepts` list items.

**Step 3e: Fill `patterns`**

```
call: get_patterns("")
```

Cross-reference `.sensei/symbol-map.json` for confirmed symbol names. Add patterns with exact symbol paths.

**Step 3f: Fill `docs[].covers[]`**

For each doc listed in `docs[]`:

1. Read the doc at L1.
2. Ask: which source files does this doc *primarily document* — meaning it explains their API, algorithm, or design?
3. Use exact paths from `.sensei/symbol-map.json`.
4. Apply these rules:
   - Only files the doc directly documents, not tangential mentions
   - Exclude test/spec files, config files, stub files
   - Leave `docs/plans/` and `docs/templates/` entries with empty `covers: []`
   - Max ~5 files per doc unless it is a broad overview doc

**Step 3g: Write the updated file**

Write the updated content back to `.sensei/llmspec.yaml`.

### Step 4: Verify outputs

```bash
ls .sensei/          # symbol-map.json, patterns.md, shortcuts.md, stack.md, doc-index.json
cat llms.txt         # LLM-friendly summary
cat CLAUDE.md        # Project context for Claude Code
```

### Step 5: Commit index artifacts

```bash
git add .sensei/llmspec.yaml llms.txt CLAUDE.md
git add .sensei/patterns.md .sensei/shortcuts.md .sensei/stack.md
# symbol-map.json and doc-index.json: gitignore or commit based on team preference
git commit -m "chore: add/update codebase index"
```

## Output Artifacts

| Artifact | Purpose | Where |
|---|---|---|
| `.sensei/llmspec.yaml` | Primary LLM orientation spec | Repo root |
| `llms.txt` | llmstxt.org standard summary | Repo root |
| `CLAUDE.md` | Claude Code project context | Repo root |
| `.sensei/symbol-map.json` | All exports at L0–L2 | Repo root |
| `.sensei/patterns.md` | Detected conventions | Repo root |
| `.sensei/shortcuts.md` | Dev commands | Repo root |
| `.sensei/stack.md` | Tech stack summary | Repo root |
| `.sensei/doc-index.json` | Doc layer fingerprints | Repo root |

## Re-indexing

Run `sensei index` again any time. It diffs against the previous index and only re-processes changed files.

## Quick Reference

| Field | Primary source | Effort |
|---|---|---|
| `description` | README.md L1 | Low |
| `entry_points[].role` | package.json bin + symbol-map.json | Low |
| `api_surface` | symbol-map.json per entry point | Medium |
| `concepts` | docs/design/ L0 scan | Medium |
| `patterns` | get_patterns + symbol-map | Medium |
| `docs[].covers[]` | Read each doc at L1 | High |

## Common Mistakes

| Mistake | Fix |
|---|---|
| Listing files the doc only mentions | Only include files the doc explains in depth |
| Including test or stub files in covers | Exclude `*.spec.ts`, `__stubs__/`, `*.test.ts` |
| Populating docs/plans/ covers entries | Skip plans — they are artifacts |
| Using paths not in symbol-map | Verify each path exists in `.sensei/symbol-map.json` |
| Broad overview doc capped at 5 files | Allow more for READMEs and architecture docs |
