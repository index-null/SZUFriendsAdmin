<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import ThemeToggle from './components/ThemeToggle.vue'
import SzuLogo from './components/SzuLogo.vue'

const route = useRoute()
const userStore = useUserStore()

// 判断是否显示导航栏（登录/注册页面不显示）
const showNavbar = computed(() => !route.meta.hideNavbar)

// 检查是否有学院管理权限
const hasCollegePermission = computed(() => {
  if (userStore.isAdmin) return true
  return userStore.userInfo.permissions?.includes('college:page') || false
})
</script>

<template>
  <div id="app">
    <!-- 导航栏 - 仅在非登录/注册页面显示 -->
    <nav v-if="showNavbar" class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <router-link to="/home" class="brand-link">
            <SzuLogo :size="128" variant="navbar" />
            <span class="brand-text">校友录管理后台</span>
          </router-link>
        </div>
        <ul class="nav-menu">
          <li>
            <router-link to="/home" :class="{ active: route.name === 'Home' }">
              首页
            </router-link>
          </li>
          <li v-if="hasCollegePermission">
            <router-link
              to="/college-management"
              :class="{ active: route.name === 'CollegeManagement' }"
            >
              学院管理
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
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
  width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

html.dark .navbar {
  background-color: #1a1a1a;
  border-bottom: 1px solid #333;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  width: 100%;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #2c3e50;
  text-decoration: none;
  transition: all 0.3s;
}

html.dark .brand-link {
  color: #e5e7eb;
}

.brand-link:hover {
  opacity: 0.8;
}

.brand-text {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #990033;
}

html.dark .brand-text {
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
  transition: all 0.3s;
  position: relative;
  padding: 8px 16px;
  border-radius: 6px;
}

html.dark .nav-menu a {
  color: #9ca3af;
}

.nav-menu a:hover {
  color: #990033;
  background-color: rgba(153, 0, 51, 0.05);
}

html.dark .nav-menu a:hover {
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
}

.nav-menu a.active {
  color: #990033;
  background-color: rgba(153, 0, 51, 0.1);
  font-weight: 600;
}

html.dark .nav-menu a.active {
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.15);
}

.nav-menu a.active::after {
  content: '';
  position: absolute;
  bottom: 0px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #990033;
  border-radius: 2px 2px 0 0;
}

html.dark .nav-menu a.active::after {
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
