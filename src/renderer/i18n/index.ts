import { createI18n } from 'vue-i18n'

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

export function i18nt(key: string) {
  return i18n.global.d(key)
}

export const i18n = createI18n({
  legacy: false,
  locale: 'zh-cn',
  fallbackLocale: 'zh-cn',
  messages: loadLanguages(),
})

export function setLanguage(locale: string) {
  i18n.global.locale.value = locale
}
