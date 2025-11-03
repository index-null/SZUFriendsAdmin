import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { setupRouterGuards } from './guards'

// 页面组件 - 使用动态导入实现代码分割
const Home = () => import('../views/Home.vue')
const About = () => import('../views/About.vue')
const NotFound = () => import('../views/NotFound.vue')

/**
 * 路由配置
 * 最佳实践：
 * 1. 使用动态导入实现代码分割，提高首屏加载速度
 * 2. 路由按功能模块组织
 * 3. 使用 meta 字段存储路由元数据（标题、权限等）
 * 4. 统一的错误处理
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
      requiresAuth: false,
      showInMenu: true,
    },
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: {
      title: '关于我们',
      requiresAuth: false,
      showInMenu: true,
    },
  },
  // 404 路由 - 必须放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '页面未找到',
      showInMenu: false,
    },
  },
]

/**
 * 创建路由实例
 * 1. 使用 createWebHistory 实现 HTML5 History 模式
 * 2. 配置平滑滚动行为，导航键盘操作时可以指定滚动位置
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // 平滑滚动
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

/**
 * 路由守卫
 * 登陆验证，权限验证相关逻辑，对router进行设置
 */
setupRouterGuards(router)

export default router
