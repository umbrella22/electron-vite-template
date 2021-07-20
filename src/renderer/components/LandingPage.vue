<template>
	<title-bar></title-bar>
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
					<el-button type="primary" round @click="CheckUpdate('one')">检查更新</el-button>
				</div>
				<div class="doc">
					<el-button type="primary" round @click="CheckUpdate('two')">检查更新（第二种方法）</el-button>
					<el-button type="primary" round @click="CheckUpdate('three')">检查更新（增量更新）</el-button>
					<el-button type="primary" round @click="StartServer">启动内置服务端</el-button>
					<el-button type="primary" round @click="StopServer">关闭内置服务端</el-button>
					<el-button type="primary" round @click="getMessage">查看消息</el-button>
				</div>
				<div class="doc">
					<el-button type="primary" round @click="openNewWin">打开新窗口</el-button>
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
				<el-progress type="dashboard" :percentage="percentage" :color="colors" :status="progressStaus"></el-progress>
			</div>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import SystemInformation from "./LandingPage/SystemInformation.vue";
import { message } from "@renderer/api/login";
import logo from "@renderer/assets/logo.png";
import { ElMessage, ElMessageBox } from 'element-plus';
import { onUnmounted } from "vue";
import { useStore } from "vuex"
let { ipcRenderer } = window;

if (!ipcRenderer) {
	ipcRenderer = {} as any;
	ipcRenderer.on = ipcRenderer.invoke = ipcRenderer.removeAllListeners = (...args: any): any => {
		console.log("not electron");
	};
}

ref: text = "等待数据读取";
ref: newdata = {
	name: "yyy",
	age: "12"
};
ref: textarray = [];
ref: percentage = 0;
ref: colors = [
	{ color: "#f56c6c", percentage: 20 },
	{ color: "#e6a23c", percentage: 40 },
	{ color: "#6f7ad3", percentage: 60 },
	{ color: "#1989fa", percentage: 80 },
	{ color: "#5cb87a", percentage: 100 },
] as string | ColorInfo[];
ref: dialogVisible = false;
ref: progressStaus = null;
ref: filePath = "";
ref: updateStatus = "";

const store = useStore()
store.dispatch("TEST_ACTION", "123456")


function openNewWin() {
	let data = {
		url: "/form/index",
	};
	ipcRenderer.invoke("open-win", data);
}
function getMessage() {
	message().then((res) => {
		ElMessageBox.alert(res.data, "提示", {
			confirmButtonText: "确定",
		});
	});
}
function StopServer() {
	ipcRenderer.invoke("stop-server").then((res) => {
		ElMessage({
			type: "success",
			message: "已关闭",
		});
	});
}
function StartServer() {
	ipcRenderer.invoke("statr-server").then((res) => {
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
}
function handleClose() {
	dialogVisible = false;
}

ipcRenderer.on("download-progress", (event, arg) => {
	percentage = Number(arg);
});
ipcRenderer.on("download-error", (event, arg) => {
	if (arg) {
		progressStaus = "exception";
		percentage = 40;
		colors = "#d81e06";
	}
});
ipcRenderer.on("download-paused", (event, arg) => {
	if (arg) {
		progressStaus = "warning";
		ElMessageBox.alert("下载由于未知原因被中断！", "提示", {
			confirmButtonText: "重试",
			callback: (action) => {
				ipcRenderer.invoke("satrt-download");
			},
		});
	}
});
ipcRenderer.on("download-done", (event, age) => {
	filePath = age.filePath;
	progressStaus = "success";
	ElMessageBox.alert("更新下载完成！", "提示", {
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
			dialogVisible = false;
			ipcRenderer.invoke("open-errorbox", msgdata);
			break;
		case 0:
			ElMessage("正在检查更新");
			break;
		case 1:
			ElMessage({
				type: "success",
				message: "已检查到新版本，开始下载",
			});
			dialogVisible = true;
			break;
		case 2:
			ElMessage({ type: "success", message: "无新版本" });
			break;
		case 3:
			percentage = age.msg.percent.toFixed(1);
			break;
		case 4:
			progressStaus = "success";
			ElMessageBox.alert("更新下载完成！", "提示", {
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
ipcRenderer.on("hot-update-status", (event, msg) => {
	updateStatus = msg.status;
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
})
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
.doc .el-button + .el-button {
	margin-left: 0;
}
.conten {
	text-align: center;
}
</style>