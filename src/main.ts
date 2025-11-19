import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import pinia from './stores'

// 引入 Element Plus 基础样式（必须在 dark.css 之前）
import 'element-plus/dist/index.css'
// 引入 Element Plus 暗色主题
import './element-plus/dark.css'
import { initTheme } from './element-plus'

// 引入 Element Plus 中文语言包
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const app = createApp(App)

// 先注册 pinia，确保 store 可用
app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})

// 初始化主题
initTheme()

// 恢复登录状态（在路由准备前恢复，确保路由守卫能正确判断）
import { useUserStore } from './stores/modules/user'
const userStore = useUserStore()
userStore.restoreLoginState()

// 等待路由准备完成后再挂载应用
router.isReady().then(() => {
  app.mount('#app')
})
