/**
 * 路由模块
 * 最佳实践：将路由按功能模块分离，便于管理和扩展
 * 
 * 使用方式：
 * 1. 在 src/router/modules 目录下创建模块文件
 * 2. 导出 RouteRecordRaw[] 类型的路由配置
 * 3. 在 src/router/index.ts 中导入并合并
 */
import type { RouteRecordRaw } from 'vue-router'

// 示例：用户模块路由
export const userRoutes: RouteRecordRaw[] = [
  // {
  //   path: '/user',
  //   name: 'UserLayout',
  //   component: () => import('../../layouts/UserLayout.vue'),
  //   meta: {
  //     title: '用户中心',
  //     requiresAuth: true,
  //   },
  //   children: [
  //     {
  //       path: 'profile',
  //       name: 'UserProfile',
  //       component: () => import('../../views/user/Profile.vue'),
  //       meta: {
  //         title: '个人资料',
  //         requiresAuth: true,
  //       },
  //     },
  //     {
  //       path: 'settings',
  //       name: 'UserSettings',
  //       component: () => import('../../views/user/Settings.vue'),
  //       meta: {
  //         title: '用户设置',
  //         requiresAuth: true,
  //       },
  //     },
  //   ],
  // },
]

// 示例：管理员模块路由
export const adminRoutes: RouteRecordRaw[] = [
  // {
  //   path: '/admin',
  //   name: 'AdminLayout',
  //   component: () => import('../../layouts/AdminLayout.vue'),
  //   meta: {
  //     title: '管理后台',
  //     requiresAuth: true,
  //     roles: ['admin'],
  //   },
  //   children: [
  //     {
  //       path: 'users',
  //       name: 'UserManagement',
  //       component: () => import('../../views/admin/UserManagement.vue'),
  //       meta: {
  //         title: '用户管理',
  //         requiresAuth: true,
  //         roles: ['admin'],
  //       },
  //     },
  //   ],
  // },
]
