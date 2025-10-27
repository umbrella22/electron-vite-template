/**
 * power by biuuu
 */

import { emptyDir, createWriteStream, readFile, copy, remove } from 'fs-extra'
import { join, resolve } from 'path'
import { promisify } from 'util'
import { pipeline } from 'stream'
import { app, BrowserWindow } from 'electron'
import { gt } from 'semver'
import { createHmac } from 'crypto'
import AdmZip from 'adm-zip'
import { version } from '../../../package.json'
import { hotPublishConfig } from '../config/hot-publish'
import axios, { AxiosResponse } from 'axios'
import { webContentSend } from './web-content-send'
import { IIpcHotUpdaterHandle } from '@ipcManager/index'

const streamPipeline = promisify(pipeline)
const appPath = app.getAppPath()
const updatePath = resolve(appPath, '..', '..', 'update')
const request = axios.create()

/**
 * @param data 文件流
 * @param type 类型，默认sha256
 * @param key 密钥，用于匹配计算结果
 * @returns {string} 计算结果
 * @author umbrella22
 * @date 2021-03-05
 */
function hash(data: Buffer, type = 'sha256', key = 'Sky'): string {
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
async function download(url: string, filePath: string): Promise<void> {
  const res = await request({ url, responseType: 'stream' })
  await streamPipeline(res.data, createWriteStream(filePath))
}

interface Res extends AxiosResponse<any> {
  data: {
    version: string
    name: string
    hash: string
  }
}

export class HotUpdaterClass implements IIpcHotUpdaterHandle {
  private updateInfo = {
    status: 'init',
    message: '',
  }

  // 实现 HotUpdate IPC 方法
  HotUpdate: (event: Electron.IpcMainInvokeEvent) => void | Promise<void> =
    async (event) => {
      const windows = BrowserWindow.fromWebContents(event.sender)
      if (windows) {
        await this.performUpdate(windows)
      }
    }

  /**
   * 执行更新流程
   * @param windows 指主窗口
   * @returns {void}
   * @author umbrella22
   * @date 2021-03-05
   */
  private async performUpdate(windows?: BrowserWindow): Promise<void> {
    try {
      const res: Res = await request({
        url: `${hotPublishConfig.url}/${
          hotPublishConfig.configName
        }.json?time=${new Date().getTime()}`,
      })
      if (gt(res.data.version, version)) {
        await emptyDir(updatePath)
        const filePath = join(updatePath, res.data.name)
        this.updateInfo.status = 'downloading'
        if (windows)
          webContentSend['hot-update-status'](
            windows.webContents,
            this.updateInfo,
          )
        await download(`${hotPublishConfig.url}/${res.data.name}`, filePath)
        const buffer = await readFile(filePath)
        const sha256 = hash(buffer)
        if (sha256 !== res.data.hash) throw new Error('sha256 error')
        const appPathTemp = join(updatePath, 'temp')
        const zip = new AdmZip(filePath)
        zip.extractAllTo(appPathTemp, true, true)
        this.updateInfo.status = 'moving'
        if (windows)
          webContentSend['hot-update-status'](
            windows.webContents,
            this.updateInfo,
          )
        await remove(join(`${appPath}`, 'dist'))
        await remove(join(`${appPath}`, 'package.json'))
        await copy(appPathTemp, appPath)
        this.updateInfo.status = 'finished'
        if (windows)
          webContentSend['hot-update-status'](
            windows.webContents,
            this.updateInfo,
          )
      }
    } catch (error) {
      this.updateInfo.status = 'failed'
      this.updateInfo.message = error

      if (windows)
        webContentSend['hot-update-status'](
          windows.webContents,
          this.updateInfo,
        )
    }
  }

  /**
   * 手动触发更新（保留向后兼容）
   * @param windows 指主窗口
   */
  public async triggerUpdate(windows?: BrowserWindow): Promise<void> {
    await this.performUpdate(windows)
  }
}

// 导出单例实例供外部直接使用（向后兼容）
export const hotUpdaterInstance = new HotUpdaterClass()

/**
 * 向后兼容的更新函数
 */
export const updater = (windows?: BrowserWindow): Promise<void> => {
  return hotUpdaterInstance.triggerUpdate(windows)
}
