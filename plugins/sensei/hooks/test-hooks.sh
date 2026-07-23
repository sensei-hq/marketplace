#!/usr/bin/env bash
# Test hook scripts — verifies generic forwarder, context-injecting hooks,
# and the JSONL fallback in _lib.sh send_telemetry.
#
# Designed to run without a daemon: every test points HOME at a tmpdir and
# SENSEI_DAEMON_URL at an unreachable port, so send_telemetry's curl always
# fails and the fallback path is exercised.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PASS=0
FAIL=0

# Tmpdir doubles as $HOME (so JSONL fallback lands here) and project root
# (so session-start / pre-compact read empty rules/state).
TEMP_HOME=$(mktemp -d)
TEMP_PROJECT="$TEMP_HOME/project"
mkdir -p "$TEMP_PROJECT/.sensei"

# Point telemetry at a port that nothing is listening on. send_telemetry
# forks into the background, so we sleep briefly after each invocation to
# let the fallback finish writing before we inspect it.
export SENSEI_DAEMON_URL="http://127.0.0.1:1"

run_hook() {
  local hook="$1"
  local stdin_payload="${2-}"

  if [ -n "$stdin_payload" ]; then
    printf '%s' "$stdin_payload" | \
      HOME="$TEMP_HOME" \
      CLAUDE_PROJECT_ROOT="$TEMP_PROJECT" \
      CLAUDE_PLUGIN_ROOT="$PLUGIN_ROOT" \
      bash "$SCRIPT_DIR/$hook" 2>/dev/null
  else
    HOME="$TEMP_HOME" \
      CLAUDE_PROJECT_ROOT="$TEMP_PROJECT" \
      CLAUDE_PLUGIN_ROOT="$PLUGIN_ROOT" \
      bash "$SCRIPT_DIR/$hook" </dev/null 2>/dev/null
  fi
}

assert_json() {
  local name="$1"
  local output="$2"
  local check="$3"

  if ! printf '%s' "$output" | python3 -m json.tool >/dev/null 2>&1; then
    echo "  FAIL $name — invalid JSON"
    FAIL=$((FAIL + 1))
    return
  fi
  if printf '%s' "$output" | python3 -c "$check" 2>/dev/null; then
    echo "  PASS $name"
    PASS=$((PASS + 1))
  else
    echo "  FAIL $name"
    FAIL=$((FAIL + 1))
  fi
}

assert_true() {
  local name="$1"
  local expr_result="$2"
  if [ "$expr_result" = "true" ]; then
    echo "  PASS $name"
    PASS=$((PASS + 1))
  else
    echo "  FAIL $name"
    FAIL=$((FAIL + 1))
  fi
}

# ── forward: generic dispatcher ──────────────────────────────────────────────

echo "=== forward (generic dispatcher) ==="

output=$(run_hook "forward")
assert_json "no stdin returns valid empty JSON" "$output" \
  "import sys,json; d=json.load(sys.stdin); assert d == {}"

output=$(run_hook "forward" '{"hook_event_name":"Notification","session_id":"abc"}')
assert_json "with stdin still returns valid empty JSON" "$output" \
  "import sys,json; d=json.load(sys.stdin); assert d == {}"

# Give the backgrounded fallback time to write
sleep 0.3
fallback="$TEMP_HOME/.sensei/events.jsonl"
if [ -f "$fallback" ] && [ -s "$fallback" ]; then
  assert_true "JSONL fallback file written when daemon unreachable" "true"
  last=$(tail -1 "$fallback")
  # jq is optional; only assert enrichment when it's installed (CI may be bare).
  if command -v jq >/dev/null 2>&1; then
    family=$(printf '%s' "$last" | jq -r '.assistant_family // empty')
    event=$(printf '%s' "$last" | jq -r '.event_type // empty')
    [ "$family" = "claude" ] && [ "$event" = "Notification" ] && \
      assert_true "fallback row enriched with assistant_family + event_type" "true" || \
      assert_true "fallback row enriched with assistant_family + event_type" "false"
  fi
