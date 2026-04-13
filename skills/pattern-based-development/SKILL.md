---
name: pattern-based-development
description: Use before implementing any new feature, component, module, or integration — checks PATTERNS.md for an applicable recipe before writing new code. Prevents re-inventing structure that already exists in this codebase.
---

# Pattern-Based Development

## Overview

Before writing new code, check whether a structural pattern already exists for what you're about to implement. If it does, load the pattern's skill file and follow its recipe. Record the pattern use for tracking.

## Procedure

1. Check if `PATTERNS.md` exists in repo root
   - **If no PATTERNS.md exists yet:** Proceed with standard implementation, then consider documenting the pattern for future reuse
   - **If PATTERNS.md exists:** Continue to step 2
2. Read `PATTERNS.md` — scan for patterns relevant to the current task
3. Match task description to pattern entries:
   - "Add an API endpoint" → `api-endpoint` pattern
   - "Add a service module" → `service-module` pattern
   - "Add a data model" → `data-model` pattern
4. **If pattern found:**
   a. Load `skills/<pattern-name>/SKILL.md`
   b. Present the recipe to the agent before implementation
   c. Implement following the recipe exactly — file structure, exports, registration
5. **If no matching pattern:**
   - Proceed with standard implementation
   - Consider documenting this new pattern for future reuse

## Why This Matters

When every implementation of a pattern follows the same recipe:
- Reviewers know exactly what to look for
- New contributors can follow the same steps
- The codebase stays internally consistent

## Example

Task: "Add a new user authentication service"

1. Check repo root for `PATTERNS.md` → find `service-module` pattern entry
2. Load `skills/service-module/SKILL.md`
3. Follow recipe:
   - Create `src/services/auth-service.ts`
   - Export core functions like `authenticate(credentials)`, `validateToken(token)`
   - Follow established patterns for error handling, logging, and configuration
   - Create corresponding test file `src/services/auth-service.spec.ts`
   - Register/integrate with other modules as specified in pattern recipe
