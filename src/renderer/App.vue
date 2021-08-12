<template>
  <el-config-provider :i18n="i18nt">
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

const i18nt = i18n.global.t
</script>

<style>
</style>