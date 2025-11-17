# Pinia 完整集成指南

## 📁 项目结构

```
src/stores/
├── index.ts                    # Pinia 初始化和导出
├── types.ts                    # TypeScript 类型定义
├── README.md                   # 基础文档
├── INTEGRATION_GUIDE.md        # 本文件
├── modules/                    # Store 模块
│   ├── user.ts                # 用户认证 store
│   ├── app.ts                 # 应用全局 store
│   └── counter.ts             # 计数器示例 store
├── plugins/                    # Pinia 插件
│   └── index.ts               # 日志、持久化、重置插件
└── composables/               # 组合函数
    └── index.ts               # 权限、通知、主题等组合函数
```

## 🚀 快速开始

### 1. 基础使用

```typescript
// 在组件中导入和使用 store
import { useUserStore } from '@/stores'

export default {
  setup() {
    const userStore = useUserStore()

    return {
      userStore,
    }
  },
}
```

### 2. 在 Vue 3 `<script setup>` 中使用

```vue
<script setup lang="ts">
import { useUserStore, useAppStore } from '@/stores'

const userStore = useUserStore()
const appStore = useAppStore()
</script>

<template>
  <div>
    <p>{{ userStore.userName }}</p>
    <button @click="userStore.logout">登出</button>
  </div>
</template>
```

### 3. 使用组合函数

```typescript
import { useAuth, usePermission } from '@/stores/composables'

const { isAuthenticated, login, logout } = useAuth()
const { canRead, canWrite } = usePermission()
```

## 📚 Store 模块详解

### User Store - 用户认证

**文件:** `modules/user.ts`

**功能:**

- 用户登录/登出
- 用户信息管理
- 权限检查

**使用示例:**

```typescript
const userStore = useUserStore()

// 登录
await userStore.login('user@example.com', 'password')

// 获取用户信息
console.log(userStore.userInfo)
console.log(userStore.userName)

// 检查权限
if (userStore.isAdmin) {
  // 管理员操作
}

// 更新资料
userStore.updateProfile({ name: '新名字' })

// 登出
userStore.logout()
```

### App Store - 应用全局状态

**文件:** `modules/app.ts`

**功能:**

- 主题切换
- 侧边栏状态
- 通知管理

**使用示例:**

```typescript
const appStore = useAppStore()

// 主题管理
appStore.toggleTheme()
appStore.setTheme('dark')
console.log(appStore.isDarkMode)

// 侧边栏
appStore.toggleSidebar()

// 通知
appStore.addNotification('操作成功', 'success', 3000)
appStore.removeNotification(notificationId)
appStore.clearNotifications()

// 初始化
appStore.initTheme()
```

### Counter Store - 计数器示例

**文件:** `modules/counter.ts`

**功能:**

- 计数操作
- 历史记录
- 派生状态

**使用示例:**

```typescript
const counterStore = useCounterStore()

// 操作
counterStore.increment()
counterStore.decrement()
counterStore.setCount(10)
counterStore.reset()

// 查看状态
console.log(counterStore.count)
console.log(counterStore.doubled)
console.log(counterStore.isEven)
console.log(counterStore.history)

// 清空历史
counterStore.clearHistory()
```

## 🔌 插件系统

### 日志插件

自动记录所有 state 变化和 action 调用。

```typescript
import { createLoggerPlugin } from '@/stores/plugins'

pinia.use(createLoggerPlugin())
```

**输出示例:**

```
[Pinia] Store "user" initialized {...}
[Pinia] user state changed: {...}
[Pinia] Action "login" called with args: [...]
[Pinia] Action "login" completed
```

### 持久化插件

自动保存和恢复状态到 localStorage。

```typescript
import { createPersistPlugin } from '@/stores/plugins'

pinia.use(
  createPersistPlugin({
    key: 'app-state',
    paths: ['theme', 'sidebarCollapsed'], // 只持久化这些字段
    storage: localStorage,
  }),
)
```

### 重置插件

为所有 store 添加 `$reset()` 方法。

```typescript
import { createResetPlugin } from '@/stores/plugins'

pinia.use(createResetPlugin())

// 使用
userStore.$reset() // 重置为初始状态
```

## 🎯 组合函数

### useAuth - 认证组合函数

```typescript
import { useAuth } from '@/stores/composables'

const { isAuthenticated, currentUser, isLoading, login, logout } = useAuth()

// 检查认证状态
if (isAuthenticated.value) {
  console.log(currentUser.value.name)
}

// 登录
await login('user@example.com', 'password')

// 登出
logout()
```

### usePermission - 权限检查

```typescript
import { usePermission } from '@/stores/composables'

const { hasPermission, canRead, canWrite, canDelete } = usePermission()

// 检查权限
if (canWrite.value) {
  // 显示编辑按钮
}

// 自定义权限检查
if (hasPermission('delete')) {
  // 显示删除按钮
}
```

### useNotificationWithUser - 通知组合函数

```typescript
import { useNotificationWithUser } from '@/stores/composables'

const { notifyUser, notifications } = useNotificationWithUser()

// 发送通知（自动添加用户名前缀）
notifyUser('操作成功', 'success')
```

### useThemeWithNotification - 主题切换

```typescript
import { useThemeWithNotification } from '@/stores/composables'

const { theme, isDarkMode, switchTheme } = useThemeWithNotification()

// 切换主题（自动发送通知）
switchTheme('dark')
```

## 💾 状态管理最佳实践

### 1. 状态设计原则

