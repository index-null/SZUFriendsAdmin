# Pinia 快速参考

## 📦 导入

```typescript
// 导入 store
import { useUserStore, useAppStore, useCounterStore } from '@/stores'

// 导入组合函数
import {
  useAuth,
  usePermission,
  useNotificationWithUser,
} from '@/stores/composables'

// 导入类型
import type { UserInfo, Theme, Notification } from '@/stores/types'
```

## 🎯 基础操作

### 创建 Store

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMyStore = defineStore('myStore', () => {
  // State
  const count = ref(0)

  // Computed
  const doubled = computed(() => count.value * 2)

  // Actions
  const increment = () => count.value++

  return { count, doubled, increment }
})
```

### 使用 Store

```typescript
const myStore = useMyStore()

// 访问状态
console.log(myStore.count)

// 使用计算属性
console.log(myStore.doubled)

// 调用 action
myStore.increment()
```

## 🔄 状态操作

| 操作         | 代码                                        |
| ------------ | ------------------------------------------- |
| 访问状态     | `store.count`                               |
| 修改状态     | `store.count = 10`                          |
| 批量修改     | `store.$patch({ count: 10, name: 'test' })` |
| 重置状态     | `store.$reset()`                            |
| 获取完整状态 | `store.$state`                              |

## 📡 订阅

```typescript
// 订阅状态变化
store.$subscribe((mutation, state) => {
  console.log('状态已变化', mutation, state)
})

// 订阅 action
store.$onAction(({ name, args, after, onError }) => {
  console.log(`Action ${name} called`)
  after(() => console.log(`Action ${name} completed`))
  onError((error) => console.error(`Action ${name} failed`, error))
})
```

## 🎨 User Store

```typescript
const userStore = useUserStore()

// 状态
userStore.userInfo // 用户信息
userStore.isLoggedIn // 是否登录
userStore.loading // 加载状态

// 计算属性
userStore.userName // 用户名
userStore.isAdmin // 是否管理员

// 方法
await userStore.login(email, password)
userStore.logout()
userStore.setUserInfo(info)
userStore.updateProfile(updates)
```

## 🌍 App Store

```typescript
const appStore = useAppStore()

// 状态
appStore.theme // 主题
appStore.sidebarCollapsed // 侧边栏状态
appStore.notifications // 通知列表

// 计算属性
appStore.isDarkMode // 是否深色模式
appStore.notificationCount // 通知数量

// 方法
appStore.toggleTheme()
appStore.setTheme('dark')
appStore.toggleSidebar()
appStore.addNotification(message, type, duration)
appStore.removeNotification(id)
appStore.clearNotifications()
appStore.initTheme()
```

## 🔢 Counter Store

```typescript
const counterStore = useCounterStore()

// 状态
counterStore.count // 计数值
counterStore.history // 历史记录

// 计算属性
counterStore.doubled // 翻倍值
counterStore.isEven // 是否偶数
counterStore.historyLength // 历史长度

// 方法
counterStore.increment()
counterStore.decrement()
counterStore.reset()
counterStore.setCount(value)
counterStore.clearHistory()
```

## 🔐 权限检查

```typescript
const { hasPermission, canRead, canWrite, canDelete } = usePermission()

if (canWrite.value) {
  // 显示编辑按钮
}

if (hasPermission('delete')) {
  // 显示删除按钮
}
```

## 🔑 认证

```typescript
const { isAuthenticated, currentUser, isLoading, login, logout } = useAuth()

if (isAuthenticated.value) {
  console.log(currentUser.value.name)
}

await login(email, password)
logout()
```

## 📢 通知

```typescript
const appStore = useAppStore()

// 成功通知
appStore.addNotification('操作成功', 'success')

// 错误通知
appStore.addNotification('操作失败', 'error')

// 警告通知
appStore.addNotification('请注意', 'warning')

// 信息通知
appStore.addNotification('提示信息', 'info')

// 自定义时长（毫秒）
appStore.addNotification('消息', 'success', 5000)

// 移除通知
appStore.removeNotification(notificationId)

// 清空所有通知
appStore.clearNotifications()
```

## 🎯 常用模式

### 异步操作

```typescript
const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    data.value = await api.getData()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
```

### 派生状态

```typescript
const isAdmin = computed(() => userInfo.value.role === 'admin')
const displayName = computed(() => userInfo.value.name || '游客')
```

### 状态持久化

```typescript
const setTheme = (theme: Theme) => {
  themeValue.value = theme
  localStorage.setItem('app-theme', theme)
}

const initTheme = () => {
  const saved = localStorage.getItem('app-theme')
  if (saved) themeValue.value = saved as Theme
}
```

### Store 间通信

```typescript
export const useUserStore = defineStore('user', () => {
  const appStore = useAppStore()

  const login = async (credentials) => {
    try {
      // 登录逻辑
      appStore.addNotification('登录成功', 'success')
    } catch (error) {
      appStore.addNotification('登录失败', 'error')
    }
  }

  return { login }
})
```

## 🛠️ 调试

```typescript
// 在浏览器控制台
import { useUserStore } from '@/stores'
const store = useUserStore()

// 查看状态
console.log(store.$state)

// 修改状态
store.$patch({ count: 10 })

// 重置状态
store.$reset()

// 查看 store ID
console.log(store.$id)
```

## 📝 Vue 组件中使用

### Options API

```typescript
import { useUserStore } from '@/stores'

export default {
  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
}
```

### Composition API (推荐)

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores'

const userStore = useUserStore()
</script>

<template>
  <div>{{ userStore.userName }}</div>
</template>
```

## 🔗 文件位置

| 文件                          | 说明            |
| ----------------------------- | --------------- |
| `stores/index.ts`             | Pinia 初始化    |
| `stores/types.ts`             | TypeScript 类型 |
| `stores/modules/user.ts`      | 用户 store      |
| `stores/modules/app.ts`       | 应用 store      |
| `stores/modules/counter.ts`   | 计数器 store    |
| `stores/plugins/index.ts`     | 插件            |
| `stores/composables/index.ts` | 组合函数        |
| `stores/README.md`            | 详细文档        |
| `stores/INTEGRATION_GUIDE.md` | 集成指南        |

## 💡 最佳实践

✅ **做这些:**

- 使用 Composition API 风格定义 store
- 为每个功能创建独立的 store
- 使用 TypeScript 类型
- 在 action 中处理异步操作
- 使用 computed 派生状态
- 为 store 添加清晰的文档

❌ **避免这些:**

- 在 state 中存储可派生的数据
- 直接修改 state（使用 action）
- 创建过大的 store
- 忽视类型检查
- 在 state 中存储大型对象
- 过度订阅状态变化
