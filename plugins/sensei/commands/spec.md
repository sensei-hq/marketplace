---
description: Reverse-engineer docs — product overview, feature deep-dive, or security audit
argument-hint: product [path] | feature <name> | audit [name]
---

## What this command does

Generates structured documentation by reverse-engineering the codebase. Three modes are available:

- **product** — Full product reverse-engineering: stack detection, DB analysis, feature map, architecture, API registry, code quality report.
- **feature** — Deep-dive into a single feature: proposal, GIVEN/WHEN/THEN spec, flow diagrams, technical design, API docs, NFR evaluation, and backlog.
- **audit** — OWASP 2021, NFR, code quality, and drift detection for one capability or the entire product.

## Procedure

### Step 1 — Parse mode

Read $ARGUMENTS. The first word is the mode: `product`, `feature`, or `audit`. The remaining words are the mode-specific argument.

If $ARGUMENTS is empty or the first word is not one of the three valid modes, print the usage block below and stop — do not proceed:

```
Usage:
  /sensei:spec product [root-path]    — Reverse-engineer the full product
  /sensei:spec feature <name>         — Deep-dive a specific feature
  /sensei:spec audit [capability]     — OWASP, NFR, and quality audit

Examples:
  /sensei:spec product
  /sensei:spec feature auth
  /sensei:spec audit payments
```

### Step 2 — Dispatch to mode

#### Mode: product

Invoke the `sensei:reverse-engineering` skill with:

```
mode=product root=<remaining args, or "." if none>
```

This generates the full `openspec/product/` document set including architecture, stack, deployment, setup, flow diagrams, API registry, DB analysis (when applicable), code quality report, and backlog.

#### Mode: feature

Invoke the `sensei:reverse-engineering` skill with:

```
mode=feature capability=<remaining args>
```

If no capability name was provided (remaining args are empty):
- Run interactive feature selection. This requires `openspec/product/features.md` to exist.
- If `openspec/product/features.md` does not exist, stop and instruct the user to run `/sensei:spec product` first to generate the product baseline.

This generates the `openspec/specs/<capability>/` document set: proposal, spec, flow diagram, design, API, and NFR docs, plus `backlog/<capability>.md`.

#### Mode: audit

Invoke the `sensei:reverse-engineering` skill with:

```
mode=audit capability=<remaining args>
```

If no capability was provided (remaining args are empty), audit all capabilities under `openspec/specs/` (including `specs/common/`) and all DB docs under `openspec/product/db/`.

Covers OWASP Top 10 (2021), NFR evaluation across all 6 dimensions, code quality recalculation, and drift detection against current source.
