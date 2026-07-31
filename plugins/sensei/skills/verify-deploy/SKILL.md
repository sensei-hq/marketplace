---
name: verify-deploy
description: Use when shipping a change that only takes effect through a built/deployed artifact (a Worker bundle, a daemon binary) — clean-rebuild on interface changes, smoke the live artifact (cache-bust), and install as part of completion. A feature isn't done while the running artifact is stale.
---

# Verify the running artifact, not just the source

## Overview

Committing the source doesn't change what's running. A new route 405s from a stale incremental
bundle; a daemon feature stays invisible until the binary is rebuilt; a new endpoint's first
anonymous hit serves a cached 404. "Shipped" means the deployed artifact is verified doing the
new thing.

## Procedure

1. **Clean-rebuild when the interface changed** — a new route method, a changed wire type, a new
   export. Incremental builds can emit a stale bundle that omits the new surface. (For the dōjō
   Worker: `rm -rf .svelte-kit/output .svelte-kit/cloudflare` before the build; re-create
   `.assetsignore`.)
2. **Install/deploy as part of finishing**, not as a follow-up. A daemon change → rebuild +
   install the binary (`make crates && make install-service`); a Worker change → deploy. A
   feature whose running artifact is still old is not done.
3. **Smoke the live artifact** with the real request shape, and **cache-bust** (a fresh query
   string) — the first hit to a newly-added route can be an edge-cached 404. Expect the handler
   to run (e.g. 401 unauth), not a 405 (stale bundle) or a cached 404 (propagation).
4. **Confirm the version/health** you deployed is the one answering, and that the effect is
   live (see `data-reality-check`).

## Done when
The rebuilt/redeployed artifact is installed and a live smoke (cache-busted) shows it serving
the new behavior — not just the source committed.
