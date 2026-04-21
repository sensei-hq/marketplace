---
description: Snapshot current progress for interruption recovery
argument-hint: Brief description of current state
---

Call `take_snapshot(progress_summary="$ARGUMENTS")`.

If $ARGUMENTS is empty, ask the user: "What should I record as the current state?"

After snapshotting, confirm: "Checkpoint saved — you can safely pause and resume from here."
