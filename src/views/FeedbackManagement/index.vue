<template>
  <div class="feedback-management">
    <!-- 统计卡片区域 -->
    <div class="stats-cards">
      <el-card class="stat-card unread" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><ChatLineRound /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.unread }}</div>
            <div class="stat-label">未读</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card read" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><View /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.read }}</div>
            <div class="stat-label">已读</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card resolved" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.resolved }}</div>
            <div class="stat-label">已处理</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card starred" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><StarFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.starred }}</div>
            <div class="stat-label">星标</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-content">
        <div class="filter-left">
          <el-radio-group v-model="filterForm.status" @change="handleSearch">
            <el-radio-button :value="undefined">全部</el-radio-button>
            <el-radio-button :value="0">未读</el-radio-button>
            <el-radio-button :value="1">已读</el-radio-button>
            <el-radio-button :value="2">已处理</el-radio-button>
          </el-radio-group>

          <el-select
            v-model="filterForm.type"
            placeholder="反馈类型"
            clearable
            style="width: 120px"
            @change="handleSearch"
          >
            <el-option :value="1" label="建议" />
            <el-option :value="2" label="BUG" />
            <el-option :value="3" label="投诉" />
            <el-option :value="4" label="其他" />
          </el-select>

          <el-select
            v-model="filterForm.star"
            placeholder="星标筛选"
            clearable
            style="width: 120px"
            @change="handleSearch"
          >
            <el-option :value="1" label="已星标" />
            <el-option :value="0" label="未星标" />
          </el-select>
        </div>

        <div class="filter-right">
          <ViewModeToggle v-model="viewMode" />
          <el-button :icon="RefreshRight" @click="handleReset">刷新</el-button>
        </div>
      </div>
    </el-card>

    <!-- 表格视图 -->
    <el-card v-if="viewMode === 'table'" class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="feedbackList"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column label="用户" width="160">
          <template #default="{ row }">
            <div class="table-author">
              <el-avatar :size="28" :src="row.avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span>{{ row.nickname || row.username || '匿名用户' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="内容" min-width="240" show-overflow-tooltip>
          <template #default="{ row }">
            <el-link
              type="primary"
              :underline="false"
              @click="handleViewDetail(row)"
            >
              {{ row.content || '暂无内容' }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getStatusTagType(row.status)"
              size="small"
              effect="dark"
            >
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="星标" width="70" align="center">
          <template #default="{ row }">
            <el-icon
              :style="{
                color: row.star === 1 ? '#e67e22' : '#c0c4cc',
                cursor: 'pointer',
                fontSize: '16px',
              }"
              @click="handleToggleStar(row)"
            >
              <component :is="row.star === 1 ? StarFilled : Star" />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="80" align="center">
          <template #default="{ row }">
            <template v-if="row.images && row.images.length > 0">
              <el-image
                :src="row.images[0]"
                :preview-src-list="row.images"
                fit="cover"
                style="width: 36px; height: 36px; border-radius: 4px"
                preview-teleported
                :z-index="9999"
              />
            </template>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="联系方式" width="130" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.contact || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="时间" width="120" align="center">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 0"
              type="primary"
              size="small"
              link
              @click="handleMarkRead(row)"
            >
              已读
            </el-button>
            <el-button
              v-if="row.status !== 2"
              type="success"
              size="small"
              link
              @click="handleReply(row)"
            >
              回复
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 卡片视图 -->
    <div v-else v-loading="loading" class="feedback-container">
      <el-empty
        v-if="!loading && feedbackList.length === 0"
        description="暂无反馈"
      />

      <TransitionGroup name="card-list" tag="div" class="feedback-grid">
        <el-card
          v-for="item in feedbackList"
          :key="item.id"
          class="feedback-card"
          :class="{
            'is-unread': item.status === 0,
            'is-starred': item.star === 1,
          }"
          shadow="hover"
        >
          <div class="feedback-header">
            <div class="user-info">
              <el-avatar :size="36" :src="item.avatar" class="user-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="user-details">
                <div class="user-name">
                  {{ item.nickname || item.username || '匿名用户' }}
                </div>
                <div class="feedback-time">
                  {{ formatTime(item.createTime) }}
                </div>
              </div>
            </div>
            <div class="feedback-badges">
              <el-tag :type="getTypeTagType(item.type)" size="small">
                {{ getTypeLabel(item.type) }}
              </el-tag>
              <el-tag
                :type="getStatusTagType(item.status)"
                size="small"
                effect="dark"
              >
                {{ getStatusLabel(item.status) }}
              </el-tag>
            </div>
          </div>

          <div class="feedback-body" @click="handleViewDetail(item)">
            <p class="feedback-content">{{ item.content || '暂无内容' }}</p>

            <div
              v-if="item.images && item.images.length > 0"
              class="feedback-images"
            >
              <el-image
                v-for="(img, idx) in item.images.slice(0, 3)"
                :key="`${item.id}-${idx}`"
                :src="img"
                :preview-src-list="item.images"
                :initial-index="idx"
                fit="cover"
                class="feedback-image"
                preview-teleported
                :z-index="9999"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div
                v-if="item.images.length > 3"
                class="image-more"
                @click.stop="handleViewDetail(item)"
              >
                +{{ item.images.length - 3 }}
              </div>
            </div>

            <div v-if="item.contact" class="feedback-contact">
              <el-icon><Phone /></el-icon>
              <span>{{ item.contact }}</span>
            </div>
          </div>

          <div v-if="item.reply" class="feedback-reply">
            <div class="reply-label">管理员回复</div>
            <div class="reply-content">{{ item.reply }}</div>
          </div>

          <div class="feedback-actions">
            <el-button
              :type="item.star === 1 ? 'warning' : 'default'"
              size="small"
              plain
              :icon="item.star === 1 ? StarFilled : Star"
              @click="handleToggleStar(item)"
            >
              {{ item.star === 1 ? '取消星标' : '星标' }}
            </el-button>
            <el-button
              v-if="item.status === 0"
              type="primary"
              size="small"
              plain
              :icon="View"
              @click="handleMarkRead(item)"
            >
              标记已读
            </el-button>
            <el-button
              v-if="item.status !== 2"
              type="success"
              size="small"
              :icon="ChatLineSquare"
              @click="handleReply(item)"
            >
              回复
            </el-button>
          </div>
        </el-card>
      </TransitionGroup>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[12, 24, 36, 48]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 反馈详情抽屉 -->
    <el-drawer
      v-model="detailDrawerVisible"
      title="反馈详情"
      size="500px"
      direction="rtl"
    >
      <div v-if="currentFeedback" class="feedback-detail">
        <div class="detail-header">
          <el-avatar :size="48" :src="currentFeedback.avatar">
            <el-icon><User /></el-icon>
          </el-avatar>
          <div class="detail-author">
            <div class="author-name">
              {{
                currentFeedback.nickname ||
                currentFeedback.username ||
                '匿名用户'
              }}
            </div>
            <div class="author-meta">
              <el-tag :type="getTypeTagType(currentFeedback.type)" size="small">
                {{ getTypeLabel(currentFeedback.type) }}
              </el-tag>
              <el-tag
                :type="getStatusTagType(currentFeedback.status)"
                size="small"
              >
                {{ getStatusLabel(currentFeedback.status) }}
              </el-tag>
              <el-tag
                v-if="currentFeedback.star === 1"
                type="warning"
                size="small"
              >
                星标
              </el-tag>
              <span class="feedback-time">{{
                formatTime(currentFeedback.createTime)
              }}</span>
            </div>
          </div>
        </div>

        <!-- 反馈内容 -->
        <div class="detail-content">
          <p>{{ currentFeedback.content }}</p>
        </div>

        <!-- 图片 -->
        <div
          v-if="currentFeedback.images && currentFeedback.images.length > 0"
          class="detail-images"
        >
          <el-image
            v-for="(img, idx) in currentFeedback.images"
            :key="`detail-${idx}`"
            :src="img"
            :preview-src-list="currentFeedback.images"
            :initial-index="idx"
            fit="cover"
            class="detail-image"
            preview-teleported
            :z-index="9999"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </div>

        <!-- 联系方式 -->
        <div v-if="currentFeedback.contact" class="detail-contact">
          <el-icon><Phone /></el-icon>
          <span>{{ currentFeedback.contact }}</span>
        </div>

        <!-- 回复内容 -->
        <div v-if="currentFeedback.reply" class="detail-reply">
          <div class="reply-label">管理员回复</div>
          <div class="reply-content">{{ currentFeedback.reply }}</div>
        </div>

        <!-- 操作按钮 -->
        <div class="detail-actions">
          <el-button
            :type="currentFeedback.star === 1 ? 'warning' : 'default'"
            :icon="currentFeedback.star === 1 ? StarFilled : Star"
            @click="handleToggleStarDetail"
          >
            {{ currentFeedback.star === 1 ? '取消星标' : '添加星标' }}
          </el-button>
          <el-button
            v-if="currentFeedback.status !== 2"
            type="success"
            :icon="ChatLineSquare"
            @click="handleReplyDetail"
          >
            回复反馈
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 回复对话框 -->
    <el-dialog
      v-model="replyDialogVisible"
      title="回复反馈"
      width="500px"
      :close-on-click-modal="false"
    >
      <div v-if="replyTarget" class="reply-preview">
        <div class="reply-preview-header">
          <el-tag :type="getTypeTagType(replyTarget.type)" size="small">
            {{ getTypeLabel(replyTarget.type) }}
          </el-tag>
          <span class="reply-preview-user">
            {{ replyTarget.nickname || replyTarget.username || '匿名用户' }}
          </span>
        </div>
        <p class="reply-preview-content">{{ replyTarget.content }}</p>
      </div>

      <el-form
        ref="replyFormRef"
        :model="replyForm"
        :rules="replyFormRules"
        label-width="80px"
      >
        <el-form-item label="回复内容" prop="replyContent">
          <el-input
            v-model="replyForm.replyContent"
            type="textarea"
            :rows="4"
            placeholder="请输入回复内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button
          type="success"
          :loading="submitting"
          @click="handleConfirmReply"
        >
          确认回复
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ChatLineRound,
  ChatLineSquare,
  CircleCheck,
  View,
  StarFilled,
  Star,
  RefreshRight,
  User,
  Picture,
  Phone,
} from '@element-plus/icons-vue'
import { get as getFeedbackApi } from '@/api/generated/用户反馈管理/用户反馈管理'
import type {
  FeedbackResponse,
  FeedbackPageRequest,
} from '@/api/generated/.ts.schemas'
import ViewModeToggle from '@/components/ViewModeToggle.vue'

