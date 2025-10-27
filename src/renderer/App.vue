<template>
  <title-bar />
  <div class="main">
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>

<script setup lang="ts">
import TitleBar from '@renderer/components/title-bar/title-bar.vue'
import { invoke, IpcChannel } from '@renderer/utils/ipcRenderer'
import { onMounted } from 'vue'
onMounted(() => {
  invoke(IpcChannel.WinReady)
})
</script>

<style scoped>
.main {
  padding-top: 30px;
  box-sizing: border-box;
}
</style>
