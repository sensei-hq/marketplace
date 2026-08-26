---
description: Prove the environment is sane before any work begins — disk, services, ports, runtime target, artifact freshness. Go/no-go with remediation.
argument-hint: Optional "--fix" to apply non-destructive remediations, or "--quick" for the fast subset
---

## What this command does

Environment drift is a silent tax: it surfaces as a confusing test failure an hour into the work,
never as an honest error at the start. This command pays that tax up front, in parallel, and
returns a single **GO / NO-GO**.

Run it before `/sensei:build` on anything touching a database, a browser, or a large native build.
`/sensei:build` invokes it automatically for those tasks.

**A NO-GO is the product, not a failure of the command.** Refuse to proceed on a hard fail.

## Procedure

1. Call `log_event(type="command_invoked", data="{\"command\":\"preflight\"}")` — MANDATORY.
   Preflight is cross-cutting — do NOT change the workflow phase.
2. Read `.sensei/rules.md` — a project may declare its own required services and ports.

### Step 1: Fan out, in parallel

**One message, five Agent calls.** The probes are independent; running them serially wastes the
wall-clock this command exists to save. Give every agent the repo path and this instruction:

> Report only what you actually measured. Never infer that a service is healthy from a process
> being alive, or that a port is free from a config file. Run the command, read the real output and
> the real exit code. Output your section in the structured shape below and nothing else.

**Probe A — Disk headroom and reclaim plan.** `df -h` on the volumes holding the repo, the build
cache, and `$TMPDIR`. Under 10 GB free → HARD FAIL; under 25 GB → WARN. If low, measure the real
candidates with `du -sh` before proposing anything — build `target/` dirs, `node_modules`, Docker
images/volumes, `~/Library/Caches`, package-manager caches, browser bundles — and report each with
its actual size and the exact reclaim command, ranked by bytes freed per unit of risk. Never run a
destructive reclaim without `--fix` **and** explicit confirmation.

**Probe B — Services responding, not merely running.** A process in `ps` proves nothing and a
listening socket proves little more. Send a real request and read the real response: `pg_isready`
**then an actual query**; the daemon's health endpoint with its status code and body; one real
round-trip for every other declared dependency. A backend that accepts a connection and returns 503
is a FAIL, not a pass.

**Probe C — Port conflicts.** Enumerate the ports the project declares (scan `docker-compose*.y*ml`,
`supabase/config.toml`, `.env*`, `Makefile`, `vite.config.*`, daemon config). For each, run
`lsof -nP -iTCP:<port> -sTCP:LISTEN` and identify the owning **pid and working directory**.
Two or three stacks of the same tool fighting over one port → HARD FAIL, naming every pid and cwd
so the operator knows which to kill. **Distinguish a real conflict from one process bound to both
IPv4 and IPv6** — two rows with one pid is dual-stack, not contention.

**Probe D — Browser / runtime target match.** Determine the app's real runtime engine (Tauri → the
system WebView, i.e. WebKit/WKWebView on macOS; Electron → bundled Chromium; a web app → its CI
browsers) and what the harness actually drives (`playwright.config.*` projects, webdriver config).
Driving Chromium against a WebKit runtime is a HARD FAIL — engine, CSS support, and JS differ.
Judge each harness against **its own** target: a Chromium project for a marketing site is correct,
not a mismatch. Verify driver binaries are installed, not merely configured.

**Probe E — Build-artifact freshness.** Compare newest source mtime against build-output mtime per
workspace. Outputs older than their inputs → WARN with the rebuild command. A manifest/lockfile
newer than its installed tree → WARN, dependencies not installed. **Detect every workspace
independently** — a repo-root build says nothing about a detached sidecar workspace. Flag artifacts
built by a different toolchain than the one now active.

### Step 2: Adjudicate

Collect all five. Do not average or soften — one HARD FAIL makes the run a **NO-GO**.

Before reporting any HARD FAIL, **verify it yourself**: re-run the single command that proves it and
paste the output. A false no-go trains the operator to ignore this command, which costs more than
the drift it was built to catch.

A probe that errored or returned nothing is **NOT RUN**, never a pass. Name it.

### Step 3: Report

Open with `PREFLIGHT: GO` or `PREFLIGHT: NO-GO`, then one line per probe: name, status
(PASS/WARN/FAIL/NOT RUN), and the measured value. Then, for WARNs and FAILs only, in severity order:
what is wrong with its measured evidence, and the exact paste-ready command that fixes it.

Close with either a statement that the environment is clean and work may begin, or — on NO-GO — the
blocking items and the remediation sequence in order. Do not offer to proceed anyway, and do not
begin the underlying task.

Log the outcome: `log_event(type="preflight", data="{\"result\":\"go|no-go\",\"failures\":[...]}")` — MANDATORY.

With `--fix`: execute only the **non-destructive** remediations (install a missing driver, rebuild a
stale artifact, start a stopped service). Anything that deletes data, kills a process, or frees disk
requires explicit confirmation — present the command and the byte count, and wait.

## Important

- Measured evidence only. "The service is probably up" is not a probe result.
- Report the real exit code; never conclude a pass from a piped command's status.
- A NO-GO blocks the work. Say so plainly and stop.
