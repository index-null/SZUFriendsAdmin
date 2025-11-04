import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import pinia from './stores'
const app = createApp(App)

app.use(router)
app.use(pinia)
// 等待路由准备完成后再挂载应用
router.isReady().then(() => {
  app.mount('#app')
})
