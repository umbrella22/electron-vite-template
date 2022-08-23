process.env.NODE_ENV = 'development'

import electron from 'electron';
import chalk from 'chalk';
import { join } from 'path';
import { watch } from 'rollup';
import Portfinder from 'portfinder';
import config from '../config'
import { say } from 'cfonts';
import { spawn } from 'child_process';
import type { ChildProcess } from 'child_process'
import { createServer } from 'vite'
import rollupOptions from './rollup.config'


const mainOpt = rollupOptions(process.env.NODE_ENV, "main");

let electronProcess: ChildProcess | null = null
let manualRestart = false

function logStats(proc: string, data: any) {
    let log = ''

    log += chalk.yellow.bold(`┏ ${proc} ${config.dev.chineseLog ? '编译过程' : 'Process'} ${new Array((19 - proc.length) + 1).join('-')}`)
    log += '\n\n'

    if (typeof data === 'object') {
        data.toString({
            colors: true,
            chunks: false
        }).split(/\r?\n/).forEach((line: string) => {
            log += '  ' + line + '\n'
        })
    } else {
        log += `  ${data}\n`
    }

    log += '\n' + chalk.yellow.bold(`┗ ${new Array(28 + 1).join('-')}`) + '\n'
    console.log(log)
}

function removeJunk(chunk: string) {
    if (config.dev.removeElectronJunk) {
        // Example: 2018-08-10 22:48:42.866 Electron[90311:4883863] *** WARNING: Textured window <AtomNSWindow: 0x7fb75f68a770>
        if (/\d+-\d+-\d+ \d+:\d+:\d+\.\d+ Electron(?: Helper)?\[\d+:\d+] /.test(chunk)) {
            return false;
        }

        // Example: [90789:0810/225804.894349:ERROR:CONSOLE(105)] "Uncaught (in promise) Error: Could not instantiate: ProductRegistryImpl.Registry", source: chrome-devtools://devtools/bundled/inspector.js (105)
        if (/\[\d+:\d+\/|\d+\.\d+:ERROR:CONSOLE\(\d+\)\]/.test(chunk)) {
            return false;
        }

        // Example: ALSA lib confmisc.c:767:(parse_card) cannot find card '0'
        if (/ALSA lib [a-z]+\.c:\d+:\([a-z_]+\)/.test(chunk)) {
            return false;
        }
    }


    return chunk;
}

function startRenderer(): Promise<void> {
    return new Promise((resolve, reject) => {
        Portfinder.basePort = config.dev.port || 9080
        Portfinder.getPort(async (err, port) => {
            if (err) {
                reject("PortError:" + err)
            } else {
                const server = await createServer({ configFile: join(__dirname, 'vite.config.ts') })
                process.env.PORT = String(port)
                await server.listen(port)
                console.log('\n\n' + chalk.blue(`${config.dev.chineseLog ? '  正在准备主进程，请等待...' : '  Preparing main process, please wait...'}`) + '\n\n')
                resolve()
            }
        })
    })
}

function startMain(): Promise<void> {
    return new Promise((resolve, reject) => {
        const MainWatcher = watch(mainOpt);
        MainWatcher.on('change', filename => {
            // 主进程日志部分
            logStats(`${config.dev.chineseLog ? '主进程文件变更' : 'Main-FileChange'}`, filename)
        });
        MainWatcher.on('event', event => {
            if (event.code === 'END') {
                if (electronProcess) {
                    manualRestart = true
                    if (electronProcess.pid) process.kill(electronProcess.pid)
                    electronProcess = null
                    startElectron()

                    setTimeout(() => {
                        manualRestart = false
                    }, 5000)
                }

                resolve()

            } else if (event.code === 'ERROR') {
                reject(event.error)
            }
        })
    })
}


function startElectron() {

    var args = [
        '--inspect=5858',
        join(__dirname, '../dist/electron/main/main.js')
    ]

    // detect yarn or npm and process commandline args accordingly

    if (process.env.npm_execpath?.endsWith('yarn.js')) {
        args = args.concat(process.argv.slice(3))
    } else if (process.env.npm_execpath?.endsWith('npm-cli.js')) {
        args = args.concat(process.argv.slice(2))
    }

    electronProcess = spawn(electron as any, args)

    electronProcess?.stdout?.on('data', (data: string) => {
        electronLog(removeJunk(data), 'blue')
    })
    electronProcess?.stderr?.on('data', (data: string) => {
        electronLog(removeJunk(data), 'red')
    })

    electronProcess.on('close', () => {
        if (!manualRestart) process.exit()
    })
}

function electronLog(data: any, color: string) {
    if (data) {
        let log = ''
        data = data.toString().split(/\r?\n/)
        data.forEach(line => {
            log += `  ${line}\n`
        })
        console.log(
            chalk[color].bold(`┏ ${config.dev.chineseLog ? '主程序日志' : 'Electron'} -------------------`) +
            '\n\n' +
            log +
            chalk[color].bold('┗ ----------------------------') +
            '\n'
        )
    }

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
            space: false
        })
    } else console.log(chalk.yellow.bold('\n  electron-vite'))
    console.log(chalk.blue(`${config.dev.chineseLog ? '  准备启动...' : '  getting ready...'}`) + '\n')
}

async function init() {
    greeting()

    try {
        await startRenderer()
        await startMain()
        startElectron()
    } catch (error) {
        console.error(error)
        process.exit(1)
    }

}

init()