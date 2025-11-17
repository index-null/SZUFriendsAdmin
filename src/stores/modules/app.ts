import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

type Theme = 'light' | 'dark'

export const useAppStore = defineStore('app', () => {
  // State
  const theme = ref<Theme>('light')
  const sidebarCollapsed = ref(false)
  const notifications = ref<
    Array<{
      id: string
      message: string
      type: 'success' | 'error' | 'warning' | 'info'
      timestamp: number
    }>
  >([])

  // Computed
  const isDarkMode = computed(() => theme.value === 'dark')
  const notificationCount = computed(() => notifications.value.length)

  // Actions
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('app-theme', theme.value)
  }

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    localStorage.setItem('app-theme', newTheme)
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const addNotification = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration = 3000,
  ) => {
    const id = Date.now().toString()
    notifications.value.push({
      id,
      message,
      type,
      timestamp: Date.now(),
    })

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearNotifications = () => {
    notifications.value = []
  }

  // 初始化主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem('app-theme') as Theme | null
    if (savedTheme) {
      theme.value = savedTheme
    }
  }

  return {
    // State
    theme,
    sidebarCollapsed,
    notifications,
    // Computed
    isDarkMode,
    notificationCount,
    // Actions
    toggleTheme,
    setTheme,
    toggleSidebar,
    addNotification,
    removeNotification,
    clearNotifications,
    initTheme,
  }
})
