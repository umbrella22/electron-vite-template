process.env.NODE_ENV = 'development'

import readline from 'node:readline'
import electron from 'electron'
import chalk from 'chalk'
import { join } from 'path'
import { watch } from 'rollup'
import { detect } from 'detect-port'
import config from '../config'
import { say } from 'cfonts'
import { spawn } from 'child_process'
import type { ChildProcess } from 'child_process'
import rollupOptions from './rollup.config'
import { electronLog, getArgv, logStats, removeJunk } from './utils'

const { target = 'client', controlledRestart = false } = getArgv()

const mainOpt = rollupOptions(process.env.NODE_ENV, 'main')
const preloadOpt = rollupOptions(process.env.NODE_ENV, 'preload')

let electronProcess: ChildProcess | null = null
let manualRestart = false
let readlineInterface: readline.Interface | null = null

interface Shortcut {
  key: string
  description: string
  action: () => void
}

const shortcutList: Shortcut[] = [
  {
    key: 'r',
    description: config.dev.chineseLog ? '重启主进程' : 'Restart Main Process',
    action() {
      restartElectron()
    },
  },
  {
    key: 'q',
    description: config.dev.chineseLog ? '退出' : 'Exit',
    action() {
      electronProcess?.kill()
      readlineInterface?.close()
      process.exit()
    },
  },
  {
    key: 'h',
    description: config.dev.chineseLog ? '显示帮助' : 'Show Help',
    action() {
      process.stdout.write('\x1B[2J\x1B[3J')
      showHelp()
    },
  },
]

async function startRenderer(): Promise<void> {
  const port = await detect(config.dev.port || 9080)
  const { createServer } = await import('vite')
  const server = await createServer({
    configFile: join(__dirname, 'vite.config.mts'),
  })
  process.env.PORT = String(port)
  await server.listen(port)
  console.log(
    '\n\n' +
      chalk.blue(
        `${
          config.dev.chineseLog
            ? '  正在准备主进程，请等待...'
            : '  Preparing main process, please wait...'
        }`,
      ) +
      '\n\n',
  )
}

function startMain(): Promise<void> {
  return new Promise((resolve, reject) => {
    const MainWatcher = watch(mainOpt)
    MainWatcher.on('change', (filename) => {
      // 主进程日志部分
      logStats(
        `${config.dev.chineseLog ? '主进程文件变更' : 'Main-FileChange'}`,
        filename,
      )
    })
    MainWatcher.on('event', (event) => {
      if (event.code === 'END') {
        if (electronProcess && !controlledRestart) {
          restartElectron()
        }

        resolve()
      } else if (event.code === 'ERROR') {
        reject(event.error)
      }
      if (controlledRestart) {
        process.stdout.write('\x1B[2J\x1B[3J')
        logStats(
          'cli tips',
          `${
            config.dev.chineseLog
              ? '受控重启已启用,请手动输入r + 回车重启'
              : 'Controlled restart is enabled, please manually enter r + Enter to restart'
          }`,
        )
      }
    })
  })
}

function startPreload(): Promise<void> {
  console.log(
    '\n\n' +
      chalk.blue(
        `${
          config.dev.chineseLog
            ? '  正在准备预加载脚本，请等待...'
            : '  Preparing preLoad File, please wait...'
        }`,
      ) +
      '\n\n',
  )
  return new Promise((resolve, reject) => {
    const PreloadWatcher = watch(preloadOpt)
    PreloadWatcher.on('change', (filename) => {
      // 预加载脚本日志部分
      logStats(
        `${
          config.dev.chineseLog ? '预加载脚本文件变更' : 'preLoad-FileChange'
        }`,
        filename,
      )
    })
    PreloadWatcher.on('event', (event) => {
      if (event.code === 'END') {
        if (electronProcess && !controlledRestart) {
          restartElectron()
        }

        resolve()
      } else if (event.code === 'ERROR') {
        reject(event.error)
      }
      if (controlledRestart) {
        process.stdout.write('\x1B[2J\x1B[3J')
        logStats(
          'cli tips',
          `${
            config.dev.chineseLog
              ? '受控重启已启用,请手动输入r + 回车重启'
              : 'Controlled restart is enabled, please manually enter r + Enter to restart'
          }`,
        )
      }
    })
  })
}

function startElectron() {
  var args = [
    '--inspect=5858',
    join(__dirname, '../dist/electron/main/main.js'),
  ]

  // detect yarn or npm and process commandline args accordingly
  if (process.env.npm_execpath?.endsWith('yarn.js')) {
    args = args.concat(process.argv.slice(3))
  } else if (process.env.npm_execpath?.endsWith('npm-cli.js')) {
    args = args.concat(process.argv.slice(2))
  }

  electronProcess = spawn(electron as any, args)

  electronProcess.stdout?.on('data', (data: string) => {
    electronLog(removeJunk(data), 'blue')
  })
  electronProcess.stderr?.on('data', (data: string) => {
    electronLog(removeJunk(data), 'red')
  })

  electronProcess.on('close', () => {
    if (!manualRestart) process.exit()
  })
}

function restartElectron() {
  manualRestart = true
  electronProcess?.pid && process.kill(electronProcess.pid)
  electronProcess = null
  electronProcess = null
  startElectron()
  setTimeout(() => {
    manualRestart = false
  }, 5000)
}

function onInputAction(input: string) {
  if (!controlledRestart && input === 'r') {
    console.log(
      chalk.yellow.bold(
        config.dev.chineseLog
          ? '受控重启被禁用，请在启动时使用 --controlledRestart 选项启用'
          : 'Controlled restart is disabled, please use the --controlledRestart option to enable when starting',
      ),
    )
    return
  }
  const shortcut = shortcutList.find((shortcut) => shortcut.key === input)
  if (shortcut) {
    shortcut.action()
  }
}

function initReadline() {
  readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  readlineInterface.on('line', onInputAction)
}

function showHelp() {
  console.log(
    chalk.green.bold(
      `${config.dev.chineseLog ? '可用快捷键：\n' : 'Available shortcuts:\n'}`,
    ),
  )
  shortcutList.forEach((shortcut) => {
    if (config.dev.chineseLog) {
      console.log(
        `输入 ${chalk.green.bold(shortcut.key)} + 回车 ${shortcut.description}`,
      )
      return
    }
    console.log(
      `Enter ${chalk.green.bold(shortcut.key)} + Enter ${shortcut.description}`,
    )
  })
  console.log('\n')
}

function greeting() {
  const cols = process.stdout.columns
  let text: string | boolean = ''

  if (cols > 104) text = 'electron-vite'
  else if (cols > 76) text = 'electron-|vite'
  else text = false

  if (text) {
    say(text, {
      colors: ['yellow'],
      font: 'simple3d',
      space: false,
    })
  } else console.log(chalk.yellow.bold('\n  electron-vite'))
  console.log(
    chalk.blue(
      `${config.dev.chineseLog ? '  准备启动...' : '  getting ready...'}`,
    ) + '\n',
  )
}

async function init() {
  if (target === 'web') {
    await startRenderer()
    return
  }
  greeting()
  try {
    await Promise.all([startRenderer(), startMain(), startPreload()])
    startElectron()
    initReadline()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

init()
