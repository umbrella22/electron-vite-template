/**
 * power by biuuu
 */

import chalk from 'chalk'
import { join } from 'path'
// fs-extra 为 CJS 包，部分转出方法（outputJSON）无法被 ESM 具名导入识别，统一走默认导入
import fsExtra from 'fs-extra'
const { ensureDir, emptyDir, copy, outputJSON, remove, stat, readFile } =
  fsExtra
import { BinaryLike, createHmac } from 'crypto'
import AdmZip from 'adm-zip'
import packageFile from '../../apps/desktop/package.json'
import buildConfig from '../../apps/desktop/build.json'
import config from '../../apps/desktop/config'
import { okayLog, errorLog, doneLog } from './log'

const buildPath = join('apps', 'desktop', 'dist', 'electron')

const hash = (data: BinaryLike, type = 'sha256') => {
  const hmac = createHmac(type, 'Sky')
  hmac.update(data)
  return hmac.digest('hex')
}

const createZip = (filePath: string, dest: string) => {
  const zip = new AdmZip()
  zip.addLocalFolder(filePath, '')
  zip.toBuffer()
  zip.writeZip(dest)
}

const start = async () => {
  console.log(chalk.green.bold(`Start packing  \n`))

  if (buildConfig.asar) {
    errorLog(
      `${chalk.red(
        'Please make sure the build.asar option in the Package.json file is set to false',
      )}\n`,
    )
    return
  }

  if (config.build.hotPublishConfigName === '') {
    errorLog(
      `${
        chalk.red(
          'HotPublishConfigName is not set, which will cause the update to fail, please set it in the config/index.js \n',
        ) + chalk.red.bold(`\n  Packing failed \n`)
      }`,
    )
    process.exit(1)
  }

  stat(join(buildPath, 'main'), async (err, stats) => {
    if (err) {
      errorLog(
        `${chalk.red(
          'No resource files were found, please execute this command after the build command',
        )}\n`,
      )
      return
    }

    try {
      console.log(chalk.green.bold(`Check the resource files \n`))
      const packResourcesPath = join('apps', 'desktop', 'build', 'resources', 'dist')
      const packPackagePath = join('apps', 'desktop', 'build', 'resources')
      const resourcesPath = join('apps', 'desktop', 'dist')
      const appPath = join('apps', 'desktop', 'build', 'resources')
      const name = 'app.zip'
      const outputPath = join('apps', 'desktop', 'build', 'update')
      const zipPath = join(outputPath, name)

      await ensureDir(packResourcesPath)
      await emptyDir(packResourcesPath)
      await copy(resourcesPath, packResourcesPath)
      okayLog(chalk.cyan.bold(`File copy complete \n`))
      await outputJSON(join(packPackagePath, 'package.json'), {
        name: packageFile.name,
        productName: buildConfig.productName,
        version: packageFile.version,
        description: packageFile.description,
        main: packageFile.main,
        author: packageFile.author,
        dependencies: packageFile.dependencies,
      })
      okayLog(chalk.cyan.bold(`Rewrite package file complete \n`))
      await ensureDir(outputPath)
      await emptyDir(outputPath)
      createZip(appPath, zipPath)
      const buffer = await readFile(zipPath)
      const sha256 = hash(buffer)
      const hashName = sha256.slice(7, 12)
      await copy(zipPath, join(outputPath, `${hashName}.zip`))
      await outputJSON(
        join(outputPath, `${config.build.hotPublishConfigName}.json`),
        {
          version: packageFile.version,
          name: `${hashName}.zip`,
          hash: sha256,
        },
      )
      okayLog(
        chalk.cyan.bold(
          `Zip file complete, Start cleaning up redundant files \n`,
        ),
      )
      await remove(zipPath)
      await remove(appPath)
      okayLog(chalk.cyan.bold(`Cleaning up redundant files completed \n`))
      doneLog('The resource file is packaged!\n')
      console.log('File location: ' + chalk.green(outputPath) + '\n')
    } catch (error) {
      errorLog(`${chalk.red(error.message || error)}\n`)
      process.exit(1)
    }
  })
}

start()
