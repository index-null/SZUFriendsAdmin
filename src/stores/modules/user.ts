import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { get as getAuthApi } from '@/api/generated/用户认证控制器-认证管理/用户认证控制器-认证管理'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  PermissionTreeNodeResponse,
} from '@/api/generated/.ts.schemas'
import { getToken, setToken, removeToken } from '@/api/mutator'
import { ElMessage } from 'element-plus'

// 初始化认证 API
const authApi = getAuthApi()

/**
 * 登录响应扩展
 * 添加前端需要的计算字段
 */
export interface LoginResponseExtended extends LoginResponse {
  permissions?: string[] // 从 permissionTree 提取的权限码列表
  roles?: string[] // 从权限或其他字段计算得出的角色列表
}

/**
 * 用户状态 Store
 * 使用生成的接口定义，确保类型安全
 */
export const useUserStore = defineStore('user', () => {
  // ============ 状态定义 ============

  /**
   * 用户信息（扩展了权限和角色字段）
   */
  const userInfo = ref<Partial<LoginResponseExtended>>({
    userId: undefined,
    username: '',
    token: '',
    nickname: '',
    avatar: '',
    collegeLeaderId: -1,
    permissionTree: [],
    permissions: [],
    roles: [],
  })

  const token = ref<string>('')
  const isLoggedIn = ref(false)
  const loading = ref(false)

  // ============ 计算属性 ============

  const userName = computed(
    () => userInfo.value.nickname || userInfo.value.username || '游客',
  )

  /**
   * 判断是否为管理员
   * 规则：
   * 1. collegeLeaderId >= 0 表示有学院管理权限
   * 2. 拥有包含 'admin' 的权限码
   */
  const isAdmin = computed(() => {
    const hasCollegePermission = (userInfo.value.collegeLeaderId ?? -1) >= 0
    const hasAdminPermission =
      userInfo.value.permissions?.some((p) =>
        p.toLowerCase().includes('admin'),
      ) || false
    return hasCollegePermission || hasAdminPermission
  })

  // ============ 辅助方法 ============

  /**
   * 从权限树中提取所有权限码
   */
  const extractPermissions = (tree: PermissionTreeNodeResponse[]): string[] => {
    const codes: string[] = []
    const traverse = (nodes: PermissionTreeNodeResponse[]) => {
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

  /**
   * 根据权限和管理员状态生成角色列表
   */
  const generateRoles = (
    permissions: string[],
    collegeLeaderId?: number,
  ): string[] => {
    const roles: string[] = ['user'] // 默认角色

    // 学院管理员
    if ((collegeLeaderId ?? -1) >= 0) {
      roles.push('college-admin')
    }

    // 超级管理员
    if ((collegeLeaderId ?? -1) === 0) {
      roles.push('admin', 'super-admin')
    }

    // 根据权限码添加角色
    if (permissions.some((p) => p.toLowerCase().includes('admin'))) {
      if (!roles.includes('admin')) {
        roles.push('admin')
      }
    }

    return roles
  }

  /**
   * 设置用户信息并计算扩展字段
   */
  const setUserInfo = (info: LoginResponse) => {
    // 提取权限
    const permissions = info.permissionTree
      ? extractPermissions(info.permissionTree)
      : []

    // 生成角色
    const roles = generateRoles(permissions, info.collegeLeaderId)

    // 设置完整的用户信息
    userInfo.value = {
      ...info,
      permissions,
      roles,
    }

    isLoggedIn.value = true
  }

  /**
   * 恢复登录状态（从持久化存储中恢复）
   */
  const restoreLoginState = () => {
    const storedToken = getToken()
    if (storedToken && userInfo.value.userId) {
      token.value = storedToken
      isLoggedIn.value = true
      return true
    }
    return false
  }

  // ============ Actions ============

  /**
   * 用户登录
   */
  const login = async (params: LoginRequest) => {
    loading.value = true
    try {
      const data = (await authApi.postAuthLogin(params)) as LoginResponse

      // 确保 token 存在
      if (!data.token) {
        throw new Error('登录失败：未返回 token')
      }

      token.value = data.token
      setToken(data.token)
      setUserInfo(data)

      ElMessage.success('登录成功')
      return true
    } catch (error: any) {
      console.error('登录失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 用户注册
   */
  const register = async (params: RegisterRequest) => {
    loading.value = true
    try {
      await authApi.postAuthRegister(params)
      ElMessage.success('注册成功，请登录')
      return true
    } catch (error: any) {
      console.error('注册失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 用户登出
   */
  const logout = async () => {
    try {
      // 调用后端登出接口（可选）
      await authApi.postAuthLogout().catch(() => {
        // 即使后端登出失败，也要清除前端状态
      })
    } finally {
      // 重置状态
      userInfo.value = {
        userId: undefined,
        username: '',
        token: '',
        nickname: '',
        avatar: '',
        collegeLeaderId: -1,
        permissionTree: [],
        permissions: [],
        roles: [],
      }
      token.value = ''
      isLoggedIn.value = false
      removeToken()

      ElMessage.success('已退出登录')
    }
  }

  /**
   * 更新用户信息（用于个人资料修改后同步）
   */
  const updateUserInfo = (updates: Partial<LoginResponse>) => {
    userInfo.value = {
      ...userInfo.value,
      ...updates,
    }
  }

  // ============ 导出 ============

  return {
    // 状态
    userInfo,
    token,
    isLoggedIn,
    loading,

    // 计算属性
    userName,
    isAdmin,

    // 方法
    setUserInfo,
    updateUserInfo,
    restoreLoginState,
    login,
    register,
    logout,
  }
})
