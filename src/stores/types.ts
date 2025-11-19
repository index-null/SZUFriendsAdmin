/**
 * Store 类型定义
 * 注意：尽量使用生成的接口类型（从 @/api/generated/.ts.schemas 导入）
 * 此文件仅保留 Store 特有的、不在后端接口中的类型
 */

// ============ 应用相关类型 ============

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

// ============ 计数器相关类型（示例） ============

export interface CounterState {
  count: number
  history: number[]
}

// ============ API 响应类型（通用） ============
// 注意：具体业务的响应类型应该使用生成的接口

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface ApiError {
  code: number
  message: string
}
