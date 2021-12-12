import { build } from '@config/index.js'
interface hotPublish {
    url: string;
    configName: string;
    gzipDirectory: string;
    tempDirectory: string;
}

export const hotPublishConfig: hotPublish = {
    url: build.hotPublishUrl,
    configName: build.hotPublishConfigName,
    gzipDirectory: build.hotPublishGzipDirectory,
    tempDirectory: build.hotPublishTempDirectory
}