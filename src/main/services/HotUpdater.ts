/**
 * power by biuuu
 */

import { emptyDir, createWriteStream, readFile, copy } from 'fs-extra'
import { join, resolve } from 'path'
import { promisify } from 'util'
import { pipeline } from 'stream'
import { app, BrowserWindow } from 'electron'
import { gt } from 'semver'
import { createHmac } from 'crypto'
import extract from 'extract-zip'
import { version, build } from 'package.json'
import axios from 'axios'
import httpAdapter from 'axios/lib/adapters/http'

const streamPipeline = promisify(pipeline)
const appPath = app.getAppPath()
const updatePath = resolve(appPath, '..', '..', 'update')
const request = axios.create({ adapter: httpAdapter })

/**
 * @param data 文件流
 * @param type 类型，默认sha256
 * @param key 密钥，用于匹配计算结果
 * @returns {string} 计算结果
 * @author umbrella22
 * @date 2021-03-05
 */
function hash(data, type = 'sha256', key = 'Sky') {
    const hmac = createHmac(type, key)
    hmac.update(data)
    return hmac.digest('hex')
}


/**
 * @param url 下载地址
 * @param filePath 文件存放地址
 * @returns {void}
 * @author umbrella22
 * @date 2021-03-05
 */
async function download(url: string, filePath: string) {
    const res = await request({ url, responseType: "stream" })
    await streamPipeline(res.data, createWriteStream(filePath))
}

const updateInfo = {
    status: 'init',
    message:''
}

/**
 * @param windows 指主窗口
 * @returns {void}
 * @author umbrella22
 * @date 2021-03-05
 */
export const updater = async (windows: BrowserWindow) => {
    try {
        if (build.asar === false) {
            const res = await request({ url: `${build.hotPublish.url}/${build.hotPublish.configName}?time=${new Date().getTime()}`, })
            if (gt(res.data.version, version)) {
                await emptyDir(updatePath)
                const filePath = join(updatePath, res.data.name)
                updateInfo.status = 'downloading'
                windows.webContents.send('hot-update-status', updateInfo)
                await download(build.hotPublish.url, filePath)
                const buffer = await readFile(filePath)
                const sha256 = hash(buffer)
                if (sha256 !== res.data.hash) throw new Error('sha256 error')
                const appPathTemp = join(updatePath, 'temp')
                await extract(filePath, { dir: appPathTemp })
                updateInfo.status = 'moving'
                windows.webContents.send('hot-update-status', updateInfo)
                await emptyDir(appPath)
                await copy(appPathTemp, appPath)
                updateInfo.status = 'finished'
                windows.webContents.send('hot-update-status', updateInfo)
                resolve('success')
            }
        } else {
            throw new Error('Please make sure the build.asar option in the Package.json file is set to false')
        }

    } catch (error) {
        updateInfo.status = 'failed'
        updateInfo.message = error
        windows.webContents.send('hot-update-status', updateInfo)
    }
}

export const getUpdateInfo = () => updateInfo