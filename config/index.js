module.exports = {
  build: {
    DisableF12: true,
    env: require('./prod.env'),
  },
  dev: {
    env: require('./dev.env'),
    removeElectronJunk: true,
    chineseLog: false,
    port: 9080,
  },
  UseStartupChart: true,
  IsUseSysTitle: true,
  BuiltInServerPort: 25565
}