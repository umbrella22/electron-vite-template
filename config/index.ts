import prod from './prod.env'
import dev from './dev.env'

export default {
  build: {
    env: prod,
    hotPublishUrl: "",
    hotPublishConfigName: "update-config"
  },
  dev: {
    env: dev,
    removeElectronJunk: true,
    chineseLog: false,
    port: 9080,
  },
  DisableF12: true,
  DllFolder: '',
  HotUpdateFolder: 'update',
  UseStartupChart: true,
  IsUseSysTitle: false,
  BuiltInServerPort: 25565
}