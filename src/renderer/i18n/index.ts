import { computed, ref } from 'vue'

export const globalLang = ref('zh-cn')
export function loadLanguages() {
  const context: any = import.meta.glob('./languages/*.ts', { eager: true })

  const languages: any = {}

  let langs = Object.keys(context)
  for (let key of langs) {
    if (key === './index.ts') return
    let lang = context[key].lang
    let name = key.replace(/(\.\/languages\/|\.ts)/g, '')
    languages[name] = lang
  }

  return languages
}

export const i18nt = computed(() => {
  const lang = loadLanguages()
  return lang[globalLang.value]
})

export function setLanguage(locale: string) {
  globalLang.value = locale
}
