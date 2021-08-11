interface AnyObject {
    [key: string]: any
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
    __lib: string;
    __static: string;
}