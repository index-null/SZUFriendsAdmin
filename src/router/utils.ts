/**
 * 路由工具函数
 * 最佳实践：提供常用的路由操作函数，简化组件中的路由逻辑
 */
import type { Router, RouteLocationRaw } from 'vue-router'

/**
 * 检查路由是否存在
 * @param router Vue Router 实例
 * @param path 路由路径
 * @returns 是否存在
 */
export const routeExists = (router: Router, path: string): boolean => {
  return router.getRoutes().some((route) => route.path === path)
}

/**
 * 获取所有路由路径
 * @param router Vue Router 实例
 * @returns 路由路径数组
 */
export const getAllRoutePaths = (router: Router): string[] => {
  return router.getRoutes().map((route) => route.path)
}

/**
 * 延迟导航
 * 用于在执行某些异步操作后导航
 * @param router Vue Router 实例
 * @param to 目标路由
 * @param delay 延迟时间（毫秒）
 */
export const delayedNavigate = (
  router: Router,
  to: RouteLocationRaw,
  delay: number = 300,
): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      router.push(to)
      resolve()
    }, delay)
  })
}

/**
 * 获取查询参数
 * @param router Vue Router 实例
 * @param key 参数键
 * @returns 参数值
 */
export const getQueryParam = (router: Router, key: string): string | null => {
  return (router.currentRoute.value.query[key] as string) || null
}

/**
 * 设置查询参数
 * @param router Vue Router 实例
 * @param params 参数对象
 */
export const setQueryParams = (
  router: Router,
  params: Record<string, string | number>,
): void => {
  const query = {
    ...router.currentRoute.value.query,
    ...params,
  }
  router.push({ query })
}
