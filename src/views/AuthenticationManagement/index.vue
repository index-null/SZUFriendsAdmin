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
              <div class="user-avatar">
                <el-avatar :size="48">
                  <el-icon><User /></el-icon>
                </el-avatar>
              </div>
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
                </div>
              </div>
            </div>
            <el-tag :type="getStatusTagType(request.status)" effect="plain">
              {{ getStatusLabel(request.status) }}
            </el-tag>
          </div>

          <el-divider />

          <div class="card-content">
            <div class="info-row">
              <span class="info-label">性别</span>
              <span class="info-value">{{
                getGenderLabel(request.gender)
              }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">用户ID</span>
              <span class="info-value">{{ request.userId }}</span>
            </div>
            <div v-if="request.reviewedTime" class="info-row">
              <span class="info-label">审核时间</span>
              <span class="info-value">{{ request.reviewedTime }}</span>
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
            <div class="images-label">认证材料</div>
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
            <el-button
              type="info"
              :icon="View"
              size="small"
              plain
              @click="handleViewDetail(request)"
              >详情</el-button
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

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="认证申请详情" width="600px">
      <el-descriptions v-if="currentRequest" :column="2" border>
        <el-descriptions-item label="申请ID">
          {{ currentRequest.id }}
        </el-descriptions-item>
        <el-descriptions-item label="用户ID">
          {{ currentRequest.userId }}
        </el-descriptions-item>
        <el-descriptions-item label="真实姓名">
          {{ currentRequest.realName }}
        </el-descriptions-item>
        <el-descriptions-item label="性别">
          {{ getGenderLabel(currentRequest.gender) }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
          {{ currentRequest.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="认证身份">
          <el-tag :type="getIdentityTagType(currentRequest.identity)">
            {{ getIdentityLabel(currentRequest.identity) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态" :span="2">
          <el-tag :type="getStatusTagType(currentRequest.status)">
            {{ getStatusLabel(currentRequest.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item
          v-if="currentRequest.reviewedTime"
          label="审核时间"
          :span="2"
        >
          {{ currentRequest.reviewedTime }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="currentRequest.reviewerId"
          label="审核管理员"
          :span="2"
        >
          {{ currentRequest.reviewerId }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="currentRequest.rejectReason"
          label="拒绝原因"
          :span="2"
        >
          {{ currentRequest.rejectReason }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="currentRequest.info && currentRequest.info.length > 0"
          label="认证材料"
          :span="2"
        >
          <div class="detail-images">
            <el-image
              v-for="(img, idx) in currentRequest.info"
              :key="idx"
              :src="img"
              :preview-src-list="currentRequest.info"
              :initial-index="idx"
              fit="cover"
              style="width: 100px; height: 100px; margin-right: 8px"
            />
          </div>
        </el-descriptions-item>
      </el-descriptions>
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
  View,
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

// 详情对话框
const detailDialogVisible = ref(false)
const currentRequest = ref<AuthRequestPageResponse | null>(null)

// 获取认证申请列表
const fetchAuthRequests = async () => {
  loading.value = true
  try {
    const params: AuthRequestsPageRequest = {
      current: pagination.current,
      size: pagination.size,
      status: filterForm.status || undefined,
      identity: filterForm.identity,
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

// 查看详情
const handleViewDetail = (request: AuthRequestPageResponse) => {
  currentRequest.value = request
  detailDialogVisible.value = true
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

<style scoped>
.auth-management {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

html.dark .auth-management {
  background: #141414;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
  border: none;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-card.pending {
  background: linear-gradient(135deg, #fef5e7 0%, #fff9e6 100%);
  border-left: 4px solid #f39c12;
}

.stat-card.approved {
  background: linear-gradient(135deg, #e8f8f5 0%, #e6f9f5 100%);
  border-left: 4px solid #27ae60;
}

.stat-card.rejected {
  background: linear-gradient(135deg, #fdecea 0%, #fef0ef 100%);
  border-left: 4px solid #e74c3c;
}

.stat-card.total {
  background: linear-gradient(135deg, #ebf5fb 0%, #e8f4fd 100%);
  border-left: 4px solid #3498db;
}

html.dark .stat-card.pending {
  background: linear-gradient(135deg, #2c2416 0%, #332819 100%);
}

html.dark .stat-card.approved {
  background: linear-gradient(135deg, #162c22 0%, #183326 100%);
}

html.dark .stat-card.rejected {
  background: linear-gradient(135deg, #2c1a1a 0%, #331d1d 100%);
}

html.dark .stat-card.total {
  background: linear-gradient(135deg, #1a2533 0%, #1d2a3a 100%);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 28px;
  background: rgba(255, 255, 255, 0.8);
}

html.dark .stat-icon {
  background: rgba(0, 0, 0, 0.3);
}

.stat-card.pending .stat-icon {
  color: #f39c12;
}

.stat-card.approved .stat-icon {
  color: #27ae60;
}

.stat-card.rejected .stat-icon {
  color: #e74c3c;
}

.stat-card.total .stat-icon {
  color: #3498db;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 8px;
  color: #2c3e50;
}

html.dark .stat-value {
  color: #ecf0f1;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
}

html.dark .stat-label {
  color: #95a5a6;
}

/* 筛选卡片 */
.filter-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: none;
}

.filter-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

/* 认证卡片容器 */
.auth-cards-container {
  min-height: 400px;
  margin-bottom: 20px;
}

.auth-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
}

/* 认证卡片 */
.auth-request-card {
  border-radius: 12px;
  border: none;
  transition: all 0.3s ease;
}

.auth-request-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

html.dark .auth-request-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.user-basic-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.user-avatar {
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 6px;
}

html.dark .user-name {
  color: #ecf0f1;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.user-phone {
  font-size: 13px;
  color: #7f8c8d;
}

html.dark .user-phone {
  color: #95a5a6;
}

.card-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-row.full-width {
  grid-column: 1 / -1;
  flex-direction: column;
  align-items: flex-start;
}

.info-label {
  font-size: 13px;
  color: #7f8c8d;
  font-weight: 500;
  flex-shrink: 0;
}

html.dark .info-label {
  color: #95a5a6;
}

.info-value {
  font-size: 14px;
  color: #2c3e50;
  flex: 1;
}

html.dark .info-value {
  color: #ecf0f1;
}

.reject-reason {
  padding: 8px;
  background: #fdecea;
  border-radius: 4px;
  color: #e74c3c;
  width: 100%;
}

html.dark .reject-reason {
  background: #2c1a1a;
}

/* 认证图片 */
.card-images {
  margin-top: 16px;
}

.images-label {
  font-size: 13px;
  color: #7f8c8d;
  font-weight: 500;
  margin-bottom: 8px;
}

html.dark .images-label {
  color: #95a5a6;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}

.auth-image {
  width: 100%;
  height: 80px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.auth-image:hover {
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
  font-size: 24px;
}

html.dark .image-error {
  background: #2c2c2c;
}

/* 卡片操作 */
.card-actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 20px;
  background: white;
  border-radius: 12px;
}

html.dark .pagination-wrapper {
  background: #1a1a1a;
}

/* 详情对话框图片 */
.detail-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 卡片列表过渡动画 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .auth-management {
    padding: 12px;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .auth-cards-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .filter-content {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-left {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
