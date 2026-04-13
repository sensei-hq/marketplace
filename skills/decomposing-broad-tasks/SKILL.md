---
name: decomposing-broad-tasks
description: Use when a request touches 5+ files or mentions "all", "every", "refactor all", "update all", "clean up all", or "audit all" — or when about to Glob a pattern that will return 5+ results and read most of them. Do NOT use for focused tasks touching fewer than 5 files.
---

# Decomposing Broad Tasks

## Overview

Decompose broad requests into focused agent chunks. Coordinating context holds only lightweight scan and shared brief. Full reading happens inside dispatched agents.

## When to Use

- Mentions: "all", "every", "refactor all", "update all", "clean up all", "audit all"
- Glob will return 5+ results and read most of them
- Files read one-by-one with no clear stopping condition

**Do NOT use** for tasks touching fewer than 5 files.

## Hard Rule

**Do not read file bodies in steps 1–3. Filenames and headers only.**

The impulse to "understand before clustering" is exactly what this prevents. Proceed to Step 2 after the lightweight scan — do not read file bodies, even the first one.

## The Protocol

### Step 1 — Lightweight Scan

Filenames, frontmatter, first ~10 lines. For docs: `id`, `type`, overview. For code: exports, imports.

### Step 2 — Extract Shared Context

Compact brief (~100 tokens) applying to all agents. Extract once, never re-derive.

Examples: "All `.index/` → Supabase tables", "Remove implementation, keep behavior", "Follow existing frontmatter format"

### Step 3 — Cluster by Independence

Group files that can be completed without knowledge of each other:

| Type | Rule | Dispatch |
|---|---|---|
| **Independent** | No cross-references, no shared output | Parallel |
| **Ordered** | Output of one feeds another | Sequential |
| **Coupled** | Cannot be cleanly separated | Single agent, do not split |

**If Step 3 produces a single cluster:** the task is not broad enough to decompose — handle it as a single inline task without spawning agents. Target 3–5 files per cluster for valid decompositions.

### Step 4 — Brief Each Agent

```
## Shared Context
<constraint — 100 tokens>

## Your Scope
Files: [list]
Goal: [one sentence]
Constraints: [what NOT to do]

## Reference
<doc pointer, not pre-loaded>

## Return
<summary>
```

### Step 5 — Dispatch

Use `superpowers:dispatching-parallel-agents` for parallel; sequential in order. Present consolidated summaries, do not re-read.

## Common Mistakes

| Mistake | Fix |
|---|---|
| "Quick read to understand" | That's the bulk reading. Headers only. |
| Keep reading after file 1 | Stop. Proceed to Step 2. |
| Silent tool calls, no narration | Announce and follow steps explicitly. |
| Re-derive context per agent | Write once, paste to all. |
| 15 single-file agents | Cluster 3–5 files per agent. |
| Force-split coupled work | Keep together. |
| Skip for 6 files | 5+ threshold. Use protocol. |
| Pre-load reference docs | Use `## Reference` field, not context. |
