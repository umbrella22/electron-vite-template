import type { App } from 'vue'
import { createPinia } from 'pinia'

const store = createPinia()

export default function setupStore(app: App<Element>) {
  app.use(store)
}

export { store }
