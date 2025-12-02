<template>
  <el-row :gutter="20" class="statistics-cards">
    <el-col :xs="24" :sm="12" :md="6">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-card-content">
          <div class="stat-icon total">
            <el-icon :size="32"><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.total }}</div>
            <div class="stat-label">总操作数</div>
          </div>
        </div>
      </el-card>
    </el-col>

    <el-col :xs="24" :sm="12" :md="6">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-card-content">
          <div class="stat-icon success">
            <el-icon :size="32"><SuccessFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.successRate }}%</div>
            <div class="stat-label">成功率</div>
          </div>
        </div>
      </el-card>
    </el-col>

    <el-col :xs="24" :sm="12" :md="6">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-card-content">
          <div class="stat-icon failed">
            <el-icon :size="32"><CircleCloseFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.failedCount }}</div>
            <div class="stat-label">失败操作</div>
          </div>
        </div>
      </el-card>
    </el-col>

    <el-col :xs="24" :sm="12" :md="6">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-card-content">
          <div class="stat-icon time">
            <el-icon :size="32"><Timer /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.avgCostTime }}ms</div>
            <div class="stat-label">平均耗时</div>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import {
  Document,
  SuccessFilled,
  CircleCloseFilled,
  Timer,
} from '@element-plus/icons-vue'

interface Statistics {
  total: number
  successRate: number
  failedCount: number
  avgCostTime: number
}

defineProps<{
  statistics: Statistics
}>()
</script>

<style scoped>
.statistics-cards {
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-icon.success {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  color: white;
}

.stat-icon.failed {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
  color: white;
}

.stat-icon.time {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

html.dark .stat-value {
  color: #e5eaf3;
}

@media (max-width: 768px) {
  .statistics-cards {
    margin-bottom: 16px;
  }

  .stat-card {
    margin-bottom: 12px;
  }
}
</style>
