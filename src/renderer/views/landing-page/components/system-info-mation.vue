<template>
  <div>
    <div class="title">{{ t('about.system') }}</div>
    <div class="items">
      <div class="item" v-for="(item, index) in tips" :key="index">
        <div class="name" v-text="item.name" />
        <div class="value" v-text="item.value" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { platform, release, arch } = require('os')
const { path, name } = useRoute()
const { t } = useI18n()

let tips = ref(
  computed(() => [
    { name: t('about.language'), value: t('about.languageValue') },
    { name: t('about.currentPagePath'), value: path },
    { name: t('about.currentPageName'), value: name },
    {
      name: t('about.vueVersion'),
      value:
        process.env.NODE_ENV === 'development'
          ? require('vue/package.json').version
          : '不可见',
    },
    {
      name: t('about.electronVersion'),
      value: process.versions.electron || '浏览器环境',
    },
    {
      name: t('about.nodeVersion'),
      value: process.versions.node || '浏览器环境',
    },
    { name: t('about.systemPlatform'), value: platform() },
    { name: t('about.systemVersion'), value: release() },
    { name: t('about.systemArch'), value: arch() + '位' },
  ]),
)
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
