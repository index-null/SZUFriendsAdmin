<template>
  <div class="post-moderation">
    <!-- 统计卡片区域 -->
    <div class="stats-cards">
      <el-card class="stat-card reviewing" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon>
              <Clock />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.reviewing }}</div>
            <div class="stat-label">待审核</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card normal" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon>
              <CircleCheck />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.normal }}</div>
            <div class="stat-label">已通过</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card blocked" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon>
              <CircleClose />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.blocked }}</div>
            <div class="stat-label">已屏蔽</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card total" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon>
              <Document />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.total }}</div>
            <div class="stat-label">总帖子数</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-content">
        <div class="filter-left">
          <el-radio-group v-model="filterForm.status" @change="handleSearch">
            <el-radio-button value="">全部</el-radio-button>
            <el-radio-button value="REVIEWING">待审核</el-radio-button>
            <el-radio-button value="NORMAL">已通过</el-radio-button>
            <el-radio-button value="BLOCKED">已屏蔽</el-radio-button>
          </el-radio-group>

          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索帖子标题/内容"
            clearable
            style="width: 180px"
            :prefix-icon="Search"
            @change="handleSearch"
          />

          <el-select
            v-model="filterForm.postType"
            placeholder="帖子类型"
            clearable
            style="width: 120px"
            @change="handleSearch"
          >
            <el-option label="普通帖子" value="NORMAL" />
            <el-option label="班级帖子" value="CLASS" />
            <el-option label="公告" value="NOTICE" />
          </el-select>
        </div>

        <el-button :icon="RefreshRight" @click="handleReset">刷新</el-button>
      </div>
    </el-card>

    <!-- 帖子列表 -->
    <div v-loading="loading" class="posts-container">
      <el-empty v-if="!loading && posts.length === 0" description="暂无帖子" />

      <TransitionGroup name="card-list" tag="div" class="posts-grid">
        <el-card
          v-for="post in posts"
          :key="post.postId"
          class="post-card"
          :class="{ 'is-reviewing': post.status === 'REVIEWING' }"
          shadow="hover"
        >
          <!-- 帖子头部 -->
          <div class="post-header">
            <div class="author-info">
              <el-avatar :size="36" :src="post.avatar" class="author-avatar">
                <el-icon>
                  <User />
                </el-icon>
              </el-avatar>
              <div class="author-details">
                <div class="author-name">{{ post.nickname || '匿名用户' }}</div>
                <div class="post-time">{{ formatTime(post.createTime) }}</div>
              </div>
            </div>
            <div class="post-badges">
              <el-tag :type="getPostTypeTagType(post.postType)" size="small">
                {{ getPostTypeLabel(post.postType) }}
              </el-tag>
              <el-tag
                :type="getStatusTagType(post.status)"
                size="small"
                effect="dark"
              >
                {{ getStatusLabel(post.status) }}
              </el-tag>
            </div>
          </div>

          <!-- 帖子内容 -->
          <div class="post-content" @click="handleViewDetail(post)">
            <h3 class="post-title">{{ post.title || '无标题' }}</h3>
            <p class="post-preview">{{ post.contentPreview || '暂无内容' }}</p>

            <!-- 封面图 -->
            <div v-if="post.cover" class="post-cover">
              <el-image :src="post.cover" fit="cover" class="cover-image">
                <template #error>
                  <div class="image-error">
                    <el-icon>
                      <Picture />
                    </el-icon>
                  </div>
                </template>
              </el-image>
            </div>

            <!-- 标签 -->
            <div v-if="post.tags && post.tags.length > 0" class="post-tags">
              <el-tag
                v-for="tag in post.tags.slice(0, 3)"
                :key="tag"
                size="small"
                type="info"
                effect="plain"
              >
                {{ getTagLabel(tag) }}
              </el-tag>
            </div>
          </div>

          <!-- 帖子统计 -->
          <div class="post-stats">
            <div class="stat-item">
              <el-icon>
                <View />
              </el-icon>
              <span>{{ post.viewCount || 0 }}</span>
            </div>
            <div class="stat-item">
              <el-icon>
                <Star />
              </el-icon>
              <span>{{ post.likeCount || 0 }}</span>
            </div>
            <div class="stat-item">
              <el-icon>
                <ChatDotRound />
              </el-icon>
              <span>{{ post.commentCount || 0 }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="post-actions">
            <el-button
              type="primary"
              size="small"
              plain
              :icon="Tickets"
              @click="handleViewReviews(post)"
            >
              审核记录
            </el-button>
            <el-button
              v-if="post.status === 'REVIEWING' || post.status === 'BLOCKED'"
              type="success"
              size="small"
              :icon="Select"
              @click="handleApprove(post)"
            >
              通过
            </el-button>
            <el-button
              v-if="post.status === 'REVIEWING' || post.status === 'NORMAL'"
              type="danger"
              size="small"
              :icon="CloseBold"
              @click="handleBlock(post)"
            >
              屏蔽
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

    <!-- 帖子详情抽屉 -->
    <el-drawer
      v-model="detailDrawerVisible"
      title="帖子详情"
      size="500px"
      direction="rtl"
    >
      <div v-if="currentPost" class="post-detail">
        <div class="detail-header">
          <el-avatar :size="48" :src="currentPost.avatar">
            <el-icon>
              <User />
            </el-icon>
          </el-avatar>
          <div class="detail-author">
            <div class="author-name">
              {{ currentPost.nickname || '匿名用户' }}
            </div>
            <div class="author-meta">
              <el-tag
                :type="getPostTypeTagType(currentPost.postType)"
                size="small"
              >
                {{ getPostTypeLabel(currentPost.postType) }}
              </el-tag>
              <el-tag :type="getStatusTagType(currentPost.status)" size="small">
                {{ getStatusLabel(currentPost.status) }}
              </el-tag>
              <span class="post-time">{{
                formatTime(currentPost.createTime)
              }}</span>
            </div>
          </div>
        </div>

        <h2 class="detail-title">{{ currentPost.title || '无标题' }}</h2>

        <!-- 内容块 -->
        <div class="detail-content">
          <ContentBlockRenderer :blocks="currentPost.contentBlocks" />
        </div>

        <!-- 标签 -->
        <div
          v-if="currentPost.tags && currentPost.tags.length > 0"
          class="detail-tags"
        >
          <el-tag
            v-for="tag in currentPost.tags"
            :key="tag"
            size="small"
            type="info"
          >
            {{ getTagLabel(tag) }}
          </el-tag>
        </div>

        <!-- 位置信息 -->
        <div v-if="currentPost.location" class="detail-location">
          <el-icon>
            <Location />
          </el-icon>
          <span>{{ currentPost.location }}</span>
        </div>

        <!-- 统计数据 -->
        <div class="detail-stats">
          <div class="stat-item">
            <el-icon>
              <View />
            </el-icon>
            <span>{{ currentPost.viewCount || 0 }} 浏览</span>
          </div>
          <div class="stat-item">
            <el-icon>
              <Star />
            </el-icon>
            <span>{{ currentPost.likeCount || 0 }} 点赞</span>
          </div>
          <div class="stat-item">
            <el-icon>
              <ChatDotRound />
            </el-icon>
            <span>{{ currentPost.commentCount || 0 }} 评论</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="detail-actions">
          <el-button
            v-if="
              currentPost.status === 'REVIEWING' ||
              currentPost.status === 'BLOCKED'
            "
            type="success"
            :icon="Select"
            @click="handleApproveDetail"
          >
            审核通过
          </el-button>
          <el-button
            v-if="
              currentPost.status === 'REVIEWING' ||
              currentPost.status === 'NORMAL'
            "
            type="danger"
            :icon="CloseBold"
            @click="handleBlockDetail"
          >
            屏蔽帖子
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 审核记录抽屉 -->
    <el-drawer
      v-model="reviewsDrawerVisible"
      title="审核记录"
      size="400px"
      direction="rtl"
    >
      <div class="reviews-container">
        <el-empty
          v-if="reviews.length === 0"
          description="暂无审核记录"
          :image-size="80"
        />

        <el-timeline v-else>
          <el-timeline-item
            v-for="review in reviews"
            :key="review.id"
            :timestamp="formatTime(review.createTime)"
            placement="top"
          >
            <el-card shadow="never" class="review-card">
              <div class="review-header">
                <span class="reviewer-name">
                  {{ review.operatorName || '系统自动审核' }}
                </span>
                <el-tag v-if="review.operatorId === 0" size="small" type="info">
                  系统
                </el-tag>
                <el-tag v-else size="small" type="primary"> 人工 </el-tag>
              </div>
              <div class="review-opinion">{{ review.opinion || '无备注' }}</div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-drawer>

    <!-- 屏蔽原因对话框 -->
    <el-dialog
      v-model="blockDialogVisible"
      title="屏蔽帖子"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="blockFormRef"
        :model="blockForm"
        :rules="blockFormRules"
        label-width="80px"
      >
        <el-form-item label="屏蔽原因" prop="reason">
          <el-input
            v-model="blockForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入屏蔽原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="blockDialogVisible = false">取消</el-button>
        <el-button
          type="danger"
          :loading="submitting"
          @click="handleConfirmBlock"
        >
          确认屏蔽
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Clock,
  CircleCheck,
  CircleClose,
  Document,
  Search,
  RefreshRight,
  User,
  View,
  Star,
  ChatDotRound,
  Picture,
  Select,
  CloseBold,
  Location,
  Tickets,
} from '@element-plus/icons-vue'
import { useDict } from '@/stores'
import { DICT_TYPE } from '@/utils/dict'
import { get as getModerationApi } from '@/api/generated/帖子审核管理/帖子审核管理'
import ContentBlockRenderer from '@/components/ContentBlockRenderer.vue'
import type {
  PostResponse,
  PostModerationQueryRequest,
  PostDetailResponse,
  PostReviewEntity,
} from '@/api/generated/.ts.schemas'

