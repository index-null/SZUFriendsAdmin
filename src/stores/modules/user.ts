import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi } from '@/api/modules/auth'
import {
  getUserInfo as getUserInfoApi,
  updateUserInfo as updateUserInfoApi,
} from '@/api/modules/user'
import { setToken, removeToken } from '@/api'
import type { LoginParams, LoginData, RegisterParams } from '@/api/modules/auth'
import type { UpdateUserParams } from '@/api/modules/user'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
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

  const userName = computed(() => userInfo.value.username || '游客')
  const isAdmin = computed(
    () => userInfo.value.roles?.includes('admin') || false,
  )

  const setUserInfo = (info: Partial<LoginData>) => {
    if (info.permissionTree) {
      const extractPermissions = (tree: any[]): string[] => {
        const codes: string[] = []
        const traverse = (nodes: any[]) => {
          nodes.forEach((node) => {
            if (node.permissionCode) {
              codes.push(node.permissionCode)
            }
            if (node.children && node.children.length > 0) {
              traverse(node.children)
            }
          })
        }
        traverse(tree)
        return codes
      }
      info.permissions = extractPermissions(info.permissionTree)
    }

    userInfo.value = info
    isLoggedIn.value = true
  }

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

  const getUserInfo = async () => {
    try {
      const data = await getUserInfoApi()
      return data
    } catch (error) {
      return null
    }
  }

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
    userInfo,
    token,
    isLoggedIn,
    loading,
    userName,
    isAdmin,
    setUserInfo,
    login,
    register,
    logout,
    getUserInfo,
    updateProfile,
  }
})
