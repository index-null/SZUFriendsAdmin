import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import pinia from './stores'

// 引入 Element Plus 暗色主题
import './element-plus/dark.css'
import { initTheme } from './element-plus'

const app = createApp(App)

app.use(router)
app.use(pinia)

// 初始化主题
initTheme()

// 等待路由准备完成后再挂载应用
router.isReady().then(() => {
  app.mount('#app')
})
