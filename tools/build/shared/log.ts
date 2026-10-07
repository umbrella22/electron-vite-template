import chalk from 'chalk'
import cliConfig from '../../../apps/desktop/config/index.ts'

export const doneLog = (text: string) => {
  console.log('\n' + chalk.bgGreen.white(' DONE ') + ' ' + text)
}
export const errorLog = (text: string) => {
  console.log('\n ' + chalk.bgRed.white(' ERROR ') + ' ' + text)
}
export const okayLog = (text: string) => {
  console.log('\n ' + chalk.bgBlue.white(' OKAY ') + ' ' + text)
}
export const warningLog = (text: string) => {
  console.log('\n ' + chalk.bgYellow.white(' WARNING ') + ' ' + text)
}
export const infoLog = (text: string) => {
  console.log('\n ' + chalk.bgCyan.white(' INFO ') + ' ' + text)
}

// 以下为 dev-runner 的进程输出格式化

export const logStats = (proc: string, data: any) => {
  let log = ''

  log += chalk.yellow.bold(
    `┏ ${proc} Process ${new Array(19 - proc.length + 1).join('-')}`,
  )
  log += '\n\n'

  if (typeof data === 'object') {
    data
      .toString({
        colors: true,
        chunks: false,
      })
      .split(/\r?\n/)
      .forEach((line) => {
        log += '  ' + line + '\n'
      })
  } else {
    log += `  ${data}\n`
  }

  log += '\n' + chalk.yellow.bold(`┗ ${new Array(28 + 1).join('-')}`) + '\n'
  console.log(log)
}

export const removeJunk = (chunk: string) => {
  if (cliConfig.dev.removeElectronJunk) {
    // Example: 2018-08-10 22:48:42.866 Electron[90311:4883863] *** WARNING: Textured window <AtomNSWindow: 0x7fb75f68a770>
    if (
      /\d+-\d+-\d+ \d+:\d+:\d+\.\d+ Electron(?: Helper)?\[\d+:\d+] /.test(chunk)
    ) {
      return false
    }

    // Example: [90789:0810/225804.894349:ERROR:CONSOLE(105)] "Uncaught (in promise) Error: Could not instantiate: ProductRegistryImpl.Registry", source: chrome-devtools://devtools/bundled/inspector.js (105)
    if (/\[\d+:\d+\/|\d+\.\d+:ERROR:CONSOLE\(\d+\)\]/.test(chunk)) {
      return false
    }

    // Example: ALSA lib confmisc.c:767:(parse_card) cannot find card '0'
    if (/ALSA lib [a-z]+\.c:\d+:\([a-z_]+\)/.test(chunk)) {
      return false
    }
  }

  return chunk
}

export const electronLog = (data: any, color: string) => {
  if (data) {
    let log = ''
    data = data.toString().split(/\r?\n/)
    data.forEach((line) => {
      log += `  ${line}\n`
    })
    console.log(
      chalk[color].bold(`┏ Electron -------------------`) +
        '\n\n' +
        log +
        chalk[color].bold('┗ ----------------------------') +
        '\n',
    )
  }
}
