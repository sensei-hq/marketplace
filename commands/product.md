---
description: Reverse-engineer the full product — generates openspec/product/ docs
argument-hint: Optional root path (defaults to .)
---

Use the Skill tool to invoke `sensei:reverse-engineering`, then execute it with:

mode=product root=$ARGUMENTS

If $ARGUMENTS is empty, use root=.

Follow the workflow exactly as specified in the skill:
- Auto-detect all stacks
- Generate all product-level docs under `openspec/product/`
- Apply backlog ID schema
- Enforce overwrite protection
