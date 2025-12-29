<template>
  <div class="auth-management">
    <!-- 统计卡片区域 -->
    <div class="stats-cards">
      <el-card class="stat-card pending" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.pending }}</div>
            <div class="stat-label">待审核</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card approved" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.approved }}</div>
            <div class="stat-label">已通过</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card rejected" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><CircleClose /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.rejected }}</div>
            <div class="stat-label">已拒绝</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card total" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.total }}</div>
            <div class="stat-label">总申请数</div>
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
            <el-radio-button value="PENDING">待审核</el-radio-button>
            <el-radio-button value="APPROVED">已通过</el-radio-button>
            <el-radio-button value="REJECTED">已拒绝</el-radio-button>
          </el-radio-group>

          <el-select
            v-model="filterForm.identity"
            placeholder="选择身份"
            clearable
            style="width: 140px"
            @change="handleSearch"
          >
            <el-option :value="1" label="学生" />
            <el-option :value="2" label="教师" />
            <el-option :value="3" label="校友" />
          </el-select>

          <el-input
            v-model="filterForm.name"
            placeholder="搜索姓名"
            clearable
            style="width: 140px"
            @change="handleSearch"
          />
        </div>

        <el-button :icon="RefreshRight" @click="handleReset">刷新</el-button>
      </div>
    </el-card>

    <!-- 认证申请列表 -->
    <div v-loading="loading" class="auth-cards-container">
      <el-empty
        v-if="!loading && authRequests.length === 0"
        description="暂无认证申请"
      />

      <TransitionGroup name="card-list" tag="div" class="auth-cards-grid">
        <el-card
          v-for="request in authRequests"
          :key="request.id"
          class="auth-request-card"
          shadow="hover"
        >
          <div class="card-header">
            <div class="user-basic-info">
              <el-avatar :size="40" class="user-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="user-details">
                <div class="user-name">{{ request.realName }}</div>
                <div class="user-meta">
                  <el-tag
                    :type="getIdentityTagType(request.identity)"
                    size="small"
                  >
                    {{ getIdentityLabel(request.identity) }}
                  </el-tag>
                  <span class="user-phone">{{ request.phone }}</span>
                  <span class="user-gender">{{
                    getGenderLabel(request.gender)
                  }}</span>
                </div>
              </div>
            </div>
            <el-tag :type="getStatusTagType(request.status)" effect="plain">
              {{ getStatusLabel(request.status) }}
            </el-tag>
          </div>

          <div class="card-content">
            <div v-if="request.reviewedTime" class="info-row">
              <span class="info-label">审核时间</span>
              <span class="info-value">{{ request.reviewedTime }}</span>
            </div>
            <div v-if="request.reviewerId" class="info-row">
              <span class="info-label">审核员</span>
              <span class="info-value">{{ request.reviewerId }}</span>
            </div>
            <div v-if="request.rejectReason" class="info-row full-width">
              <span class="info-label">拒绝原因</span>
              <span class="info-value reject-reason">{{
                request.rejectReason
              }}</span>
            </div>
          </div>

          <!-- 认证图片 -->
          <div
            v-if="request.info && request.info.length > 0"
            class="card-images"
          >
            <div class="images-grid">
              <el-image
                v-for="(img, idx) in request.info"
                :key="`${request.id}-${idx}`"
                :src="img"
                :preview-src-list="request.info"
                :initial-index="idx"
                fit="cover"
                class="auth-image"
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
          </div>

          <div class="card-actions">
            <el-button
              v-if="request.status === 'PENDING'"
              type="success"
              :icon="Select"
              size="small"
              @click="handleApprove(request)"
              >通过</el-button
            >
            <el-button
              v-if="request.status === 'PENDING'"
              type="danger"
              :icon="CloseBold"
              size="small"
              @click="handleReject(request)"
              >拒绝</el-button
            >
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

    <!-- 拒绝原因对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝认证申请"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="rejectFormRef"
        :model="rejectForm"
        :rules="rejectFormRules"
        label-width="80px"
      >
        <el-form-item label="拒绝原因" prop="rejectReason">
          <el-input
            v-model="rejectForm.rejectReason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button
          type="danger"
          :loading="submitting"
          @click="handleConfirmReject"
          >确认拒绝</el-button
        >
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
  User,
  RefreshRight,
  Select,
  CloseBold,
  Picture,
} from '@element-plus/icons-vue'
import { useDict } from '@/stores'
import { DICT_TYPE } from '@/utils/dict'
import { get as getAuthApi } from '@/api/generated/身份认证控制类/身份认证控制类'
import type {
  AuthRequestPageResponse,
  AuthRequestsPageRequest,
  AuthRequestHandlerRequest,
} from '@/api/generated/.ts.schemas'

