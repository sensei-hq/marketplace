# Shared helpers for plugin hook scripts. Source this from a hook script:
#
#   source "$(dirname "$0")/_lib.sh"
#
# Provides:
#   - read_stdin_payload   captures stdin into PAYLOAD, normalises to "" when empty
#   - send_telemetry       fire-and-forget POST to /hook/event with JSONL fallback
#
# Filename starts with `_` so the dispatcher (run-hook.cmd) does not try to
# execute it as a hook script.

DAEMON_URL="${SENSEI_DAEMON_URL:-http://127.0.0.1:7744}"
FALLBACK_FILE="${HOME}/.sensei/events.jsonl"

# Read all of stdin into the global PAYLOAD. Sets PAYLOAD="" when there's no
# input (e.g. hook fired without a payload, or running interactively).
read_stdin_payload() {
  PAYLOAD=""
  if [ -t 0 ]; then
    return 0
  fi
  PAYLOAD="$(cat)"
}

# Forward a captured hook payload to the daemon. The daemon's /hook/event
# endpoint is schema-tolerant: it reads top-level keys when present and
# stores the full payload as jsonb. We enrich here only when jq is on PATH
# (macOS ships without jq, so we tolerate its absence).
#
# Always returns 0. Forks into the background so the hook does not block
# Claude on a daemon that is slow or down.
#
# Arguments:
#   $1 — the raw hook payload (the JSON string captured from stdin)
send_telemetry() {
  local payload="$1"
  [ -z "$payload" ] && return 0

  local enriched="$payload"
  if command -v jq >/dev/null 2>&1; then
    enriched=$(printf '%s' "$payload" | jq -c '. + {
      assistant_family: (.assistant_family // "claude"),
      event_type: (.event_type // .hook_event_name // "unknown")
    }' 2>/dev/null) || enriched="$payload"
  fi

  (
    if ! curl -sS -X POST "${DAEMON_URL}/hook/event" \
          -H "Content-Type: application/json" \
          -d "$enriched" \
          --connect-timeout 1 --max-time 2 >/dev/null 2>&1; then
      mkdir -p "$(dirname "$FALLBACK_FILE")"
      printf '%s\n' "$enriched" >> "$FALLBACK_FILE"
    fi
  ) >/dev/null 2>&1 &
  disown 2>/dev/null || true

  return 0
}
