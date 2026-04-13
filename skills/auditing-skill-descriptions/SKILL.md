---
name: auditing-skill-descriptions
description: Use when adding new skills, reviewing the skill library for quality,
or when skills aren't firing at the right moments — scores every skill description
against a weakness rubric and rewrites weak ones.
Also use periodically to keep the skill library sharp as the codebase evolves.
---

# Auditing Skill Descriptions

## Overview

Skill descriptions are the trigger mechanism — they determine when an agent loads a skill. Weak descriptions cause skills to never fire. This skill scores every description in the repo against a weakness rubric, proposes stronger rewrites, and applies approved changes.

## Weakness Rubric

A description is **weak** if it matches any of these:

| Failure mode | Example |
|---|---|
| No "Use when" trigger | `"Helps with code patterns"` |
| Too vague — no specificity | `"Use for code tasks"` |
| Reactive-only | `"Use when something goes wrong"` — misses proactive triggers |
| Describes the skill not the trigger | `"This skill enforces zero errors"` |
| Single trigger, missing proactive case | Only says when to use defensively, not proactively |
| Missing what the agent gains | No payoff — agent can't assess value before loading |

A description is **strong** if it:
- Opens with `Use when <specific situation>`
- Names at least one proactive trigger (before X, when starting Y)
- States what the agent gains (`— provides`, `— ensures`, `— prevents`)
- Is specific enough that two different skills wouldn't share it

**Strong template:**
```
Use when <specific situation> — <what the agent gets>.
Also use before <proactive trigger>.
```

---

## Scope

- Repo-local skills: `skills/*/SKILL.md`
- Global skills: `~/.claude/skills/*.md` (read-only audit unless user opts in to rewrite)
- Does NOT touch superpowers plugin skills (`~/.claude/plugins/`)

---

## Procedure

### Step 1: Discover

Glob `skills/*/SKILL.md` for repo-local skills. Glob `~/.claude/skills/*.md` for global skills.

### Step 2: Score each description

For each skill file:
1. Read the frontmatter `description` field
2. If missing: verdict = **MISSING**
3. Apply the weakness rubric: if any failure mode matches, verdict = **WEAK** (list all matching failure modes)
4. Otherwise: verdict = **STRONG**

### Step 3: Report

Print a table:

```
Skill                        Verdict   Issues
─────────────────────────────────────────────────────────────
zero-errors-policy           STRONG    —
managing-project-sessions    STRONG    —
detecting-doc-drift          WEAK      reactive-only, missing proactive trigger
decomposing-broad-tasks      WEAK      too vague
compressing-content          MISSING   no description field
```

### Step 4: Rewrite weak ones

For each WEAK or MISSING skill:
1. Read the full skill file content to understand what it actually does
2. Propose a rewritten description using the strong template, grounded in the skill's actual content
3. Show side-by-side:

```
detecting-doc-drift

CURRENT:
Use when you suspect design docs are out of sync with code, before committing
changes that affect documented APIs or flows, or when setting up a repo to
continuously monitor docs.

PROPOSED:
Use before committing any change that touches a documented API, flow, or
design decision — catches doc drift before it reaches the repo. Also use
when design docs feel stale or when a feature has evolved significantly
since its spec was written.
```

### Step 5: Apply on approval

- User can approve each rewrite individually, or approve all at once ("yes to all")
- For each approved rewrite: edit the `description` field in the SKILL.md frontmatter in place
- For MISSING descriptions: add the `description:` field to the frontmatter block
- For global skills (`~/.claude/skills/*.md`): only apply if user opts in (ask first)
- After applying: print a confirmation line for each file modified

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| Rewriting based on skill name alone | Always read the full skill file content before proposing |
| Proposing a rewrite that matches another skill's description | Descriptions must be specific enough to distinguish between skills |
| Applying changes to global skills without explicit permission | Always ask before modifying `~/.claude/skills/*.md` |
| Adding "Also use" clauses that are redundant with the main trigger | Each trigger should describe a distinct situation |
