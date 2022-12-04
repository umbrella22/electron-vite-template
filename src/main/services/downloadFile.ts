import { app, BrowserWindow, dialog } from "electron";
import { join } from "path";
import { arch, platform } from "os";
import { stat, remove, appendFileSync } from "fs-extra";
import type { IncomingMessage } from "http";
import { request as httpRequest } from "http";
import { request as httpsRequest } from "https";
import packageInfo from "../../../package.json";

/**
 *
 * @description
 * @returns {void} 下载类
 * @param {mainWindow} 主窗口
 * @param {downloadUrl} 下载地址，当未传入时则会使用预先设置好的baseUrl拼接名称
 * @author Sky
 * @date 2020-08-12
 */

class Main {
  public mainWindow: BrowserWindow = null;
  public downloadUrl: string = "";
  public fileName: string = "";
  public filePath: string = "";
  public version: string = packageInfo.version;
  public baseUrl: string = process.env.BASE_API;
  public Sysarch: string = arch().includes("64") ? "win64" : "win32";
  public HistoryFilePath = join(
    app.getPath("downloads"),
    platform().includes("win32")
      ? `electron_${this.version}_${this.Sysarch}.exe`
      : `electron_${this.version}_mac.dmg`
  );

  constructor(mainWindow: BrowserWindow, downloadUrl?: string) {
    this.mainWindow = mainWindow;
    if (downloadUrl) {
      this.downloadUrl = downloadUrl;
    } else {
      this.downloadUrl = platform().includes("win32")
        ? this.baseUrl +
          `electron_${this.version}_${this.Sysarch}.exe?${new Date().getTime()}`
        : this.baseUrl +
          `electron_${this.version}_mac.dmg?${new Date().getTime()}`;
    }
  }

  start() {
    // 更新时检查有无同名文件，若有就删除，若无就开始下载
    stat(this.HistoryFilePath, async (err, stats) => {
      try {
        if (stats) {
          await remove(this.HistoryFilePath);
        }
        this.download(
          this.downloadUrl,
          (chunk: any, size: number, fullSize: number) => {
            
            // 保存文件
            appendFileSync(this.filePath, chunk, { encoding: "binary" });

            //发送进度
            this.mainWindow.webContents.send(
              "download-progress",
              (size / fullSize) * 100
            );

            //完成后反馈
            if (size === fullSize) {
              const data = {
                filePath: this.filePath,
              };
              this.mainWindow.webContents.send("download-done", data);
              return;
            }
          }
        ).catch((err) => {
          this.mainWindow.webContents.send("download-error", true);
          console.error(err);
          dialog.showErrorBox("下载出错", err.message);
        });
      } catch (error) {
        console.log(error);
      }
    });
  }

  download(
    url: string,
    onDown: (chunk: any, size: number, fullSize: number) => void
  ) {
    return new Promise((resolve, reject) => {
      try {
        let size: number = 0;
        const ing = (response: IncomingMessage) => {
          if (response.statusCode && response.statusCode === 301) {
            this.download(response.headers.location as string, onDown)
              .then(resolve)
              .catch(reject);
            return;
          }
          const fullSize = Number(response.headers["content-length"] || 0);
          this.fileName = response.headers["content-disposition"]
            .match(/filename=[\"|'](.*?)[\"|']/gi)[0]
            .match(/["|'](.*)["|']/)[1];
          this.filePath = join(app.getPath("downloads"), this.fileName);
          response.on("data", (chunk) => {
            size += chunk.length;
            onDown(chunk, size, fullSize);
          });
          response.on("end", () => {
            if (response.statusCode && response.statusCode >= 400) {
              reject(new Error(response.statusCode + ""));
              return;
            }
            resolve({
              msg: "downloaded",
              fullSize,
            });
          });
        };
        let request;
        const isHttp = url.startsWith("http://");
        if (isHttp) request = httpRequest(url, {}, ing);
        request = httpsRequest(url, {}, ing);
        request.on("destroyed", () => reject(new Error("destroy")));
        request.on("error", (err) => reject(err));
        request.end();
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  }
}

export default Main;
