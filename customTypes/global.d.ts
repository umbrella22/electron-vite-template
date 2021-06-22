import { ipcRenderer } from "electron"
import { platform, release, arch } from "os"

interface ImportMeta {
    env: Record<string, unknown>;
    globEager<T = unknown>(globPath: string): Record<string, T>;
}

interface memoryInfo {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
}

interface Window {
    performance: {
        memory: memoryInfo
    }
}

declare global {
    interface Window {
        ipcRenderer: typeof ipcRenderer,
        platform: typeof platform,
        release: typeof release,
        arch: typeof arch
    }
}