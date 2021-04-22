<template>
  <router-view v-slot="{ Component }" @mousedown.self.stop="onMouseDown" @mouseup.self.stop="onMouseUp">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script lang="ts">
import { defineComponent } from "vue";
const { ipcRenderer } = require("electron");

export default defineComponent({
  name: "App",
  components: {},
  data() {
    return {
      isDrag: false  
    }
  },
  methods: {
    onMouseDown(e) {
      if (e.clientY <= 30) {
        this.isDrag = ipcRenderer.sendSync('startDrag', true);
      }
    },

    onMouseUp(e) {
      this.isDrag = ipcRenderer.sendSync('stopDrag', true);
    }
  }
});
</script>

<style>
</style>