const feedbackApi = getFeedbackApi()

const viewMode = ref<'table' | 'card'>('table')

// 筛选表单
const filterForm = reactive({
  status: undefined as number | undefined,
  type: undefined as number | undefined,
  star: undefined as number | undefined,
})

// 分页参数
const pagination = reactive({
  current: 1,
  size: 12,
  total: 0,
})

// 数据
const feedbackList = ref<FeedbackResponse[]>([])
const loading = ref(false)

// 统计数据（基于当前页面数据 + total）
const statistics = computed(() => {
  return {
    unread: feedbackList.value.filter((item) => item.status === 0).length,
    read: feedbackList.value.filter((item) => item.status === 1).length,
    resolved: feedbackList.value.filter((item) => item.status === 2).length,
    starred: feedbackList.value.filter((item) => item.star === 1).length,
  }
})

// 详情抽屉
const detailDrawerVisible = ref(false)
const currentFeedback = ref<FeedbackResponse | null>(null)

// 回复对话框
const replyDialogVisible = ref(false)
const replyFormRef = ref()
const replyTarget = ref<FeedbackResponse | null>(null)
const replyForm = reactive({
  feedbackId: 0,
  replyContent: '',
})
const replyFormRules = {
  replyContent: [
    { required: true, message: '请输入回复内容', trigger: 'blur' },
    { min: 2, message: '回复内容至少2个字符', trigger: 'blur' },
  ],
}
const submitting = ref(false)

