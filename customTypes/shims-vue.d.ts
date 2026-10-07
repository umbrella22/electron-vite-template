/// <reference types="vite-plus/client" />

declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare const __CONFIG__: {
  [key: string]: string;
};

declare module 'element-plus/dist/locale/en.min' {
  import type { Language } from 'element-plus/es/locale'
  const lang: Language
  export default lang
}

declare module 'element-plus/dist/locale/zh-cn.min' {
  import type { Language } from 'element-plus/es/locale'
  const lang: Language
  export default lang
}
