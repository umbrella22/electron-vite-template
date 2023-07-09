<template>
  <div id="wrapper">
    <img id="logo" :src="logo" alt="electron-vue" />
    <main>
      <div class="left-side">
        <span class="title">
          {{ t("welcome") }}
        </span>
        <system-information></system-information>
      </div>

      <div class="right-side">
        <div class="doc">
          <div class="title alt">
            {{ t("buttonTips") }}
          </div>
          <el-button type="primary" round @click="open()">
            {{ t("buttons.console") }}
          </el-button>
          <el-button type="primary" round @click="CheckUpdate('one')">
            {{ t("buttons.checkUpdate") }}
          </el-button>
        </div>
        <div class="doc">
          <el-button type="primary" round @click="CheckUpdate('two')">
            {{ t("buttons.checkUpdate2") }}
          </el-button>
          <el-button type="primary" round @click="CheckUpdate('three')">
            {{ t("buttons.checkUpdateInc") }}
          </el-button>
          <el-button type="primary" round @click="CheckUpdate('threetest')">
            {{ t("buttons.incrementalUpdateTest") }}
          </el-button>

          <el-button type="primary" round @click="CheckUpdate('four')">
            {{ t("buttons.ForcedUpdate") }}
          </el-button>
          <el-button type="primary" round @click="StartServer">
            {{ t("buttons.startServer") }}
          </el-button>
          <el-button type="primary" round @click="StopServer">
            {{ t("buttons.stopServer") }}
          </el-button>
          <el-button type="primary" round @click="getMessage">
            {{ t("buttons.viewMessage") }}
          </el-button>
          <el-button type="primary" round @click="crash">
            {{ t("buttons.simulatedCrash") }}
          </el-button>
          <el-button type="primary" round @click="openPreloadWindow">
            {{ t("buttons.openPreloadWindow") }}
          </el-button>
        </div>
        <div class="doc">
          <el-button type="primary" round @click="openNewWin">
            {{ t("buttons.openNewWindow") }}
          </el-button>
          <el-button type="primary" round @click="changeLanguage">{{
            t("buttons.changeLanguage")
          }}</el-button>
          <el-button type="primary" round @click="printDemo">{{
            t("buttons.printDemo")
          }}</el-button>
          <el-button type="primary" round @click="browserDemo">{{
            t("buttons.browser")
          }}</el-button>
        </div>
        <div class="doc">
          <el-pagination :current-page="elCPage" :page-sizes="[100, 200, 300, 400]" :page-size="elPageSize"
            layout="total, sizes, prev, pager, next, jumper" :total="400" @size-change="handleSizeChange"
            @current-change="handleCurrentChange">
          </el-pagination>
        </div>
      </div>
    </main>
    <el-dialog title="进度" v-model="dialogVisible" :before-close="handleClose" center width="14%" top="45vh">
      <div class="conten">
        <el-progress type="dashboard" :percentage="percentage" :color="colors" :status="progressStaus"></el-progress>
      </div>
    </el-dialog>
    <update-progress v-model="showForcedUpdate" />
  </div>
</template>

<script setup lang="ts">
import SystemInformation from "./LandingPage/SystemInformation.vue";
import UpdateProgress from "./updataProgress/index.vue";
import { message } from "@renderer/api/login";
import logo from "@renderer/assets/logo.png";
import { ElMessage, ElMessageBox } from "element-plus";
import { onUnmounted, Ref, ref } from "vue";
import { i18n, setLanguage } from "@renderer/i18n";
import { useI18n } from "vue-i18n";
import { invoke, vueListen } from "../utils/ipcRenderer";
import { IpcChannel } from "../../ipc";

import { useTemplateStore } from "@renderer/store/modules/template";
import TitleBar from "./common/TitleBar.vue";
import { ProgressInfo } from "electron-updater";

const storeTemplate = useTemplateStore();

const { t } = useI18n();

console.log(`storeTemplate`, storeTemplate.getTest);
console.log(`storeTemplate`, storeTemplate.getTest1);
console.log(`storeTemplate`, storeTemplate.$state.testData);
console.log(__CONFIG__)

setTimeout(() => {
  storeTemplate.TEST_ACTION("654321");
  console.log(`storeTemplate`, storeTemplate.getTest1);
}, 1000);

const { ipcRenderer, shell } = require("electron");

let percentage = ref(0);
let colors: Ref<ColorInfo[]> | Ref<string> = ref([
  { color: "#f56c6c", percentage: 20 },
  { color: "#e6a23c", percentage: 40 },
  { color: "#6f7ad3", percentage: 60 },
  { color: "#1989fa", percentage: 80 },
  { color: "#5cb87a", percentage: 100 },
]);

let dialogVisible = ref(false);
let progressStaus = ref(null);
let showForcedUpdate = ref(false);
let filePath = ref("");
let updateStatus = ref("");

let elPageSize = ref(100);
let elCPage = ref(1);

invoke(IpcChannel.GetStaticPath).then((res) => {
  console.log("staticPath", res);
})


function changeLanguage() {
  setLanguage(i18n.global.locale.value === "zh-cn" ? "en" : "zh-cn");
}

function printDemo() {
  invoke(IpcChannel.OpenPrintDemoWindow);
}

function browserDemo() {
  invoke(IpcChannel.OpenBrowserDemoWindow);
}

