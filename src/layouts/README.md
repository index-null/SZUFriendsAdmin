# Layout 系统

本项目采用组件化的Layout系统，支持灵活切换不同的布局方案。

## 📁 目录结构

```
layouts/
├── components/           # 布局组件
│   ├── Sidebar.vue      # 侧边栏组件
│   └── Header.vue       # 顶部栏组件
├── DefaultLayout.vue    # 默认布局（侧边栏+顶栏）
├── index.ts            # 统一导出
└── README.md           # 本文档
```

## 🎯 当前布局

### DefaultLayout（侧边栏布局）

**布局结构：**

```
┌──────────────────────────────────┐
│ Sidebar │  Header                │
│         │  ────────────────────  │
│  Logo   │                        │
│         │                        │
│  导航    │      Main Content      │
│  菜单    │                        │
│         │                        │
│ [折叠]   │                        │
└──────────────────────────────────┘
```

**特性：**

- ✅ 左侧固定侧边栏（可折叠）
- ✅ 顶部导航栏（面包屑+用户操作）
- ✅ 折叠状态持久化（localStorage）
- ✅ 权限控制菜单显示
- ✅ 路由高亮
- ✅ 响应式设计

## 🔧 使用方式

### 在 App.vue 中使用

```vue
<script setup lang="ts">
import { DefaultLayout } from '@/layouts'
</script>

<template>
  <DefaultLayout v-if="useLayout" />
</template>
```

### 切换布局

未来如需切换布局，只需：

```vue
<!-- 方式1: 直接替换 -->
<TopNavLayout v-if="useLayout" />

<!-- 方式2: 动态切换 -->
<component :is="currentLayout" v-if="useLayout" />
```

## 📦 组件说明

### Sidebar.vue

**Props:**

- `isCollapsed: boolean` - 折叠状态

**Emits:**

- `toggle` - 切换折叠状态

**功能：**

- Logo区域（可折叠）
- 垂直导航菜单
- 权限控制
- 折叠按钮

### Header.vue

**Props:**

- `isCollapsed: boolean` - 侧边栏折叠状态

**Emits:**

- `toggle-sidebar` - 触发侧边栏切换

**功能：**

- 折叠/展开按钮
- 面包屑导航
- 搜索按钮（预留）
- 通知按钮（预留）
- 主题切换
- 用户下拉菜单

### DefaultLayout.vue

**功能：**

- 组合 Sidebar 和 Header
- 管理折叠状态
- 状态持久化
- 路由视图渲染

## 🎨 样式变量

全局CSS变量定义在 `App.vue` 中：

```css
:root {
  --brand-primary: #990033;
  --text-primary: #2c3e50;
  --border-color: #e5e7eb;
  /* ... */
}
```

各Layout组件使用这些变量保持一致性。

## 📱 响应式

- **Desktop (>768px)**: 侧边栏固定显示
- **Mobile (<768px)**: 用户名隐藏等优化

## 🚀 扩展建议

### 添加新布局

1. 创建新布局文件 `layouts/TopNavLayout.vue`
2. 在 `layouts/index.ts` 中导出
3. 在 `App.vue` 中使用

示例：

```typescript
// layouts/index.ts
export { default as DefaultLayout } from './DefaultLayout.vue'
export { default as TopNavLayout } from './TopNavLayout.vue'
```

### 布局切换方案

可以通过以下方式实现动态切换：

1. **用户设置**：在用户设置中添加布局选项
2. **角色配置**：不同角色使用不同布局
3. **路由配置**：特定路由使用特定布局

```typescript
// 示例：基于路由meta切换
const currentLayout = computed(() => {
  return route.meta.layout || 'DefaultLayout'
})
```

## 📝 最佳实践

1. **保持组件独立**：各Layout组件应独立可用
2. **CSS变量**：使用全局CSS变量保持一致性
3. **响应式**：考虑移动端适配
4. **性能优化**：避免不必要的重渲染
5. **可访问性**：添加适当的ARIA标签

## 🔗 相关文件

- `src/App.vue` - Layout使用入口
- `src/router/index.ts` - 路由配置
- `src/components/ThemeToggle.vue` - 主题切换组件
- `src/components/SzuLogo.vue` - Logo组件
