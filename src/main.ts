import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
const app = createApp(App)

// 使用路由
app.use(router)

// 等待路由准备完成后再挂载应用
router.isReady().then(() => {
  app.mount('#app')
})
