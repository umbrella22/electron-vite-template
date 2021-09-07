<template>
  <el-config-provider :locale="i18nt">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ElConfigProvider } from "element-plus";
import { i18n } from "./i18n";

const i18nt = computed(() => i18n.global.messages[i18n.global.locale].el);
</script>

<style></style>
