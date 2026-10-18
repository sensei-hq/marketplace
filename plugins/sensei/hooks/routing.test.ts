import type { On } from 'claude-code'
import { type Engine, describe, expect, mock, test } from 'claude-code/testing'

const SESSION = 'sess-238-routing'

type Request = { url: string; body: Record<string, unknown> }

// The engine beneath the plugin: git reports the working tree's changes, the
// daemon answers the routing question, and the engine records the model each
// spawn finally resolved with.
const engine = (on: On, routed: { class: string; reasons: string[]; model: string | null } | 'down') => {
  mock.env(on, { HOME: '/Users/dev' })
  mock.clock(on, { now: 1_760_000_000_000 })
  on('session.id', () => ({ value: SESSION }))
  on('process.run', ($, e) => {
    const out = (stdout: string) => ({
      value: { exitCode: 0, stdout, stderr: '', isStdoutTruncated: false, isStderrTruncated: false },
    })
    if (e.argv.join(' ') === 'git diff --name-only -z HEAD') return out('crates/senseid/src/auth/session.rs\0README.md\0')
    if (e.argv.join(' ') === 'git ls-files --others --exclude-standard -z') return out('crates/senseid/src/new.rs\0')
    return out('')
  })
  const requests: Request[] = []
  on('http.fetch', ($, e) => {
    requests.push({ url: e.url, body: JSON.parse(e.init?.body ?? '{}') })
    if (e.url.endsWith('/hook/event')) return { value: { status: 200, ok: true, headers: {}, text: '{}' } }
    if (routed === 'down') return { deny: 'connection refused' }
    return { value: { status: 200, ok: true, headers: {}, text: JSON.stringify(routed) } }
  })
  const spawned: (string | undefined)[] = []
  on('agent.spawn', ($, e) => {
    spawned.push(e.model)
    return { model: e.model ?? 'inherit' }
  })
  return { requests, spawned }
}

// An Agent tool call spawning a plugin agent, as the engine raises it.
const spawn = ($: Engine, model?: string) =>
  $.agent.spawn({
    tool_use_id: 'toolu_238',
    prompt: 'review the session token handling',
    description: 'review',
    subagentType: 'sensei:security-reviewer',
    provider: { plugin: 'sensei', tier: 'user' },
    parentModel: 'claude-opus-5-5',
    background: false,
    fork: false,
    ...(model === undefined ? {} : { model }),
  })

describe('subagent model by risk class (#238 step 3)', () => {
  test('a spawn with no model of its own runs on the model its risk class maps to', async ($, on) => {
    const { requests, spawned } = engine(on, { class: 'approve', reasons: ['auth'], model: 'opus' })

    await spawn($)

    expect(spawned).toEqual(['opus'])
    const ask = requests.find(r => r.url.endsWith('/api/review/subagent-model'))
    expect(ask?.body).toEqual({
      paths: ['crates/senseid/src/auth/session.rs', 'README.md', 'crates/senseid/src/new.rs'],
      task: 'review the session token handling',
    })
  })

  test('the routing is recorded as a ModelRouted event', async ($, on) => {
    const { requests } = engine(on, { class: 'approve', reasons: ['auth'], model: 'opus' })

    await spawn($)

    const event = requests.find(r => r.body.hook_event_name === 'ModelRouted')
    expect(event?.body).toMatchObject({
      session_id: SESSION,
      subagent_type: 'sensei:security-reviewer',
      risk_class: 'approve',
      reasons: ['auth'],
      model: 'opus',
    })
  })

  test('a model the caller named is never overridden', async ($, on) => {
    const { requests, spawned } = engine(on, { class: 'approve', reasons: [], model: 'opus' })

    await spawn($, 'haiku')

    expect(spawned).toEqual(['haiku'])
    expect(requests).toHaveLength(0)
  })

  test('an unmapped class leaves the agent on its own model', async ($, on) => {
    const { requests, spawned } = engine(on, { class: 'review', reasons: [], model: null })

    await spawn($)

    expect(spawned).toEqual([undefined])
    expect(requests.some(r => r.body.hook_event_name === 'ModelRouted')).toBe(false)
  })

  test('an unreachable daemon leaves the agent on its own model', async ($, on) => {
    const { spawned } = engine(on, 'down')

    await spawn($)

    expect(spawned).toEqual([undefined])
  })
})
