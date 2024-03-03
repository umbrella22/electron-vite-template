<template>
  <div id="wrapper">
    <img id="logo" :src="logo" alt="electron-vue" />
    <main>
      <div class="left-side">
        <span class="title">
          {{ i18nt.welcome }}
        </span>
        <system-information></system-information>
      </div>

      <!--  -->
      <div class="right-side">
        <div class="doc">
          <div class="title alt">
            {{ i18nt.buttonTips }}
          </div>
          <button class="btu" @click="open()">
            {{ i18nt.buttons.console }}
          </button>
          <button class="btu" @click="CheckUpdate('one')">
            {{ i18nt.buttons.checkUpdate }}
          </button>
        </div>
        <div class="doc">
          <button class="btu" @click="CheckUpdate('two')">
            {{ i18nt.buttons.checkUpdate2 }}
          </button>
          <button class="btu" @click="CheckUpdate('three')">
            {{ i18nt.buttons.checkUpdateInc }}
          </button>
          <!-- <button class="btu" @click="CheckUpdate('four')">
            {{ i18nt.buttons.ForcedUpdate }}
          </button> -->
          <button class="btu" @click="StartServer">
            {{ i18nt.buttons.startServer }}
          </button>
          <button class="btu" @click="StopServer">
            {{ i18nt.buttons.stopServer }}
          </button>
          <button class="btu" @click="getMessage">
            {{ i18nt.buttons.viewMessage }}
          </button>
          <button class="btu" @click="startCrash">
            {{ i18nt.buttons.simulatedCrash }}
          </button>
        </div>
        <div class="doc">
          <button class="btu" @click="openNewWin">
            {{ i18nt.buttons.openNewWindow }}
          </button>
          <button class="btu" @click="changeLanguage">{{
            i18nt.buttons.changeLanguage
          }}</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import SystemInformation from "./components/system-info-mation.vue";
import { message } from "@renderer/api/login";
import logo from "@renderer/assets/logo.png";
import { onUnmounted, ref } from "vue";
import { i18nt, setLanguage, globalLang } from "@renderer/i18n";
import { useStoreTemplate } from "@store/template";

let { ipcRenderer, shell, crash } = window;


if (!ipcRenderer) {
  ipcRenderer = {} as any;
  ipcRenderer.on =
    ipcRenderer.invoke =
    ipcRenderer.removeAllListeners =
    (...args: any): any => {
      console.log("not electron");
    };
}

const percentage = ref(0);
const colors = ref([
  { color: "#f56c6c", percentage: 20 },
  { color: "#e6a23c", percentage: 40 },
  { color: "#6f7ad3", percentage: 60 },
  { color: "#1989fa", percentage: 80 },
  { color: "#5cb87a", percentage: 100 },
] as string | ColorInfo[]);
const dialogVisible = ref(false);
const progressStaus = ref(null);
const filePath = ref("");
const updateStatus = ref("");
const showForcedUpdate = ref(false);

const storeTemplate = useStoreTemplate();

console.log(`storeTemplate`, storeTemplate.getTest);
console.log(`storeTemplate`, storeTemplate.getTest1);
console.log(`storeTemplate`, storeTemplate.$state.testData);

setTimeout(() => {
  storeTemplate.TEST_ACTION("654321");
  console.log(`storeTemplate`, storeTemplate.getTest1);
}, 1000);

const elPageSize = ref(100);
const elCPage = ref(1);

function changeLanguage() {
  setLanguage(globalLang.value === "zh-cn" ? "en" : "zh-cn");
}

function startCrash() {
  crash.start();
}