const moderationApi = getModerationApi()

// 使用字典
const { getLabel: getTagLabel } = useDict(DICT_TYPE.POST_TAG)

// 筛选表单
const filterForm = reactive({
  status: '' as string,
  keyword: '',
  postType: undefined as string | undefined,
})

// 分页参数
const pagination = reactive({
  current: 1,
  size: 12,
  total: 0,
})

// 数据
const posts = ref<PostResponse[]>([])
const loading = ref(false)

// 统计数据
const statistics = computed(() => {
  return {
    total: pagination.total,
    reviewing: posts.value.filter((item) => item.status === 'REVIEWING').length,
    normal: posts.value.filter((item) => item.status === 'NORMAL').length,
    blocked: posts.value.filter((item) => item.status === 'BLOCKED').length,
  }
})

// 详情抽屉
const detailDrawerVisible = ref(false)
const currentPost = ref<PostDetailResponse | null>(null)

// 审核记录抽屉
const reviewsDrawerVisible = ref(false)
const reviews = ref<PostReviewEntity[]>([])
const currentReviewPostId = ref<number | null>(null)

// 屏蔽对话框
const blockDialogVisible = ref(false)
const blockFormRef = ref()
const blockForm = reactive({
  postId: 0,
  reason: '',
})
const blockFormRules = {
  reason: [
    { required: true, message: '请输入屏蔽原因', trigger: 'blur' },
    { min: 5, message: '屏蔽原因至少5个字符', trigger: 'blur' },
  ],
}
const submitting = ref(false)