const authApi = getAuthApi()

// 使用字典
const { getLabel: getGenderLabel } = useDict(DICT_TYPE.GENDER)
const { getLabel: getIdentityLabel } = useDict(DICT_TYPE.USER_TYPE)

// 筛选表单
const filterForm = reactive({
  status: '' as string,
  identity: undefined as number | undefined,
  name: '' as string,
})

// 分页参数
const pagination = reactive({
  current: 1,
  size: 12,
  total: 0,
})

// 数据
const authRequests = ref<AuthRequestPageResponse[]>([])
const loading = ref(false)

// 统计数据
const statistics = computed(() => {
  return {
    total: pagination.total,
    pending: authRequests.value.filter((item) => item.status === 'PENDING')
      .length,
    approved: authRequests.value.filter((item) => item.status === 'APPROVED')
      .length,
    rejected: authRequests.value.filter((item) => item.status === 'REJECTED')
      .length,
  }
})

// 拒绝对话框
const rejectDialogVisible = ref(false)
const rejectFormRef = ref()
const rejectForm = reactive({
  id: 0,
  rejectReason: '',
})
const rejectFormRules = {
  rejectReason: [
    { required: true, message: '请输入拒绝原因', trigger: 'blur' },
    { min: 5, message: '拒绝原因至少5个字符', trigger: 'blur' },
  ],
}
const submitting = ref(false)

// 获取认证申请列表
const fetchAuthRequests = async () => {
  loading.value = true
  try {
    const params: AuthRequestsPageRequest = {
      current: pagination.current,
      size: pagination.size,
      status: filterForm.status || undefined,
      identity: filterForm.identity,
      name: filterForm.name || undefined,
    }
    const response = await authApi.postAuthIdentityRequestsPage(params)

    if (response) {
      authRequests.value = response.records || []
      pagination.total = response.total || 0
      pagination.current = response.current || 1
      pagination.size = response.size || 12
    } else {
      authRequests.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取认证申请列表失败:', error)
    ElMessage.error('获取认证申请列表失败')
    authRequests.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchAuthRequests()
}

// 重置
const handleReset = () => {
  filterForm.status = ''
  filterForm.identity = undefined
  filterForm.name = ''
  pagination.current = 1
  fetchAuthRequests()
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  fetchAuthRequests()
}

const handleCurrentChange = (page: number) => {
  pagination.current = page
  fetchAuthRequests()
}

// 通过认证
const handleApprove = async (request: AuthRequestPageResponse) => {
  if (!request.id) return
  try {
    await ElMessageBox.confirm(
      `确定要通过用户 "${request.realName}" 的认证申请吗？`,
      '通过认证',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success',
      },
    )

    const params: AuthRequestHandlerRequest = {
      id: request.id,
      result: 'APPROVED',
    }
    await authApi.postAuthIdentityRequestsHandle(params)
    ElMessage.success('认证申请已通过')
    fetchAuthRequests()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('处理认证失败:', error)
      ElMessage.error('处理认证失败')
    }
  }
}

// 拒绝认证
const handleReject = (request: AuthRequestPageResponse) => {
  if (!request.id) return
  rejectForm.id = request.id
  rejectForm.rejectReason = ''
  rejectDialogVisible.value = true
}

// 确认拒绝
const handleConfirmReject = async () => {
  if (!rejectFormRef.value) return

  try {
    await rejectFormRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    const params: AuthRequestHandlerRequest = {
      id: rejectForm.id,
      result: 'REJECTED',
      rejectReason: rejectForm.rejectReason,
    }
    await authApi.postAuthIdentityRequestsHandle(params)
    ElMessage.success('认证申请已拒绝')
    rejectDialogVisible.value = false
    fetchAuthRequests()
  } catch (error) {
    console.error('处理认证失败:', error)
    ElMessage.error('处理认证失败')
  } finally {
    submitting.value = false
  }
}

