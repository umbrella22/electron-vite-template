interface ImportMeta {
    env: Record<string, unknown>;
    glob<T = unknown>(globPath: string): Record<string, T>;
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