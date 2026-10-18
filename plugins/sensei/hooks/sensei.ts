// The sensei plugin's mods module: one register, one concern per file.
import type { Register } from 'claude-code'
import { registerDrive } from './drive.ts'
import { registerGate } from './gate.ts'
import { registerRouting } from './routing.ts'
import { registerUsage } from './usage.ts'

export const register: Register = (on, options) => {
  registerUsage(on)
  registerRouting(on)
  registerGate(on, options)
  registerDrive(on, options)
}
