import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { setupRouterGuards } from './guards'

// 页面组件 - 使用动态导入实现代码分割
const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')
const Home = () => import('../views/Home.vue')
const CollegeManagement = () => import('../views/CollegeManagement/index.vue')
const ClassManagement = () => import('../views/ClassManagement/index.vue')
const AlumniManagement = () => import('../views/AlumniManagement/index.vue')
const UserManagement = () => import('../views/UserManagement/index.vue')
const AdminManagement = () => import('../views/AdminManagement/index.vue')
const RoleManagement = () => import('../views/RoleManagement/index.vue')
const PermissionManagement = () =>
  import('../views/PermissionManagement/index.vue')
const DictManagement = () => import('../views/DictManagement/index.vue')
const OperationLogStatistics = () =>
  import('../views/OperationLogStatistics/index.vue')
const AuthenticationManagement = () =>
  import('../views/AuthenticationManagement/index.vue')
const PostManagement = () => import('../views/PostManagement/index.vue')
const PostModeration = () => import('../views/PostModeration/index.vue')
const Profile = () => import('../views/Profile/index.vue')
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
  // 根路径重定向到登录页
  {
    path: '/',
    redirect: '/login',
  },
  // 登录页
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      requiresAuth: false,
      hideNavbar: true,
    },
  },
  // 注册页
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      title: '注册',
      requiresAuth: false,
      hideNavbar: true,
    },
  },
  // 首页
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页',
      requiresAuth: true,
      showInMenu: true,
    },
  },
  // 学院管理
  {
    path: '/college-management',
    name: 'CollegeManagement',
    component: CollegeManagement,
    meta: {
      title: '学院管理',
      requiresAuth: true,
      permission: 'college:page',
      showInMenu: true,
    },
  },
  // 班级管理
  {
    path: '/class-management',
    name: 'ClassManagement',
    component: ClassManagement,
    meta: {
      title: '班级管理',
      requiresAuth: true,
      permission: 'class', // 需要 class 权限
      showInMenu: true,
    },
  },
  // 校友档案管理
  {
    path: '/alumni-management',
    name: 'AlumniManagement',
    component: AlumniManagement,
    meta: {
      title: '校友档案管理',
      requiresAuth: true,
      permission: 'alumni:page',
      showInMenu: true,
    },
  },
  // 用户管理
  {
    path: '/user-management',
    name: 'UserManagement',
    component: UserManagement,
    meta: {
      title: '用户管理',
      requiresAuth: true,
      permission: 'user:page',
      showInMenu: true,
    },
  },
  // 管理员管理
  {
    path: '/admin-management',
    name: 'AdminManagement',
    component: AdminManagement,
    meta: {
      title: '管理员管理',
      requiresAuth: true,
      permission: 'admin-user:page',
      showInMenu: true,
    },
  },
  // 角色管理
  {
    path: '/role-management',
    name: 'RoleManagement',
    component: RoleManagement,
    meta: {
      title: '角色管理',
      requiresAuth: true,
      permission: 'role:page',
      showInMenu: true,
    },
  },
  // 权限管理
  {
    path: '/permission-management',
    name: 'PermissionManagement',
    component: PermissionManagement,
    meta: {
      title: '权限管理',
      requiresAuth: true,
      permission: 'permission:page',
      showInMenu: true,
    },
  },
  // 字典管理
  {
    path: '/dict-management',
    name: 'DictManagement',
    component: DictManagement,
    meta: {
      title: '字典管理',
      requiresAuth: true,
      permission: 'dict:page',
      showInMenu: true,
    },
  },
  // 操作日志统计
  {
    path: '/operation-log-statistics',
    name: 'OperationLogStatistics',
    component: OperationLogStatistics,
    meta: {
      title: '操作日志统计',
      requiresAuth: true,
      permission: 'operation-log:page',
      showInMenu: true,
    },
  },
  // 认证管理
  {
    path: '/authentication-management',
    name: 'AuthenticationManagement',
    component: AuthenticationManagement,
    meta: {
      title: '认证管理',
      requiresAuth: true,
      permission: 'auth:page',
      showInMenu: true,
    },
  },
  // 帖子管理
  {
    path: '/post-management',
    name: 'PostManagement',
    component: PostManagement,
    meta: {
      title: '帖子管理',
      requiresAuth: true,
      permission: 'post:page',
      showInMenu: true,
    },
  },
  // 帖子审核
  {
    path: '/post-moderation',
    name: 'PostModeration',
    component: PostModeration,
    meta: {
      title: '帖子审核',
      requiresAuth: true,
      permission: 'post:moderation',
      showInMenu: true,
    },
  },
  // 个人资料
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: {
      title: '个人资料',
      requiresAuth: true,
      showInMenu: false, // 不在侧边栏显示
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
