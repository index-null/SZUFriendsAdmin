import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

/**
 * 创建一个简化的 Axios 实例供 Orval 使用
 * 注意：避免使用 import.meta 以防止 esbuild 警告
 */

// 硬编码 baseURL，或者在运行时从全局变量读取
// 如果需要动态配置，可以通过 window.__ENV__ 等方式
const BASE_URL = 'http://49.235.189.33:9000/api'
const TOKEN_KEY = 'access_token'

// 创建独立的 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 简单的请求拦截器：添加 Token
service.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 简单的响应拦截器：提取数据
service.interceptors.response.use(
  (response) => {
    const { data } = response
    // 统一返回 data.data 或 data
    if (data && (data.code === 0 || data.code === 200 || data.success === true)) {
      return data.data || data
    }
    return data
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Orval 专用的自定义实例
 * Orval 生成的代码会调用这个函数
 */
export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source()
  
  const promise = service({
    ...config,
    cancelToken: source.token,
  }).then((data) => data as T)

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled')
  }

  return promise
}

export default customInstance
