import service from './index'
import type { RequestConfig } from './types'

/**
 * 封装 GET 请求
 */
export const get = <T = any>(
  url: string,
  params?: Record<string, any>,
  config?: RequestConfig,
): Promise<T> => {
  return service.get(url, {
    params,
    ...config,
  })
}

/**
 * 封装 POST 请求
 */
export const post = <T = any>(
  url: string,
  data?: Record<string, any>,
  config?: RequestConfig,
): Promise<T> => {
  return service.post(url, data, config)
}

/**
 * 封装 PUT 请求
 */
export const put = <T = any>(
  url: string,
  data?: Record<string, any>,
  config?: RequestConfig,
): Promise<T> => {
  return service.put(url, data, config)
}

/**
 * 封装 DELETE 请求
 */
export const del = <T = any>(
  url: string,
  params?: Record<string, any>,
  config?: RequestConfig,
): Promise<T> => {
  return service.delete(url, {
    params,
    ...config,
  })
}

/**
 * 封装 PATCH 请求
 */
export const patch = <T = any>(
  url: string,
  data?: Record<string, any>,
  config?: RequestConfig,
): Promise<T> => {
  return service.patch(url, data, config)
}

/**
 * 导出所有请求方法
 */
export default {
  get,
  post,
  put,
  delete: del,
  patch,
}
