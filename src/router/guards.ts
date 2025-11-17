/**
 * 路由守卫集合
 * 最佳实践：将守卫逻辑分离到独立文件，提高代码可维护性
 */
import type { Router, RouteLocationNormalized } from 'vue-router'
import { getToken } from '@/api'

/**
 * 权限检查函数
 * @param requiredRoles 需要的角色列表
 * @returns 是否有权限
 */
export const checkPermission = (requiredRoles?: string[]): boolean => {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true
  }

  // 这里应该从状态管理（如 Pinia）获取用户信息
  // const userStore = useUserStore()
  // return requiredRoles.some(role => userStore.user?.roles.includes(role))

  // 示例实现
  return true
}

/**
 * 检查用户是否已认证
 * @returns 是否已认证
 */
export const isAuthenticated = (): boolean => {
  const token = getToken()
  return !!token
}

/**
 * 设置页面标题
 * @param to 目标路由
 */
export const setPageTitle = (to: RouteLocationNormalized): void => {
  const title = to.meta.title || '页面'
  const appName = '深大校友录管理后台'
  document.title = `${title} - ${appName}`
}

/**
 * 注册全局导航守卫
 * @param router Vue Router 实例
 */
export const setupRouterGuards = (router: Router): void => {
  /**
   * 全局前置守卫
   */
  router.beforeEach((to, _from, next) => {
    setPageTitle(to)

    const authenticated = isAuthenticated()

    if (to.meta.requiresAuth && !authenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }

    if (authenticated && to.path === '/login') {
      next('/home')
      return
    }

    if (to.meta.roles && !checkPermission(to.meta.roles as string[])) {
      next('/403')
      return
    }

    next()
  })

  /**
   * 全局后置钩子
   */
  router.afterEach(() => {
    // 可在此处添加页面访问统计等逻辑
  })

  /**
   * 路由错误处理
   */
  router.onError((error) => {
    console.error('❌ Router error:', error)
  })
}
