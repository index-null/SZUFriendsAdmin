<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ThemeToggle from './components/ThemeToggle.vue'

const route = useRoute()

// 判断是否显示导航栏（登录/注册页面不显示）
const showNavbar = computed(() => !route.meta.hideNavbar)
</script>

<template>
  <div id="app">
    <!-- 导航栏 - 仅在非登录/注册页面显示 -->
    <nav v-if="showNavbar" class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <router-link to="/home" class="brand-link">深大校友录管理后台</router-link>
        </div>
        <ul class="nav-menu">
          <li>
            <router-link to="/home" :class="{ active: route.name === 'Home' }">
              首页
            </router-link>
          </li>
        </ul>
      </div>
    </nav>

    <!-- 路由视图 -->
    <main :class="['main-content', { 'no-navbar': !showNavbar }]">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

    <!-- 全局主题切换按钮 -->
    <ThemeToggle />
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.navbar {
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
}

html.dark .navbar {
  background-color: #1a1a1a;
  border-bottom: 1px solid #333;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  width: 100%;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.brand-link {
  color: #333;
  text-decoration: none;
  transition: color 0.3s;
}

html.dark .brand-link {
  color: #e5e7eb;
}

.brand-link:hover {
  color: #409eff;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

.nav-menu a {
  color: #606266;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  position: relative;
}

html.dark .nav-menu a {
  color: #9ca3af;
}

.nav-menu a:hover {
  color: #409eff;
}

.nav-menu a.active {
  color: #409eff;
}

.nav-menu a.active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #409eff;
}

.main-content {
  flex: 1;
  width: 100%;
  overflow-x: hidden;
}

.main-content.no-navbar {
  padding: 0;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
