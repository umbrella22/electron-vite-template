const { contextBridge, ipcRenderer } =  require("electron")
const { platform, release, arch } = require("os");

function copy(object) {
    if (typeof object === "object") {
        if (object === null) return object;
        else if (Array.isArray(object)) return copyArray(object);
        else return copyObject(object);
    } else return object;
}

function copyObject(object) {
    let obj = {};
    for (let key in object) {
        obj[key] = copy(object[key]);
    }
    return obj;
}

function copyArray(array) {
    let arr = [];
    let length = array.length;
    for (let i = 0; i < length; i++) {
        arr.push(copy(array[i]));
    }
    return arr;
}

contextBridge.exposeInMainWorld("ipcRenderer", copy(ipcRenderer));
contextBridge.exposeInMainWorld("platform", copy(platform));
contextBridge.exposeInMainWorld("release", copy(release));
contextBridge.exposeInMainWorld("arch", copy(arch));