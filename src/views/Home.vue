<template>
  <div class="home">
    <!-- 头部欢迎区 -->
    <div class="home-header">
      <el-card shadow="never" class="welcome-card">
        <div class="welcome-content">
          <div class="user-avatar-section">
            <el-avatar 
              :size="80" 
              :src="userStore.userInfo.avatar || undefined"
              class="user-avatar"
            >
              <template #default>
                <el-icon :size="40"><User /></el-icon>
              </template>
            </el-avatar>
          </div>
          <div class="user-info-section">
            <h1 class="welcome-title">
              欢迎回来，{{ userStore.userInfo.nickname || userStore.userInfo.username || '用户' }}！
            </h1>
            <div class="user-meta">
              <el-tag type="info" size="small">ID: {{ userStore.userInfo.userId || '-' }}</el-tag>
              <el-tag type="success" size="small">@{{ userStore.userInfo.username || '-' }}</el-tag>
              <el-tag v-if="userStore.isAdmin" type="danger" size="small">管理员</el-tag>
              <el-tag type="warning" size="small">在线</el-tag>
            </div>
          </div>
          <div class="logout-section">
            <el-button 
              type="danger" 
              :loading="logoutLoading"
              @click="handleLogout"
            >
              退出登录
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <div class="home-content">
      <!-- 用户详细信息 -->
      <el-row :gutter="20">
        <!-- 基本信息卡片 -->
        <el-col :xs="24" :md="12" :lg="8">
          <el-card shadow="hover" class="info-card">
            <template #header>
              <div class="card-header">
                <el-icon><UserFilled /></el-icon>
                <span>基本信息</span>
              </div>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="用户ID">
                {{ userStore.userInfo.userId || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="用户名">
                {{ userStore.userInfo.username || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="昵称">
                {{ userStore.userInfo.nickname || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="头像">
                <span v-if="userStore.userInfo.avatar">已设置</span>
                <span v-else class="text-muted">未设置</span>
              </el-descriptions-item>
              <el-descriptions-item label="登录状态">
                <el-tag type="success" size="small">已登录</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>

        <!-- Token 信息卡片 -->
        <el-col :xs="24" :md="12" :lg="8">
          <el-card shadow="hover" class="info-card">
            <template #header>
              <div class="card-header">
                <el-icon><Key /></el-icon>
                <span>Token 信息</span>
              </div>
            </template>
            <div class="token-section">
              <div class="token-label">访问令牌：</div>
              <el-input
                v-model="userStore.token"
                type="textarea"
                :rows="4"
                readonly
                resize="none"
                class="token-input"
              />
              <div class="token-actions">
                <el-button 
                  size="small" 
                  @click="copyToken"
                >
                  复制 Token
                </el-button>
                <el-button 
                  size="small" 
                  type="info"
                  @click="viewTokenPayload"
                >
                  解析 Token
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 权限信息卡片 -->
        <el-col :xs="24" :md="12" :lg="8">
          <el-card shadow="hover" class="info-card">
            <template #header>
              <div class="card-header">
                <el-icon><Lock /></el-icon>
                <span>权限信息</span>
              </div>
            </template>
            <div class="permission-section">
              <div class="permission-item">
                <div class="permission-label">角色列表：</div>
                <div class="permission-value">
                  <el-tag 
                    v-if="userStore.userInfo.roles && userStore.userInfo.roles.length > 0"
                    v-for="role in userStore.userInfo.roles" 
                    :key="role"
                    type="primary" 
                    size="small"
                    class="permission-tag"
                  >
                    {{ role }}
                  </el-tag>
                  <span v-else class="text-muted">暂无角色</span>
                </div>
              </div>
              <el-divider />
              <div class="permission-item">
                <div class="permission-label">权限列表：</div>
                <div class="permission-value">
                  <el-tag 
                    v-if="userStore.userInfo.permissions && userStore.userInfo.permissions.length > 0"
                    v-for="perm in userStore.userInfo.permissions" 
                    :key="perm"
                    type="success" 
                    size="small"
                    class="permission-tag"
                  >
                    {{ perm }}
                  </el-tag>
                  <span v-else class="text-muted">暂无权限</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 权限树展示 -->
      <el-row :gutter="20" class="tree-row">
        <el-col :span="24">
          <el-card shadow="hover" class="info-card">
            <template #header>
              <div class="card-header">
                <el-icon><Grid /></el-icon>
                <span>权限树结构</span>
                <el-button 
                  size="small" 
                  @click="expandAll = !expandAll"
                  class="expand-btn"
                >
                  {{ expandAll ? '收起全部' : '展开全部' }}
                </el-button>
              </div>
            </template>
            <div v-if="userStore.userInfo.permissionTree && userStore.userInfo.permissionTree.length > 0">
              <el-tree
                :data="userStore.userInfo.permissionTree"
                :props="treeProps"
                :default-expand-all="expandAll"
                node-key="id"
                highlight-current
              >
                <template #default="{ node, data }">
                  <div class="tree-node">
                    <el-icon v-if="data.permissionType === 1"><Menu /></el-icon>
                    <el-icon v-else-if="data.permissionType === 2"><Document /></el-icon>
                    <el-icon v-else><Operation /></el-icon>
                    <span class="tree-label">{{ data.permissionName || node.label }}</span>
                    <el-tag 
                      v-if="data.permissionCode" 
                      size="small" 
                      type="info"
                      class="tree-tag"
                    >
                      {{ data.permissionCode }}
                    </el-tag>
                  </div>
                </template>
              </el-tree>
            </div>
            <el-empty 
              v-else 
              description="暂无权限树数据" 
              :image-size="100"
            />
          </el-card>
        </el-col>
      </el-row>

      <!-- 原始数据展示（用于调试） -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-card shadow="hover" class="info-card debug-card">
            <template #header>
              <div class="card-header">
                <el-icon><Document /></el-icon>
                <span>原始数据（调试用）</span>
                <el-button 
                  size="small" 
                  @click="copyUserInfo"
                >
                  复制数据
                </el-button>
              </div>
            </template>
            <pre class="json-viewer">{{ JSON.stringify(userStore.userInfo, null, 2) }}</pre>
          </el-card>
        </el-col>
      </el-row>

      <!-- 快捷操作 -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-card shadow="hover" class="action-card">
            <template #header>
              <div class="card-header">
                <el-icon><Setting /></el-icon>
                <span>快捷操作</span>
              </div>
            </template>
            <el-space wrap>
              <el-button type="primary" @click="refreshUserInfo">
                <el-icon><Refresh /></el-icon>
                刷新信息
              </el-button>
              <el-button type="success">
                <el-icon><EditPen /></el-icon>
                编辑资料
              </el-button>
              <el-button type="warning">
                <el-icon><Setting /></el-icon>
                系统设置
              </el-button>
              <el-button 
                type="danger" 
                :loading="logoutLoading"
                @click="handleLogout"
              >
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-button>
            </el-space>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  User, UserFilled, Key, Lock, Grid, Menu, Document, 
  Operation, Setting, Refresh, EditPen, SwitchButton 
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const logoutLoading = ref(false)
const expandAll = ref(false)

// 树形控件配置
const treeProps = {
  children: 'children',
  label: 'permissionName'
}

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '退出确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    logoutLoading.value = true
    await userStore.logout()
    await router.replace('/login')
  } catch (error) {
    // 用户取消操作
  } finally {
    logoutLoading.value = false
  }
}

// 复制 Token
const copyToken = async () => {
  try {
    await navigator.clipboard.writeText(userStore.token)
    ElMessage.success('Token 已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 解析 Token
const viewTokenPayload = () => {
  try {
    const token = userStore.token
    if (!token) {
      ElMessage.warning('Token 不存在')
      return
    }
    
    const parts = token.split('.')
    if (parts.length !== 3 || !parts[1]) {
      throw new Error('无效的 JWT Token')
    }
    
    // 解码 Payload
    const payloadPart = parts[1]
    if (!payloadPart) {
      throw new Error('Token Payload 部分缺失')
    }
    const payload = JSON.parse(atob(payloadPart))
    
    ElMessageBox.alert(
      `<pre style="text-align: left; max-height: 400px; overflow: auto;">${JSON.stringify(payload, null, 2)}</pre>`,
      'Token Payload',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '关闭'
      }
    )
  } catch (error) {
    ElMessage.error('Token 解析失败')
  }
}

// 复制用户信息
const copyUserInfo = async () => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(userStore.userInfo, null, 2))
    ElMessage.success('用户信息已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 刷新用户信息
const refreshUserInfo = () => {
  ElMessage.info('当前用户信息已是最新')
}
</script>

<style scoped>
.home {
  padding: 24px;
  min-height: 100vh;
  background: #f5f7fa;
}

html.dark .home {
  background: #1a1a1a;
}

/* 欢迎卡片 */
.home-header {
  margin-bottom: 24px;
}

.welcome-card {
  border-radius: 12px;
}

.welcome-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-avatar-section {
  flex-shrink: 0;
}

.user-avatar {
  border: 3px solid #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
}

.user-info-section {
  flex: 1;
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #2c3e50;
}

html.dark .welcome-title {
  color: #e5e7eb;
}

.user-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.logout-section {
  flex-shrink: 0;
}

/* 内容区域 */
.home-content {
  max-width: 1600px;
  margin: 0 auto;
}

.el-row {
  margin-bottom: 20px;
}

.tree-row {
  margin-top: 20px;
}

/* 卡片样式 */
.info-card {
  height: 100%;
  border-radius: 8px;
  transition: all 0.3s;
}

.info-card:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
}

html.dark .card-header {
  color: #e5e7eb;
}

.expand-btn {
  margin-left: auto;
}

/* Token 区域 */
.token-section {
  padding: 8px 0;
}

.token-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

html.dark .token-label {
  color: #9ca3af;
}

.token-input {
  margin-bottom: 12px;
}

.token-input :deep(.el-textarea__inner) {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
}

.token-actions {
  display: flex;
  gap: 8px;
}

/* 权限区域 */
.permission-section {
  padding: 8px 0;
}

.permission-item {
  margin-bottom: 12px;
}

.permission-item:last-child {
  margin-bottom: 0;
}

.permission-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  margin-bottom: 8px;
}

html.dark .permission-label {
  color: #9ca3af;
}

.permission-value {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-tag {
  margin: 0;
}

.text-muted {
  color: #909399;
  font-size: 14px;
  font-style: italic;
}

html.dark .text-muted {
  color: #6b7280;
}

/* 树形结构 */
.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.tree-label {
  flex: 1;
  font-size: 14px;
}

.tree-tag {
  margin-left: auto;
}

/* JSON 查看器 */
.debug-card {
  margin-top: 20px;
}

.json-viewer {
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 16px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
  overflow-x: auto;
  max-height: 400px;
  margin: 0;
  color: #2c3e50;
}

html.dark .json-viewer {
  background: #262626;
  border-color: #404040;
  color: #e5e7eb;
}

/* 操作卡片 */
.action-card {
  margin-top: 20px;
  border-radius: 8px;
}

/* 响应式 */
@media (max-width: 768px) {
  .home {
    padding: 16px;
  }

  .welcome-content {
    flex-direction: column;
    text-align: center;
  }

  .user-info-section {
    text-align: center;
  }

  .welcome-title {
    font-size: 20px;
  }

  .logout-section {
    width: 100%;
  }

  .logout-section .el-button {
    width: 100%;
  }
}

/* Element Plus 组件样式覆盖 */
:deep(.el-descriptions__label) {
  font-weight: 600;
  background: #f5f7fa;
}

html.dark :deep(.el-descriptions__label) {
  background: #262626;
}

:deep(.el-tree-node__content) {
  height: 36px;
  padding: 0 12px;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

html.dark :deep(.el-tree-node__content:hover) {
  background-color: #262626;
}

:deep(.el-empty__description) {
  color: #909399;
}

html.dark :deep(.el-empty__description) {
  color: #6b7280;
}
</style>
