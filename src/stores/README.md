# Pinia Store 最佳实践指南

## 项目结构

```
stores/
├── index.ts              # Pinia 初始化和导出
├── modules/
│   ├── user.ts          # 用户相关状态
│   ├── app.ts           # 应用全局状态
│   └── counter.ts       # 计数器示例
└── README.md            # 本文件
```

## 核心概念

### 1. Composition API 风格（推荐）

使用 Composition API 风格定义 store，更接近 Vue 3 的开发体验：

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // State
  const userInfo = ref({ name: '', email: '' })
  
  // Computed
  const userName = computed(() => userInfo.value.name)
  
  // Actions
  const setUserInfo = (info) => {
    userInfo.value = info
  }
  
  return {
    userInfo,
    userName,
    setUserInfo
  }
})
```

### 2. 在组件中使用

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores'

const userStore = useUserStore()

// 直接访问状态
console.log(userStore.userInfo)

// 使用计算属性
console.log(userStore.userName)

// 调用 action
userStore.setUserInfo({ name: '张三', email: 'test@example.com' })
</script>

<template>
  <div>
    <p>{{ userStore.userName }}</p>
    <button @click="userStore.setUserInfo({ name: '李四', email: 'li@example.com' })">
      更新用户
    </button>
  </div>
</template>
```

## 最佳实践

### 1. Store 分文件管理

- 每个功能模块创建一个独立的 store 文件
- 在 `modules/` 目录下组织
- 在 `index.ts` 中统一导出

### 2. 命名规范

- Store 文件名使用小写：`user.ts`, `app.ts`
- Store 函数名使用 `use` 前缀：`useUserStore`, `useAppStore`
- Store ID 与文件名保持一致：`defineStore('user', ...)`

### 3. 状态设计

```typescript
// ✅ 好的做法
const userInfo = ref({ id: '', name: '', email: '' })
const isLoading = ref(false)
const error = ref<string | null>(null)

// ❌ 避免
const user = ref(null) // 类型不明确
const loading = ref(false) // 命名不够清晰
```

### 4. 异步操作

```typescript
const login = async (email: string, password: string) => {
  loading.value = true
  error.value = null
  
  try {
    const response = await api.login(email, password)
    setUserInfo(response.data)
    return true
  } catch (err) {
    error.value = err.message
    return false
  } finally {
    loading.value = false
  }
}
```

### 5. 计算属性

```typescript
// ✅ 使用 computed 派生状态
const isAdmin = computed(() => userInfo.value.role === 'admin')
const userName = computed(() => userInfo.value.name || '游客')

// ❌ 避免在 state 中存储可派生的数据
const isAdmin = ref(false) // 容易不同步
```

### 6. 持久化存储

```typescript
const setTheme = (newTheme: Theme) => {
  theme.value = newTheme
  // 保存到 localStorage
  localStorage.setItem('app-theme', newTheme)
}

const initTheme = () => {
  const saved = localStorage.getItem('app-theme')
  if (saved) {
    theme.value = saved as Theme
  }
}
```

## 常见模式

### 模式 1：用户认证

```typescript
export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const isLoggedIn = computed(() => !!userInfo.value)
  
  const login = async (credentials) => {
    const data = await api.login(credentials)
    userInfo.value = data
  }
  
  const logout = () => {
    userInfo.value = null
  }
  
  return { userInfo, isLoggedIn, login, logout }
})
```

### 模式 2：列表管理

```typescript
export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const loading = ref(false)
  
  const fetchProducts = async () => {
    loading.value = true
    try {
      products.value = await api.getProducts()
    } finally {
      loading.value = false
    }
  }
  
  const addProduct = (product) => {
    products.value.push(product)
  }
  
  return { products, loading, fetchProducts, addProduct }
})
```

### 模式 3：表单状态

```typescript
export const useFormStore = defineStore('form', () => {
  const formData = ref({
    name: '',
    email: '',
    message: ''
  })
  
  const errors = ref({})
  
  const updateField = (field: string, value: any) => {
    formData.value[field] = value
  }
  
  const resetForm = () => {
    formData.value = { name: '', email: '', message: '' }
    errors.value = {}
  }
  
  return { formData, errors, updateField, resetForm }
})
```

## 调试技巧

### 使用 Vue DevTools

1. 安装 Vue DevTools 浏览器扩展
2. 在 DevTools 中查看 Pinia 标签
3. 实时查看和修改状态
4. 查看 action 调用历史

### 在控制台调试

```typescript
// 在浏览器控制台中
import { useUserStore } from '@/stores'
const store = useUserStore()
console.log(store.$state) // 查看完整状态
store.$patch({ /* 部分更新 */ }) // 直接修改状态
store.$reset() // 重置为初始状态
```

## 性能优化

### 1. 避免过度订阅

```typescript
// ❌ 不好：订阅整个 store
watch(() => userStore.$state, () => { /* ... */ })

// ✅ 好：只订阅需要的属性
watch(() => userStore.userName, () => { /* ... */ })
```

### 2. 使用 storeToRefs

```typescript
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
// 解构时保持响应性
const { userInfo, userName } = storeToRefs(userStore)
```

### 3. 避免在 store 中存储大型对象

- 考虑使用分页或虚拟滚动
- 对于大型列表，使用索引而不是完整对象

## 常见问题

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

### Q: 如何重置 store？
A: 使用 `$reset()` 方法：
```typescript
userStore.$reset() // 重置为初始状态
```

## 参考资源

- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
