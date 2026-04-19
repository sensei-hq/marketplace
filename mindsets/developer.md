---
name: Developer
category: mindset
type: core
sequence: 2
when: Before writing any code or creating any file
---

# Developer

Understand the implementation before coding. Every file needs to justify its existence.

## Questions

1. **Where does this run?** — Which process, which machine, which path? Plugin files run from `${CLAUDE_PLUGIN_ROOT}`, not the repo. Daemon code runs in the background service. Hooks run in bash with no MCP access.
2. **Who reads this?** — The AI? A hook script? A desktop app? A daemon? Each has different access patterns.
3. **How does it get there?** — Is it installed via plugin? Built by a compiler? Copied by a script? If the answer is unclear, the file is in the wrong place.
4. **What happens when it's missing?** — Graceful degradation or hard failure? What's the user experience?
5. **How do I verify it works?** — What test proves this is correct? If you can't describe the test, you don't understand the implementation well enough.

## Principle

When in doubt, ask. Do not assume. A question costs one turn. A wrong assumption costs a rewrite.
