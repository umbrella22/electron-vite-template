import { app, BrowserWindow } from "electron";
import { updateElectron, UpdateInfo, UpdateJson } from "electron_updater_node_core"
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
  const dirDirectory = app.getAppPath();
  const tempDirectory = join(dirDirectory, updateConfig.tempDirectory);
  try {
    const res = await request({ url: `${updateConfig.url}/${updateConfig.updateJsonName}.json?time=${new Date().getTime()}`, })
    const updateJson: UpdateJson = res.data;
    return await updateElectron(statusCallback, updateConfig.updaterName || "updater", version, app.getPath('exe'), tempDirectory, updateConfig.updateJsonName, updateJson, `${updateConfig.url}/${updateConfig.target + updateJson.version}`, downloadFn);
  } catch (error) {
    console.log(error);
    const updateInfo = new UpdateInfo();
    updateInfo.status = 'failed'
    updateInfo.message = error
    if (windows) windows.webContents.send('hot-update-status', updateInfo)
  }
}
