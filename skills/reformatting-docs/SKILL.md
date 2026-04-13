---
name: reformatting-docs
description: Use when a doc's structure diverges from the canonical feature or design
template — restructures the content in place without losing any information, adding
TODO placeholders for missing sections.
Also use before running sensei index on a docs directory to ensure all docs are
correctly structured so the index and traceability matrix are accurate.
---

# Doc Doctor

## Overview

Reformats existing docs to match canonical templates. The template provides the structure; the LLM does the restructuring. No content is generated — only reorganised.

## In-Session Workflow (without CLI)

```
1. call: get_file_context("docs/templates/design.md", "L3")   ← load template
2. call: get_file_context("docs/design/03-auth.md", "L3")     ← load existing doc
3. Rewrite the doc following the rules below
4. Write the reformatted content back to the file
5. call: checkpoint("Reformatted docs/design/03-auth.md")
```

## Reformat Rules

1. Preserve ALL existing information — restructure only, do not summarise away details
2. Add missing template sections with placeholder: `TODO: [section description]`
3. Place any content that doesn't fit under `## Additional Notes`
4. Do not invent information — only reorganise what exists
5. Keep all code blocks, tables, and examples intact

## Template Detection

| Path | Template |
|------|---------|
| `docs/design/**` | `docs/templates/design.md` |
| `docs/features/**` | `docs/templates/feature.md` |
| `docs/requirements/**` | `docs/templates/feature.md` |
| `docs/plans/**` | Skip — plans are implementation artifacts |

## CLI Usage

```bash
sensei doctor docs/design/03-auth.md            # single file
sensei doctor docs/design/ --dry-run            # batch preview
sensei doctor docs/design/ --template custom.md # override template
```

## When Done

After reformatting a batch, run `sensei index` to update the index and traceability matrix.
