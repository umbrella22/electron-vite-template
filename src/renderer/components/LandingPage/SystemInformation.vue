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

<script setup lang="ts">
import { useRoute } from "vue-router";

const { path, name } = useRoute();
const { systemInfo } = window;

let tips = $ref([
  { name: "当前页面路径：", value: path },
  { name: "当前页面名称：", value: name },
  { name: "系统平台：", value: systemInfo.platform },
  { name: "系统版本：", value: systemInfo.release },
  { name: "系统位数：", value: systemInfo.arch + "位" },
])
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
