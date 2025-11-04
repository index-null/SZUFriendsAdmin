import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // State
  const userInfo = ref({
    id: '',
    name: '',
    email: '',
    avatar: '',
    role: 'user'
  })

  const isLoggedIn = ref(false)
  const loading = ref(false)

  // Computed
  const userName = computed(() => userInfo.value.name || '游客')
  const isAdmin = computed(() => userInfo.value.role === 'admin')

  // Actions
  const setUserInfo = (info: typeof userInfo.value) => {
    userInfo.value = info
    isLoggedIn.value = true
  }

  const login = async (email: string, _password: string) => {
    loading.value = true
    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setUserInfo({
        id: '1',
        name: '张三',
        email,
        avatar: 'https://via.placeholder.com/150',
        role: 'user'
      })
      return true
    } catch (error) {
      console.error('登录失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    userInfo.value = {
      id: '',
      name: '',
      email: '',
      avatar: '',
      role: 'user'
    }
    isLoggedIn.value = false
  }

  const updateProfile = (updates: Partial<typeof userInfo.value>) => {
    userInfo.value = { ...userInfo.value, ...updates }
  }

  return {
    // State
    userInfo,
    isLoggedIn,
    loading,
    // Computed
    userName,
    isAdmin,
    // Actions
    setUserInfo,
    login,
    logout,
    updateProfile
  }
})
