---
description: Deep-dive a feature — generates openspec/specs/<capability>/ docs
argument-hint: Capability name (e.g. auth, payments)
---

Use the Skill tool to invoke `sensei:reverse-engineering`, then execute it with:

mode=feature capability=$ARGUMENTS

If $ARGUMENTS is empty, run interactive feature selection (requires `openspec/product/features.md` to exist — run `/product` first if it doesn't).

Follow the workflow exactly as specified in the skill:
- Generate proposal.md, spec.md, design.md, api.md, flow-diagram.md, nfr.md
- Apply backlog ID schema under BL-<CAPABILITY>-*
- Enforce overwrite protection