function openNewWin() {
  const data = {
    url: "/form/index",
  };
  ipcRenderer.invoke("open-win", data);
}
function getMessage() {
  message().then((res) => {
    // ElMessageBox.alert(res.data, "提示", {
    //   confirmButtonText: "确定",
    // });
  });
}
function StopServer() {
  ipcRenderer.invoke("stop-server").then((res) => {
    // ElMessage({
    //   type: "success",
    //   message: "已关闭",
    // });
  });
}
function StartServer() {
  ipcRenderer.invoke("start-server").then((res) => {
    if (res) {
      // ElMessage({
      //   type: "success",
      //   message: res,
      // });
    }
  });
}
// 获取electron方法
function open() { }
function CheckUpdate(data) {
  switch (data) {
    case "one":
      ipcRenderer.invoke("check-update");
      console.log("启动检查");
      break;
    case "two":
      ipcRenderer.invoke("start-download").then(() => {
        dialogVisible.value = true;
      });
      break;
    case "three":
      ipcRenderer.invoke("hot-update");
      break;
    case "four":
      showForcedUpdate.value = true;
      break;

    default:
      break;
  }
}
function handleClose() {
  dialogVisible.value = false;
}
ipcRenderer.on("download-progress", (event, arg) => {
  percentage.value = Number(arg);
});
ipcRenderer.on("download-error", (event, arg) => {
  if (arg) {
    progressStaus.value = "exception";
    percentage.value = 40;
    colors.value = "#d81e06";
  }
});
ipcRenderer.on("download-paused", (event, arg) => {
  if (arg) {
    progressStaus.value = "warning";
    // ElMessageBox.alert("下载由于未知原因被中断！", "提示", {
    //   confirmButtonText: "重试",
    //   callback: (action) => {
    //     ipcRenderer.invoke("start-download");
    //   },
    // });
  }
});
ipcRenderer.on("download-done", (event, age) => {
  filePath.value = age.filePath;
  progressStaus.value = "success";
  // ElMessageBox.alert("更新下载完成！", "提示", {
  //   confirmButtonText: "确定",
  //   callback: (action) => {
  //     shell.shell.openPath(filePath.value);
  //   },
  // });
});
// electron-updater upload 
ipcRenderer.on("update-msg", (event, age) => {
  switch (age.state) {
    case -1:
      const msgdata = {
        title: "发生错误",
        message: age.msg,
      };
      dialogVisible.value = false;
      ipcRenderer.invoke("open-errorbox", msgdata);
      break;
    case 0:
      console.log('check-update')
      break;
    case 1:
      dialogVisible.value = true;
      console.log('has update download-ing')
      break;
    case 2:
      console.log('not new version')
      break;
    case 3:
      percentage.value = age.msg.percent.toFixed(1);
      break;
    case 4:
      progressStaus.value = "success";
      ipcRenderer.invoke("confirm-update");
      break;
    default:
      break;
  }
});
ipcRenderer.on("hot-update-status", (event, msg) => {
  switch (msg.status) {
    case "downloading":
      console.log("正在下载")
      break;
    case "moving":
      console.log("正在移动文件")
      break;
    case "finished":
      console.log("成功,请重启")
      break;
    case "failed":
      console.log("msg.message.message")
      break;

    default:
      break;
  }
  console.log(msg);
  updateStatus.value = msg.status;
});
onUnmounted(() => {
  console.log("销毁了哦");
  ipcRenderer.removeAllListeners("confirm-message");
  ipcRenderer.removeAllListeners("download-done");
  ipcRenderer.removeAllListeners("download-paused");
  ipcRenderer.removeAllListeners("confirm-stop");
  ipcRenderer.removeAllListeners("confirm-start");
  ipcRenderer.removeAllListeners("confirm-download");
  ipcRenderer.removeAllListeners("download-progress");
  ipcRenderer.removeAllListeners("download-error");
});
</script>

<style scoped lang="scss">
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Source Sans Pro", sans-serif;
}

#wrapper {
  padding: 124px 80px;
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

.doc {
  button {
    margin-top: 10px;
    margin-right: 10px;

  }

  .btu {
    display: inline-block;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    color: #fff;
    background-color: #409eff;
    border: 1px solid #409eff;
    text-align: center;
    box-sizing: border-box;
    outline: none;
    transition: .1s;
    font-weight: 500;
    padding: 12px 20px;
    font-size: 14px;
    border-radius: 4px;
  }

  .btu:focus,
  .btu:hover {
    background: #3a8ee6;
    border-color: #3a8ee6;
  }
}

.doc .button+.button {
  margin-left: 0;
}

.conten {
  text-align: center;
}</style>
