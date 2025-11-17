/**
 * 路由守卫集合
 * 最佳实践：将守卫逻辑分离到独立文件，提高代码可维护性
 */
import type { Router, RouteLocationNormalized } from 'vue-router'
import { getToken } from '@/api'
import { useUserStore } from '@/stores/modules/user'

/**
 * 权限检查函数
 * @param permissionCode 需要的权限码
 * @returns 是否有权限
 */
export const checkPermission = (permissionCode?: string): boolean => {
  if (!permissionCode) {
    return true
  }

  const userStore = useUserStore()

  if (userStore.isAdmin) {
    return true
  }

  const permissions = userStore.userInfo.permissions || []
  return permissions.includes(permissionCode)
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
        query: { redirect: to.fullPath },
      })
      return
    }

    if (authenticated && to.path === '/login') {
      next('/home')
      return
    }

    if (to.meta.permission && !checkPermission(to.meta.permission as string)) {
      next('/home')
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
