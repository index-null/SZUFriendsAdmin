import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosError,
} from 'axios'
import { ElMessage } from 'element-plus'

/**
 * 创建一个简化的 Axios 实例供 Orval 使用
 * 注意：避免使用 import.meta 以防止 esbuild 警告
 */

// 使用环境变量配置 API 基础路径
// 开发环境：通过 Vite 代理访问 /api
// 生产环境：前后端同域，直接访问 /api
// 如果需要动态配置，可以通过 window.__ENV__ 等方式
const BASE_URL = '/api'
const TOKEN_KEY = 'access_token'

/**
 * 跳转到登录页
 * 使用动态导入 router 避免循环依赖
 */
const redirectToLogin = async () => {
  // 清除本地存储的 token
  localStorage.removeItem(TOKEN_KEY)

  // 保存当前路径用于登录后跳转
  const currentPath = window.location.pathname

  if (currentPath !== '/login') {
    // 动态导入 router 并等待跳转完成
    const { default: router } = await import('@/router')
    await router.push({
      path: '/login',
      query: { redirect: currentPath },
    })
  }
}

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

// 简单的响应拦截器：提取数据和统一错误处理
service.interceptors.response.use(
  (response) => {
    const { data } = response
    // 统一返回 data.data 或 data
    if (
      data &&
      (data.code === 0 || data.code === 200 || data.success === true)
    ) {
      return data.data || data
    }
    return data
  },
  async (error: AxiosError) => {
    // 处理 HTTP 错误响应
    if (error.response) {
      const { status, data } = error.response as {
        status: number
        data: any
      }

      // Token 过期或无效（401 未授权）
      if (status === 401) {
        const message = data?.message || 'Token已过期或无效，请重新登录'

        // 显示错误提示
        ElMessage.error({
          message,
          duration: 3000,
          showClose: true,
        })

        // 延迟跳转，确保用户能看到提示，并等待跳转完成
        setTimeout(async () => {
          await redirectToLogin()
        }, 1000)
      }
      // 其他 HTTP 错误
      else if (status === 403) {
        ElMessage.error('没有权限访问该资源')
      } else if (status === 404) {
        ElMessage.error('请求的资源不存在')
      } else if (status >= 500) {
        ElMessage.error('服务器错误，请稍后重试')
      }
    }
    // 网络错误或请求超时
    else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请检查网络连接')
    } else if (error.message === 'Network Error') {
      ElMessage.error('网络连接失败，请检查网络')
    }

    return Promise.reject(error)
  },
)

/**
 * 类型辅助：自动解包 Result 包装类型
 * 例如：UnwrapResult<ResultPageResultUserPageVo> = PageResultUserPageVo
 *      UnwrapResult<ResultListRoleResponse> = RoleResponse[]
 */
export type UnwrapResult<T> = T extends { data?: infer D } ? D : T

/**
 * Orval 专用的自定义实例
 * 会自动解包响应中的 data 字段，并修正类型
 */
export const customInstance = <T>(
  config: AxiosRequestConfig,
): Promise<UnwrapResult<T>> => {
  const source = axios.CancelToken.source()

  const promise = service({
    ...config,
    cancelToken: source.token,
  }).then((data) => data as UnwrapResult<T>)

  // @ts-ignore: 为 promise 添加 cancel 方法，用于取消请求
  promise.cancel = () => {
    source.cancel('Query was cancelled')
  }

  return promise
}

export default customInstance
