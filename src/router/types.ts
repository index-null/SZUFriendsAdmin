/**
 * 路由元数据类型定义
 * 最佳实践：使用 TypeScript 定义路由元数据，提高类型安全性
 */
declare module 'vue-router' {
  interface RouteMeta {
    /** 页面标题 */
    title?: string
    /** 是否需要认证 */
    requiresAuth?: boolean
    /** 用户权限要求 */
    roles?: string[]
    /** 页面描述 */
    description?: string
    /** 是否在菜单中显示 */
    showInMenu?: boolean
    /** 菜单图标 */
    icon?: string
    /** 面包屑导航 */
    breadcrumb?: boolean
    /** 是否缓存组件 */
    keepAlive?: boolean
    /** 是否隐藏导航栏（登录/注册页使用） */
    hideNavbar?: boolean
  }
}
