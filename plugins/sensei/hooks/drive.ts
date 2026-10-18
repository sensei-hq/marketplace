// Run drive (#238 step 4), opt-in through the plugin's `runDrive` option; off,
// nudges stay pull-only through get_pending_nudges (decisions.md, 2026-10-15).
//
// When this session starts a run (the sensei MCP server's start_run), the run's
// dōjō nudges are polled every POLL_MS and each one is submitted as a prompt,
// once: the engine queues a plugin's prompt until the session is idle. Reporting
// the run's outcome stops the drive. The run and the nudges already delivered
// are kept in the plugin's store under the session's id, so a reload of the
// module resumes rather than repeats.
import type { EngineInterface, On, PluginOptions } from 'claude-code'
import { request } from './daemon.ts'

const POLL_MS = 30_000
// The newest delivered ids kept: the store is 4 MiB shared by every session.
const DELIVERED_KEPT = 200

type Drive = { runId: string; delivered: string[] }
type Nudge = { id: string; kind: string; text: string }

function isSenseiTool(tool: string, name: string) {
  return tool.startsWith('mcp__') && tool.includes('sensei') && tool.endsWith(`__${name}`)
}

// The text of an MCP tool's result: a string, content blocks, or `{ content }`.
function resultText(result: unknown): string {
  if (typeof result === 'string') return result
  const blocks = Array.isArray(result) ? result : (result as { content?: unknown } | undefined)?.content
  if (!Array.isArray(blocks)) return ''
  return blocks.map(b => (typeof b?.text === 'string' ? b.text : '')).join('')
}

function startedRunId(result: unknown): string | undefined {
  try {
    const id = (JSON.parse(resultText(result)) as { run?: { id?: unknown } }).run?.id
    return typeof id === 'string' ? id : undefined
  } catch {
    return undefined
  }
}

async function driveKey($: EngineInterface) {
  return `drive:${await $.session.id()}`
}

async function poll($: EngineInterface) {
  const key = await driveKey($)
  const drive = (await $.store.get(key)) as Drive | undefined
  if (drive === undefined) return
  const answer = await request($, `/api/runs/${drive.runId}/nudges`, undefined)
  if (answer === undefined) return
  const nudges = (JSON.parse(answer) as { nudges: Nudge[] }).nudges
  const fresh = nudges.filter(n => !drive.delivered.includes(n.id))
  if (fresh.length === 0) return
  // Recorded before submitting: a nudge lost to a failed submit beats one
  // submitted twice into a session working unattended.
  const delivered = [...drive.delivered, ...fresh.map(n => n.id)].slice(-DELIVERED_KEPT)
  await $.store.set(key, { runId: drive.runId, delivered })
  for (const n of fresh) {
    await $.prompt.submit({ text: `Dōjō ${n.kind} for run ${drive.runId}: ${n.text}` })
  }
}

export const registerDrive = (on: On, options: PluginOptions) => {
  if (options.runDrive !== true) return

  on('session.start', async ($, e, next) => {
    const started = await next(e)
    $.clock.every(POLL_MS, () => {
      void poll($)
    })
    return started
  })

  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    if (ran.deny !== undefined || ran.isError === true) return ran
    if (isSenseiTool(e.tool, 'start_run')) {
      const runId = startedRunId(ran.result)
      if (runId !== undefined) await $.store.set(await driveKey($), { runId, delivered: [] })
    } else if (isSenseiTool(e.tool, 'report_run_outcome')) {
      const key = await driveKey($)
      const drive = (await $.store.get(key)) as Drive | undefined
      if (drive !== undefined && drive.runId === (e as { run_id?: unknown }).run_id) await $.store.delete(key)
    }
    return ran
  }).catch(($, e, next) => next(e)) // the drive's bookkeeping never breaks a tool call
}