// 获取帖子列表
const fetchPosts = async () => {
  loading.value = true
  try {
    const params: PostModerationQueryRequest = {
      pageNum: pagination.current,
      pageSize: pagination.size,
      keyword: filterForm.keyword || undefined,
      postType: filterForm.postType || undefined,
      postStatusEnumList: filterForm.status ? [filterForm.status] : undefined,
    }
    const response =
      await moderationApi.postCommunityPostsModerationPage(params)

    if (response) {
      posts.value = response.records || []
      pagination.total = response.total || 0
      pagination.current = response.current || 1
      pagination.size = response.size || 12
    } else {
      posts.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取帖子列表失败:', error)
    ElMessage.error('获取帖子列表失败')
    posts.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchPosts()
}

// 重置
const handleReset = () => {
  filterForm.status = ''
  filterForm.keyword = ''
  filterForm.postType = undefined
  pagination.current = 1
  fetchPosts()
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  fetchPosts()
}

const handleCurrentChange = (page: number) => {
  pagination.current = page
  fetchPosts()
}

// 查看详情
const handleViewDetail = async (post: PostResponse) => {
  if (!post.postId) return
  try {
    const response = await moderationApi.getCommunityPostsModerationPostId(
      post.postId,
    )
    if (response) {
      currentPost.value = response
      detailDrawerVisible.value = true
    }
  } catch (error) {
    console.error('获取帖子详情失败:', error)
    ElMessage.error('获取帖子详情失败')
  }
}

// 查看审核记录
const handleViewReviews = async (post: PostResponse) => {
  if (!post.postId) return
  currentReviewPostId.value = post.postId
  try {
    const response =
      await moderationApi.getCommunityPostsModerationPostIdReviews(post.postId)
    reviews.value = response || []
    reviewsDrawerVisible.value = true
  } catch (error) {
    console.error('获取审核记录失败:', error)
    ElMessage.error('获取审核记录失败')
    reviews.value = []
  }
}

// 审核通过
const handleApprove = async (post: PostResponse) => {
  if (!post.postId) return
  try {
    await ElMessageBox.confirm(
      `确定要通过帖子"${post.title || '无标题'}"的审核吗？`,
      '审核通过',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success',
      },
    )

    await moderationApi.postCommunityPostsModerationPostIdApprove(post.postId, {
      reason: '人工审核通过',
    })
    ElMessage.success('帖子审核已通过')
    fetchPosts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('审核通过失败:', error)
      ElMessage.error('审核通过失败')
    }
  }
}

