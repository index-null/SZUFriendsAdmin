<template>
  <div class="post-management">
    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-content">
        <div class="filter-left">
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索帖子标题/内容"
            clearable
            style="width: 200px"
            :prefix-icon="Search"
            @change="handleSearch"
          />

          <el-select
            v-model="filterForm.postType"
            placeholder="帖子类型"
            clearable
            style="width: 140px"
            @change="handleSearch"
          >
            <el-option label="普通帖子" value="NORMAL" />
            <el-option label="班级帖子" value="CLASS" />
            <el-option label="公告" value="NOTICE" />
          </el-select>

          <el-select
            v-model="filterForm.sortBy"
            placeholder="排序方式"
            style="width: 140px"
            @change="handleSearch"
          >
            <el-option label="最新发布" value="TIME" />
            <el-option label="最热门" value="HOT" />
          </el-select>

          <el-checkbox v-model="filterForm.hasImage" @change="handleSearch">
            有图片
          </el-checkbox>

          <el-checkbox v-model="filterForm.hasVideo" @change="handleSearch">
            有视频
          </el-checkbox>
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
          shadow="hover"
        >
          <!-- 帖子头部 -->
          <div class="post-header">
            <div class="author-info">
              <el-avatar :size="36" :src="post.avatar" class="author-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="author-details">
                <div class="author-name">{{ post.nickname || '匿名用户' }}</div>
                <div class="post-time">{{ formatTime(post.createTime) }}</div>
              </div>
            </div>
            <div class="post-badges">
              <el-tag
                v-if="post.isTop"
                type="danger"
                size="small"
                effect="dark"
              >
                置顶
              </el-tag>
              <el-tag :type="getPostTypeTagType(post.postType)" size="small">
                {{ getPostTypeLabel(post.postType) }}
              </el-tag>
              <el-tag :type="getStatusTagType(post.status)" size="small">
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
              <el-image
                :src="post.cover"
                fit="cover"
                class="cover-image"
                :preview-src-list="[post.cover]"
                preview-teleported
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
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
              <span v-if="post.tags.length > 3" class="more-tags">
                +{{ post.tags.length - 3 }}
              </span>
            </div>
          </div>

          <!-- 帖子统计 -->
          <div class="post-stats">
            <div class="stat-item">
              <el-icon><View /></el-icon>
              <span>{{ post.viewCount || 0 }}</span>
            </div>
            <div class="stat-item">
              <el-icon><Star /></el-icon>
              <span>{{ post.likeCount || 0 }}</span>
            </div>
            <div class="stat-item">
              <el-icon><ChatDotRound /></el-icon>
              <span>{{ post.commentCount || 0 }}</span>
            </div>
            <div class="stat-item">
              <el-icon><Share /></el-icon>
              <span>{{ post.shareCount || 0 }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="post-actions">
            <el-button
              v-if="!post.isTop"
              type="warning"
              size="small"
              plain
              :icon="Top"
              @click="handleTop(post)"
            >
              置顶
            </el-button>
            <el-button
              v-else
              type="info"
              size="small"
              plain
              :icon="Bottom"
              @click="handleUntop(post)"
            >
              取消置顶
            </el-button>
            <el-button
              type="danger"
              size="small"
              plain
              :icon="Delete"
              @click="handleDelete(post)"
            >
              删除
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
      destroy-on-close
    >
      <div v-if="currentPost" class="post-detail">
        <div class="detail-header">
          <el-avatar :size="48" :src="currentPost.avatar">
            <el-icon><User /></el-icon>
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
          <el-icon><Location /></el-icon>
          <span>{{ currentPost.location }}</span>
        </div>

        <!-- 统计数据 -->
        <div class="detail-stats">
          <div class="stat-item">
            <el-icon><View /></el-icon>
            <span>{{ currentPost.viewCount || 0 }} 浏览</span>
          </div>
          <div class="stat-item">
            <el-icon><Star /></el-icon>
            <span>{{ currentPost.likeCount || 0 }} 点赞</span>
          </div>
          <div class="stat-item">
            <el-icon><ChatDotRound /></el-icon>
            <span>{{ currentPost.commentCount || 0 }} 评论</span>
          </div>
          <div class="stat-item">
            <el-icon><Share /></el-icon>
            <span>{{ currentPost.shareCount || 0 }} 分享</span>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  RefreshRight,
  User,
  View,
  Star,
  ChatDotRound,
  Share,
  Picture,
  Top,
  Bottom,
  Delete,
  Location,
} from '@element-plus/icons-vue'
import { useDict } from '@/stores'
import { DICT_TYPE } from '@/utils/dict'
import { get as getPostApi } from '@/api/generated/帖子管理/帖子管理'
import ContentBlockRenderer from '@/components/ContentBlockRenderer.vue'
import type {
  PostResponse,
  PostQueryRequest,
  PostDetailResponse,
} from '@/api/generated/.ts.schemas'

