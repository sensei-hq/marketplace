// Usage at the source (#238 step 2). Claude Code's hook payloads carry no
// token or cost figures; the engine's own events do. This forwards them to the
// daemon as two event kinds:
//
//   SessionMeasure — the context window's fill, the rate-limit windows and
//                    the session's cost as /cost totals it (list price).
//   TurnComplete   — one turn's four token counts and the model that answered.
import type { On } from 'claude-code'
import { capture } from './daemon.ts'

export const registerUsage = (on: On) => {
  on('session.measure', async ($, e, next) => {
    const result = await next(e)
    await capture($, {
      hook_event_name: 'SessionMeasure',
      context: e.context,
      rate_limits: e.rateLimits,
      ...(e.cost === undefined ? {} : { cost: e.cost }),
      changed: e.changed,
    })
    return result
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    await capture($, {
      hook_event_name: 'TurnComplete',
      turn_id: e.turnId,
      ...(e.agentId === undefined ? {} : { agent_id: e.agentId }),
      reason: e.reason,
      duration_ms: e.durationMs,
      ...(e.usage === undefined ? {} : { usage: e.usage }),
    })
    return result
  })
}
