import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia

// 导出所有 store
export { useUserStore } from './modules/user'
export { useAppStore } from './modules/app'
export { useCounterStore } from './modules/counter'
