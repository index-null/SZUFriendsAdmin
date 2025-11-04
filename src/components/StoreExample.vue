<template>
  <div class="store-example">
    <!-- 用户 Store 示例 -->
    <section class="section">
      <h2>用户 Store 示例</h2>
      <div class="card">
        <p v-if="!userStore.isLoggedIn" class="info">未登录</p>
        <div v-else class="user-info">
          <p><strong>用户名:</strong> {{ userStore.userName }}</p>
          <p><strong>邮箱:</strong> {{ userStore.userInfo.email }}</p>
          <p><strong>角色:</strong> {{ userStore.userInfo.role }}</p>
          <p v-if="userStore.isAdmin" class="admin-badge">✓ 管理员</p>
        </div>

        <div class="button-group">
          <button
            v-if="!userStore.isLoggedIn"
            @click="handleLogin"
            :disabled="userStore.loading"
          >
            {{ userStore.loading ? '登录中...' : '登录' }}
          </button>
          <button v-else @click="userStore.logout">登出</button>
          <button
            v-if="userStore.isLoggedIn"
            @click="handleUpdateProfile"
          >
            更新资料
          </button>
        </div>
      </div>
    </section>

    <!-- 应用 Store 示例 -->
    <section class="section">
      <h2>应用 Store 示例</h2>
      <div class="card">
        <div class="theme-control">
          <p><strong>当前主题:</strong> {{ appStore.theme }}</p>
          <button @click="appStore.toggleTheme">
            切换主题 ({{ appStore.isDarkMode ? '深色' : '浅色' }})
          </button>
        </div>

        <div class="sidebar-control">
          <p><strong>侧边栏:</strong> {{ appStore.sidebarCollapsed ? '已折叠' : '已展开' }}</p>
          <button @click="appStore.toggleSidebar">
            {{ appStore.sidebarCollapsed ? '展开' : '折叠' }}侧边栏
          </button>
        </div>

        <div class="notification-control">
          <p><strong>通知数量:</strong> {{ appStore.notificationCount }}</p>
          <button @click="addTestNotification('success')">成功通知</button>
          <button @click="addTestNotification('error')">错误通知</button>
          <button @click="addTestNotification('warning')">警告通知</button>
          <button @click="appStore.clearNotifications">清空通知</button>
        </div>

        <div v-if="appStore.notifications.length > 0" class="notifications">
          <h4>通知列表:</h4>
          <div
            v-for="notification in appStore.notifications"
            :key="notification.id"
            :class="['notification', notification.type]"
          >
            <span>{{ notification.message }}</span>
            <button @click="appStore.removeNotification(notification.id)">×</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 计数器 Store 示例 -->
    <section class="section">
      <h2>计数器 Store 示例</h2>
      <div class="card">
        <div class="counter-display">
          <p class="counter-value">{{ counterStore.count }}</p>
          <p class="counter-info">
            <span>翻倍: {{ counterStore.doubled }}</span>
            <span>{{ counterStore.isEven ? '偶数' : '奇数' }}</span>
          </p>
        </div>

        <div class="button-group">
          <button @click="counterStore.increment">+1</button>
          <button @click="counterStore.decrement">-1</button>
          <button @click="counterStore.reset">重置</button>
          <button @click="counterStore.setCount(10)">设置为 10</button>
        </div>

        <div v-if="counterStore.history.length > 0" class="history">
          <p><strong>历史记录 ({{ counterStore.historyLength }}):</strong></p>
          <p class="history-values">{{ counterStore.history.join(' → ') }}</p>
          <button @click="counterStore.clearHistory">清空历史</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useUserStore, useAppStore, useCounterStore } from '@/stores'

const userStore = useUserStore()
const appStore = useAppStore()
const counterStore = useCounterStore()

const handleLogin = async () => {
  const success = await userStore.login('user@example.com', 'password')
  if (success) {
    appStore.addNotification('登录成功！', 'success')
  } else {
    appStore.addNotification('登录失败，请重试', 'error')
  }
}

const handleUpdateProfile = () => {
  userStore.updateProfile({
    name: '李四',
    email: 'li@example.com'
  })
  appStore.addNotification('资料已更新', 'success')
}

const addTestNotification = (type: 'success' | 'error' | 'warning' | 'info') => {
  const messages = {
    success: '操作成功！',
    error: '发生错误！',
    warning: '请注意！',
    info: '提示信息'
  }
  appStore.addNotification(messages[type], type)
}
</script>

<style scoped>
.store-example {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.section {
  margin-bottom: 30px;
}

.section h2 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.card {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
}

.info {
  color: #6c757d;
  font-style: italic;
}

.user-info {
  margin-bottom: 15px;
}

.user-info p {
  margin: 8px 0;
}

.admin-badge {
  color: #28a745;
  font-weight: bold;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 15px;
}

button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

button:hover:not(:disabled) {
  background: #0056b3;
}

button:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.theme-control,
.sidebar-control,
.notification-control {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #dee2e6;
}

.theme-control:last-child,
.sidebar-control:last-child,
.notification-control:last-child {
  border-bottom: none;
}

.theme-control p,
.sidebar-control p,
.notification-control p {
  margin-bottom: 10px;
}

.notifications {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #dee2e6;
}

.notifications h4 {
  margin-bottom: 10px;
}

.notification {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 4px;
  background: white;
  border-left: 4px solid #6c757d;
}

.notification.success {
  border-left-color: #28a745;
  background: #d4edda;
}

.notification.error {
  border-left-color: #dc3545;
  background: #f8d7da;
}

.notification.warning {
  border-left-color: #ffc107;
  background: #fff3cd;
}

.notification.info {
  border-left-color: #17a2b8;
  background: #d1ecf1;
}

.notification button {
  background: none;
  color: inherit;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.counter-display {
  text-align: center;
  margin-bottom: 20px;
}

.counter-value {
  font-size: 48px;
  font-weight: bold;
  color: #007bff;
  margin: 0;
}

.counter-info {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
  color: #6c757d;
}

.history {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #dee2e6;
}

.history p {
  margin: 8px 0;
}

.history-values {
  background: white;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  overflow-x: auto;
  word-break: break-all;
}
</style>
