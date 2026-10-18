import type { On } from 'claude-code'
import { describe, expect, mock, test } from 'claude-code/testing'

const SESSION = 'sess-238'
const NOW = 1_760_000_000_000

// The engine beneath the plugin: the session's id, a home directory, a clock,
// and the engine's own answer to the two events the mod observes.
const engine = (on: On) => {
  mock.env(on, { HOME: '/Users/dev' })
  const clock = mock.clock(on, { now: NOW })
  on('session.id', () => ({ value: SESSION }))
  on('session.measure', ($, e) => ({ changed: e.changed }))
  on('turn.complete', ($, e) => ({ text: e.answer, usage: e.usage }))
  return clock
}

const spool = (on: On) => {
  const spooled: { argv: readonly string[]; stdin?: string }[] = []
  on('process.run', ($, e) => {
    spooled.push({ argv: e.argv, stdin: e.init?.stdin })
    return { value: { exitCode: 0, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
  })
  return spooled
}

// The daemon's endpoint answers 200 here; the tests capture what was posted.
const posted = (on: On) => {
  engine(on)
  const bodies: Record<string, unknown>[] = []
  const urls: string[] = []
  on('http.fetch', ($, e) => {
    urls.push(e.url)
    bodies.push(JSON.parse(e.init?.body ?? '{}'))
    return { value: { status: 200, ok: true, headers: {}, text: '{"ok":true}' } }
  })
  return Object.assign(bodies, { urls })
}

describe('usage at source (#238 step 2)', () => {
  test('session.measure posts the engine figures as a SessionMeasure event', async ($, on) => {
    const bodies = posted(on)

    await $.session.measure({
      context: { tokens: 51234, window: 200000, percent: 26 },
      rateLimits: [{ kind: 'five_hour', percentUsed: 23.5, resetsAt: '2026-10-15T18:00:00Z' }],
      cost: { usd: 4.27 },
      changed: ['context', 'cost'],
    })

    expect(bodies).toHaveLength(1)
    expect(bodies[0]).toMatchObject({
      session_id: SESSION,
      assistant_family: 'claude',
      hook_event_name: 'SessionMeasure',
      context: { tokens: 51234, window: 200000, percent: 26 },
      rate_limits: [{ kind: 'five_hour', percentUsed: 23.5, resetsAt: '2026-10-15T18:00:00Z' }],
      cost: { usd: 4.27 },
      changed: ['context', 'cost'],
    })
    expect(bodies[0]?.ts).toBe(NOW)
    expect(bodies.urls).toEqual(['http://127.0.0.1:7744/hook/event'])
  })

  test('a measure with no cost ledger posts no cost key, never a zero', async ($, on) => {
    const bodies = posted(on)

    await $.session.measure({ context: { window: 200000 }, rateLimits: [], changed: ['context'] })

    expect(bodies).toHaveLength(1)
    expect('cost' in (bodies[0] ?? {})).toBe(false)
  })

  test('turn.complete posts the turn usage as a TurnComplete event', async ($, on) => {
    const bodies = posted(on)
    const usage = {
      input_tokens: 12,
      output_tokens: 340,
      cache_read_input_tokens: 48000,
      cache_creation_input_tokens: 900,
      model: 'claude-opus-5-5',
    }

    await $.turn.complete({
      answer: 'done',
      durationMs: 8123,
      isAborted: false,
      turnId: 't-1',
      reason: 'answer',
      usage,
    })

    const turn = bodies.find(b => b.hook_event_name === 'TurnComplete')
    expect(turn).toMatchObject({
      session_id: SESSION,
      assistant_family: 'claude',
      turn_id: 't-1',
      reason: 'answer',
      duration_ms: 8123,
      usage,
    })
    expect('agent_id' in (turn ?? {})).toBe(false)
  })

  test('a turn with no usage is posted without a usage key', async ($, on) => {
    const bodies = posted(on)

    await $.turn.complete({
      answer: '',
      durationMs: 40,
      isAborted: true,
      turnId: 't-2',
      reason: 'aborted',
    })

    const turn = bodies.find(b => b.hook_event_name === 'TurnComplete')
    expect(turn).toBeDefined()
    expect('usage' in (turn ?? {})).toBe(false)
  })

  test('an unreachable daemon dead-letters the event to the capture spool', async ($, on) => {
    engine(on)
    const spooled = spool(on)
    on('http.fetch', () => ({ deny: 'connection refused' }))

    await $.session.measure({ context: { window: 200000 }, rateLimits: [], cost: { usd: 1.5 }, changed: ['cost'] })

    expect(spooled).toHaveLength(1)
    expect(spooled[0]?.argv.at(-1)).toBe('/Users/dev/.sensei/events.jsonl')
    const line = spooled[0]?.stdin ?? ''
    expect(line.endsWith('\n')).toBe(true)
    expect(JSON.parse(line)).toMatchObject({ hook_event_name: 'SessionMeasure', cost: { usd: 1.5 } })
  })
  test('a daemon that never answers is dead-lettered after the post bound', async ($, on) => {
    const clock = engine(on)
    const spooled = spool(on)
    on('http.fetch', () => new Promise(() => {}))

    const measured = $.session.measure({ context: { window: 200000 }, rateLimits: [], changed: ['context'] })
    await clock.advance(1999)
    expect(spooled).toHaveLength(0)
    await clock.advance(1)
    await measured

    expect(spooled).toHaveLength(1)
  })

  test('a delivered event is not also spooled', async ($, on) => {
    const clock = engine(on)
    const spooled = spool(on)
    on('http.fetch', () => ({ value: { status: 200, ok: true, headers: {}, text: '{}' } }))

    await $.session.measure({ context: { window: 200000 }, rateLimits: [], changed: ['context'] })
    await clock.advance(5000)

    expect(spooled).toHaveLength(0)
  })

  test('a non-2xx answer is dead-lettered', async ($, on) => {
    engine(on)
    const spooled = spool(on)
    on('http.fetch', () => ({ value: { status: 503, ok: false, headers: {}, text: '' } }))

    await $.session.measure({ context: { window: 200000 }, rateLimits: [], changed: ['context'] })

    expect(spooled).toHaveLength(1)
  })
})
