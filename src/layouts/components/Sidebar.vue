<template>
  <el-aside :width="sidebarWidth" class="app-sidebar">
    <div class="sidebar-container">
      <!-- Logo 区域 -->
      <div class="sidebar-logo" :class="{ collapsed: isCollapsed }">
        <router-link to="/home" class="logo-link">
          <img
            src="/lychee.svg"
            alt="Logo"
            class="logo-image"
            :class="{ collapsed: isCollapsed }"
          />
          <transition name="fade">
            <div v-if="!isCollapsed" class="logo-text">
              <div class="logo-main">深大校友录</div>
              <div class="logo-sub">ALUMNI SYSTEM</div>
            </div>
          </transition>
        </router-link>
      </div>

      <!-- 导航菜单 -->
      <el-scrollbar class="sidebar-menu-wrapper">
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapsed"
          :unique-opened="true"
          :collapse-transition="false"
          router
          class="sidebar-menu"
        >
          <!-- 首页 -->
          <el-menu-item index="/home">
            <el-icon><HomeFilled /></el-icon>
            <template #title>首页</template>
          </el-menu-item>

          <!-- 信息管理 -->
          <el-sub-menu
            v-if="
              hasPermission('college:page') ||
              hasPermission('class') ||
              hasPermission('alumni:page') ||
              hasPermission('user:page') ||
              hasPermission('post:page')
            "
            index="data-management"
          >
            <template #title>
              <el-icon><DataAnalysis /></el-icon>
              <span>信息管理</span>
            </template>
            <el-menu-item
              v-if="hasPermission('college:page')"
              index="/college-management"
            >
              <el-icon><School /></el-icon>
              <template #title>学院管理</template>
            </el-menu-item>
            <el-menu-item
              v-if="hasPermission('class')"
              index="/class-management"
            >
              <el-icon><Grid /></el-icon>
              <template #title>班级管理</template>
            </el-menu-item>
            <el-menu-item
              v-if="hasPermission('alumni:page')"
              index="/alumni-management"
            >
              <el-icon><Postcard /></el-icon>
              <template #title>校友档案管理</template>
            </el-menu-item>
            <el-menu-item
              v-if="hasPermission('user:page')"
              index="/user-management"
            >
              <el-icon><User /></el-icon>
              <template #title>用户管理</template>
            </el-menu-item>
            <el-menu-item
              v-if="hasPermission('post:page')"
              index="/post-management"
            >
              <el-icon><ChatLineSquare /></el-icon>
              <template #title>帖子管理</template>
            </el-menu-item>
          </el-sub-menu>

          <!-- 系统管理 -->
          <el-sub-menu
            v-if="
              hasPermission('admin-user:page') ||
              hasPermission('role:page') ||
              hasPermission('permission:page') ||
              hasPermission('dict:page')
            "
            index="system-management"
          >
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item
              v-if="hasPermission('admin-user:page')"
              index="/admin-management"
            >
              <el-icon><UserFilled /></el-icon>
              <template #title>管理员管理</template>
            </el-menu-item>
            <el-menu-item
              v-if="hasPermission('role:page')"
              index="/role-management"
            >
              <el-icon><Management /></el-icon>
              <template #title>角色管理</template>
            </el-menu-item>
            <el-menu-item
              v-if="hasPermission('permission:page')"
              index="/permission-management"
            >
              <el-icon><Key /></el-icon>
              <template #title>权限管理</template>
            </el-menu-item>
            <el-menu-item
              v-if="hasPermission('dict:page')"
              index="/dict-management"
            >
              <el-icon><Notebook /></el-icon>
              <template #title>字典管理</template>
            </el-menu-item>
          </el-sub-menu>

          <!-- 审核管理 -->
          <el-sub-menu
            v-if="
              hasPermission('auth:page') ||
              hasPermission('operation-log:page') ||
              hasPermission('post:moderation')
            "
            index="audit-management"
          >
            <template #title>
              <el-icon><Monitor /></el-icon>
              <span>审核管理</span>
            </template>
            <el-menu-item
              v-if="hasPermission('auth:page')"
              index="/authentication-management"
            >
              <el-icon><Checked /></el-icon>
              <template #title>认证管理</template>
            </el-menu-item>
            <el-menu-item
              v-if="hasPermission('post:moderation')"
              index="/post-moderation"
            >
              <el-icon><DocumentChecked /></el-icon>
              <template #title>帖子审核</template>
            </el-menu-item>
            <el-menu-item
              v-if="hasPermission('operation-log:page')"
              index="/operation-log-statistics"
            >
              <el-icon><Tickets /></el-icon>
              <template #title>操作日志</template>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>

      <!-- 折叠按钮 -->
      <div class="sidebar-toggle" @click="toggleCollapse">
        <el-icon class="toggle-icon">
          <DArrowLeft v-if="!isCollapsed" />
          <DArrowRight v-else />
        </el-icon>
      </div>
    </div>
  </el-aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  HomeFilled,
  School,
  Grid,
  Postcard,
  User,
  UserFilled,
  Management,
  Key,
  Notebook,
  DocumentChecked,
  Checked,
  DArrowLeft,
  DArrowRight,
  DataAnalysis,
  Setting,
  Monitor,
  ChatLineSquare,
  Tickets,
} from '@element-plus/icons-vue'
import { usePermission } from '@/stores'

