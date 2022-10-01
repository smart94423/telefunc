export { cmd }
export { isObject }

import { execSync } from 'child_process'

/** @type { (command: string, options?: { cwd?: string }) => string } */
function cmd(command, { cwd } = {}) {
  let stdout = execSync(command, { encoding: 'utf8', cwd })
  stdout = stdout.split(/\s/).filter(Boolean).join(' ')
  return stdout
}

/** @type { (value: unknown) => value is Record<string, unknown> } */
function isObject(value) {
  return typeof value === 'object' && value !== null
}
