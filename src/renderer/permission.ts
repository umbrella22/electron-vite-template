import router from './router'
import Performance from '@renderer/utils/performance'

var end: Function | null = null
router.beforeEach((to, from) => {
  end = Performance.startExecute(`${from.path} => ${to.path} 路由耗时`) /// 路由性能监控
  setTimeout(() => {
    end?.()
  }, 0)
  // 返回 undefined 即放行，无需再调用 next 回调
})

router.afterEach(() => {})
