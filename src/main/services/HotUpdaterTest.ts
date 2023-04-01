import { app, BrowserWindow } from "electron";
import {  UpdateInfo, UpdateJson, UpdateStatus, UpdateElectron } from "electron_updater_node_core"
import { dirname, join } from "path";
import { version } from '../../../package.json'
import { Readable } from "stream";
import axios from 'axios'
const request = axios.create()
import updateConfig from "../../../updateConfig.json";
/**
 * 增量更新
 *
 * @export
 * @param {BrowserWindow} [windows]
 */
export async function updater(windows?: BrowserWindow) {
  const statusCallback = (status: UpdateInfo) => {
    if (windows) windows.webContents.send('hot-update-status', status);
  }
  const downloadFn = async (url: string):Promise<Readable> =>  {
    const response = await request({
      method: 'get',
      url: url,
      responseType: 'stream',
    });
    return response.data;
  }
  const dirDirectory = join(app.getAppPath(), '..', '..');
  const tempDirectory = join(dirDirectory, updateConfig.tempDirectory);
  try {
    const res = await request({ url: `${updateConfig.url}/${updateConfig.updateJsonName}.json?time=${new Date().getTime()}`, })
    const updateJson: UpdateJson = res.data;
    const updateElectron = new UpdateElectron(statusCallback, updateConfig.updaterName || "updater", version, app.getPath('exe'), tempDirectory, updateConfig.updateJsonName, updateJson, `${updateConfig.url}/${updateConfig.target + updateJson.version}`, downloadFn)
    const needUpdateNumber =  await updateElectron.checkForUpdates();
    // have nothing to update
    if(needUpdateNumber === 0 ) {
      console.log("have nothing to update");
      return UpdateStatus.HaveNothingUpdate
    } else {
      const download =  await updateElectron.downloadUpdate();
      if(download) {
        if (updateElectron.install()) {
          // return UpdateStatus.Success;
        } else {
          throw new Error("update Fail")
        }
      }else {
        throw new Error("download Fail")
      }
    }
  } catch (error) {
    console.log(error);
    const updateInfo = new UpdateInfo();
    updateInfo.status = 'failed'
    updateInfo.message = error
    if (windows) windows.webContents.send('hot-update-status', updateInfo)
    return UpdateStatus.Failed
  }
}
