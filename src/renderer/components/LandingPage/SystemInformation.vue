<template>
  <div>
    <div class="title">关于系统</div>
    <div class="items">
      <div class="item" v-for="(item, index) in tips" :key="index">
        <div class="name" v-text="item.name" />
        <div class="value" v-text="item.value" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
const { platform, release, arch } = require("os");
import { useRoute } from "vue-router";
export default defineComponent({
  components: {},
  setup: () => {
    const { path, name } = useRoute();

    const tips = ref([
      { name: "当前页面路径：", value: path },
      { name: "当前页面名称：", value: name },
      {
        name: "Vue版本：",
        value:
          process.env.NODE_ENV === "development"
            ? require("vue/package.json").version
            : "不可见",
      },
      {
        name: "Electron版本：",
        value: process.versions.electron || "浏览器环境",
      },
      { name: "Node版本：", value: process.versions.node || "浏览器环境" },
      { name: "系统平台：", value: platform() },
      { name: "系统版本：", value: release() },
      { name: "系统位数：", value: arch() + "位" },
    ]);
    return {
      tips,
    };
  },
});
</script>

<style scoped lang="scss">
.title {
  color: #888;
  font-size: 18px;
  font-weight: initial;
  letter-spacing: 0.25px;
  margin-top: 10px;
}

.items {
  margin-top: 8px;
}

.item {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  line-height: 24px;
}

.item .name {
  color: #6a6a6a;
  margin-right: 6px;
}

.item .value {
  color: #35495e;
  font-weight: bold;
}
</style>
