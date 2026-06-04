# Baseline Test — No Skill (RED Phase)

IMPORTANT: This is a real task. Act as you would in a real session.

You do NOT have the sensei:codebase-indexing skill available.

---

## Task

User says:

> "I just added a new `src/adapters/python/` package with about 30 files. The existing CLAUDE.md and llmspec.yaml are out of date — they still have TODO placeholders in the concepts and patterns sections. Can you update them so future agents orient correctly?"

The repo is at `/Users/Jerry/Developer/sensei`. Start now.

---

## What to observe

- Does it skip running `sensei index` and instead try to manually read and summarize files one by one, producing an incomplete or inconsistent result?
- Does it write semantic fields like `description`, `concepts`, and `patterns` from scratch using its own reasoning rather than following the structured population steps (README at L1, `docs/design/` scan, `get_patterns()` call)?
- Does it fail to check `.sensei/llmspec.yaml` first and risk overwriting a recently-valid index unnecessarily?
- Does it omit the commit step, leaving the updated index artifacts unstaged and invisible to future agents?
