process.env.NODE_ENV = 'production'

import { createInterface } from 'node:readline';
import { promisify } from 'util';
import { join } from 'path'
import { say } from 'cfonts'
import { deleteSync } from 'del'
import { build as viteBuild } from 'vite'
import { Platform, build } from 'electron-builder'
import type { Configuration } from 'electron-builder'
import buildConfig from '../build.json'
import chalk from 'chalk'
import { rollup, OutputOptions } from 'rollup'
import { Listr } from 'listr2'
import rollupOptions from './rollup.config'
import { errorLog, doneLog } from './log'


const [, , arch] = process.argv;
const EOL = process.platform === 'win32' ? "\r\n" : "\n";

const mainOpt = rollupOptions(process.env.NODE_ENV, "main");
const preloadOpt = rollupOptions(process.env.NODE_ENV, "preload")
const isCI = process.env.CI || false


const [optional, linuxOptional] = [
  [
    'web',
    'win',
    'win32',
    'win64',
    'winp',
    'winp32',
    'winp64',
    'mac',
    'linux'
  ],
  [
    'AppImage',
    'snap',
    'deb',
    'rpm',
    'pacman'
  ]
];
let pushLinuxOptional = false;

function platformOptional() {
  switch (process.platform) {
    case 'win32':
      return ['web', ...optional.filter((item) => item.startsWith('win'))];
    case 'linux':
      return ['web', ...optional.filter((item) => !(item === 'mac' || item === 'darwin'))];
    default:
      return ['web', ...optional];
  }
}

const r = createInterface({
  input: process.stdin,
  output: process.stdout,
  completer: (line) => {
    let cmds = platformOptional();
    pushLinuxOptional && (cmds = linuxOptional);
    !cmds.includes('q') && cmds.push('q');
    const hits = cmds.filter((c) => c.toLocaleLowerCase().startsWith(line.toLocaleLowerCase()));
    return [hits.length ? hits : cmds, line];
  }
});
const question = promisify(r.question).bind(r);


process.env.BUILD_TARGET === 'onlyClean' && clean()

preBuild()

function clean() {
  deleteSync(['dist/electron/main/**', 'dist/electron/renderer/**', 'dist/web/**', 'build/**', '!build/icons', '!build/lib', '!build/lib/electron-build.*', '!build/icons/icon.*', '!dist/electron/main', '!dist/electron/renderer', '!dist/web'])
  doneLog('clear done')
  if (process.env.BUILD_TARGET === 'onlyClean') process.exit()
}

async function preBuild() {
  let _arch = await (async function (arch: string) {
    if (arch) {
      if (!platformOptional().includes(arch.trim().toLowerCase())) {
        errorLog(`${arch} is Illegal input, Please check input.`)
        process.exit(1)
      }
      return arch
    } else {
      for (; ;) {
        const line = await question(
          `${chalk.cyan(`Which platform is you want to build?${EOL}`)}${chalk.cyan(` optional: `)}${chalk.yellow(`${platformOptional().join(' ')}`)}${EOL}`
        );
        if (line && platformOptional().includes(line.trim().toLowerCase())) {
          return line
        }
        console.log(chalk.red(`There is no such option`));
      }
    }
  })(arch)
  let archTag: any = null;
  switch (_arch) {
    case 'web':
      return web();
    case 'win':
    case 'win32':
    case 'win64':
    case 'winp':
    case 'winp32':
    case 'winp64':
      archTag = Platform.WINDOWS.createTarget();
      let bv = {
        target: 'nsis',
        arch: [] as string[]
      };
      if (_arch.startsWith('winp')) {
        bv.target = 'portable'
      }
      if (_arch.length === 4) bv.arch = ['x64', 'ia32'];
      else if (_arch.indexOf('32') > -1) bv.arch = ['ia32'];
      else if (_arch.indexOf('64') > -1) bv.arch = ['x64'];
      buildConfig.win['target'] = [bv];
      break;
    case 'mac':
      archTag = Platform.MAC.createTarget();
      break;
    case 'linux':
      archTag = Platform.LINUX.createTarget();
      pushLinuxOptional = true;
      for (; ;) {
        const line = await question(
          `${chalk.cyan(`Please input linux package type:${EOL}`)}${chalk.cyan(` optional: `)}${chalk.yellow(`${linuxOptional.join(' ')}`)}${EOL}`
        );
        if (line && linuxOptional.includes(line.trim().toLowerCase())) {
          buildConfig.linux['target'] = line;
          break
        }
        console.log(chalk.red(`There is no such option`));
      }
  }
  r.close()
  unionBuild(archTag)
}

function unionBuild(archTag: any) {
  greeting()
  if (process.env.BUILD_TARGET === 'clean') clean()

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
      task: async () => {
        try {
          await viteBuild({ configFile: join(__dirname, 'vite.config.ts') })
        } catch (error) {
          console.error(`\n${error}\n`)
          errorLog('failed to build renderer process')
          process.exit(1)
        }
      },
      options: { persistentOutput: true }
    },
    {
      title: "building electron process",
      task: async (_, tasks) => {
        try {
          await build({
            targets: archTag,
            config: buildConfig as Configuration
          })
          tasks.output = `${chalk.bgBlue.white(' OKAY ') + ' '}All done${EOL}`
        } catch (error) {
          console.error(`\n${error}\n`)
          errorLog('failed to build electron process')
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
  viteBuild({ configFile: join(__dirname, 'vite.config.ts') }).then(res => {
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
