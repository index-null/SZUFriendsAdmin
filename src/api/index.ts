import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosError,
  type AxiosResponse,
} from 'axios'
import { ElMessage, ElLoading } from 'element-plus'
import type { ApiResponse, RequestConfig } from './types'
import router from '../router'

/**
 * API 基础配置
 */
// 使用环境变量配置 API 基础路径
// 开发环境：通过 Vite 代理访问 /api
// 生产环境：前后端同域，直接访问 /api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const REQUEST_TIMEOUT = 30000
const TOKEN_KEY = 'access_token'

/**
 * Loading 实例管理
 */
let loadingInstance: ReturnType<typeof ElLoading.service> | null = null
let loadingCount = 0

const showLoading = () => {
  if (loadingCount === 0) {
    loadingInstance = ElLoading.service({
      lock: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.7)',
    })
  }
  loadingCount++
}

const hideLoading = () => {
  loadingCount--
  if (loadingCount === 0 && loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }
}

/**
 * 创建 Axios 实例
 */
const service: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 请求拦截器
 */
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig & RequestConfig) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (config.showLoading !== false) {
      showLoading()
    }

    return config
  },
  (error: AxiosError) => {
    hideLoading()
    ElMessage.error('请求配置错误，请稍后重试')
    return Promise.reject(error)
  },
)

/**
 * 响应拦截器
 */
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    hideLoading()

    const { data, config } = response
    const customConfig = config as RequestConfig

    if (data.code === 200 || data.code === 0 || data.success === true) {
      return data.data
    }

    const errorMessage = data.message || '请求失败，请稍后重试'

    if (customConfig.errorHandler) {
      customConfig.errorHandler(data)
    } else if (customConfig.showError !== false) {
      ElMessage.error(errorMessage)
    }

    return Promise.reject(new Error(errorMessage))
  },
  (error: AxiosError<ApiResponse>) => {
    hideLoading()

    const { response, config, message } = error
    const customConfig = config as RequestConfig

    let errorMessage = '请求失败，请稍后重试'

    if (response) {
      switch (response.status) {
        case 400:
          errorMessage = response.data?.message || '请求参数错误 (400)'
          break
        case 401:
          errorMessage = '未授权，请重新登录 (401)'
          handleTokenExpired()
          break
        case 403:
          errorMessage = '拒绝访问，权限不足 (403)'
          break
        case 404:
          errorMessage = `请求的资源不存在 (404): ${config?.url}`
          break
        case 405:
          errorMessage = '请求方法不允许 (405)'
          break
        case 408:
          errorMessage = '请求超时，请检查网络 (408)'
          break
        case 500:
          errorMessage = '服务器内部错误 (500)'
          break
        case 502:
          errorMessage = '网关错误 (502)'
          break
        case 503:
          errorMessage = '服务不可用 (503)'
          break
        case 504:
          errorMessage = '网关超时 (504)'
          break
        default:
          errorMessage =
            response.data?.message || `请求失败 (${response.status})`
      }
    } else if (message.includes('timeout')) {
      errorMessage = '请求超时，请检查网络连接'
    } else if (message.includes('Network Error')) {
      errorMessage = '网络错误，请检查网络连接'
    }

    if (customConfig?.showError !== false) {
      ElMessage.error(errorMessage)
    }

    if (customConfig?.errorHandler) {
      customConfig.errorHandler(error)
    }

    return Promise.reject(error)
  },
)

/**
 * Token 管理
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Token 过期处理
 */
const handleTokenExpired = () => {
  removeToken()

  // 避免重复跳转
  if (router.currentRoute.value.path !== '/login') {
    router.push({
      path: '/login',
      query: {
        redirect: router.currentRoute.value.fullPath,
      },
    })
  }
}
/**
 * 导出 Axios 实例
 */
export default service
