process.env.NODE_ENV = 'production'

import { join } from 'path'
import { say } from 'cfonts'
import { deleteSync } from 'del'
import { build } from 'vite'
import chalk from 'chalk'
import { rollup, OutputOptions } from 'rollup'
import { Listr } from 'listr2'
import rollupOptions from './rollup.config'
import { errorLog, doneLog } from './log'


const mainOpt = rollupOptions(process.env.NODE_ENV, "main");
const preloadOpt = rollupOptions(process.env.NODE_ENV, "preload")
const isCI = process.env.CI || false


if (process.env.BUILD_TARGET === 'web') web()
else unionBuild()

function clean() {
  deleteSync(['dist/electron/main/**', 'dist/electron/renderer/**', 'dist/web/**', 'build/**', '!build/icons', '!build/lib', '!build/lib/electron-build.*', '!build/icons/icon.*', '!dist/electron/main', '!dist/electron/renderer', '!dist/web'])
  doneLog('clear done')
  if (process.env.BUILD_TARGET === 'onlyClean') process.exit()
}

function unionBuild() {
  greeting()
  if (process.env.BUILD_TARGET === 'clean' || process.env.BUILD_TARGET === 'onlyClean') clean()

  const tasksLister = new Listr([
    {
      title: 'building main process',
      task: async () => {
        try {
          const build = await rollup(mainOpt)
          await build.write(mainOpt.output as OutputOptions)
        } catch (error) {
          console.error(`\n${error}\n`)
          errorLog('failed to build main process')
          process.exit(1)
        }
      }
    },
    {
      title: 'building preload process',
      task: async () => {
        try {
          const build = await rollup(preloadOpt)
          await build.write(preloadOpt.output as OutputOptions)
        } catch (error) {
          console.error(`\n${error}\n`)
          errorLog('failed to build main process')
          process.exit(1)
        }
      }
    },
    {
      title: "building renderer process",
      task: async (_, tasks) => {
        try {
          await build({ configFile: join(__dirname, 'vite.config.ts') })
          tasks.output = `${chalk.bgBlue.white(' OKAY ') + ' '}take it away ${chalk.yellow('`electron-builder`')}\n`
        } catch (error) {
          console.error(`\n${error}\n`)
          errorLog('failed to build renderer process')
          process.exit(1)
        }
      },
      options: { persistentOutput: true }
    }
  ], {
    exitOnError: false
  })
  tasksLister.run()
}

function web() {
  deleteSync(['dist/web/*', '!.gitkeep'])
  build({ configFile: join(__dirname, 'vite.config.ts') }).then(res => {
    doneLog('RendererProcess build success')
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
    say(text, {
      colors: ['yellow'],
      font: 'simple3d',
      space: false
    })
  } else console.log(chalk.yellow.bold(`\n  let's-build`))
  console.log()
}
