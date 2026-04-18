#!/usr/bin/env bash
# Test hook scripts — verifies JSON output and content checks
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PASS=0
FAIL=0

# Create temp project for testing
TEMP_PROJECT=$(mktemp -d)
mkdir -p "$TEMP_PROJECT/.sensei"

run_test() {
  local name="$1"
  local hook="$2"
  local check="$3"
  local setup="${4:-}"

  # Run optional setup
  if [ -n "$setup" ]; then
    eval "$setup"
  fi

  # Run hook and capture output
  local output
  output=$(CLAUDE_PROJECT_ROOT="$TEMP_PROJECT" CLAUDE_PLUGIN_ROOT="$PLUGIN_ROOT" bash "$SCRIPT_DIR/$hook" 2>/dev/null) || true

  # Check valid JSON
  if ! echo "$output" | python3 -m json.tool >/dev/null 2>&1; then
    echo "  FAIL $name — invalid JSON"
    FAIL=$((FAIL + 1))
    return
  fi

  # Run content check
  if echo "$output" | python3 -c "$check" 2>/dev/null; then
    echo "  PASS $name"
    PASS=$((PASS + 1))
  else
    echo "  FAIL $name"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== session-start hook ==="

run_test "valid JSON with additional_context" "session-start" \
  "import sys,json; d=json.load(sys.stdin); assert 'additional_context' in d"

run_test "includes MCP tools" "session-start" \
  "import sys,json; d=json.load(sys.stdin); assert 'search(query' in d['additional_context']"

run_test "includes workflow commands" "session-start" \
  "import sys,json; d=json.load(sys.stdin); assert '/sensei:idea' in d['additional_context']"

run_test "includes mindsets reference" "session-start" \
  "import sys,json; d=json.load(sys.stdin); assert 'Analyst' in d['additional_context'] or 'mindsets' in d['additional_context']"

run_test "no rules message when file missing" "session-start" \
  "import sys,json; d=json.load(sys.stdin); assert 'No rules' in d['additional_context']"

run_test "loads rules when present" "session-start" \
  "import sys,json; d=json.load(sys.stdin); assert 'test-rule-alpha' in d['additional_context']" \
  "echo '# Rules\n- test-rule-alpha' > $TEMP_PROJECT/.sensei/rules.md"

run_test "loads state when present" "session-start" \
  "import sys,json; d=json.load(sys.stdin); assert 'active_phase: build' in d['additional_context']" \
  "echo 'active_phase: build\nactive_issue: 42' > $TEMP_PROJECT/.sensei/state.yaml"

echo ""
echo "=== pre-compact hook ==="

# Reset temp project
rm -f "$TEMP_PROJECT/.sensei/rules.md" "$TEMP_PROJECT/.sensei/state.yaml"

run_test "valid JSON" "pre-compact" \
  "import sys,json; d=json.load(sys.stdin); assert 'additional_context' in d"

run_test "includes tool reminder" "pre-compact" \
  "import sys,json; d=json.load(sys.stdin); assert 'search()' in d['additional_context']"

run_test "suggests refocus" "pre-compact" \
  "import sys,json; d=json.load(sys.stdin); assert '/sensei:refocus' in d['additional_context']"

run_test "no-rules message when missing" "pre-compact" \
  "import sys,json; d=json.load(sys.stdin); assert 'No project rules' in d['additional_context']"

run_test "loads rules when present" "pre-compact" \
  "import sys,json; d=json.load(sys.stdin); assert 'test-rule-beta' in d['additional_context']" \
  "echo '# Rules\n- test-rule-beta' > $TEMP_PROJECT/.sensei/rules.md"

run_test "loads state when present" "pre-compact" \
  "import sys,json; d=json.load(sys.stdin); assert 'active_phase: ideate' in d['additional_context']" \
  "echo 'active_phase: ideate' > $TEMP_PROJECT/.sensei/state.yaml"

# Cleanup
rm -rf "$TEMP_PROJECT"

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
