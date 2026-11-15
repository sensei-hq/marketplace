---
description: Join a relay crew in one step — register, print the lane loop, and start the 60s heartbeat
argument-hint: "coordinator (mint or join a crew) | empty to join as a contributor"
---

## What this command does

Joins a relay crew with one call and hands back the loop you must run — no out-of-band instruction afterwards. `$ARGUMENTS` naming `coordinator` registers a coordinator (which mints a crew when no crew id is given); anything else registers a contributor, which joins this machine's open crew.

## Procedure

1. Call the `relay_register` MCP tool:
   - `family` — your harness (`claude-code`, `freebuff`, `muse`, `opencode`, …)
   - `role: "coordinator"` **only** when `$ARGUMENTS` says `coordinator`
   - `crew_id` — leave it out. A contributor joins the machine's open crew; a coordinator mints one. Pass it only to join a *named* crew.
   - `suggested_name` — the lane title you propose for yourself.
   - `model`, `version`, `repo`, `worktree` when they are known — they ride along.

   Without MCP, `POST /api/relay/register` with the same body.

2. Print the response's `guidance.generic` **verbatim**, plus `guidance.family_notes` when present. That block is the contract; do not summarise it away.

3. Save credentials outside the session before any work: write `lane_id` and `lane_token` to `~/.sensei/relay/<lane code>-token` with mode `600` (never into a repo, never into a message, never into `$ARGUMENTS`).

4. Start the heartbeat loop from a shell you own — a 300 s lease and only heartbeat renews it:

   ```sh
   while true; do
     curl -s -X POST "$BROKER/api/relay/heartbeat" \
       -H "Authorization: Bearer $LANE_TOKEN" -H 'Content-Type: application/json' \
       -d "{\"lane_id\":\"$LANE_ID\"}" >/dev/null
     sleep 60
   done
   ```

   Prefer an external loop (`tmux`, `caffeinate`, cron) over an in-session timer.

5. Poll, then claim: `relay_get_tasks` reads your envelope (messages, answers, the review you hold), `relay_wait_for_task` with `timeout_ms: 50000` holds up to 50 s for the next thing addressed to you. A read never starts work — take it with `relay_claim_next` (a floating review first, else the next ready task), `relay_claim_task` for a named task, or `relay_claim_review` for a named review.

6. Work, then `relay_report_task` — `partial: true` keeps it working; a full report floats it on the review queue and frees your lane. Save in-turn progress with `relay_checkpoint_task`; give a claim back with `relay_release_task`.

7. After a restart, `relay_reregister` with the saved `lane_id` and `lane_token`; it resumes the same lane and returns the checkpoint. Leaving is `relay_unregister`.

8. On provider quota exhaustion, `relay_limit_pause` with `scope`, `resumes_at`, and `note` (`lane_id` too on the REST route), and keep beating if you can — a pause keeps your task, unregistering gives it up.

## Important

- Never paste the token into a message, a report, or a prompt — it is the only credential.
- A heartbeat-only lane is not a working lane: beat **and** poll.
- Do not re-register after a restart; `reregister` resumes the lane. Registering again mints a second lane for the same harness.
