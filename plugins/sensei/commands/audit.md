---
description: Audit a capability for OWASP, NFR, and code quality issues
argument-hint: Capability name (omit to audit everything)
---

Use the Skill tool to invoke `sensei:reverse-engineering`, then execute it with:

mode=audit capability=$ARGUMENTS

If $ARGUMENTS is empty, audit ALL capabilities under `openspec/specs/` plus `specs/common/` and all DB docs.

Follow the workflow exactly as specified in the skill:
- OWASP 2021 security checks
- NFR coverage across 6 dimensions
- Code quality health score recalculation
- Drift detection against current source
