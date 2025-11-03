<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="about">
    <h1>关于我们</h1>
    <div class="content">
      <p>这是一个使用 Vue 3 + TypeScript + Vite + Vue Router 构建的现代化项目。</p>
      <h2>技术栈</h2>
      <ul>
        <li>Vue 3 - 渐进式 JavaScript 框架</li>
        <li>TypeScript - 类型安全的 JavaScript</li>
        <li>Vite - 下一代前端构建工具</li>
        <li>Vue Router - 官方路由管理库</li>
        <li>Pinia - 状态管理</li>
        <li>Element Plus - UI 组件库</li>
      </ul>
      <h2>最佳实践</h2>
      <ul>
        <li>✅ 动态导入实现代码分割</li>
        <li>✅ 路由元数据管理</li>
        <li>✅ 全局导航守卫</li>
        <li>✅ TypeScript 类型安全</li>
        <li>✅ 组件懒加载</li>
      </ul>
    </div>
    <button @click="goBack" class="back-btn">返回首页</button>
  </div>
</template>

<style scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 2rem;
}

h2 {
  color: #555;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.content {
  line-height: 1.8;
  color: #666;
}

ul {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

li {
  margin-bottom: 0.5rem;
}

.back-btn {
  margin-top: 2rem;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  border: 1px solid transparent;
  background-color: #1e90ff;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background-color: #1873cc;
}
</style>
