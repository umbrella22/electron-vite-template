import { globalShortcut } from 'electron'

export const useDisableButton = () => {
  const disableF12 = () => {
    globalShortcut.register('f12', () => {
      console.log('用户试图启动控制台')
    })
  }
  return {
    disableF12,
  }
}