// 获取反馈列表
const fetchFeedbackList = async () => {
  loading.value = true
  try {
    const params: FeedbackPageRequest = {
      current: pagination.current,
      size: pagination.size,
      type: filterForm.type,
      status: filterForm.status,
      star: filterForm.star,
    }
    const response = await feedbackApi.postCommunityFeedbackAdminList(params)

    if (response) {
      feedbackList.value = response.records || []
      pagination.total = response.total || 0
      pagination.current = response.current || 1
      pagination.size = response.size || 12
    } else {
      feedbackList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取反馈列表失败:', error)
    ElMessage.error('获取反馈列表失败')
    feedbackList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchFeedbackList()
}

// 重置
const handleReset = () => {
  filterForm.status = undefined
  filterForm.type = undefined
  filterForm.star = undefined
  pagination.current = 1
  fetchFeedbackList()
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  fetchFeedbackList()
}

const handleCurrentChange = (page: number) => {
  pagination.current = page
  fetchFeedbackList()
}

// 查看详情
const handleViewDetail = (item: FeedbackResponse) => {
  currentFeedback.value = { ...item }
  detailDrawerVisible.value = true

  // 如果未读，自动标记为已读
  if (item.status === 0 && item.id) {
    feedbackApi
      .putCommunityFeedbackFeedbackIdStatus(item.id, { status: 1 })
      .then(() => {
        item.status = 1
        if (currentFeedback.value) {
          currentFeedback.value.status = 1
        }
      })
      .catch(() => {
        // 静默失败，不影响查看
      })
  }
}

// 标记已读
const handleMarkRead = async (item: FeedbackResponse) => {
  if (!item.id) return
  try {
    await feedbackApi.putCommunityFeedbackFeedbackIdStatus(item.id, {
      status: 1,
    })
    ElMessage.success('已标记为已读')
    item.status = 1
  } catch (error) {
    console.error('标记已读失败:', error)
    ElMessage.error('标记已读失败')
  }
}

// 切换星标
const handleToggleStar = async (item: FeedbackResponse) => {
  if (!item.id) return
  const newStar = item.star === 1 ? 0 : 1
  try {
    await feedbackApi.putCommunityFeedbackFeedbackIdStar(item.id, {
      star: newStar,
    })
    item.star = newStar
    ElMessage.success(newStar === 1 ? '已添加星标' : '已取消星标')
  } catch (error) {
    console.error('切换星标失败:', error)
    ElMessage.error('操作失败')
  }
}

// 详情页切换星标
const handleToggleStarDetail = async () => {
  if (!currentFeedback.value?.id) return
  const newStar = currentFeedback.value.star === 1 ? 0 : 1
  try {
    await feedbackApi.putCommunityFeedbackFeedbackIdStar(
      currentFeedback.value.id,
      { star: newStar },
    )
    currentFeedback.value.star = newStar
    // 同步列表数据
    const listItem = feedbackList.value.find(
      (f) => f.id === currentFeedback.value?.id,
    )
    if (listItem) listItem.star = newStar
    ElMessage.success(newStar === 1 ? '已添加星标' : '已取消星标')
  } catch (error) {
    console.error('切换星标失败:', error)
    ElMessage.error('操作失败')
  }
}

// 回复
const handleReply = (item: FeedbackResponse) => {
  if (!item.id) return
  replyTarget.value = item
  replyForm.feedbackId = item.id
  replyForm.replyContent = ''
  replyDialogVisible.value = true
}

// 详情页回复
const handleReplyDetail = () => {
  if (!currentFeedback.value?.id) return
  replyTarget.value = currentFeedback.value
  replyForm.feedbackId = currentFeedback.value.id
  replyForm.replyContent = ''
  replyDialogVisible.value = true
}

// 确认回复
const handleConfirmReply = async () => {
  if (!replyFormRef.value) return

  try {
    await replyFormRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    await feedbackApi.postCommunityFeedbackFeedbackIdReply(
      replyForm.feedbackId,
      { replyContent: replyForm.replyContent },
    )
    ElMessage.success('回复成功')
    replyDialogVisible.value = false
    detailDrawerVisible.value = false
    fetchFeedbackList()
  } catch (error) {
    console.error('回复失败:', error)
    ElMessage.error('回复失败')
  } finally {
    submitting.value = false
  }
}

// 获取类型标签
const getTypeTagType = (type?: number) => {
  const map: Record<number, 'primary' | 'danger' | 'warning' | 'info'> = {
    1: 'primary',
    2: 'danger',
    3: 'warning',
    4: 'info',
  }
  return type ? map[type] || 'info' : 'info'
}

const getTypeLabel = (type?: number) => {
  const map: Record<number, string> = {
    1: '建议',
    2: 'BUG',
    3: '投诉',
    4: '其他',
  }
  return type ? map[type] || '未知' : '未知'
}

// 获取状态标签
const getStatusTagType = (status?: number) => {
  const map: Record<number, 'info' | 'primary' | 'success'> = {
    0: 'info',
    1: 'primary',
    2: 'success',
  }
  return status !== undefined ? map[status] || 'info' : 'info'
}

const getStatusLabel = (status?: number) => {
  const map: Record<number, string> = {
    0: '未读',
    1: '已读',
    2: '已处理',
  }
  return status !== undefined ? map[status] || '未知' : '未知'
}

// 格式化时间
const formatTime = (time?: string) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`

  return date.toLocaleDateString()
}

// 初始化
onMounted(() => {
  fetchFeedbackList()
})
</script>

<style lang="scss" scoped>
// 变量定义
$primary-padding: 16px;
$card-gap: 12px;
$border-radius: 8px;
$transition-duration: 0.3s;

// 颜色定义
$unread-color: #f39c12;
$read-color: #3498db;
$resolved-color: #27ae60;
$starred-color: #e67e22;

$bg-light: #f5f7fa;
$bg-dark: #141414;
$card-bg-light: #ffffff;
$card-bg-dark: #1a1a1a;

// 主容器
.feedback-management {
  padding: $primary-padding;
  background: $bg-light;
  min-height: 100vh;

  html.dark & {
    background: $bg-dark;
  }
}

// 统计卡片区域
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: $card-gap;
  margin-bottom: $card-gap;

  .stat-card {
    border-radius: $border-radius;
    border: none;
    transition: all $transition-duration ease;

    &:hover {
      transform: translateY(-2px);
    }

    &.unread {
      background: linear-gradient(135deg, #fef5e7 0%, #fff9e6 100%);
      border-left: 3px solid $unread-color;

      html.dark & {
        background: linear-gradient(135deg, #2c2416 0%, #332819 100%);
      }

      .stat-icon {
        color: $unread-color;
      }
    }

    &.read {
      background: linear-gradient(135deg, #ebf5fb 0%, #e8f4fd 100%);
      border-left: 3px solid $read-color;

      html.dark & {
        background: linear-gradient(135deg, #1a2533 0%, #1d2a3a 100%);
      }

      .stat-icon {
        color: $read-color;
      }
    }

    &.resolved {
      background: linear-gradient(135deg, #e8f8f5 0%, #e6f9f5 100%);
      border-left: 3px solid $resolved-color;

      html.dark & {
        background: linear-gradient(135deg, #162c22 0%, #183326 100%);
      }

      .stat-icon {
        color: $resolved-color;
      }
    }

    &.starred {
      background: linear-gradient(135deg, #fef5e7 0%, #fdf0db 100%);
      border-left: 3px solid $starred-color;

      html.dark & {
        background: linear-gradient(135deg, #2c2416 0%, #33291a 100%);
      }

      .stat-icon {
        color: $starred-color;
      }
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 12px;

      .stat-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: $border-radius;
        font-size: 24px;
        background: rgba(255, 255, 255, 0.8);

        html.dark & {
          background: rgba(0, 0, 0, 0.3);
        }
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          line-height: 1;
          margin-bottom: 6px;
          color: #2c3e50;

          html.dark & {
            color: #ecf0f1;
          }
        }

        .stat-label {
          font-size: 13px;
          color: #7f8c8d;
          font-weight: 500;

          html.dark & {
            color: #95a5a6;
          }
        }
      }
    }
  }
}

// 筛选卡片
.filter-card {
  margin-bottom: $card-gap;
  border-radius: $border-radius;
  border: none;

  .filter-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    .filter-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .filter-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
  }
}

// 表格卡片
.table-card {
  margin-bottom: $card-gap;
  border-radius: $border-radius;
  border: none;

  .table-author {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .text-muted {
    color: #c0c4cc;
  }
}

// 反馈容器
.feedback-container {
  min-height: 400px;
  margin-bottom: $card-gap;

  .feedback-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: $card-gap;
  }
}

// 反馈卡片
.feedback-card {
  border-radius: $border-radius;
  border: none;
  transition: all $transition-duration ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);

    html.dark & {
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    }
  }

  &.is-unread {
    border-left: 3px solid $unread-color;
  }

  &.is-starred {
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: $starred-color;
    }
  }

  .feedback-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 12px;

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;

      .user-avatar {
        flex-shrink: 0;
      }

      .user-details {
        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #2c3e50;

          html.dark & {
            color: #ecf0f1;
          }
        }

        .feedback-time {
          font-size: 12px;
          color: #7f8c8d;

          html.dark & {
            color: #95a5a6;
          }
        }
      }
    }

    .feedback-badges {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
  }

  .feedback-body {
    cursor: pointer;
    margin-bottom: 12px;

    .feedback-content {
      font-size: 14px;
      color: #2c3e50;
      line-height: 1.6;
      margin: 0 0 12px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;

      html.dark & {
        color: #ecf0f1;
      }
    }

    .feedback-images {
      display: flex;
      gap: 6px;
      margin-bottom: 10px;

      .feedback-image {
        width: 80px;
        height: 80px;
        border-radius: 6px;
        cursor: pointer;
        transition: all $transition-duration;

        &:hover {
          transform: scale(1.05);
        }

        .image-error {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f7fa;
          color: #bdc3c7;
          font-size: 20px;

          html.dark & {
            background: #2c2c2c;
          }
        }
      }

      .image-more {
        width: 80px;
        height: 80px;
        border-radius: 6px;
        background: #f5f7fa;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 600;
        color: #7f8c8d;
        cursor: pointer;

        html.dark & {
          background: #2c2c2c;
          color: #95a5a6;
        }
      }
    }

    .feedback-contact {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #7f8c8d;

      html.dark & {
        color: #95a5a6;
      }
    }
  }

  .feedback-reply {
    padding: 10px 12px;
    background: #f0f9eb;
    border-radius: 6px;
    margin-bottom: 12px;

    html.dark & {
      background: #1a2c16;
    }

    .reply-label {
      font-size: 12px;
      color: #67c23a;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .reply-content {
      font-size: 13px;
      color: #2c3e50;
      line-height: 1.5;

      html.dark & {
        color: #ecf0f1;
      }
    }
  }

  .feedback-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
}

// 分页
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: $primary-padding;
  background: $card-bg-light;
  border-radius: $border-radius;

  html.dark & {
    background: $card-bg-dark;
  }
}

// 反馈详情
.feedback-detail {
  .detail-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;

    .detail-author {
      .author-name {
        font-size: 16px;
        font-weight: 600;
        color: #2c3e50;

        html.dark & {
          color: #ecf0f1;
        }
      }

      .author-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
        flex-wrap: wrap;

        .feedback-time {
          font-size: 12px;
          color: #7f8c8d;

          html.dark & {
            color: #95a5a6;
          }
        }
      }
    }
  }

  .detail-content {
    margin-bottom: 16px;

    p {
      font-size: 14px;
      color: #2c3e50;
      line-height: 1.8;
      margin: 0;

      html.dark & {
        color: #ecf0f1;
      }
    }
  }

  .detail-images {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
    margin-bottom: 16px;

    .detail-image {
      width: 100%;
      height: 120px;
      border-radius: 6px;
      cursor: pointer;

      .image-error {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f7fa;
        color: #bdc3c7;
        font-size: 24px;

        html.dark & {
          background: #2c2c2c;
        }
      }
    }
  }

  .detail-contact {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #7f8c8d;
    margin-bottom: 16px;

    html.dark & {
      color: #95a5a6;
    }
  }

  .detail-reply {
    padding: 12px 16px;
    background: #f0f9eb;
    border-radius: 8px;
    margin-bottom: 20px;

    html.dark & {
      background: #1a2c16;
    }

    .reply-label {
      font-size: 12px;
      color: #67c23a;
      font-weight: 600;
      margin-bottom: 6px;
    }

    .reply-content {
      font-size: 14px;
      color: #2c3e50;
      line-height: 1.6;

      html.dark & {
        color: #ecf0f1;
      }
    }
  }

  .detail-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
}

// 回复预览
.reply-preview {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 16px;

  html.dark & {
    background: #2c2c2c;
  }

  .reply-preview-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .reply-preview-user {
      font-size: 13px;
      font-weight: 600;
      color: #2c3e50;

      html.dark & {
        color: #ecf0f1;
      }
    }
  }

  .reply-preview-content {
    font-size: 13px;
    color: #7f8c8d;
    line-height: 1.5;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;

    html.dark & {
      color: #95a5a6;
    }
  }
}

// 卡片列表过渡动画
.card-list-move,
.card-list-enter-active,
.card-list-leave-active {
  transition: all 0.5s ease;
}

.card-list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.card-list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.card-list-leave-active {
  position: absolute;
}

// 响应式设计
@media (max-width: 768px) {
  .feedback-management {
    padding: 10px;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .feedback-container .feedback-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .filter-content {
    flex-direction: column;
    align-items: stretch;

    .filter-left {
      flex-direction: column;
      align-items: stretch;
    }
  }
}
</style>
