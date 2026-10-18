import type { On } from 'claude-code'
import { type Engine, describe, expect, mock, test } from 'claude-code/testing'

const SESSION = 'sess-238-drive'
const DRIVEN = { options: { runDrive: true } }
const POLL_MS = 30_000
const START_RUN = 'mcp__plugin_sensei_sensei__start_run'
const REPORT_OUTCOME = 'mcp__plugin_sensei_sensei__report_run_outcome'

type Nudge = { id: string; kind: string; text: string; answered_at: string | null }

// The engine beneath the plugin: the sensei MCP server answers start_run and
// report_run_outcome, the daemon serves the run's nudges, and the session takes
// the prompts the plugin submits.
const engine = (on: On, nudges: Nudge[]) => {
  mock.env(on, { HOME: '/Users/dev' })
  mock.store(on)
  const clock = mock.clock(on, { now: 1_760_000_000_000 })
  on('session.id', () => ({ value: SESSION }))
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('tool.call', ($, e) => {
    if (e.tool === START_RUN) {
      const text = JSON.stringify({ run: { id: 'run-1', status: 'pending' }, track_url: null })
      return { result: { content: [{ type: 'text', text }], isError: false } }
    }
    return { result: { content: [{ type: 'text', text: '{"ok":true}' }], isError: false } }
  })
  const polled: string[] = []
  on('http.fetch', ($, e) => {
    polled.push(e.url)
    return { value: { status: 200, ok: true, headers: {}, text: JSON.stringify({ nudges }) } }
  })
  const submitted: string[] = []
  on('prompt.submit', ($, e) => {
    submitted.push(e.text)
    return { text: e.text }
  })
  return { clock, polled, submitted }
}

const startSession = ($: Engine) => $.session.start({ cwd: '/Users/dev/repo', surface: null, isInteractive: false })
const startRun = ($: Engine) => $.tool.call({ tool: START_RUN, goal: 'ship it' })

const NUDGE: Nudge = { id: 'n-1', kind: 'nudge', text: 'tighten the failing test first', answered_at: null }

describe('opt-in run drive (#238 step 4)', () => {
  test('off by default: a started run is never polled', async ($, on) => {
    const { clock, polled, submitted } = engine(on, [NUDGE])
    await startSession($)
    await startRun($)

    await clock.advance(POLL_MS * 2)

    expect(polled).toHaveLength(0)
    expect(submitted).toHaveLength(0)
  })

  test("on: a run this session started has its nudges submitted as prompts", DRIVEN, async ($, on) => {
    const { clock, polled, submitted } = engine(on, [NUDGE])
    await startSession($)
    await startRun($)

    await clock.advance(POLL_MS)

    expect(polled).toEqual(['http://127.0.0.1:7744/api/runs/run-1/nudges'])
    expect(submitted).toHaveLength(1)
    expect(submitted[0]).toContain('tighten the failing test first')
    expect(submitted[0]).toContain('run-1')
  })

  test('on: a nudge is submitted once, however often it is polled', DRIVEN, async ($, on) => {
    const { clock, polled, submitted } = engine(on, [NUDGE])
    await startSession($)
    await startRun($)

    await clock.advance(POLL_MS * 3)

    expect(polled).toHaveLength(3)
    expect(submitted).toHaveLength(1)
  })

  test('on: with no run started nothing is polled', DRIVEN, async ($, on) => {
    const { clock, polled } = engine(on, [NUDGE])
    await startSession($)

    await clock.advance(POLL_MS * 2)

    expect(polled).toHaveLength(0)
  })

  test("on: reporting the run's outcome stops the drive", DRIVEN, async ($, on) => {
    const { clock, polled } = engine(on, [])
    await startSession($)
    await startRun($)
    await clock.advance(POLL_MS)
    expect(polled).toHaveLength(1)

    await $.tool.call({ tool: REPORT_OUTCOME, run_id: 'run-1', outcome: 'done' })
    await clock.advance(POLL_MS * 2)

    expect(polled).toHaveLength(1)
  })
  test("on: another run's outcome does not stop this one", DRIVEN, async ($, on) => {
    const { clock, polled } = engine(on, [])
    await startSession($)
    await startRun($)

    await $.tool.call({ tool: REPORT_OUTCOME, run_id: 'run-other', outcome: 'done' })
    await clock.advance(POLL_MS)

    expect(polled).toHaveLength(1)
  })
})
