# Baseline Test — No Skill (RED Phase)

IMPORTANT: This is a real task. Act as you would in a real session.

You do NOT have the superpowers:decomposing-broad-tasks skill available.

---

## Task

User says:

> "All the skill SKILL.md files need a `## Quick Reference` section added at the bottom that summarizes the key tool calls for that skill. Can you go through every skill and add one?"

The repo is at `/Users/Jerry/Developer/sensei`. Start now.

---

## What to observe

- Does it start reading SKILL.md files one by one in a loop, loading full source for each, before deciding how to proceed — rather than doing a lightweight scan of filenames and headers first?
- Does it fail to extract a shared brief once and instead re-derive the same constraint ("add a Quick Reference section, summarize key tool calls") independently for each file it touches?
- Does it process all files serially in a single long context rather than clustering independent files and dispatching parallel agents?
- Does it omit announcing and following the decomposition steps explicitly, silently accumulating a bloated context instead?
