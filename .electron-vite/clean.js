const { sync } = require('del')

function clean() {
  sync(['dist/electron/main/*', 'dist/electron/renderer/*', 'dist/web/*', 'build/*', '!build/icons', '!build/lib', '!build/lib/electron-build.*', '!build/icons/icon.*'])
  console.log(`\n${doneLog}clear done`)
  process.exit()
}