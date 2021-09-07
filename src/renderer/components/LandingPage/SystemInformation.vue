<template>
  <div>
    <div class="title">{{ $t("about.system") }}</div>
    <div class="items">
      <div class="item" v-for="(item, index) in tips" :key="index">
        <div class="name" v-text="item.name" />
        <div class="value" v-text="item.value" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { i18nt } from "@renderer/i18n";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

const { path, name } = useRoute();
const { systemInfo } = window;

let tips = ref(
  computed(() => [
    { name: i18nt("about.language"), value: i18nt("about.languageValue") },
    { name: i18nt("about.currentPagePath"), value: path },
    { name: i18nt("about.currentPageName"), value: name },
    { name: i18nt("about.systemPlatform"), value: systemInfo.platform },
    { name: i18nt("about.systemVersion"), value: systemInfo.release },
    { name: i18nt("about.systemArch"), value: systemInfo.arch + "位" },
  ])
);
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
