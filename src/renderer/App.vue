<template>
  <title-bar />
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>

<script setup lang="ts">
import TitleBar from "@renderer/components/title-bar/title-bar.vue";
</script>

<style></style>
