<template>
  <el-drawer
    v-model="drawerVisible"
    title="用户详情"
    direction="rtl"
    size="600px"
    :close-on-click-modal="true"
  >
    <div v-if="userDetail" class="user-detail-container">
      <!-- 用户基本信息卡片 -->
      <el-card shadow="never" class="info-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
          </div>
        </template>
        <div class="user-header">
          <el-avatar :src="userDetail.avatar" :size="80">
            <el-icon :size="40"><User /></el-icon>
          </el-avatar>
          <div class="user-header-info">
            <div class="username">{{ userDetail.username }}</div>
            <div class="tags">
              <el-tag :type="getUserTypeTag(userDetail.userType)" size="small">
                {{ getUserTypeLabel(userDetail.userType) }}
              </el-tag>
              <el-tag
                :type="userDetail.status === 1 ? 'success' : 'danger'"
                size="small"
                style="margin-left: 8px"
              >
                {{ userDetail.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </div>
          </div>
        </div>
        <el-descriptions :column="1" border class="info-descriptions">
          <el-descriptions-item label="用户ID">
            {{ userDetail.id }}
          </el-descriptions-item>
          <el-descriptions-item label="昵称">
            {{ userDetail.nickname || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="真实姓名">
            {{ userDetail.realName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="学号/工号">
            {{ userDetail.studentId || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 联系方式卡片 -->
      <el-card shadow="never" class="info-card">
        <template #header>
          <div class="card-header">
            <span>联系方式</span>
          </div>
        </template>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="邮箱">
            {{ userDetail.email || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="手机号">
            {{ userDetail.phone || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="性别">
            {{ getGenderLabel(userDetail.gender) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 教育/职业信息卡片 -->
      <el-card shadow="never" class="info-card">
        <template #header>
          <div class="card-header">
            <span>教育/职业信息</span>
          </div>
        </template>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="专业">
            {{ userDetail.major || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="入学年份">
            {{ userDetail.admissionYear || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="毕业年份">
            {{ userDetail.graduationYear || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="工作单位">
            {{ userDetail.companyName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="职位">
            {{ userDetail.jobTitle || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="行业">
            {{ userDetail.industry || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 地域信息卡片 -->
      <el-card shadow="never" class="info-card">
        <template #header>
          <div class="card-header">
            <span>地域信息</span>
          </div>
        </template>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="所在地">
            {{
              [userDetail.province, userDetail.city, userDetail.district]
                .filter(Boolean)
                .join(' ') || '-'
            }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 个人简介卡片 -->
      <el-card v-if="userDetail.bio" shadow="never" class="info-card">
        <template #header>
          <div class="card-header">
            <span>个人简介</span>
          </div>
        </template>
        <div class="bio-content">{{ userDetail.bio }}</div>
      </el-card>

      <!-- 系统信息卡片 -->
      <el-card shadow="never" class="info-card">
        <template #header>
          <div class="card-header">
            <span>系统信息</span>
          </div>
        </template>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(userDetail.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDateTime(userDetail.updateTime) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>

    <div v-else class="empty-state">
      <el-empty description="暂无用户信息" />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { User } from '@element-plus/icons-vue'
import type { UserEntity } from '@/api/generated/.ts.schemas'
import { useDict } from '@/stores'
import { DICT_TYPE } from '@/utils/dict'

interface Props {
  visible: boolean
  userDetail: UserEntity | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const drawerVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

// 使用字典
const { getLabel: getUserTypeLabel } = useDict(DICT_TYPE.USER_TYPE)
const { getLabel: getGenderLabel } = useDict(DICT_TYPE.GENDER)

// 用户类型标签颜色映射
const getUserTypeTag = (
  type: number | undefined,
): 'success' | 'warning' | 'info' => {
  if (type === undefined) return 'info'
  const map: Record<number, 'success' | 'warning' | 'info'> = {
    1: 'success',
    2: 'warning',
    3: 'info',
  }
  return map[type] || 'info'
}

// 格式化时间
const formatDateTime = (dateTime?: string) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}
</script>

<style scoped>
.user-detail-container {
  padding: 0 4px;
}

.info-card {
  margin-bottom: 16px;
}

.info-card:last-child {
  margin-bottom: 0;
}

.card-header {
  font-weight: 600;
  font-size: 15px;
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--el-color-primary);
  border-radius: 8px;
  color: white;
}

.user-header-info {
  margin-left: 20px;
  flex: 1;
}

.username {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.tags {
  display: flex;
  align-items: center;
}

.info-descriptions {
  margin-top: 0;
}

.bio-content {
  padding: 12px;
  line-height: 1.6;
  color: #606266;
  white-space: pre-wrap;
  word-break: break-word;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
  width: 120px;
}

:deep(.el-card__header) {
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-drawer__header) {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 600;
  font-size: 18px;
}

:deep(.el-drawer__body) {
  padding: 0 20px 20px;
  overflow-y: auto;
}

/* 暗色模式适配 */
html.dark .card-header {
  color: #e5e7eb;
}

html.dark .bio-content {
  color: #d1d5db;
}

html.dark :deep(.el-card__header) {
  border-bottom-color: #4c4d4f;
}

html.dark :deep(.el-drawer__header) {
  border-bottom-color: #4c4d4f;
}
</style>
