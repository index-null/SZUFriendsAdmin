<template>
  <el-header height="60px" class="app-header">
    <div class="header-left">
      <!-- 折叠按钮 -->
      <el-icon :size="38" class="collapse-btn" @click="emit('toggle-sidebar')">
        <Expand v-if="isCollapsed" />
        <Fold v-else />
      </el-icon>

      <!-- 面包屑 -->
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentRoute">{{
          currentRoute
        }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="header-right">
      <!-- 搜索按钮（预留） -->
      <el-tooltip content="搜索功能开发中" placement="bottom">
        <el-button circle :icon="Search" class="action-btn" />
      </el-tooltip>

      <!-- 通知按钮（预留） -->
      <el-tooltip content="通知功能开发中" placement="bottom">
        <el-badge :value="0" :max="99" :hidden="true">
          <el-button circle :icon="Bell" class="action-btn" />
        </el-badge>
      </el-tooltip>

      <!-- 主题切换 -->
      <ThemeToggle navbar-mode />

      <!-- 用户下拉菜单 -->
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-dropdown-trigger">
          <el-avatar :size="36" class="user-avatar">
            <el-icon><UserFilled /></el-icon>
          </el-avatar>
          <span class="username">{{
            userStore.userInfo.username || '用户'
          }}</span>
          <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
        </div>

        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item disabled class="user-info-header">
              <div class="user-info-content">
                <div class="user-display-name">
                  {{
                    userStore.userInfo.nickname || userStore.userInfo.username
                  }}
                </div>
                <el-tag v-if="userStore.isAdmin" size="small" type="danger"
                  >管理员</el-tag
                >
              </div>
            </el-dropdown-item>
            <el-dropdown-item divided command="profile">
              <el-icon><User /></el-icon>
              <span>个人资料</span>
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>
              <span>账号设置</span>
            </el-dropdown-item>
            <el-dropdown-item command="password">
              <el-icon><Lock /></el-icon>
              <span>修改密码</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Expand,
  Fold,
  Search,
  Bell,
  UserFilled,
  ArrowDown,
  User,
  Setting,
  Lock,
  SwitchButton,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores'
import ThemeToggle from '@/components/ThemeToggle.vue'

interface Props {
  isCollapsed: boolean
}

interface Emits {
  (e: 'toggle-sidebar'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 当前路由标题
const currentRoute = computed(() => {
  return route.meta.title as string | undefined
})

// 用户下拉菜单命令处理
const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      ElMessage.info('账号设置功能开发中...')
      break
    case 'password':
      ElMessage.info('修改密码功能开发中...')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        await userStore.logout()
        ElMessage.success('已退出登录')
        router.push('/login')
      } catch {
        // 用户取消
      }
      break
  }
}
</script>

<style scoped>
.app-header {
  background-color: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

html.dark .app-header {
  background-color: var(--header-bg-dark);
  border-bottom-color: var(--border-color-dark);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

/* === 左侧区域 === */
.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.collapse-btn {
  cursor: pointer;
  color: var(--text-primary);
  transition: all 0.3s;
  padding: 8px;
  border-radius: 6px;
}

.collapse-btn:hover {
  background-color: var(--hover-bg);
  color: var(--brand-primary);
  transform: scale(1.1);
}

/* 面包屑样式 */
:deep(.el-breadcrumb) {
  font-size: 14px;
}

:deep(.el-breadcrumb__item) {
  display: flex;
  align-items: center;
}

/* === 右侧区域 === */
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  background-color: transparent;
  border-color: var(--border-color);
  color: var(--text-primary);
  transition: all 0.3s;
}

.action-btn:hover {
  background-color: var(--hover-bg);
  border-color: var(--brand-primary);
  color: var(--brand-primary);
}

/* === 用户下拉菜单 === */
.user-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: transparent;
  border: 1px solid transparent;
}

.user-dropdown-trigger:hover {
  background-color: var(--hover-bg);
  border-color: var(--border-color);
}

.user-avatar {
  background: linear-gradient(135deg, #990033, #7a0028);
}

html.dark .user-avatar {
  background: linear-gradient(135deg, #409eff, #267de8);
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  font-size: 12px;
  color: var(--text-secondary);
  transition: transform 0.3s;
}

.user-dropdown-trigger:hover .dropdown-icon {
  transform: rotate(180deg);
}

/* === 用户下拉菜单项 === */
.user-info-header {
  padding: 12px 16px !important;
  cursor: default !important;
}

.user-info-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.user-display-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 14px;
}

:deep(.el-dropdown-menu__item .el-icon) {
  font-size: 16px;
}

/* === CSS 变量 === */
:root {
  --header-bg: #ffffff;
  --header-bg-dark: #1a1a1a;
  --hover-bg: rgba(153, 0, 51, 0.05);
}

html.dark {
  --hover-bg: rgba(64, 158, 255, 0.1);
}

/* === 响应式 === */
@media (max-width: 768px) {
  .username {
    display: none;
  }

  .header-left {
    gap: 12px;
  }

  .header-right {
    gap: 8px;
  }
}
</style>
