import { createPinia } from 'pinia'
import { createPersistPlugin } from './plugins'

const pinia = createPinia()

// 添加持久化插件，仅持久化 user 和 app store
pinia.use((context) => {
  const { store } = context

  // 只对 user 和 app store 启用持久化
  if (store.$id === 'user') {
    createPersistPlugin({
      key: 'user-store',
      storage: localStorage,
    })(context)
  } else if (store.$id === 'app') {
    createPersistPlugin({
      key: 'app-store',
      storage: localStorage,
    })(context)
  }
})

export default pinia

// 导出所有 store
export { useUserStore } from './modules/user'
export { useAppStore } from './modules/app'
export { useCounterStore } from './modules/counter'
export { useDictStore } from './modules/dict'

// 导出 composables
export {
  usePermission,
  useAuth,
  useNotificationWithUser,
  useThemeWithNotification,
} from './composables'
export { useDict, useDicts } from './composables/useDict'
