import { createPinia } from 'pinia'
import { createPersistPlugin } from './plugins'

const pinia = createPinia()

// 添加持久化插件，持久化 user store
pinia.use(
  createPersistPlugin({
    key: 'app-store',
    storage: localStorage,
  }),
)

export default pinia

// 导出所有 store
export { useUserStore } from './modules/user'
export { useAppStore } from './modules/app'
export { useCounterStore } from './modules/counter'

// 导出 composables
export {
  usePermission,
  useAuth,
  useNotificationWithUser,
  useThemeWithNotification,
} from './composables'
