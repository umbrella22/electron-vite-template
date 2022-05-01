process.env.NODE_ENV = 'production'

import { join } from 'path'
import { say } from 'cfonts'
import { sync } from 'del'
import { build } from 'vite'
import chalk from 'chalk'
import { rollup, OutputOptions } from 'rollup'
import Multispinner from 'Multispinner'
import rollupOptions from './rollup.config'
import { okayLog, errorLog, doneLog } from './log'


const mainOpt = rollupOptions(process.env.NODE_ENV, "main");
const preloadOpt = rollupOptions(process.env.NODE_ENV, "preload")
const isCI = process.env.CI || false


if (process.env.BUILD_TARGET === 'web') web()
else unionBuild()

function clean() {
    sync(['dist/electron/main/*', 'dist/electron/renderer/*', 'dist/web/*', 'build/*', '!build/icons', '!build/lib', '!build/lib/electron-build.*', '!build/icons/icon.*'])
    console.log(`\n${doneLog}clear done`)
    if (process.env.BUILD_TARGET === 'onlyClean') process.exit()
}

function unionBuild() {
    greeting()
    if (process.env.BUILD_TARGET === 'clean' || process.env.BUILD_TARGET === 'onlyClean') clean()

    const tasks = ['main', 'preload', 'renderer']
    const m = new Multispinner(tasks, {
        preText: 'building',
        postText: 'process'
    })
    let results = ''

    m.on('success', () => {
        process.stdout.write('\x1B[2J\x1B[0f')
        console.log(`\n\n${results}`)
        console.log(`${okayLog}take it away ${chalk.yellow('`electron-builder`')}\n`)
        process.exit()
    })

    rollup(mainOpt)
        .then(build => {
            results += `${doneLog}MainProcess build success` + '\n\n'
            build.write(mainOpt.output as OutputOptions).then(() => {
                m.success('main')
            })
        })
        .catch(error => {
            m.error('main')
            console.log(`\n  ${errorLog}failed to build main process`)
            console.error(`\n${error}\n`)
            process.exit(1)
        });

    rollup(preloadOpt)
        .then(build => {
            results += `${doneLog}preLoad build success` + '\n\n'
            build.write(preloadOpt.output as OutputOptions).then(() => {
                m.success('preload')
            })
        })
        .catch(error => {
            m.error('preload')
            console.log(`\n  ${errorLog}failed to build preLoad`)
            console.error(`\n${error}\n`)
            process.exit(1)
        });

    build({ configFile: join(__dirname, 'vite.config') }).then(res => {
        results += `${doneLog}RendererProcess build success` + '\n\n'
        m.success('renderer')
    }).catch(err => {
        m.error('renderer')
        console.log(`\n  ${errorLog}failed to build renderer process`)
        console.error(`\n${err}\n`)
        process.exit(1)
    })
}

function web() {
    sync(['dist/web/*', '!.gitkeep'])
    build({ configFile: join(__dirname, 'vite.config') }).then(res => {
        console.log(`${doneLog}RendererProcess build success`)
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