interface Props {
  isCollapsed: boolean
}

interface Emits {
  (e: 'toggle'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const route = useRoute()
const { hasPermission } = usePermission()

// 侧边栏宽度
const sidebarWidth = computed(() => (props.isCollapsed ? '64px' : '200px'))

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 切换折叠状态
const toggleCollapse = () => {
  emit('toggle')
}
</script>

<style scoped>
.app-sidebar {
  height: 100vh;
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  transition: width 0.3s ease;
  overflow: hidden;
}

html.dark .app-sidebar {
  background-color: var(--sidebar-bg-dark);
  border-right-color: var(--border-color-dark);
}

.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* === Logo 区域 === */
.sidebar-logo {
  padding: 20px 16px;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

html.dark .sidebar-logo {
  border-bottom-color: var(--border-color-dark);
}

.sidebar-logo.collapsed {
  padding: 20px 12px;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  transition: opacity 0.3s;
}

.logo-link:hover {
  opacity: 0.8;
}

.logo-image {
  width: 64px;
  height: 64px;
  object-fit: contain;
  transition: all 0.3s ease;
}

.logo-image.collapsed {
  width: 40px;
  height: 40px;
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  white-space: nowrap;
}

.logo-main {
  font-size: 16px;
  font-weight: 700;
  color: #000000;
  line-height: 1.2;
}

html.dark .logo-main {
  color: #ffffff;
}

.logo-sub {
  font-size: 10px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.5);
  letter-spacing: 0.5px;
}

html.dark .logo-sub {
  color: rgba(255, 255, 255, 0.5);
}

/* === 菜单区域 === */
.sidebar-menu-wrapper {
  flex: 1;
  overflow-y: auto;
}

.sidebar-menu {
  border-right: none;
  background-color: transparent;
}

.sidebar-menu :deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
  margin: 4px 8px;
  border-radius: 8px;
  transition: all 0.3s;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: var(--menu-hover-bg);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: var(--menu-active-bg);
  color: var(--brand-primary);
  font-weight: 600;
}

.sidebar-menu :deep(.el-icon) {
  font-size: 18px;
}

/* 子菜单标题样式 */
.sidebar-menu :deep(.el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
  margin: 4px 8px;
  border-radius: 8px;
  transition: all 0.3s;
}

.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background-color: var(--menu-hover-bg);
}

/* 子菜单内容区域 */
.sidebar-menu :deep(.el-sub-menu .el-menu) {
  background-color: transparent;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item) {
  height: 44px;
  line-height: 44px;
  padding-left: 56px !important;
  font-size: 14px;
}

/* 展开的子菜单高亮 */
.sidebar-menu :deep(.el-sub-menu.is-opened > .el-sub-menu__title) {
  color: var(--brand-primary);
  font-weight: 600;
}

/* 折叠状态下的菜单 */
.sidebar-menu.el-menu--collapse {
  width: 64px;
}

.sidebar-menu.el-menu--collapse :deep(.el-menu-item) {
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* === 折叠按钮 === */
.sidebar-toggle {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s;
  color: var(--text-secondary);
}

html.dark .sidebar-toggle {
  border-top-color: var(--border-color-dark);
}

.sidebar-toggle:hover {
  background-color: var(--menu-hover-bg);
  color: var(--brand-primary);
}

.toggle-icon {
  font-size: 16px;
  transition: transform 0.3s;
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
  --sidebar-bg: #ffffff;
  --sidebar-bg-dark: #1a1a1a;
  --menu-hover-bg: rgba(0, 0, 0, 0.05);
  --menu-active-bg: rgba(153, 0, 51, 0.1);
}

html.dark {
  --menu-hover-bg: rgba(255, 255, 255, 0.05);
  --menu-active-bg: rgba(64, 158, 255, 0.15);
}
</style>
