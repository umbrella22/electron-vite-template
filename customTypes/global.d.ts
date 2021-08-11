import { ipcRenderer } from "electron"

interface ImportMeta {
    env: Record<string, unknown>;
    globEager<T = unknown>(globPath: string): Record<string, T>;
}

interface memoryInfo {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
}

declare global {
    interface Window {
        performance: {
            memory: memoryInfo
        }
        ipcRenderer: typeof ipcRenderer,
        systemInfo: {
            platform: string
            release: string
            arch: string
            nodeVersion: string
            electronVersion: string
        }
    }
}