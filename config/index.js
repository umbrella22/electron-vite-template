
module.exports = {
  build: {
    DisableF12: true,
    env: require('./prod.env'),
    // 示例
    hotPublishUrl:"http://localhost:5000",
    hotPublishConfigName: "update-config",
    hotPublishGzipDirectory: "gzip",
    hotPublishTempDirectory: "update_temp",
    hostPublishOldDirectory: "old_temp",
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
