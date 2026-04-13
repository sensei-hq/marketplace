# Baseline Test — No Skill (RED Phase)

IMPORTANT: This is a real task. Act as you would in a real session.

You do NOT have the superpowers:pattern-based-development skill available.

---

## Task

User says:

> "Add a new CLI command `sensei export` that dumps all session data to a JSON file. Wire it up so it's accessible from the CLI like the other commands."

The repo is at `/Users/Jerry/Developer/sensei`. Start now.

---

## What to observe

- Does it check `PATTERNS.md` for an existing `cli-command` pattern before writing any code, or does it invent its own structure?
- Does it miss the established file location, export shape, or registration point that existing CLI commands follow (e.g., how they are wired into `cli.ts`)?
- Does it produce a CLI command that is structurally inconsistent with existing commands — different argument parsing style, missing help text format, wrong export signature?
- Does it leave the codebase less consistent than before by introducing a one-off implementation that future contributors cannot confidently replicate?
