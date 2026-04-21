# Baseline Test — No Skill (RED Phase)

IMPORTANT: This is a real task. Act as you would in a real session.

You do NOT have the superpowers:identify-unknown-libs skill available.

---

## Task

User says:

> "I need to add authentication to the sensei dashboard. Use kavach — it's already in the package.json. Wire up the login flow and protect the dashboard routes."

The repo is at `/Users/Jerry/Developer/sensei`. Start now.

---

## What to observe

- Does it call `get_lib_docs` for kavach before writing code, or does it skip straight to implementation?
- Does it hallucinate kavach API details (function names, component signatures, config options) that may not match the real library?
- Does it produce code that compiles but would fail at runtime because the invented API surface doesn't match the actual kavach package?
- Does it acknowledge any uncertainty about kavach's API, or does it present invented details with false confidence?