// 详情页审核通过
const handleApproveDetail = async () => {
  if (!currentPost.value?.postId) return
  try {
    await ElMessageBox.confirm(
      `确定要通过帖子"${currentPost.value.title || '无标题'}"的审核吗？`,
      '审核通过',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success',
      },
    )

    await moderationApi.postCommunityPostsModerationPostIdApprove(
      currentPost.value.postId,
      { reason: '人工审核通过' },
    )
    ElMessage.success('帖子审核已通过')
    detailDrawerVisible.value = false
    fetchPosts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('审核通过失败:', error)
      ElMessage.error('审核通过失败')
    }
  }
}

// 屏蔽帖子
const handleBlock = (post: PostResponse) => {
  if (!post.postId) return
  blockForm.postId = post.postId
  blockForm.reason = ''
  blockDialogVisible.value = true
}

// 详情页屏蔽帖子
const handleBlockDetail = () => {
  if (!currentPost.value?.postId) return
  blockForm.postId = currentPost.value.postId
  blockForm.reason = ''
  blockDialogVisible.value = true
}

// 确认屏蔽
const handleConfirmBlock = async () => {
  if (!blockFormRef.value) return

  try {
    await blockFormRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    await moderationApi.postCommunityPostsModerationPostIdBlock(
      blockForm.postId,
      { reason: blockForm.reason },
    )
    ElMessage.success('帖子已屏蔽')
    blockDialogVisible.value = false
    detailDrawerVisible.value = false
    fetchPosts()
  } catch (error) {
    console.error('屏蔽帖子失败:', error)
    ElMessage.error('屏蔽帖子失败')
  } finally {
    submitting.value = false
  }
}

// 获取帖子类型标签类型
const getPostTypeTagType = (postType?: string) => {
  const map: Record<string, 'primary' | 'success' | 'warning'> = {
    NORMAL: 'primary',
    CLASS: 'success',
    NOTICE: 'warning',
  }
  return postType ? map[postType] || 'primary' : 'primary'
}

// 获取帖子类型标签文本
const getPostTypeLabel = (postType?: string) => {
  const map: Record<string, string> = {
    NORMAL: '普通',
    CLASS: '班级',
    NOTICE: '公告',
  }
  return postType ? map[postType] || '未知' : '未知'
}

// 获取状态标签类型
const getStatusTagType = (status?: string) => {
  const map: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
    NORMAL: 'success',
    DELETED: 'danger',
    BLOCKED: 'warning',
    REVIEWING: 'info',
  }
  return status ? map[status] || 'info' : 'info'
}

// 获取状态标签文本
const getStatusLabel = (status?: string) => {
  const map: Record<string, string> = {
    NORMAL: '已通过',
    DELETED: '已删除',
    BLOCKED: '已屏蔽',
    REVIEWING: '待审核',
  }
  return status ? map[status] || '未知' : '未知'
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
  fetchPosts()
})
</script>

<style lang="scss" scoped>
// 变量定义
$primary-padding: 16px;
$card-gap: 12px;
$border-radius: 8px;
$transition-duration: 0.3s;

// 颜色定义
$reviewing-color: #909399;
$normal-color: #27ae60;
$blocked-color: #e74c3c;
$total-color: #3498db;

$bg-light: #f5f7fa;
$bg-dark: #141414;
$card-bg-light: #ffffff;
$card-bg-dark: #1a1a1a;

