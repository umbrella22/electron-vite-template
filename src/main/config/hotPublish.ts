import config from '@config/index.js'
interface hotPublish {
    url: string;
    configName: string;
}

export const hotPublishConfig: hotPublish = {
    url: config.build.hotPublishUrl,
    configName: config.build.hotPublishConfigName
}