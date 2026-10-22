// The relay tool gate (#238 step 5), opt-in through the plugin's `relayGate`
// option. Before a tool call runs, the daemon's /hook/gate may put it to a dōjō
// member's phone and hold it for their answer (it bounds that wait itself, ~50 s).
//
// It only ever TIGHTENS: a decline denies the call; anything else, including
// the daemon allowing, leaves the engine's own verdict, so the gate can never
// skip a permission prompt. And it fails open: an unreachable daemon, or a
// failure in this hook, leaves the engine's verdict too.
//
// It tells the daemon when the session is UNATTENDED — a step the daemon spawned
// (SENSEI_RUN_ID) or a session its run drive steers — so an unanswered
// hard-block there is denied rather than let through (#312, D28).
import type { On, PluginOptions } from 'claude-code'
import { request } from './daemon.ts'
import { isDriven } from './drive.ts'

type GateAnswer = { hookSpecificOutput?: { permissionDecision?: string; permissionDecisionReason?: string } }

export const registerGate = (on: On, options: PluginOptions) => {
  if (options.relayGate !== true) return
  on('tool.check', async ($, e, next) => {
    const verdict = await next(e)
    // A query runs nothing, and a call the engine refuses needs no human.
    if (e.tool_use_id === undefined || verdict.decision === 'deny') return verdict
    const body = JSON.stringify({
      session_id: await $.session.id(),
      hook_event_name: 'PreToolUse',
      tool_name: e.tool,
      tool_input: e.input,
      tool_use_id: e.tool_use_id,
      cwd: await $.session.root(),
      unattended: (await $.env.get('SENSEI_RUN_ID')) !== undefined || (await isDriven($)),
    })
    const answer = await request($, '/hook/gate', body, undefined)
    const said = answer === undefined ? undefined : (JSON.parse(answer) as GateAnswer).hookSpecificOutput
    return said?.permissionDecision === 'deny'
      ? { decision: 'deny' as const, reason: said.permissionDecisionReason ?? 'declined by the relay gate' }
      : verdict
  }).catch(($, e, next) => next(e))
}