```typescript
// ✅ 好的做法
const userInfo = ref({
  id: '',
  name: '',
  email: '',
  role: 'user',
})
const isLoading = ref(false)
const error = ref<string | null>(null)

// ❌ 避免
const user = ref(null) // 类型不明确
const data = ref({}) // 命名不清晰
```

### 2. 异步操作模式

```typescript
const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await api.getData()
    data.value = response
    return true
  } catch (err) {
    error.value = err.message
    return false
  } finally {
    loading.value = false
  }
}
```

### 3. 计算属性使用

```typescript
// ✅ 使用 computed 派生状态
const isAdmin = computed(() => userInfo.value.role === 'admin')
const displayName = computed(() => userInfo.value.name || '游客')

// ❌ 避免在 state 中存储可派生的数据
const isAdmin = ref(false) // 容易不同步
```

### 4. 状态订阅

```typescript
// 订阅特定属性
watch(
  () => userStore.userName,
  (newName) => {
    console.log('用户名已更改:', newName)
  },
)

// 订阅整个 store
userStore.$subscribe((mutation, state) => {
  console.log('状态已更改:', mutation, state)
})

// 订阅 action
userStore.$onAction(({ name, args, after, onError }) => {
  console.log(`Action ${name} called`)
  after(() => console.log(`Action ${name} completed`))
  onError((error) => console.error(`Action ${name} failed:`, error))
})
```

## 🔄 常见场景

### 场景 1: 用户登录流程

```typescript
import { useAuth } from '@/stores/composables'
import { useAppStore } from '@/stores'

const { login, isLoading } = useAuth()
const appStore = useAppStore()

const handleLogin = async (email: string, password: string) => {
  const success = await login(email, password)
  if (success) {
    appStore.addNotification('登录成功', 'success')
    // 导航到首页
  } else {
    appStore.addNotification('登录失败', 'error')
  }
}
```

### 场景 2: 列表数据管理

```typescript
export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchProducts = async () => {
    loading.value = true
    try {
      products.value = await api.getProducts()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const addProduct = (product) => {
    products.value.push(product)
  }

  const removeProduct = (id: string) => {
    const index = products.value.findIndex((p) => p.id === id)
    if (index > -1) {
      products.value.splice(index, 1)
    }
  }

  return { products, loading, error, fetchProducts, addProduct, removeProduct }
})
```

### 场景 3: 表单状态管理

```typescript
export const useFormStore = defineStore('form', () => {
  const formData = ref({
    name: '',
    email: '',
    message: '',
  })

  const errors = ref({})
  const isSubmitting = ref(false)

  const updateField = (field: string, value: any) => {
    formData.value[field] = value
    // 清除该字段的错误
    if (errors.value[field]) {
      delete errors.value[field]
    }
  }

  const submit = async () => {
    isSubmitting.value = true
    try {
      await api.submitForm(formData.value)
      resetForm()
      return true
    } catch (err) {
      errors.value = err.errors
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  const resetForm = () => {
    formData.value = { name: '', email: '', message: '' }
    errors.value = {}
  }

  return { formData, errors, isSubmitting, updateField, submit, resetForm }
})
```

## 🐛 调试技巧

### 1. Vue DevTools

1. 安装 Vue DevTools 浏览器扩展
2. 打开 DevTools → Vue 标签 → Pinia
3. 查看实时状态和 action 历史

### 2. 控制台调试

```typescript
// 在浏览器控制台中
import { useUserStore } from '@/stores'
const store = useUserStore()

// 查看完整状态
console.log(store.$state)

// 直接修改状态
store.$patch({ userInfo: { name: '新名字' } })

// 重置状态
store.$reset()

// 查看 store ID
console.log(store.$id)
```

### 3. 日志记录

启用日志插件后，所有操作都会被记录到控制台。

## ⚡ 性能优化

### 1. 避免过度订阅

```typescript
// ❌ 不好：订阅整个 store
watch(
  () => userStore.$state,
  () => {
    /* ... */
  },
)

// ✅ 好：只订阅需要的属性
watch(
  () => userStore.userName,
  () => {
    /* ... */
  },
)
```

### 2. 使用 storeToRefs

```typescript
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
// 解构时保持响应性
const { userInfo, userName } = storeToRefs(userStore)
```

### 3. 避免在 store 中存储大型对象

- 对于大型列表，使用分页
- 考虑使用虚拟滚动
- 使用索引而不是完整对象

## 📖 完整示例

查看 `src/components/StoreExample.vue` 获取完整的使用示例。

## 🔗 相关资源

- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [TypeScript 支持](https://pinia.vuejs.org/cookbook/typescript.html)

## ❓ 常见问题

### Q: 如何在 store 中使用路由？

A: 注入路由实例：

```typescript
import { useRouter } from 'vue-router'

export const useAppStore = defineStore('app', () => {
  const router = useRouter()

  const navigate = (path) => {
    router.push(path)
  }

  return { navigate }
})
```

### Q: 如何在 store 中使用 API？

A: 创建 API 服务层：

```typescript
import { api } from '@/services/api'

export const useUserStore = defineStore('user', () => {
  const fetchUser = async (id) => {
    return await api.getUser(id)
  }

  return { fetchUser }
})
```

### Q: 如何处理 store 之间的依赖？

A: 在 action 中使用其他 store：

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

### Q: 如何重置 store？

A: 使用 `$reset()` 方法：

```typescript
userStore.$reset() // 重置为初始状态
```

### Q: 如何持久化状态？

A: 使用持久化插件：

```typescript
import { createPersistPlugin } from '@/stores/plugins'

pinia.use(
  createPersistPlugin({
    paths: ['theme', 'sidebarCollapsed'],
  }),
)
```
