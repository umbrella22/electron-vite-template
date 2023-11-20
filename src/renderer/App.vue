<template>
  <title-bar />
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>

<script setup lang="ts">
import TitleBar from "./components/common/TitleBar.vue";

</script>

<style></style>