function handleSizeChange(val: number) {
  elPageSize.value = val;
}

function handleCurrentChange(val: number) {
  elCPage.value = val;
}

function crash() {
  process.crash();
}

function openNewWin() {
  let data = {
    url: "/form/index",
  };
  invoke(IpcChannel.OpenWin, data);
}
function getMessage() {
  message().then((res) => {
    ElMessageBox.alert(res.data, "提示", {
      confirmButtonText: "确定",
    });
  });
}
function StopServer() {
  invoke(IpcChannel.StopServer).then((res) => {
    if (res) {
      ElMessage({
        type: "success",
        message: "已关闭",
      });
    }
  });
}
function StartServer() {
  invoke(IpcChannel.StartServer).then((res) => {
    if (res) {
      ElMessage({
        type: "success",
        message: res,
      });
    }
  });
}
// 获取electron方法
function open() { }
function CheckUpdate(data) {
  switch (data) {
    case "one":
      invoke(IpcChannel.CheckUpdate);
      break;
    case "two":
      // TODO 测试链接
      console.log('test Url')
      // ipcRenderer
      //   .invoke(
      //     "start-download",
      //     "https://az764295.vo.msecnd.net/stable/6261075646f055b99068d3688932416f2346dd3b/VSCodeUserSetup-x64-1.73.1.exe"
      //   )
      //   .then(() => {
      //     dialogVisible.value = true;
      //   });
      break;
    case "three":
      invoke(IpcChannel.HotUpdate);
      break;
    case "threetest":
      alert("更新后再次点击没有提示");
      invoke(IpcChannel.HotUpdateTest);
      break;
    case "four":
      showForcedUpdate.value = true;
      break;
    default:
      break;
  }
}
function openPreloadWindow() {
  ElMessageBox.alert(t("home.openPreloadWindowError.content"), t("home.openPreloadWindowError.title"), {
    confirmButtonText: t("home.openPreloadWindowError.confirm"),
    callback: (action) => { },
  });
}

function handleClose() {
  dialogVisible.value = false;
}
vueListen(IpcChannel.DownloadProgress,(event, arg) => {
  console.log(arg);
  percentage.value = arg;
});


vueListen(IpcChannel.DownloadError, (event, arg) => {
  if (arg) {
    progressStaus = "exception";
    percentage.value = 40;
    colors.value = "#d81e06";
  }
});
vueListen(IpcChannel.DownloadPaused, (event, arg) => {
  if (arg) {
    progressStaus = "warning";
    ElMessageBox.alert("下载由于未知原因被中断！", "提示", {
      confirmButtonText: "重试",
      callback: (action) => {
        invoke(IpcChannel.StartDownload, "");
      },
    });
  }
});
vueListen(IpcChannel.DownloadDone, (event, age) => {
  filePath.value = age.filePath;
  progressStaus = "success";
  ElMessageBox.alert("更新下载完成！", "提示", {
    confirmButtonText: "确定",
    callback: (action) => {
      shell.openPath(filePath.value);
    },
  });
});
// electron-updater的更新监听
vueListen(IpcChannel.UpdateMsg, (event, args) => {
  switch (args.state) {
    case -1:
      const msgdata = {
        title: "发生错误",
        message: args.msg as string,
      };
      dialogVisible.value = false;
      invoke(IpcChannel.OpenErrorbox, msgdata);
      break;
    case 0:
      ElMessage("正在检查更新");
      break;
    case 1:
      ElMessage({
        type: "success",
        message: "已检查到新版本，开始下载",
      });
      dialogVisible.value = true;
      break;
    case 2:
      ElMessage({ type: "success", message: "无新版本" });
      break;
    case 3:
      percentage.value = Number((args.msg as ProgressInfo).percent.toFixed(1));
      break;
    case 4:
      progressStaus = "success";
      ElMessageBox.alert("更新下载完成！", "提示", {
        confirmButtonText: "确定",
        callback: (action) => {
          invoke(IpcChannel.ConfirmUpdate);
        },
      });
      break;
    default:
      break;
  }
});
vueListen(IpcChannel.HotUpdateStatus, (event, msg) => {
  switch (msg.status) {
    case "downloading":
      ElMessage("正在下载");
      break;
    case "moving":
      ElMessage("正在移动文件");
      break;
    case "finished":
      ElMessage.success("成功,请重启");
      break;
    case "failed":
      ElMessage.error(msg.message);
      break;
    default:
      break;
  }
  console.log(msg);
  updateStatus.value = msg.status;
});

</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Source Sans Pro", sans-serif;
}

#wrapper {
  padding: 114px 80px;
}

#logo {
  height: auto;
  margin-bottom: 20px;
  width: 420px;
}

main {
  display: flex;
  justify-content: space-between;
}

main>div {
  flex-basis: 50%;
}

.left-side {
  display: flex;
  flex-direction: column;
}

.welcome {
  color: #555;
  font-size: 23px;
  margin-bottom: 10px;
}

.title {
  color: #2c3e50;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 6px;
}

.title.alt {
  font-size: 18px;
  margin-bottom: 10px;
}

.doc {
  margin-bottom: 10px;
}

.doc p {
  color: black;
  margin-bottom: 10px;
}

.doc .el-button {
  margin-top: 10px;
  margin-right: 10px;
}

.doc .el-button+.el-button {
  margin-left: 0;
}

.conten {
  text-align: center;
}
</style>
