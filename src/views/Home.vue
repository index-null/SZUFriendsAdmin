<template>
  <div class="home">
    <div class="home-header">
      <h1>欢迎来到深大校友录管理后台</h1>
      <p>这是首页，后续将展示统计数据和快捷入口</p>
    </div>

    <div class="home-content">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :lg="6">
          <el-card shadow="hover">
            <el-statistic title="总用户数" :value="1234" />
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <el-card shadow="hover">
            <el-statistic title="今日新增" :value="56" />
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <el-card shadow="hover">
            <el-statistic title="活跃用户" :value="789" />
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <el-card shadow="hover">
            <el-statistic title="在线人数" :value="123" />
          </el-card>
        </el-col>
      </el-row>

      <el-card class="action-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>快捷操作</span>
          </div>
        </template>
        <el-space wrap>
          <el-button type="primary">添加用户</el-button>
          <el-button type="success">导出数据</el-button>
          <el-button type="warning">系统设置</el-button>
          <el-button type="danger" @click="handleLogout">退出登录</el-button>
        </el-space>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const handleLogout = () => {
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.home {
  padding: 24px;
  min-height: calc(100vh - 60px);
  width: 100%;
}

.home-header {
  text-align: center;
  margin-bottom: 40px;
}

.home-header h1 {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #2c3e50;
}

html.dark .home-header h1 {
  color: #e5e7eb;
}

.home-header p {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

html.dark .home-header p {
  color: #9ca3af;
}

.home-content {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.el-row {
  margin-bottom: 20px;
}

.el-col {
  margin-bottom: 20px;
}

.action-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
