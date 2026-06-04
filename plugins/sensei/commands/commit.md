---
description: Run zero-errors checks then commit
argument-hint: Optional commit message
---

## Step 1: Zero-errors checkpoint

Detect and run the project's full test + lint/type-check commands — do not assume a toolchain:
- Rust → `cargo test` + `cargo clippy`
- JS/TS → the package-manager script (`<pm> test`) + type-check (`tsc --noEmit`, e.g. `bunx tsc --noEmit`)
- Python → `pytest` + `ruff check`; Go → `go test ./...` + `go vet ./...`
- Prefer a project wrapper if one exists (`make test`, a root `test` script).

If any errors: **stop**. Do not commit. Fix all errors first, then run again.

## Step 2: Commit

Only proceed once the above passes with zero errors.

- Review staged changes: `git diff --staged`
- Stage relevant files if not already staged
- Commit with a clear message

If $ARGUMENTS is provided, use it as the commit message. Otherwise write one based on the staged changes.
