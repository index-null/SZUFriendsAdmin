/**
 * Store 类型定义
 */

// 用户相关类型
export interface UserInfo {
  id: string
  name: string
  email: string
  avatar: string
  role: 'user' | 'admin' | 'guest'
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: UserInfo
}

// 应用相关类型
export type Theme = 'light' | 'dark'

export interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  timestamp: number
  duration?: number
}

export interface AppState {
  theme: Theme
  sidebarCollapsed: boolean
  notifications: Notification[]
}

// 计数器相关类型
export interface CounterState {
  count: number
  history: number[]
}

// API 响应类型
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface ApiError {
  code: number
  message: string
}
