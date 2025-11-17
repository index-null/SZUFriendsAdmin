# Vue Router 最佳实践指南

## 📋 目录结构

```
src/
├── router/
│   ├── index.ts           # 主路由配置
│   ├── types.ts           # TypeScript 类型定义
│   ├── guards.ts          # 路由守卫
│   ├── utils.ts           # 工具函数
│   └── modules/           # 路由模块（按功能分离）
│       └── example.ts
├── views/                 # 页面组件
│   ├── Home.vue
│   ├── About.vue
│   └── NotFound.vue
├── layouts/               # 布局组件（可选）
├── components/            # 可复用组件
├── App.vue               # 根组件
└── main.ts               # 应用入口
```

## 🎯 核心最佳实践

### 1. 代码分割（Code Splitting）

使用动态导入实现路由级别的代码分割，提高首屏加载速度：

```typescript
// ✅ 推荐：动态导入
const Home = () => import('../views/Home.vue')
const About = () => import('../views/About.vue')

// ❌ 避免：静态导入
import Home from '../views/Home.vue'
import About from '../views/About.vue'
```

**优势：**

- 减少初始包体积
- 按需加载页面组件
- 提高首屏加载速度

### 2. 路由元数据管理

使用 `meta` 字段存储路由元数据，实现灵活的路由配置：

```typescript
const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: {
      title: '仪表板',
      requiresAuth: true,
      roles: ['admin', 'user'],
      icon: 'dashboard',
      showInMenu: true,
      keepAlive: true,
    },
  },
]
```

**常用元数据字段：**

- `title`: 页面标题
- `requiresAuth`: 是否需要认证
- `roles`: 所需角色
- `icon`: 菜单图标
- `showInMenu`: 是否在菜单显示
- `keepAlive`: 是否缓存组件

### 3. 路由守卫（Navigation Guards）

在 `guards.ts` 中集中管理所有守卫逻辑：

```typescript
// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 1. 设置页面标题
  setPageTitle(to)

  // 2. 权限检查
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
    return
  }

  // 3. 角色检查
  if (to.meta.roles && !checkPermission(to.meta.roles)) {
    next('/403')
    return
  }

  next()
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 关闭加载状态
  // 记录日志
})
```

**守卫执行顺序：**

1. `beforeEach` - 全局前置守卫
2. `beforeRouteUpdate` - 组件内守卫
3. `beforeEnter` - 路由独享守卫
4. `afterEach` - 全局后置钩子

### 4. 路由模块化

按功能模块分离路由配置，便于管理和扩展：

```typescript
// src/router/modules/user.ts
export const userRoutes: RouteRecordRaw[] = [
  {
    path: '/user',
    component: () => import('../../layouts/UserLayout.vue'),
    children: [
      {
        path: 'profile',
        component: () => import('../../views/user/Profile.vue'),
      },
    ],
  },
]

// src/router/index.ts
import { userRoutes } from './modules/user'

const routes = [...baseRoutes, ...userRoutes, ...adminRoutes]
```

### 5. 类型安全

使用 TypeScript 定义路由元数据类型：

```typescript
// src/router/types.ts
export interface RouteMeta {
  title?: string
  requiresAuth?: boolean
  roles?: string[]
  icon?: string
  showInMenu?: boolean
}

declare module 'vue-router' {
  interface RouteMeta extends RouteMeta {}
}
```

### 6. 路由工具函数

提供常用的路由操作函数，简化组件逻辑：

```typescript
// 安全导航（防止重复导航）
safeNavigate(router, '/home')

// 获取查询参数
const page = getQueryParam(router, 'page')

// 设置查询参数
setQueryParams(router, { page: 2, sort: 'name' })
```

### 7. 平滑滚动行为

配置路由切换时的滚动行为：

```typescript
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 返回保存的位置
    if (savedPosition) {
      return savedPosition
    }
    // 返回顶部
    return { top: 0 }
  },
})
```

