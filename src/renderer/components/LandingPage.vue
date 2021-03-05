<template>
  <div id="wrapper">
    <img id="logo" :src="logo" alt="electron-vue" />
    <main>
      <div class="left-side">
        <span class="title">欢迎进入本框架</span>
        <system-information></system-information>
      </div>

      <div class="right-side">
        <div class="doc">
          <div class="title alt">您可以点击的按钮测试功能</div>
          <el-button type="primary" round @click="open()">控制台打印</el-button>
          <el-button type="primary" round @click="CheckUpdate('one')"
            >检查更新</el-button
          >
        </div>
        <div class="doc">
          <el-button type="primary" round @click="CheckUpdate('two')"
            >检查更新（第二种方法）</el-button
          >
          <el-button type="primary" round @click="CheckUpdate('three')"
            >检查更新（增量更新）</el-button
          >
          <el-button type="primary" round @click="StartServer"
            >启动内置服务端</el-button
          >
          <el-button type="primary" round @click="StopServer"
            >关闭内置服务端</el-button
          >
          <el-button type="primary" round @click="getMessage"
            >查看消息</el-button
          >
          <el-button type="primary" round @click="crash">模拟崩溃</el-button>
        </div>
        <div class="doc">
          <el-button type="primary" round @click="openNewWin"
            >打开新窗口</el-button
          >
        </div>
      </div>
    </main>
    <el-dialog
      title="进度"
      :v-model="dialogVisible"
      :before-close="handleClose"
      center
      width="14%"
      top="45vh"
    >
      <div class="conten">
        <el-progress
          type="dashboard"
          :percentage="percentage"
          :color="colors"
          :status="progressStaus"
        ></el-progress>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import SystemInformation from "./LandingPage/SystemInformation.vue";
import { message } from "@renderer/api/login";
const { ipcRenderer } = require("electron");
import logo from "@renderer/assets/logo.png";
export default {
  name: "landing-page",
  components: { SystemInformation },
  data: () => ({
    text: "等待数据读取",
    newdata: {
      name: "yyy",
      age: "12",
    },
    logo: logo,
    textarray: [],
    percentage: 0,
    colors: [
      { color: "#f56c6c", percentage: 20 },
      { color: "#e6a23c", percentage: 40 },
      { color: "#6f7ad3", percentage: 60 },
      { color: "#1989fa", percentage: 80 },
      { color: "#5cb87a", percentage: 100 },
    ],
    dialogVisible: false,
    progressStaus: null,
    filePath: "",
  }),
  created() {
    // console.log(__lib);
    // // 下载文件的监听
    ipcRenderer.on("download-progress", (event, arg) => {
      this.percentage = Number(arg);
    });
    ipcRenderer.on("download-error", (event, arg) => {
      if (arg) {
        this.progressStaus = "exception";
        this.percentage = 40;
        this.colors = "#d81e06";
      }
    });
    ipcRenderer.on("download-paused", (event, arg) => {
      if (arg) {
        this.progressStaus = "warning";
        this.$alert("下载由于未知原因被中断！", "提示", {
          confirmButtonText: "重试",
          callback: (action) => {
            ipcRenderer.invoke("satrt-download");
          },
        });
      }
    });
    ipcRenderer.on("download-done", (event, age) => {
      this.filePath = age.filePath;
      this.progressStaus = "success";
      this.$alert("更新下载完成！", "提示", {
        confirmButtonText: "确定",
        callback: (action) => {
          // this.$electron.shell.openPath(this.filePath);
        },
      });
    });
    // electron-updater的更新监听
    ipcRenderer.on("UpdateMsg", (event, age) => {
      switch (age.state) {
        case -1:
          const msgdata = {
            title: "发生错误",
            message: age.msg,
          };
          this.dialogVisible = false;
          ipcRenderer.invoke("open-errorbox", msgdata);
          break;
        case 0:
          this.$message("正在检查更新");
          break;
        case 1:
          this.$message({
            type: "success",
            message: "已检查到新版本，开始下载",
          });
          this.dialogVisible = true;
          break;
        case 2:
          this.$message({ type: "success", message: "无新版本" });
          break;
        case 3:
          this.percentage = age.msg.percent.toFixed(1);
          break;
        case 4:
          this.progressStaus = "success";
          this.$alert("更新下载完成！", "提示", {
            confirmButtonText: "确定",
            callback: (action) => {
              ipcRenderer.invoke("confirm-update");
            },
          });
          break;

        default:
          break;
      }
    });
     ipcRenderer.on('hot-update-status')
  },
  methods: {
    crash() {
      process.crash();
    },
    openNewWin() {
      let data = {
        url: "/form/index",
      };
      ipcRenderer.invoke("open-win", data);
    },
    getMessage() {
      message().then((res) => {
        this.$alert(res.data, "提示", {
          confirmButtonText: "确定",
        });
      });
    },
    StopServer() {
      ipcRenderer.invoke("stop-server").then((res) => {
        this.$message({
          type: "success",
          message: "已关闭",
        });
      });
    },
    StartServer() {
      ipcRenderer.invoke("statr-server").then((res) => {
        if (res) {
          this.$message({
            type: "success",
            message: res,
          });
        }
      });
    },
    // 获取electron方法
    open() {},
    CheckUpdate(data) {
      switch (data) {
        case "one":
          ipcRenderer.invoke("check-update");
          console.log("启动检查");
          break;
        case "two":
          ipcRenderer.invoke("start-download").then(() => {
            this.dialogVisible = true;
          });
          break;
        case "three":
          ipcRenderer.invoke("hot-update");
          break;

        default:
          break;
      }
    },
    handleClose() {
      this.dialogVisible = false;
    },
  },
  unmounted() {
    console.log("销毁了哦");
    ipcRenderer.removeAllListeners("confirm-message");
    ipcRenderer.removeAllListeners("download-done");
    ipcRenderer.removeAllListeners("download-paused");
    ipcRenderer.removeAllListeners("confirm-stop");
    ipcRenderer.removeAllListeners("confirm-start");
    ipcRenderer.removeAllListeners("confirm-download");
    ipcRenderer.removeAllListeners("download-progress");
    ipcRenderer.removeAllListeners("download-error");
  },
};
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
  padding: 60px 80px;
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

main > div {
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
  margin-bottom: 20px;
}
.doc p {
  color: black;
  margin-bottom: 10px;
}
.conten {
  text-align: center;
}
</style>