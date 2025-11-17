import { post } from '../request'

/**
 * 认证相关接口
 * 注意：这些是独立维护的正式接口，generated 文件夹的接口仅用作查询参考
 */

// 登录请求参数（参考后端生成的 LoginRequest 类型）
export interface LoginParams {
  username: string  // 后端使用 username 而不是 email
  password: string
  wxMpCode?: string  // 微信小程序登录凭证（可选）
}

// 登录响应数据（匹配后端实际返回的字段）
export interface LoginData {
  token: string
  userId: number
  username: string
  nickname?: string           // 后端实际返回的字段
  avatar?: string | null      // 后端实际返回的字段
  permissionTree?: any[]      // 后端实际返回的字段
  roles?: string[]
  permissions?: string[]
}

// 注册请求参数（参考后端生成的 RegisterRequest 类型）
export interface RegisterParams {
  username: string      // 用户名（登录账号）
  password: string      // 密码
  nickname: string      // 用户昵称（显示用）
}

// 注册响应数据
export interface RegisterData {
  success: boolean
  message?: string
}

/**
 * 用户登录
 */
export const login = (params: LoginParams) => {
  return post<LoginData>('/auth/login', params)
}

/**
 * 用户注册
 */
export const register = (params: RegisterParams) => {
  return post<RegisterData>('/auth/register', params)
}

// 注意：logout 不需要调用后端接口，仅在前端清除 Token 即可

/**
 * 刷新 Token（如果后端提供此接口）
 */
export const refreshToken = () => {
  return post<{ token: string }>('/auth/refresh')
}

/**
 * 发送验证码（如果后端提供此接口）
 */
export const sendVerificationCode = (email: string) => {
  return post('/auth/send-code', { email })
}
