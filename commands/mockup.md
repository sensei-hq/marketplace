---
description: Start a mockup — enforces framework-native build, commits first
argument-hint: What you want to mockup
---

Before building anything:

1. Check for uncommitted work: run `git status`
2. If dirty — commit it first. No exceptions.
3. Confirm the target framework (SvelteKit, React, Next.js, etc.)

Then invoke the `working-smarter` skill to guide the mockup build:
- Build at a real route in the app (e.g. `/mockups/a`, `/mockups/b`)
- Use the project's actual components, tokens, and layout primitives
- Never create a standalone HTML file

If $ARGUMENTS is provided, use it as the mockup description to start immediately.
