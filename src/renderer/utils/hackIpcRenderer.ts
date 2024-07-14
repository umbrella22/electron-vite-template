function throwIpcError() {
  throw new Error("ipcRenderer is not available");
}
const IpcRendererProxyHandler = {
  get() {
    return {
      on: throwIpcError,
      once: throwIpcError,
      removeAllListeners: throwIpcError,
      invoke: throwIpcError,
    };
  },
};

if (!window.ipcRendererChannel) {
  window.ipcRendererChannel = new Proxy({}, IpcRendererProxyHandler) as any;
}
