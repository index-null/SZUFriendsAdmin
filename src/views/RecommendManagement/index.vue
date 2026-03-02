<template>
  <div class="recommend-management">
    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="card-header">
          <h2 class="page-title">推荐系统管理</h2>
          <el-tag type="info" effect="plain">管理接口</el-tag>
        </div>
      </template>

      <div class="actions-grid">
        <!-- 一键初始化推荐系统 -->
        <el-card shadow="hover" class="action-card">
          <div class="action-content">
            <div class="action-icon init-icon">
              <el-icon :size="32"><SetUp /></el-icon>
            </div>
            <div class="action-info">
              <h3 class="action-title">一键初始化推荐系统</h3>
              <p class="action-desc">
                异步串行执行全部定时任务，适用于系统首次上线、大批量导入数据后生效、手动触发全量同步等场景。
              </p>
              <div class="action-steps">
                <div class="step-item">
                  <span class="step-num">1</span>
                  <span>更新热门帖子缓存</span>
                </div>
                <el-icon class="step-arrow"><Right /></el-icon>
                <div class="step-item">
                  <span class="step-num">2</span>
                  <span>生成帖子向量</span>
                </div>
                <el-icon class="step-arrow"><Right /></el-icon>
                <div class="step-item">
                  <span class="step-num">3</span>
                  <span>重建用户画像</span>
                </div>
                <el-icon class="step-arrow"><Right /></el-icon>
                <div class="step-item">
                  <span class="step-num">4</span>
                  <span>预热推荐缓存</span>
                </div>
              </div>
              <el-alert
                type="warning"
                :closable="false"
                show-icon
                class="action-warning"
              >
                DashScope API
                调用有费用，数据量大时请谨慎使用。任务在后台异步运行，可通过日志观察进度。
              </el-alert>
            </div>
          </div>
          <div class="action-footer">
            <el-button
              type="primary"
              size="large"
              :loading="initLoading"
              :icon="SetUp"
              @click="handleInit"
            >
              {{ initLoading ? '初始化中...' : '开始初始化' }}
            </el-button>
          </div>
        </el-card>

        <!-- 刷新用户画像 -->
        <el-card shadow="hover" class="action-card">
          <div class="action-content">
            <div class="action-icon refresh-icon">
              <el-icon :size="32"><Refresh /></el-icon>
            </div>
            <div class="action-info">
              <h3 class="action-title">刷新用户画像</h3>
              <p class="action-desc">
                手动触发当前用户画像重新计算，清除推荐缓存。适用于用户兴趣发生变化后需要立即更新推荐结果的场景。
              </p>
              <el-alert
                type="info"
                :closable="false"
                show-icon
                class="action-warning"
              >
                刷新后推荐结果会基于最新的用户行为数据重新生成。
              </el-alert>
            </div>
          </div>
          <div class="action-footer">
            <el-button
              type="success"
              size="large"
              :loading="refreshLoading"
              :icon="Refresh"
              @click="handleRefresh"
            >
              {{ refreshLoading ? '刷新中...' : '刷新画像' }}
            </el-button>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { SetUp, Refresh, Right } from '@element-plus/icons-vue'
import { get as getRecommendApi } from '@/api/generated/推荐系统/推荐系统'

const recommendApi = getRecommendApi()

const initLoading = ref(false)
const refreshLoading = ref(false)

const handleInit = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要执行一键初始化吗？此操作将异步执行全部推荐系统任务（更新热门缓存 → 生成帖子向量 → 重建用户画像 → 预热推荐缓存），DashScope API 调用会产生费用。',
      '一键初始化推荐系统',
      {
        confirmButtonText: '确定执行',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    initLoading.value = true
    await recommendApi.postCommunityRecommendAdminInit()
    ElMessage.success('初始化任务已提交，正在后台异步执行，请通过日志观察进度')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('初始化推荐系统失败:', error)
      ElMessage.error('初始化推荐系统失败')
    }
  } finally {
    initLoading.value = false
  }
}

const handleRefresh = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要刷新用户画像吗？此操作将重新计算用户画像并清除推荐缓存。',
      '刷新用户画像',
      {
        confirmButtonText: '确定刷新',
        cancelButtonText: '取消',
        type: 'info',
      },
    )

    refreshLoading.value = true
    await recommendApi.postCommunityRecommendProfileRefresh()
    ElMessage.success('用户画像刷新成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('刷新用户画像失败:', error)
      ElMessage.error('刷新用户画像失败')
    }
  } finally {
    refreshLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.recommend-management {
  padding: 16px;
  min-height: 100vh;
  background: #f5f7fa;

  html.dark & {
    background: #141414;
  }
}

.page-card {
  border: none;
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;

  .page-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;

    html.dark & {
      color: #ecf0f1;
    }
  }
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
  gap: 20px;
}

.action-card {
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }

  .action-content {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
  }

  .action-icon {
    flex-shrink: 0;
    width: 64px;
    height: 64px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;

    &.init-icon {
      background: linear-gradient(135deg, #409eff, #337ecc);
    }

    &.refresh-icon {
      background: linear-gradient(135deg, #67c23a, #529b2e);
    }
  }

  .action-info {
    flex: 1;
    min-width: 0;
  }

  .action-title {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;

    html.dark & {
      color: #ecf0f1;
    }
  }

  .action-desc {
    margin: 0 0 12px;
    font-size: 14px;
    color: #606266;
    line-height: 1.6;

    html.dark & {
      color: #909399;
    }
  }

  .action-steps {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 12px;

    .step-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: #f0f5ff;
      border-radius: 4px;
      font-size: 13px;
      color: #409eff;

      html.dark & {
        background: rgba(64, 158, 255, 0.1);
      }

      .step-num {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #409eff;
        color: #fff;
        font-size: 11px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .step-arrow {
      color: #c0c4cc;
      font-size: 12px;
    }
  }

  .action-warning {
    margin-top: 8px;
  }

  .action-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;

    html.dark & {
      border-top-color: #363636;
    }
  }
}

@media (max-width: 768px) {
  .recommend-management {
    padding: 10px;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .action-content {
    flex-direction: column;
  }

  .action-steps {
    .step-arrow {
      display: none;
    }
  }
}
</style>
