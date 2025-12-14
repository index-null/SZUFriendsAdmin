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
            </div>
          </div>
        </div>
        <el-descriptions :column="1" border class="info-descriptions">
          <el-descriptions-item label="用户ID">
            {{ userDetail.id }}
          </el-descriptions-item>
          <el-descriptions-item v-if="userDetail.nickname" label="昵称">
            {{ userDetail.nickname }}
          </el-descriptions-item>
          <el-descriptions-item v-if="userDetail.realName" label="真实姓名">
            {{ userDetail.realName }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="userDetail.gender !== undefined"
            label="性别"
          >
            {{ getGenderLabel(userDetail.gender) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="userDetail.birthday" label="生日">
            {{ userDetail.birthday }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 联系方式卡片 -->
      <el-card
        v-if="
          userDetail.email ||
          userDetail.phone ||
          userDetail.wechat ||
          userDetail.qq
        "
        shadow="never"
        class="info-card"
      >
        <template #header>
          <div class="card-header">
            <span>联系方式</span>
          </div>
        </template>
        <el-descriptions :column="1" border>
          <el-descriptions-item v-if="userDetail.email" label="邮箱">
            {{ userDetail.email }}
          </el-descriptions-item>
          <el-descriptions-item v-if="userDetail.phone" label="手机号">
            {{ userDetail.phone }}
          </el-descriptions-item>
          <el-descriptions-item v-if="userDetail.wechat" label="微信号">
            {{ userDetail.wechat }}
          </el-descriptions-item>
          <el-descriptions-item v-if="userDetail.qq" label="QQ号">
            {{ userDetail.qq }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 职业信息卡片 -->
      <el-card
        v-if="
          userDetail.companyName || userDetail.jobTitle || userDetail.industry
        "
        shadow="never"
        class="info-card"
      >
        <template #header>
          <div class="card-header">
            <span>职业信息</span>
          </div>
        </template>
        <el-descriptions :column="1" border>
          <el-descriptions-item v-if="userDetail.companyName" label="工作单位">
            {{ userDetail.companyName }}
          </el-descriptions-item>
          <el-descriptions-item v-if="userDetail.jobTitle" label="职位">
            {{ userDetail.jobTitle }}
          </el-descriptions-item>
          <el-descriptions-item v-if="userDetail.industry" label="行业">
            {{ userDetail.industry }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 地域信息卡片 -->
      <el-card
        v-if="userDetail.locationResponse && hasLocationInfo"
        shadow="never"
        class="info-card"
      >
        <template #header>
          <div class="card-header">
            <span>地域信息</span>
          </div>
        </template>
        <el-descriptions :column="1" border>
          <el-descriptions-item
            v-if="
              userDetail.locationResponse.province ||
              userDetail.locationResponse.city ||
              userDetail.locationResponse.district
            "
            label="所在地"
          >
            {{
              [
                userDetail.locationResponse.province,
                userDetail.locationResponse.city,
                userDetail.locationResponse.district,
              ]
                .filter(Boolean)
                .join(' ')
            }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="userDetail.locationResponse.company"
            label="公司"
          >
            {{ userDetail.locationResponse.company }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="userDetail.locationResponse.position"
            label="职位"
          >
            {{ userDetail.locationResponse.position }}
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

      <!-- 校友档案卡片 -->
      <el-card
        v-if="userDetail.alumniInfos && userDetail.alumniInfos.length > 0"
        shadow="never"
        class="info-card"
      >
        <template #header>
          <div class="card-header">
            <span>校友档案</span>
          </div>
        </template>
        <div
          v-for="alumni in userDetail.alumniInfos"
          :key="alumni.id"
          class="alumni-card"
        >
          <el-descriptions :column="2" border>
            <el-descriptions-item label="姓名">
              {{ alumni.name }}
            </el-descriptions-item>
            <el-descriptions-item label="学号/工号">
              {{ alumni.number }}
            </el-descriptions-item>
            <el-descriptions-item label="身份">
              <el-tag
                :type="getAlumniIdentityTag(alumni.identity)"
                size="small"
              >
                {{ getUserTypeLabel(alumni.identity) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="认证状态">
              <el-tag
                :type="alumni.status === 1 ? 'success' : 'info'"
                size="small"
              >
                {{ alumni.status === 1 ? '已认证' : '未认证' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="alumni.grade" label="入学年份">
              {{ alumni.grade }}
            </el-descriptions-item>
            <el-descriptions-item v-if="alumni.alumniType" label="学历">
              {{ getAlumniTypeLabel(alumni.alumniType) }}
            </el-descriptions-item>
            <el-descriptions-item v-if="alumni.collegeName" label="学院">
              {{ alumni.collegeName }}
            </el-descriptions-item>
            <el-descriptions-item v-if="alumni.className" label="班级">
              {{ alumni.className }}
            </el-descriptions-item>
            <el-descriptions-item v-if="alumni.major" label="专业" :span="2">
              {{ alumni.major }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
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
import type {
  UserInfoResponse,
  AlumniPageResponse,
} from '@/api/generated/.ts.schemas'
import { useDict } from '@/stores'
import { DICT_TYPE } from '@/utils/dict'

// 扩展类型以支持校友档案
type UserDetailType = UserInfoResponse & {
  alumniInfos?: AlumniPageResponse[]
}

interface Props {
  visible: boolean
  userDetail: UserDetailType | null
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

// 检查是否有位置信息
const hasLocationInfo = computed(() => {
  const location = props.userDetail?.locationResponse
  if (!location) return false
  return !!(
    location.province ||
    location.city ||
    location.district ||
    location.company ||
    location.position
  )
})

// 使用字典
const { getLabel: getUserTypeLabel } = useDict(DICT_TYPE.USER_TYPE)
const { getLabel: getGenderLabel } = useDict(DICT_TYPE.GENDER)

// 获取校友身份类型标签颜色（复用 getUserTypeTag）
const getAlumniIdentityTag = (identity?: number) => {
  return getUserTypeTag(identity)
}

// 获取学历标签
const getAlumniTypeLabel = (type?: number) => {
  const map: Record<number, string> = {
    0: '无',
    1: '本科',
    2: '硕士',
    3: '博士',
  }
  return type !== undefined ? map[type] || '-' : '-'
}

// 用户类型标签颜色映射
const getUserTypeTag = (
  type: number | undefined,
): 'success' | 'warning' | 'info' | 'danger' => {
  if (type === undefined) return 'info'
  const map: Record<number, 'success' | 'warning' | 'info' | 'danger'> = {
    1: 'success', // 学生
    2: 'warning', // 教师
    3: 'info', // 校友
    4: 'info', // 游客
    5: 'danger', // 管理员
  }
  return map[type] || 'info'
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

/* 校友档案卡片样式 */
.alumni-card {
  margin-bottom: 16px;
}

.alumni-card:last-child {
  margin-bottom: 0;
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
