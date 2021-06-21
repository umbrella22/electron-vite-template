const { contextBridge, ipcRenderer } =  require("electron")
const { platform, release, arch } = require("os");

function copy(object) {
    let obj = {};
    for (let key in object) {
        obj[key] = object[key];
    }
    return obj;
}

contextBridge.exposeInMainWorld("ipcRenderer", copy(ipcRenderer));
contextBridge.exposeInMainWorld("platform", platform)
contextBridge.exposeInMainWorld("release", release)
contextBridge.exposeInMainWorld("arch", arch)