// 主容器
.post-moderation {
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

    &.reviewing {
      background: linear-gradient(135deg, #f4f4f5 0%, #fafafa 100%);
      border-left: 3px solid $reviewing-color;

      html.dark & {
        background: linear-gradient(135deg, #262626 0%, #2c2c2c 100%);
      }

      .stat-icon {
        color: $reviewing-color;
      }
    }

    &.normal {
      background: linear-gradient(135deg, #e8f8f5 0%, #e6f9f5 100%);
      border-left: 3px solid $normal-color;

      html.dark & {
        background: linear-gradient(135deg, #162c22 0%, #183326 100%);
      }

      .stat-icon {
        color: $normal-color;
      }
    }

    &.blocked {
      background: linear-gradient(135deg, #fdecea 0%, #fef0ef 100%);
      border-left: 3px solid $blocked-color;

      html.dark & {
        background: linear-gradient(135deg, #2c1a1a 0%, #331d1d 100%);
      }

      .stat-icon {
        color: $blocked-color;
      }
    }

    &.total {
      background: linear-gradient(135deg, #ebf5fb 0%, #e8f4fd 100%);
      border-left: 3px solid $total-color;

      html.dark & {
        background: linear-gradient(135deg, #1a2533 0%, #1d2a3a 100%);
      }

      .stat-icon {
        color: $total-color;
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
  }
}

// 帖子容器
.posts-container {
  min-height: 400px;
  margin-bottom: $card-gap;

  .posts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: $card-gap;
  }
}

// 帖子卡片
.post-card {
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

  &.is-reviewing {
    border-left: 3px solid $reviewing-color;
  }

  .post-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 12px;

    .author-info {
      display: flex;
      align-items: center;
      gap: 10px;

      .author-avatar {
        flex-shrink: 0;
      }

      .author-details {
        .author-name {
          font-size: 14px;
          font-weight: 600;
          color: #2c3e50;

          html.dark & {
            color: #ecf0f1;
          }
        }

        .post-time {
          font-size: 12px;
          color: #7f8c8d;

          html.dark & {
            color: #95a5a6;
          }
        }
      }
    }

    .post-badges {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
  }

  .post-content {
    cursor: pointer;
    margin-bottom: 12px;

    .post-title {
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      html.dark & {
        color: #ecf0f1;
      }
    }

    .post-preview {
      font-size: 14px;
      color: #7f8c8d;
      line-height: 1.5;
      margin: 0 0 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;

      html.dark & {
        color: #95a5a6;
      }
    }

    .post-cover {
      margin-bottom: 12px;

      .cover-image {
        width: 100%;
        height: 160px;
        border-radius: 6px;
        overflow: hidden;
      }

      .image-error {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f7fa;
        color: #bdc3c7;
        font-size: 32px;

        html.dark & {
          background: #2c2c2c;
        }
      }
    }

    .post-tags {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
  }

  .post-stats {
    display: flex;
    gap: 16px;
    padding: 12px 0;
    border-top: 1px solid #ebeef5;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 12px;

    html.dark & {
      border-color: #363636;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #7f8c8d;

      html.dark & {
        color: #95a5a6;
      }
    }
  }

  .post-actions {
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

// 帖子详情
.post-detail {
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

        .post-time {
          font-size: 12px;
          color: #7f8c8d;

          html.dark & {
            color: #95a5a6;
          }
        }
      }
    }
  }

  .detail-title {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 16px;

    html.dark & {
      color: #ecf0f1;
    }
  }

  .detail-content {
    margin-bottom: 16px;
  }

  .detail-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .detail-location {
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

  .detail-stats {
    display: flex;
    gap: 20px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
    margin-bottom: 20px;

    html.dark & {
      background: #2c2c2c;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #7f8c8d;

      html.dark & {
        color: #95a5a6;
      }
    }
  }

  .detail-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
}

// 审核记录
.reviews-container {
  .review-card {
    border: none;
    background: #f5f7fa;

    html.dark & {
      background: #2c2c2c;
    }

    .review-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      .reviewer-name {
        font-size: 14px;
        font-weight: 600;
        color: #2c3e50;

        html.dark & {
          color: #ecf0f1;
        }
      }
    }

    .review-opinion {
      font-size: 13px;
      color: #7f8c8d;
      line-height: 1.5;

      html.dark & {
        color: #95a5a6;
      }
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
  .post-moderation {
    padding: 10px;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .posts-container .posts-grid {
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
