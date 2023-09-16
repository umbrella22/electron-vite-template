<template>
  <title-bar />
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import TitleBar from "./components/common/TitleBar.vue";

const i18nt = computed(() => i18n.global.messages[i18n.global.locale].el);
</script>

<style></style>
