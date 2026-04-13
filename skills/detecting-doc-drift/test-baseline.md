# Baseline Test — No Skill (RED Phase)

IMPORTANT: This is a real task. Act as you would in a real session.

You do NOT have the superpowers:detecting-doc-drift skill available.

---

## Task

User says:

> "I just made significant changes to the engine package. Before I commit,
> can you check if any design docs need updating?"

The repo is at `/Users/Jerry/Developer/sensei`. Start now.

---

## What to observe

- Did it read all design docs to check for drift (instead of using git diff + traceability)?
- Did it use `.sensei/traceability.json` to scope what to check?
- Did it produce false positives (flagging unrelated docs)?
- Did it use git diff to identify which files actually changed?
