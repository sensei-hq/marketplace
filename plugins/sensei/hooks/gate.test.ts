import type { On } from 'claude-code'
import { type Engine, describe, expect, mock, test } from 'claude-code/testing'

const SESSION = 'sess-238-gate'
const GATED = { options: { relayGate: true } }

type Verdict = 'allow' | 'ask' | 'deny'

// The engine's own verdict beneath the plugin, and the daemon's /hook/gate.
const engine = (on: On, verdict: Verdict, gate: { decision: string; reason: string } | 'down') => {
  mock.env(on, { HOME: '/Users/dev' })
  mock.clock(on, { now: 1_760_000_000_000 })
  on('session.id', () => ({ value: SESSION }))
  on('session.root', () => ({ value: '/Users/dev/repo' }))
  on('tool.check', () => ({ decision: verdict, reason: 'the engine said so' }))
  const asked: Record<string, unknown>[] = []
  on('http.fetch', ($, e) => {
    asked.push(JSON.parse(e.init?.body ?? '{}'))
    if (gate === 'down') return { deny: 'connection refused' }
    const text = JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: gate.decision,
        permissionDecisionReason: gate.reason,
      },
    })
    return { value: { status: 200, ok: true, headers: {}, text } }
  })
  return asked
}

// `null` asks without a call: a permission query.
const check = ($: Engine, toolUseId: string | null = 'toolu_gate') =>
  $.tool.check({
    tool: 'Bash',
    input: { command: 'git push origin main' },
    ...(toolUseId === null ? {} : { tool_use_id: toolUseId }),
  })

describe('relay tool gate (#238 step 5)', () => {
  test('off by default: the daemon is never asked', async ($, on) => {
    const asked = engine(on, 'allow', { decision: 'deny', reason: 'declined from your phone' })

    expect((await check($)).decision).toBe('allow')
    expect(asked).toHaveLength(0)
  })

  test('on: a decline from the daemon denies the call with its reason', GATED, async ($, on) => {
    const asked = engine(on, 'allow', { decision: 'deny', reason: 'declined from your phone' })

    const verdict = await check($)

    expect(verdict.decision).toBe('deny')
    expect(verdict.reason).toBe('declined from your phone')
    expect(asked).toEqual([
      {
        session_id: SESSION,
        hook_event_name: 'PreToolUse',
        tool_name: 'Bash',
        tool_input: { command: 'git push origin main' },
        tool_use_id: 'toolu_gate',
        cwd: '/Users/dev/repo',
      },
    ])
  })

  test('on: the daemon allowing never loosens the engine verdict', GATED, async ($, on) => {
    engine(on, 'ask', { decision: 'allow', reason: 'approved from your phone' })

    expect((await check($)).decision).toBe('ask')
  })

  test('on: an unreachable daemon leaves the engine verdict (fail-open)', GATED, async ($, on) => {
    engine(on, 'ask', 'down')

    expect((await check($)).decision).toBe('ask')
  })

  test('on: a call the engine already denies is not put to the phone', GATED, async ($, on) => {
    const asked = engine(on, 'deny', { decision: 'deny', reason: 'x' })

    expect((await check($)).decision).toBe('deny')
    expect(asked).toHaveLength(0)
  })

  test('on: a permission query (no tool call) is not put to the phone', GATED, async ($, on) => {
    const asked = engine(on, 'allow', { decision: 'deny', reason: 'x' })

    expect((await check($, null)).decision).toBe('allow')
    expect(asked).toHaveLength(0)
  })
})
