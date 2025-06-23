import { ResolvedConfig } from 'vite'

export default () => {
  let command = ''
  return {
    name: 'ikaros-tools',
    configResolved(resolvedConfig: ResolvedConfig) {
      command = resolvedConfig.command
    },
    buildStart: () => {
      if (command.includes('serve')) {
        globalThis.__name = (target: string, value: Record<string, any>) =>
          Object.defineProperty(target, 'name', { value, configurable: true })
      }
    },
  }
}
