module.exports = {
  build: {
    DisableF12: true,
    env: require('./prod.env'),
    hotPublishUrl:"",
    hotPublishConfigName: "update-config"
  },
  dev: {
    env: require('./dev.env'),
    removeElectronJunk: true,
    chineseLog: false,
    port: 9080,
  },
  DllFolder: '',
  HotUpdateFolder: 'update',
  UseStartupChart: true,
  IsUseSysTitle: false,
  BuiltInServerPort: 25565
}