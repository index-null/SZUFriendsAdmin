import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi } from '@/api/modules/auth'
import { getUserInfo as getUserInfoApi, updateUserInfo as updateUserInfoApi } from '@/api/modules/user'
import { setToken, removeToken } from '@/api'
import type { LoginParams, LoginData, RegisterParams } from '@/api/modules/auth'
import type { UpdateUserParams } from '@/api/modules/user'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  // State - 基于后端实际返回的数据结构
  const userInfo = ref<Partial<LoginData>>({
    userId: 0,
    username: '',
    token: '',
    roles: [],
    permissions: [],
  })

  const token = ref<string>('')
  const isLoggedIn = ref(false)
  const loading = ref(false)

  // Computed
  const userName = computed(() => userInfo.value.username || '游客')
  const isAdmin = computed(() => userInfo.value.roles?.includes('admin') || false)

  // Actions
  const setUserInfo = (info: Partial<LoginData>) => {
    userInfo.value = info
    isLoggedIn.value = true
  }

  /**
   * 用户登录
   */
  const login = async (params: LoginParams) => {
    loading.value = true
    try {
      const data = await loginApi(params)
      
      token.value = data.token
      setToken(data.token)
      setUserInfo(data)
      
      ElMessage.success('登录成功')
      return true
    } catch (error: any) {
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 用户注册
   */
  const register = async (params: RegisterParams) => {
    loading.value = true
    try {
      const data = await registerApi(params)
      ElMessage.success(data.message || '注册成功，请登录')
      return true
    } catch (error: any) {
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 用户登出
   */
  const logout = async () => {
    userInfo.value = {
      userId: 0,
      username: '',
      token: '',
      roles: [],
      permissions: [],
    }
    token.value = ''
    isLoggedIn.value = false
    removeToken()
    
    ElMessage.success('已退出登录')
  }

  /**
   * 获取用户信息
   */
  const getUserInfo = async () => {
    try {
      const data = await getUserInfoApi()
      return data
    } catch (error) {
      return null
    }
  }

  /**
   * 更新用户信息
   */
  const updateProfile = async (updates: UpdateUserParams) => {
    try {
      const data = await updateUserInfoApi(updates)
      userInfo.value = { ...userInfo.value, ...data }
      ElMessage.success('更新成功')
      return true
    } catch (error) {
      return false
    }
  }

  return {
    // State
    userInfo,
    token,
    isLoggedIn,
    loading,
    // Computed
    userName,
    isAdmin,
    // Actions
    setUserInfo,
    login,
    register,
    logout,
    getUserInfo,
    updateProfile
  }
})
