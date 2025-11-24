<template>
  <el-container class="app-container">
    <!-- 侧边栏 -->
    <Sidebar :is-collapsed="isCollapsed" @toggle="toggleSidebar" />

    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 顶部栏 -->
      <Header :is-collapsed="isCollapsed" @toggle-sidebar="toggleSidebar" />

      <!-- 内容区 -->
      <el-main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'

const route = useRoute()

// 侧边栏折叠状态
const isCollapsed = ref(false)

// 切换侧边栏
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  // 持久化到 localStorage
  localStorage.setItem('sidebar-collapsed', String(isCollapsed.value))
}

// 从 localStorage 恢复状态
onMounted(() => {
  const savedState = localStorage.getItem('sidebar-collapsed')
  if (savedState !== null) {
    isCollapsed.value = savedState === 'true'
  }
})
</script>

<style scoped>
.app-container {
  height: 100vh;
  overflow: hidden;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-main {
  flex: 1;
  overflow-y: auto;
  background-color: var(--main-bg);
  padding: 20px;
}

html.dark .app-main {
  background-color: var(--main-bg-dark);
}

/* === 过渡动画 === */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* === CSS 变量 === */
:root {
  --main-bg: #f5f5f5;
  --main-bg-dark: #0a0a0a;
}
</style>
