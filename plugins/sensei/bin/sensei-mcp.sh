#!/usr/bin/env bash
# Launcher for sensei-mcp that resolves the binary regardless of how
# Claude Code was started.
#
# Background: macOS apps launched from Finder inherit a narrow PATH
# (typically `/usr/bin:/bin:/usr/sbin:/sbin` only). Brew binaries live
# in `/opt/homebrew/bin` (Apple Silicon) or `/usr/local/bin` (Intel),
# neither of which is on Finder's PATH. So a `plugin.json` that just
# says `"command": "sensei-mcp"` works when Claude Code is launched
# from a terminal but fails silently when launched from Finder — the
# MCP server never starts and `/plugin` shows `✘ failed`.
#
# This launcher probes the well-known install locations directly,
# bypassing PATH lookup. The first existing executable wins; the
# final `exec sensei-mcp "$@"` is a last-ditch PATH fallback so a
# manually-relocated install still works.

set -e

for candidate in \
  /opt/homebrew/bin/sensei-mcp \
  /opt/homebrew/opt/sensei/bin/sensei-mcp \
  /usr/local/bin/sensei-mcp \
  /usr/local/opt/sensei/bin/sensei-mcp \
  /home/linuxbrew/.linuxbrew/bin/sensei-mcp \
  "$HOME/.local/bin/sensei-mcp"; do
  if [ -x "$candidate" ]; then
    exec "$candidate" "$@"
  fi
done

# Final fallback — relies on PATH. Will fail loudly if sensei-mcp
# isn't where we looked AND not on PATH.
exec sensei-mcp "$@"
