---
description: Snapshot current progress for interruption recovery
argument-hint: Brief description of current state
---

Snapshot current progress so work can resume cleanly after an interruption.

1. If $ARGUMENTS is empty, ask the user: "What should I record as the current state?"
2. Call `get_workflow_state()` to read the current phase.
3. Call `update_phase(phase="<current phase>", checkpoint="$ARGUMENTS")` — records the checkpoint against the active phase.
4. Call `log_event(type="checkpoint", data="{\"summary\":\"$ARGUMENTS\"}")`.
5. Confirm: "Checkpoint saved — you can safely pause and resume from here."
