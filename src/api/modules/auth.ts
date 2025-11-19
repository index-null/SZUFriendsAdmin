import { post } from '../request'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '../generated/.ts.schemas'

/**
 * 认证相关接口
 * 直接使用生成的接口定义，减少手动维护
 */

// ============ 导出生成的类型，方便外部使用 ============
export type { LoginRequest, LoginResponse, RegisterRequest }

// ============ 扩展类型（仅当需要额外字段时） ============

/**
 * 登录响应扩展
 * 添加前端需要的计算字段
 */
export interface LoginResponseExtended extends LoginResponse {
  permissions?: string[] // 从 permissionTree 提取的权限码列表
  roles?: string[] // 从权限或其他字段计算得出的角色列表
}

// ============ API 方法 ============

/**
 * 用户登录
 */
export const login = (params: LoginRequest) => {
  return post<LoginResponse>('/auth/login', params)
}

/**
 * 用户注册
 */
export const register = (params: RegisterRequest) => {
  return post<boolean>('/auth/register', params)
}

/**
 * 用户登出
 */
export const logout = () => {
  return post<boolean>('/auth/logout')
}

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
