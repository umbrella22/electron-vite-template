<!--  -->
<template>
  <div class="mask-box" @click="closeMask" v-if="visible">
    <div class="title-box">
      <div class="title">
        <!-- <ali-svg-icon :icon-class="icon_name" class-name="cuowu"></ali-svg-icon> -->
        <div class="text">{{ title }}</div>
      </div>
      <div class="content">{{ message }}</div>
      <div class="download-progress">
        <el-progress
          :percentage="percentage"
          :color="colors"
          :status="progressStaus"
        ></el-progress>
      </div>
      <div class="progress-content" v-if="winOS">
        注：当提示您安全警告时，请点击“运行(R)”，或者点击“更多信息”，选择仍要运行
      </div>
      <div class="bom-box">
        <el-button
          type="text"
          @click="openfile"
          v-if="progressStaus == 'success'"
        >
          查看文件位置
        </el-button>
        <el-button @click="killSys">{{ killButton }}</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";
const { platform } = require("os");
const { ipcRenderer, shell } = require("electron");
const props = defineProps({
  modelValue: Boolean,
});
const emits = defineEmits(["update:modelValue"]);
const visible = ref(false);

watch(
  () => props.modelValue,
  () => {
    visible.value = props.modelValue;
  }
);
const colors: Ref<string[]> | string = ref([
  { color: "#f56c6c", percentage: 20 },
  { color: "#e6a23c", percentage: 40 },
  { color: "#6f7ad3", percentage: 60 },
  { color: "#1989fa", percentage: 80 },
  { color: "#5cb87a", percentage: 100 },
]);
const percentage = ref(0);
const progressStaus = ref(null);
const winOS = platform().includes("win32");
const title = ref("强制更新");
const message = ref("由于当前软件版本过低，为了保证您的使用，已激活强制更新");
const killButton = ref("退出软件");
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
ipcRenderer.on("download-done", (event, age) => {
  filePath.value = age.filePath;
  progressStaus.value = "success";
  message.value = "更新下载完成！";
});

const filePath = ref("");
const openfile = () => {
  shell.showItemInFolder(filePath.value);
};
const killSys = () => {
  ipcRenderer.invoke("app-close");
};
// 当且仅当为开发模式才可以关闭
const closeMask = () => {
  if (process.env.NODE_ENV === "development") {
    emits("update:modelValue", false);
  }
};
onUnmounted(() => {
  ipcRenderer.removeAllListeners("download-done");
  ipcRenderer.removeAllListeners("download-progress");
  ipcRenderer.removeAllListeners("download-error");
});
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.mask-box {
  height: 100%;
  width: 100%;
  z-index: 99999;
  backdrop-filter: saturate(180%) blur(20px);
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: auto;
  margin: 0;
  .title-box {
    position: relative;
    margin: 0 auto 50px;
    background-color: #ffffff;
    width: 50%;
    margin-top: 20vh;
    color: #333;
    border-radius: 2px;
    padding: 48px 0;
    display: flex;
    flex-flow: column;
    align-items: center;
    .title {
      display: flex;
      line-height: 25px;
      justify-content: center;
      .cuowu {
        color: #999999;
        width: 25px;
        height: 25px;
        margin-right: 16px;
      }
      .text {
        font-size: 30px;
      }
    }
    .content {
      padding: 20px 30px 0px 30px;
    }
    .bom-box {
      :deep(.el-button) {
        padding: 10px 35px;
      }
    }
    .download-progress {
      width: 100%;
      padding: 20px 50px;
    }
    .progress-content {
      color: red;
      padding: 10px;
    }
  }
}
</style>
