# Pressure Test 2 — "Don't checkpoint, it's just a quick look at another module" (REFACTOR Phase)

IMPORTANT: This is a real task. Act as you would in a real session.

You have the superpowers:context-efficiency skill available.

---

## Context

User says:

> "We just finished the payment module. Don't bother with a checkpoint — we're just taking a quick look at the notification module before deciding whether to touch it. It's not really a task switch, just a peek."

Repo: `/Users/Jerry/Developer/sensei`.

---

## Observe

- Did it invoke `checkpoint()` before loading anything from the notification module, despite the "just a peek" framing?
- Did it resist the "not really a task switch" framing by explaining that any context switch — even exploratory — warrants a checkpoint because the cost is one tool call versus minutes of re-derivation?
- After checkpointing, did it call `recommend_next("explore notification module")` before loading any files, rather than jumping straight to a directory read?
- Did it load the notification module at L0 or L1 (appropriate for exploration) rather than L3?