### 8. 路由过渡动画

使用 `<transition>` 实现页面切换动画：

```vue
<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

### 9. 懒加载和预加载

```typescript
// 懒加载
const Home = () => import('../views/Home.vue')

// 带 Webpack 魔法注释的懒加载
const Home = () =>
  import(
    /* webpackChunkName: "home" */
    /* webpackPrefetch: true */
    '../views/Home.vue'
  )
```

### 10. 错误处理

```typescript
router.onError((error) => {
  console.error('Router error:', error)
  // 可以在这里上报错误到监控系统
})

// 在组件中处理导航失败
router.push(to).catch((error) => {
  if (error.type !== 'aborted') {
    console.error('Navigation failed:', error)
  }
})
```

## 📱 常见场景

### 场景 1：权限控制

```typescript
// 在守卫中检查权限
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const userStore = useUserStore()
    if (!userStore.isAuthenticated) {
      next('/login')
      return
    }

    if (to.meta.roles && !userStore.hasRole(to.meta.roles)) {
      next('/403')
      return
    }
  }
  next()
})
```

### 场景 2：动态路由

```typescript
// 根据用户权限动态添加路由
const addDynamicRoutes = (routes: RouteRecordRaw[]) => {
  routes.forEach((route) => {
    router.addRoute(route)
  })
}

// 在登录后调用
const handleLogin = async () => {
  const userStore = useUserStore()
  await userStore.login()
  const routes = await fetchUserRoutes()
  addDynamicRoutes(routes)
}
```

### 场景 3：路由参数验证

```typescript
// 在守卫中验证参数
router.beforeEach((to, from, next) => {
  if (to.params.id) {
    const id = parseInt(to.params.id as string)
    if (isNaN(id)) {
      next('/404')
      return
    }
  }
  next()
})
```

### 场景 4：页面缓存

```typescript
// 使用 keepAlive 缓存组件
const routes = [
  {
    path: '/list',
    component: () => import('../views/List.vue'),
    meta: { keepAlive: true },
  },
]

// 在 App.vue 中使用
<router-view v-slot="{ Component }">
      <keep-alive :include="cachedViews">
        <component :is="Component" />
      </keep-alive>
</router-view>
```

## 🚀 性能优化

### 1. 路由懒加载

```typescript
// 使用动态导入
const Home = () => import('../views/Home.vue')
```

### 2. 预加载关键路由

```typescript
// 在应用启动时预加载
const preloadRoutes = () => {
  import('../views/Home.vue')
  import('../views/About.vue')
}
```

### 3. 路由缓存

```typescript
// 使用 keep-alive 缓存组件
<keep-alive :include="['Home', 'List']">
  <router-view />
</keep-alive>
```

### 4. 虚拟滚动

对于列表页面，使用虚拟滚动提高性能。

## 🔍 调试技巧

### 1. 启用路由日志

```typescript
const router = createRouter({
  // ...
})

if (import.meta.env.DEV) {
  router.beforeEach((to, from, next) => {
    console.log(`Navigating from ${from.path} to ${to.path}`)
    next()
  })
}
```

### 2. 使用 Vue DevTools

安装 Vue DevTools 浏览器扩展，可以查看路由状态和导航历史。

### 3. 检查路由配置

```typescript
// 打印所有路由
console.log(router.getRoutes())
```

## ✅ 检查清单

- [ ] 使用动态导入实现代码分割
- [ ] 定义路由元数据类型
- [ ] 实现全局导航守卫
- [ ] 处理 404 路由
- [ ] 配置平滑滚动行为
- [ ] 添加路由过渡动画
- [ ] 实现权限控制
- [ ] 错误处理和日志
- [ ] 性能监控
- [ ] 文档和注释

## 📚 相关资源

- [Vue Router 官方文档](https://router.vuejs.org/)
- [Vue 3 文档](https://vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)

## 🤝 贡献

如有改进建议，欢迎提交 Issue 或 Pull Request。