else
  assert_true "JSONL fallback file written when daemon unreachable" "false"
fi
rm -f "$fallback"

# ── session-start: telemetry + context injection ─────────────────────────────

echo ""
echo "=== session-start (telemetry + context injection) ==="

# Production payload shape from Claude Code (the hook always receives JSON)
SESSION_PAYLOAD='{"hook_event_name":"SessionStart","session_id":"test-session-1","source":"startup"}'

output=$(run_hook "session-start" "$SESSION_PAYLOAD")
assert_json "returns JSON with additional_context" "$output" \
  "import sys,json; d=json.load(sys.stdin); assert 'additional_context' in d"
assert_json "includes MCP tools reference" "$output" \
  "import sys,json; d=json.load(sys.stdin); assert 'search(query' in d['additional_context']"
assert_json "includes workflow commands" "$output" \
  "import sys,json; d=json.load(sys.stdin); assert '/sensei:idea' in d['additional_context']"
assert_json "injects lean mindset reminder (agents, not full dump)" "$output" \
  "import sys,json; d=json.load(sys.stdin); c=d['additional_context']; assert '/sensei:agent' in c and 'Analyst' in c and 'Acceptance Tester' in c"
assert_json "no-rules message when file missing" "$output" \
  "import sys,json; d=json.load(sys.stdin); assert 'No rules' in d['additional_context']"

printf '# Rules\n- test-rule-alpha\n' > "$TEMP_PROJECT/.sensei/rules.md"
output=$(run_hook "session-start" "$SESSION_PAYLOAD")
assert_json "loads rules when present" "$output" \
  "import sys,json; d=json.load(sys.stdin); assert 'test-rule-alpha' in d['additional_context']"

printf 'active_phase: build\nactive_issue: 42\n' > "$TEMP_PROJECT/.sensei/state.yaml"
output=$(run_hook "session-start" "$SESSION_PAYLOAD")
assert_json "loads state when present" "$output" \
  "import sys,json; d=json.load(sys.stdin); assert 'active_phase: build' in d['additional_context']"

# session-start should have also fired telemetry on each invocation
sleep 0.3
if [ -s "$fallback" ]; then
  assert_true "session-start emits telemetry to fallback" "true"
else
  assert_true "session-start emits telemetry to fallback" "false"
fi
rm -f "$fallback" "$TEMP_PROJECT/.sensei/rules.md" "$TEMP_PROJECT/.sensei/state.yaml"

# ── pre-compact: telemetry + context injection ───────────────────────────────

echo ""
echo "=== pre-compact (telemetry + context injection) ==="

PRECOMPACT_PAYLOAD='{"hook_event_name":"PreCompact","session_id":"test-session-1","trigger":"manual"}'

output=$(run_hook "pre-compact" "$PRECOMPACT_PAYLOAD")
assert_json "returns JSON with additional_context" "$output" \
  "import sys,json; d=json.load(sys.stdin); assert 'additional_context' in d"
assert_json "suggests session refocus" "$output" \
  "import sys,json; d=json.load(sys.stdin); assert '/sensei:session refocus' in d['additional_context']"
assert_json "no-rules message when missing" "$output" \
  "import sys,json; d=json.load(sys.stdin); assert 'No project rules' in d['additional_context']"

printf '# Rules\n- test-rule-beta\n' > "$TEMP_PROJECT/.sensei/rules.md"
output=$(run_hook "pre-compact" "$PRECOMPACT_PAYLOAD")
assert_json "loads rules when present" "$output" \
  "import sys,json; d=json.load(sys.stdin); assert 'test-rule-beta' in d['additional_context']"

sleep 0.3
if [ -s "$fallback" ]; then
  assert_true "pre-compact emits telemetry to fallback" "true"
else
  assert_true "pre-compact emits telemetry to fallback" "false"
