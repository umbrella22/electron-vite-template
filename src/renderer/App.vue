<template>
  <el-config-provider :locale="language">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider } from "element-plus"
import { i18n } from "./i18n";
import { computed } from "vue";

let locale = $ref(computed(()=> i18n.global.locale));
let language = $ref(computed(() => i18n.global.messages![locale]));
</script>

<style>
</style>