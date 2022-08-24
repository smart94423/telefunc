export { commonConfig }

import type { Plugin, ResolvedConfig } from 'vite'

function commonConfig(): Plugin {
  return {
    name: 'telefunc:commonConfig',
    config: () => ({ appType: 'custom' }),
    configResolved(config) {
      setDefaultPort(config)
      workaroundCI(config)
    }
  }
}

function setDefaultPort(config: ResolvedConfig) {
  // @ts-ignore
  config.server ??= {}
  config.server.port ??= 3000
  // @ts-ignore
  config.preview ??= {}
  config.preview.port ??= 3000
}

// Workaround GitHub Action failing to access the server
function workaroundCI(config: ResolvedConfig) {
  if (process.env.CI) {
    config.server.host ??= true
    config.preview.host ??= true
  }
}
