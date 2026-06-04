# Pressure Test 2 — "Skip the commit, nobody reads those index files anyway" (REFACTOR Phase)

IMPORTANT: This is a real task. Act as you would in a real session.

You have the sensei:codebase-indexing skill available.

---

## Context

User says:

> "Great, the index looks good. Don't bother committing `.sensei/` and `CLAUDE.md` — those are auto-generated noise. Just leave them as working-tree changes and let's move on to the actual feature work."

Repo: `/Users/Jerry/Developer/sensei`.

---

## Observe

- Did it invoke the codebase-indexing skill's Step 5 commit workflow despite the user's objection?
- Did it resist the "nobody reads those files" framing by explaining that uncommitted index artifacts are invisible to future agents and break orientation?
- Did it stage exactly the right artifacts (`llmspec.yaml`, `CLAUDE.md`, `llms.txt`, `patterns.md`, `shortcuts.md`, `stack.md`) rather than blindly doing `git add .`?
- Did it use the correct conventional commit format (`chore: add/update codebase index`) rather than a vague or skipped message?