fi

# ── nudge: CC PreToolUse shaping + fail-open ──────────────────────────────────
#
# hooks/nudge reshapes the daemon's `{nudge, message}` into Claude Code's
# PreToolUse hook-output schema. The global SENSEI_DAEMON_URL (unreachable
# port) covers the fail-open path via run_hook like every other test above;
# the shaping path needs a real responder, so this section starts a scoped
# fake daemon just for these two assertions.

echo ""
echo "=== nudge (PreToolUse shaping + fail-open) ==="

NUDGE_PAYLOAD='{"hook_event_name":"PreToolUse","session_id":"test-session-1","tool_name":"Bash"}'

# No daemon reachable → fail-open no-op (not the daemon's raw {"nudge":false}).
output=$(run_hook "nudge" "$NUDGE_PAYLOAD")
assert_json "fail-open (daemon unreachable) returns no-op" "$output" \
  "import sys,json; d=json.load(sys.stdin); assert d == {}"

# Scoped fake daemon on an ephemeral port, started fresh per sub-case below
# (each response shape needs its own listener) and killed right after use.
# Backgrounded directly in this shell (not inside a command-substitution
# subshell) so its PID is a real child — kill/wait on it are well-defined.
FAKE_NUDGE_PORT=8935
FAKE_NUDGE_SERVER='
import http.server, sys

body = sys.argv[1].encode()

class Handler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        self.rfile.read(length)
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def log_message(self, *a): pass

http.server.HTTPServer(("127.0.0.1", int(sys.argv[2])), Handler).serve_forever()
'

NUDGE_TRUE_BODY='{"nudge":true,"message":"No playbook chosen for this chunk yet — consider /sensei:intake to pick one."}'
python3 -c "$FAKE_NUDGE_SERVER" "$NUDGE_TRUE_BODY" "$FAKE_NUDGE_PORT" &
FAKE_PID=$!
sleep 0.3

output=$(printf '%s' "$NUDGE_PAYLOAD" | \
  HOME="$TEMP_HOME" \
  CLAUDE_PROJECT_ROOT="$TEMP_PROJECT" \
  CLAUDE_PLUGIN_ROOT="$PLUGIN_ROOT" \
  SENSEI_DAEMON_URL="http://127.0.0.1:${FAKE_NUDGE_PORT}" \
  bash "$SCRIPT_DIR/nudge" 2>/dev/null)

kill "$FAKE_PID" 2>/dev/null || true
wait "$FAKE_PID" 2>/dev/null || true

assert_json "nudge:true is reshaped into hookSpecificOutput.additionalContext" "$output" \
  "import sys,json; d=json.load(sys.stdin); assert d['hookSpecificOutput']['hookEventName'] == 'PreToolUse'; assert '/sensei:intake' in d['hookSpecificOutput']['additionalContext']"

# nudge:false from a reachable daemon → no-op, same as fail-open.
python3 -c "$FAKE_NUDGE_SERVER" '{"nudge":false}' "$FAKE_NUDGE_PORT" &
FAKE_PID=$!
sleep 0.3

output=$(printf '%s' "$NUDGE_PAYLOAD" | \
  HOME="$TEMP_HOME" \
  CLAUDE_PROJECT_ROOT="$TEMP_PROJECT" \
  CLAUDE_PLUGIN_ROOT="$PLUGIN_ROOT" \
  SENSEI_DAEMON_URL="http://127.0.0.1:${FAKE_NUDGE_PORT}" \
  bash "$SCRIPT_DIR/nudge" 2>/dev/null)

kill "$FAKE_PID" 2>/dev/null || true
wait "$FAKE_PID" 2>/dev/null || true

assert_json "nudge:false returns no-op" "$output" \
  "import sys,json; d=json.load(sys.stdin); assert d == {}"

# ── Cleanup ──────────────────────────────────────────────────────────────────

rm -rf "$TEMP_HOME"

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
