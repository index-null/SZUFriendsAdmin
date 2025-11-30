import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
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
  const notificationCount = computed(() => notifications.value.length)

  // Actions
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

  return {
    // State
    sidebarCollapsed,
    notifications,
    // Computed
    notificationCount,
    // Actions
    toggleSidebar,
    addNotification,
    removeNotification,
    clearNotifications,
  }
})
