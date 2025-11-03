/**
 * 路由守卫集合
 * 最佳实践：将守卫逻辑分离到独立文件，提高代码可维护性
 */
import type { Router, RouteLocationNormalized } from 'vue-router'

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
  // 这里应该从状态管理或 localStorage 获取认证状态
  // const token = localStorage.getItem('token')
  // return !!token

  // 示例实现
  return true
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
   * 执行顺序：beforeEach -> 组件内 beforeRouteUpdate -> afterEach
   */
  router.beforeEach((to, _from, next) => {
    // 1. 设置页面标题
    setPageTitle(to)

    // 2. 权限检查
    if (to.meta.requiresAuth && !isAuthenticated()) {
      // 未认证，重定向到登录页
      next('/login')
      return
    }

    // 3. 角色权限检查
    if (to.meta.roles && !checkPermission(to.meta.roles as string[])) {
      // 无权限，重定向到 403 页面
      next('/403')
      return
    }

    // 4. 继续导航
    next()
  })

  /**
   * 全局后置钩子
   * 用于关闭加载状态、记录日志等
   */
  router.afterEach((to, from) => {
    // 关闭加载状态
    // NProgress.done()

    // 记录页面访问日志
    console.log(`Navigated from ${from.path} to ${to.path}`)
  })

  /**
   * 路由错误处理
   */
  router.onError((error) => {
    console.error('Router error:', error)
  })
}
