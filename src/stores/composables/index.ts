/**
 * Store 相关的组合函数
 */

import { computed } from 'vue'
import { useUserStore } from '../modules/user'
import { useAppStore } from '../modules/app'

/**
 * 组合多个 store 的权限检查
 */
export const usePermission = () => {
  const userStore = useUserStore()

  const hasPermission = (permission: string) => {
    // 管理员拥有所有权限
    if (userStore.isAdmin) return true

    // 检查用户的权限数组
    return userStore.userInfo.permissions?.includes(permission) || false
  }

  const canRead = computed(() => hasPermission('read'))
  const canWrite = computed(() => hasPermission('write'))
  const canDelete = computed(() => hasPermission('delete'))

  return {
    hasPermission,
    canRead,
    canWrite,
    canDelete,
  }
}

/**
 * 组合通知和用户状态
 */
export const useNotificationWithUser = () => {
  const appStore = useAppStore()
  const userStore = useUserStore()

  const notifyUser = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
  ) => {
    const prefix = userStore.isLoggedIn ? `${userStore.userName}: ` : ''
    appStore.addNotification(prefix + message, type)
  }

  return {
    notifyUser,
    notifications: computed(() => appStore.notifications),
  }
}

/**
 * 组合应用状态和主题
 * 注意：主题管理已迁移到 @/element-plus 中的 useDark
 * 此函数仅提供通知功能的包装
 */
export const useThemeWithNotification = () => {
  const appStore = useAppStore()

  const switchTheme = (isDark: boolean) => {
    appStore.addNotification(
      `主题已切换为${isDark ? '深色' : '浅色'}`,
      'info',
      2000,
    )
  }

  return {
    switchTheme,
  }
}

/**
 * 组合用户认证状态
 */
export const useAuth = () => {
  const userStore = useUserStore()

  const isAuthenticated = computed(() => userStore.isLoggedIn)
  const currentUser = computed(() => userStore.userInfo)
  const isLoading = computed(() => userStore.loading)

  const login = async (username: string, password: string) => {
    return await userStore.login({ username, password })
  }

  const logout = () => {
    userStore.logout()
  }

  return {
    isAuthenticated,
    currentUser,
    isLoading,
    login,
    logout,
  }
}
