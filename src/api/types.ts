import type { AxiosRequestConfig } from 'axios'

/**
 * API 响应数据结构
 */
export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
  success: boolean
}

/**
 * 分页参数
 */
export interface PageParams {
  page: number
  pageSize: number
}

/**
 * 分页响应数据
 */
export interface PageData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/**
 * 自定义请求配置
 * 扩展 Axios 原生配置，添加业务自定义选项
 */
export interface RequestConfig extends AxiosRequestConfig {
  // 是否显示加载提示
  showLoading?: boolean
  // 是否显示错误提示
  showError?: boolean
  // 自定义错误处理
  errorHandler?: (error: any) => void
}
