/**
 * power by biuuu
 */

const fs = require('fs-extra')
const path = require('path')
const crypto = require('crypto')
const AdmZip = require('adm-zip')
const { version } = require('../package.json')
const buildConfig = require('../build.json')
const { build } = require("../config/index")

const hash = (data, type = 'sha256') => {
    const hmac = crypto.createHmac(type, 'Sky')
    hmac.update(data)
    return hmac.digest('hex')
}

const createZip = (filePath, dest) => {
    const zip = new AdmZip()
    zip.addLocalFolder(filePath)
    zip.toBuffer()
    zip.writeZip(dest)
}

const start = async () => {
    if (buildConfig.asar === false) {
        const appPath = './build/win-unpacked/resources/app'
        const name = 'app.zip'
        const outputPath = path.resolve('./build/update/update/')
        const zipPath = path.resolve(outputPath, name)
        await fs.ensureDir(outputPath)
        await fs.emptyDir(outputPath)
        createZip(appPath, zipPath)
        const buffer = await fs.readFile(zipPath)
        const sha256 = hash(buffer)
        const hashName = sha256.slice(7, 12)
        await fs.copy(zipPath, path.resolve(outputPath, `${hashName}.zip`))
        await fs.remove(zipPath)
        await fs.outputJSON(path.join(outputPath, `${build.hotPublishConfigName}.json`), {
            version,
            name: `${hashName}.zip`,
            hash: sha256
        })
    } else {
        throw new Error('Please make sure the build.asar option in the Package.json file is set to false')
    }
}

start()