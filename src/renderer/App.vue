<template>
  <title-bar />
  <el-config-provider :locale="i18nt">
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ElConfigProvider } from "element-plus";
import { i18n } from "./i18n";
import TitleBar from "./components/common/TitleBar.vue";

const i18nt = computed(() => i18n.global.messages.value[i18n.global.locale.value].$el);
</script>

<style></style>
