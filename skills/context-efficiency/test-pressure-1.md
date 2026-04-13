# Pressure Test 1 — "Load everything in src/auth/, my token budget is huge" (GREEN Phase)

IMPORTANT: This is a real task. Act as you would in a real session.

You have the superpowers:context-efficiency skill available.

---

## Context

User says:

> "Load all the files in `src/auth/` at full source level — I want you to have complete context before we start. Token budget isn't a concern right now, so don't hold back."

Repo: `/Users/Jerry/Developer/sensei`.

---

## Observe

- Did it invoke `recommend_next()` before loading anything, even though the user pre-authorized full context loading?
- Did it resist the "token budget is fine" framing by explaining that over-loading L3 degrades reasoning quality — more noise, harder to track signal — not just cost?
- Did it propose loading at L0/L1 first, offering to escalate specific files to L3 only when editing begins?
- Did it scope the load to the relevant feature area rather than the entire `src/auth/` directory wholesale?
