// Subagent model by risk class (#238 step 3). When an agent is spawned without
// a model of its own choosing, the daemon classifies the working tree's change
// (auto | review | approve) and answers the model the user's
// `routing.risk_models` maps that class to. No map, an unmapped class, or an
// unreachable daemon overrides nothing: the agent keeps its own model.
import type { EngineInterface, On } from 'claude-code'
import { capture, request } from './daemon.ts'

type Routed = { class: string; reasons: string[]; model: string | null }

function lines(stdout: string) {
  return stdout.split('\0').filter(path => path !== '')
}

async function git($: EngineInterface, cwd: string | undefined, args: string[]) {
  const r = await $.process.run(['git', ...args], cwd === undefined ? {} : { cwd })
  return r.exitCode === 0 ? lines(r.stdout) : []
}

// Tracked changes against HEAD plus untracked files: what the subagent's work
// would touch. A command that fails contributes nothing; the daemon classifies
// an empty change as `review` ("cannot assess blast radius").
async function changedPaths($: EngineInterface, cwd: string | undefined) {
  return [
    ...(await git($, cwd, ['diff', '--name-only', '-z', 'HEAD'])),
    ...(await git($, cwd, ['ls-files', '--others', '--exclude-standard', '-z'])),
  ]
}

export const registerRouting = (on: On) => {
  on('agent.spawn', async ($, e, next) => {
    if (e.model !== undefined) return next(e)
    const paths = await changedPaths($, e.cwd)
    const answer = await request($, '/api/review/subagent-model', JSON.stringify({ paths, task: e.prompt }))
    const routed = answer === undefined ? undefined : (JSON.parse(answer) as Routed)
    if (routed?.model == null) return next(e)
    await capture($, {
      hook_event_name: 'ModelRouted',
      subagent_type: e.subagentType,
      risk_class: routed.class,
      reasons: routed.reasons,
      model: routed.model,
    })
    return next({ ...e, model: routed.model })
  }).catch(($, e, next) => next(e)) // a failed routing never blocks a spawn: it keeps its own model
}