const postApi = getPostApi()

// 使用字典
const { getLabel: getTagLabel } = useDict(DICT_TYPE.POST_TAG)

// 筛选表单
const filterForm = reactive({
  keyword: '',
  postType: undefined as string | undefined,
  sortBy: 'TIME' as string,
  hasImage: false,
  hasVideo: false,
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

// 详情抽屉
const detailDrawerVisible = ref(false)
const currentPost = ref<PostDetailResponse | null>(null)

// 获取帖子列表
const fetchPosts = async () => {
  loading.value = true
  try {
    const params: PostQueryRequest = {
      pageNum: pagination.current,
      pageSize: pagination.size,
      sortBy: filterForm.sortBy as PostQueryRequest['sortBy'],
      keyword: filterForm.keyword || undefined,
      postType: filterForm.postType || undefined,
      hasImage: filterForm.hasImage || undefined,
      hasVideo: filterForm.hasVideo || undefined,
    }
    const response = await postApi.postCommunityPostsPage(params)

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
  filterForm.keyword = ''
  filterForm.postType = undefined
  filterForm.sortBy = 'TIME'
  filterForm.hasImage = false
  filterForm.hasVideo = false
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
    const response = await postApi.getCommunityPostsPostId(post.postId)
    if (response) {
      currentPost.value = response
      detailDrawerVisible.value = true
    }
  } catch (error) {
    console.error('获取帖子详情失败:', error)
    ElMessage.error('获取帖子详情失败')
  }
}

// 置顶帖子
const handleTop = async (post: PostResponse) => {
  if (!post.postId) return
  try {
    await ElMessageBox.confirm(
      `确定要置顶帖子"${post.title || '无标题'}"吗？`,
      '置顶帖子',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    await postApi.putCommunityPostsPostIdTop(post.postId)
    ElMessage.success('帖子已置顶')
    fetchPosts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('置顶帖子失败:', error)
      ElMessage.error('置顶帖子失败')
    }
  }
}

// 取消置顶
const handleUntop = async (post: PostResponse) => {
  if (!post.postId) return
  try {
    await ElMessageBox.confirm(
      `确定要取消置顶帖子"${post.title || '无标题'}"吗？`,
      '取消置顶',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      },
    )

    await postApi.putCommunityPostsPostIdUntop(post.postId)
    ElMessage.success('已取消置顶')
    fetchPosts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消置顶失败:', error)
      ElMessage.error('取消置顶失败')
    }
  }
}

// 删除帖子
const handleDelete = async (post: PostResponse) => {
  if (!post.postId) return
  try {
    await ElMessageBox.confirm(
      `确定要删除帖子"${post.title || '无标题'}"吗？此操作不可恢复！`,
      '删除帖子',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
      },
    )

    await postApi.deleteCommunityPostsPostId(post.postId)
    ElMessage.success('帖子已删除')
    fetchPosts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除帖子失败:', error)
      ElMessage.error('删除帖子失败')
    }
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
    NORMAL: '正常',
    DELETED: '已删除',
    BLOCKED: '已屏蔽',
    REVIEWING: '审核中',
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

$bg-light: #f5f7fa;
$bg-dark: #141414;
$card-bg-light: #ffffff;
$card-bg-dark: #1a1a1a;

// 主容器
.post-management {
  padding: $primary-padding;
  background: $bg-light;
  min-height: 100vh;

  html.dark & {
    background: $bg-dark;
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
      line-clamp: 2;
      -webkit-line-clamp: 2;
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
      align-items: center;

      .more-tags {
        font-size: 12px;
        color: #7f8c8d;
      }
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
  .post-management {
    padding: 10px;
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