// 获取身份标签类型
const getIdentityTagType = (identity?: number) => {
  const map: Record<number, 'success' | 'warning' | 'info'> = {
    1: 'success',
    2: 'warning',
    3: 'info',
  }
  return identity ? map[identity] || 'info' : 'info'
}

// 获取状态标签类型
const getStatusTagType = (status?: string) => {
  const map: Record<string, 'warning' | 'success' | 'danger' | 'info'> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
  }
  return status ? map[status] || 'info' : 'info'
}

// 获取状态标签文本
const getStatusLabel = (status?: string) => {
  const map: Record<string, string> = {
    PENDING: '待审核',
    APPROVED: '已通过',
    REJECTED: '已拒绝',
  }
  return status ? map[status] || '未知' : '未知'
}

// 初始化
onMounted(() => {
  fetchAuthRequests()
})
</script>

<style lang="scss" scoped>
// 变量定义
$primary-padding: 16px;
$card-gap: 12px;
$border-radius: 8px;
$transition-duration: 0.3s;

// 颜色定义
$pending-color: #f39c12;
$approved-color: #27ae60;
$rejected-color: #e74c3c;
$total-color: #3498db;

$bg-light: #f5f7fa;
$bg-dark: #141414;
$card-bg-light: #ffffff;
$card-bg-dark: #1a1a1a;

// 主容器
.auth-management {
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

    // 统计卡片主题色
    &.pending {
      background: linear-gradient(135deg, #fef5e7 0%, #fff9e6 100%);
      border-left: 3px solid $pending-color;

      html.dark & {
        background: linear-gradient(135deg, #2c2416 0%, #332819 100%);
      }

      .stat-icon {
        color: $pending-color;
      }
    }

    &.approved {
      background: linear-gradient(135deg, #e8f8f5 0%, #e6f9f5 100%);
      border-left: 3px solid $approved-color;

      html.dark & {
        background: linear-gradient(135deg, #162c22 0%, #183326 100%);
      }

      .stat-icon {
        color: $approved-color;
      }
    }

    &.rejected {
      background: linear-gradient(135deg, #fdecea 0%, #fef0ef 100%);
      border-left: 3px solid $rejected-color;

      html.dark & {
        background: linear-gradient(135deg, #2c1a1a 0%, #331d1d 100%);
      }

      .stat-icon {
        color: $rejected-color;
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

// 认证卡片容器
.auth-cards-container {
  min-height: 400px;
  margin-bottom: $card-gap;

  .auth-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: $card-gap;
  }
}

// 认证卡片
.auth-request-card {
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

  .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;

    .user-basic-info {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;

      .user-avatar {
        flex-shrink: 0;
      }

      .user-details {
        flex: 1;
        min-width: 0;

        .user-name {
          font-size: 15px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          html.dark & {
            color: #ecf0f1;
          }
        }

        .user-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          font-size: 12px;

          .user-phone,
          .user-gender {
            color: #7f8c8d;

            html.dark & {
              color: #95a5a6;
            }
          }
        }
      }
    }
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 10px;

    .info-row {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 13px;

      &.full-width {
        flex-direction: column;
        gap: 4px;
      }

      .info-label {
        color: #7f8c8d;
        font-weight: 500;
        flex-shrink: 0;

        html.dark & {
          color: #95a5a6;
        }
      }

      .info-value {
        color: #2c3e50;
        flex: 1;

        html.dark & {
          color: #ecf0f1;
        }

        &.reject-reason {
          padding: 6px 8px;
          background: #fdecea;
          border-radius: 4px;
          color: #e74c3c;

          html.dark & {
            background: #2c1a1a;
          }
        }
      }
    }
  }

  .card-images {
    margin-bottom: 10px;

    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
      gap: 6px;

      .auth-image {
        width: 100%;
        height: 70px;
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
    }
  }

  .card-actions {
    display: flex;
    gap: 6px;
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
  .auth-management {
    padding: 10px;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .auth-cards-container .auth-cards-grid {
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
