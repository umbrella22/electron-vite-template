const fs = require("fs");
const path = require("path");
const https = require('https');
function checkNetWork(host) {
  return new Promise((resolve, reject) => {
    const options = {
      host: host,
      port: 443, // HTTP 默认端口
      timeout: 1000, // 设置超时时间，单位为毫秒
    };

    const req = https.request(options, (res) => {
      resolve()
    });

    req.on('error', (error) => {
      reject();
    });

    req.on('timeout', () => {
      req.destroy();
      reject();
    });

    req.end();
  })
}

function checkMirrorConfig() {
  const npmrcPath = path.resolve(__dirname, "../.npmrc")
  if (!fs.existsSync(npmrcPath)) {
    checkNetWork("www.google.com").catch(() => {
      checkNetWork("www.baidu.com").then(() => {
        // cant connet www.google.com
        // registry=https://registry.npmmirror.com
        const config = `
electron_builder_binaries_mirror=https://npmmirror.com/mirrors/electron-builder-binaries/
electron_mirror=https://cdn.npmmirror.com/binaries/electron/
`
        console.log("generate .npmrc")
        fs.writeFileSync(npmrcPath, config)
      })
    })

  } else {
    console.log("npmrc is exists, skip the npmrc generation step")
  }
}

checkMirrorConfig();


