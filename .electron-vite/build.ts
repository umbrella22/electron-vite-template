process.env.NODE_ENV = 'production'

import { join } from 'path'
import cfonts from 'cfonts'
import chalk from 'chalk'
import { rolldown, type OutputOptions } from 'rolldown'
import { Listr } from 'listr2'
import rolldownOptions from './rolldown.config'
import { errorLog, doneLog } from './log'
import { getArgv } from './utils'

const mainOpt = rolldownOptions(process.env.NODE_ENV, 'main')
const preloadOpt = rolldownOptions(process.env.NODE_ENV, 'preload')
const { clean = false, target = 'client' } = getArgv()
const isCI = process.env.CI || false

if (target === 'web') web()
else unionBuild()

async function cleanBuild() {
  // del@8 的传递依赖 unicorn-magic 为 ESM-only，tsx 的 CJS 模式下静态导入无法解析
  const { deleteAsync } = await import('del')
  await deleteAsync([
    'dist/electron/main/*',
    'dist/electron/renderer/*',
    'dist/web/*',
    'build/*',
    '!build/icons',
    '!build/lib',
    '!build/lib/electron-build.*',
    '!build/icons/icon.*',
  ])
  doneLog(`clear done`)
  if (clean) process.exit()
}

async function unionBuild() {
  greeting()
  await cleanBuild()

  const tasksLister = new Listr(
    [
      {
        title: 'building main process',
        task: async () => {
          try {
            const build = await rolldown(mainOpt)
            await build.write(mainOpt.output as OutputOptions)
          } catch (error) {
            errorLog(`failed to build main process\n`)
            return Promise.reject(error)
          }
        },
      },
      {
        title: 'building preload process',
        task: async () => {
          try {
            const build = await rolldown(preloadOpt)
            await build.write(preloadOpt.output as OutputOptions)
          } catch (error) {
            errorLog(`failed to build preload process\n`)
            return Promise.reject(error)
          }
        },
      },
      {
        title: 'building renderer process',
        task: async (_, tasks) => {
          try {
            const { build } = await import('vite-plus')
            await build({ configFile: join(import.meta.dirname, 'vite.config.mts') })
            tasks.output = `take it away ${chalk.yellow(
              '`electron-builder`',
            )}\n`
          } catch (error) {
            errorLog(`failed to build renderer process\n`)
            return Promise.reject(error)
          }
        },
      },
    ],
    {
      concurrent: true,
      exitOnError: true,
    },
  )
  await tasksLister.run()
}

async function web() {
  await deleteAsync(['dist/web/*', '!.gitkeep'])
  const { build } = await import('vite-plus')
  build({ configFile: join(import.meta.dirname, 'vite.config.mts') }).then((res) => {
    doneLog(`web build success`)
    process.exit()
  })
}

function greeting() {
  const cols = process.stdout.columns
  let text: boolean | string = ''

  if (cols > 85) text = `let's-build`
  else if (cols > 60) text = `let's-|build`
  else text = false

  if (text && !isCI) {
    cfonts.say(text, {
      colors: ['yellow'],
      font: 'simple3d',
      space: false,
    })
  } else console.log(chalk.yellow.bold(`\n  let's-build`))
  console.log()
}
