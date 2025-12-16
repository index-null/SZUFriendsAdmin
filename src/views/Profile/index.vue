<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- 页面头部 -->
      <div class="profile-header">
        <h1 class="page-title">个人资料</h1>
        <p class="page-desc">管理您的个人信息和账户设置</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="8" animated />
      </div>

      <!-- 主要内容 -->
      <div v-else class="profile-content">
        <!-- 头像卡片 -->
        <el-card class="profile-card avatar-card" shadow="hover">
          <div class="avatar-section">
            <!-- 头像上传区域 -->
            <div
              class="avatar-upload-wrapper"
              @click="triggerFileUpload"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
            >
              <el-avatar
                :size="120"
                :src="formData.avatar"
                class="profile-avatar"
                :class="{
                  'avatar-dragging': isDragging,
                  'avatar-uploading': uploadingAvatar,
                }"
              >
                <el-icon :size="60"><UserFilled /></el-icon>
              </el-avatar>

              <!-- 上传遮罩层 -->
              <div class="avatar-overlay">
                <el-icon v-if="!uploadingAvatar" :size="32"><Camera /></el-icon>
                <el-progress
                  v-else
                  type="circle"
                  :percentage="uploadProgress"
                  :width="80"
                  :stroke-width="6"
                />
                <p v-if="!uploadingAvatar" class="overlay-text">
                  点击或拖拽更换
                </p>
              </div>

              <!-- 隐藏的文件输入 -->
              <input
                ref="fileInputRef"
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                style="display: none"
                @change="handleFileSelect"
              />
            </div>

            <div class="avatar-info">
              <h2 class="user-name">
                {{ formData.nickname || formData.username || '未设置昵称' }}
              </h2>
              <p class="user-username">@{{ formData.username }}</p>
              <div class="avatar-tips">
                <el-text size="small" type="info">
                  <el-icon><InfoFilled /></el-icon>
                  支持 JPG、PNG 格式，大小不超过 2MB
                </el-text>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 基本信息卡片 -->
        <el-card class="profile-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="card-title">
                <el-icon><User /></el-icon>
                <span>基本信息</span>
              </div>
              <el-button
                :type="editMode.basic ? 'primary' : 'default'"
                :icon="editMode.basic ? Check : Edit"
                size="small"
                @click="toggleEdit('basic')"
              >
                {{ editMode.basic ? '保存' : '编辑' }}
              </el-button>
            </div>
          </template>

          <el-form
            :model="formData"
            label-width="100px"
            :disabled="!editMode.basic"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="昵称">
                  <el-input
                    v-model="formData.nickname"
                    placeholder="请输入昵称"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="真实姓名">
                  <el-input
                    v-model="formData.realName"
                    placeholder="请输入真实姓名"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="性别">
                  <el-radio-group v-model="formData.gender">
                    <el-radio :label="0">未知</el-radio>
                    <el-radio :label="1">男</el-radio>
                    <el-radio :label="2">女</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="生日">
                  <el-date-picker
                    v-model="formData.birthday"
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-collapse-transition>
              <div v-if="editMode.basic" class="form-actions">
                <el-button @click="cancelEdit('basic')">取消</el-button>
                <el-button type="primary" @click="saveProfile"
                  >保存更改</el-button
                >
              </div>
            </el-collapse-transition>
          </el-form>
        </el-card>

        <!-- 联系方式卡片 -->
        <el-card class="profile-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="card-title">
                <el-icon><Phone /></el-icon>
                <span>联系方式</span>
              </div>
              <el-button
                :type="editMode.contact ? 'primary' : 'default'"
                :icon="editMode.contact ? Check : Edit"
                size="small"
                @click="toggleEdit('contact')"
              >
                {{ editMode.contact ? '保存' : '编辑' }}
              </el-button>
            </div>
          </template>

          <el-form
            :model="formData"
            label-width="100px"
            :disabled="!editMode.contact"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="手机号">
                  <el-input v-model="formData.phone" placeholder="请输入手机号">
                    <template #prefix>
                      <el-icon><Phone /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱">
                  <el-input v-model="formData.email" placeholder="请输入邮箱">
                    <template #prefix>
                      <el-icon><Message /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="QQ号">
                  <el-input v-model="formData.qq" placeholder="请输入QQ号" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="微信号">
                  <el-input
                    v-model="formData.wechat"
                    placeholder="请输入微信号"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-collapse-transition>
              <div v-if="editMode.contact" class="form-actions">
                <el-button @click="cancelEdit('contact')">取消</el-button>
                <el-button type="primary" @click="saveProfile"
                  >保存更改</el-button
                >
              </div>
            </el-collapse-transition>
          </el-form>
        </el-card>

        <!-- 职业信息卡片 -->
        <el-card class="profile-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="card-title">
                <el-icon><Briefcase /></el-icon>
                <span>职业信息</span>
              </div>
              <el-button
                :type="editMode.career ? 'primary' : 'default'"
                :icon="editMode.career ? Check : Edit"
                size="small"
                @click="toggleEdit('career')"
              >
                {{ editMode.career ? '保存' : '编辑' }}
              </el-button>
            </div>
          </template>

          <el-form
            :model="formData"
            label-width="100px"
            :disabled="!editMode.career"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="工作单位">
                  <el-input
                    v-model="formData.companyName"
                    placeholder="请输入工作单位"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="职位">
                  <el-input
                    v-model="formData.jobTitle"
                    placeholder="请输入职位"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="所在行业">
                  <el-input
                    v-model="formData.industry"
                    placeholder="请输入所在行业"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-collapse-transition>
              <div v-if="editMode.career" class="form-actions">
                <el-button @click="cancelEdit('career')">取消</el-button>
                <el-button type="primary" @click="saveProfile"
                  >保存更改</el-button
                >
              </div>
            </el-collapse-transition>
          </el-form>
        </el-card>

        <!-- 位置信息卡片 -->
        <el-card class="profile-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="card-title">
                <el-icon><Location /></el-icon>
                <span>位置信息</span>
              </div>
              <el-button
                :type="editMode.location ? 'primary' : 'default'"
                :icon="editMode.location ? Check : Edit"
                size="small"
                @click="toggleEdit('location')"
              >
                {{ editMode.location ? '保存' : '编辑' }}
              </el-button>
            </div>
          </template>

          <el-form
            :model="locationData"
            label-width="100px"
            :disabled="!editMode.location"
          >
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="省份">
                  <el-input
                    v-model="locationData.province"
                    placeholder="请输入省份"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="城市">
                  <el-input
                    v-model="locationData.city"
                    placeholder="请输入城市"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="区县">
                  <el-input
                    v-model="locationData.district"
                    placeholder="请输入区县"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-collapse-transition>
              <div v-if="editMode.location" class="form-actions">
                <el-button @click="cancelEdit('location')">取消</el-button>
                <el-button type="primary" @click="saveProfile"
                  >保存更改</el-button
                >
              </div>
            </el-collapse-transition>
          </el-form>
        </el-card>

        <!-- 个人简介卡片 -->
        <el-card class="profile-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="card-title">
                <el-icon><Document /></el-icon>
                <span>个人简介</span>
              </div>
              <el-button
                :type="editMode.bio ? 'primary' : 'default'"
                :icon="editMode.bio ? Check : Edit"
                size="small"
                @click="toggleEdit('bio')"
              >
                {{ editMode.bio ? '保存' : '编辑' }}
              </el-button>
            </div>
          </template>

          <el-form
            :model="formData"
            label-width="100px"
            :disabled="!editMode.bio"
          >
            <el-form-item label="一句话介绍">
              <el-input
                v-model="formData.bio"
                type="textarea"
                :rows="4"
                placeholder="写点什么介绍一下自己吧..."
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-collapse-transition>
              <div v-if="editMode.bio" class="form-actions">
                <el-button @click="cancelEdit('bio')">取消</el-button>
                <el-button type="primary" @click="saveProfile"
                  >保存更改</el-button
                >
              </div>
            </el-collapse-transition>
          </el-form>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  UserFilled,
  Edit,
  Check,
  User,
  Phone,
  Message,
  Briefcase,
  Location,
  Document,
  Camera,
  InfoFilled,
} from '@element-plus/icons-vue'
import { getProfile, updateProfile } from '@/api/modules/user'
import { get as getCommunityApi } from '@/api/generated/社区控制器/社区控制器'
import type { UpdateProfileRequest } from '@/api/generated/.ts.schemas'
import { useUserStore } from '@/stores/modules/user'

// 初始化上传 API
const communityApi = getCommunityApi()

// 用户 Store
const userStore = useUserStore()

// 加载状态
const loading = ref(true)

// 编辑模式状态
const editMode = reactive({
  basic: false,
  contact: false,
  career: false,
  location: false,
  bio: false,
})

// 头像上传相关状态
const fileInputRef = ref<HTMLInputElement>()
const uploadingAvatar = ref(false)
const uploadProgress = ref(0)
const isDragging = ref(false)

// 表单数据
const formData = ref<UpdateProfileRequest & { username?: string }>({
  nickname: '',
  avatar: '',
  email: '',
  phone: '',
  gender: 0,
  realName: '',
  companyName: '',
  jobTitle: '',
  industry: '',
  bio: '',
  birthday: '',
  qq: '',
  wechat: '',
  username: '',
})

// 位置数据
const locationData = ref({
  province: '',
  city: '',
  district: '',
})

// 原始数据备份（用于取消编辑时恢复）
const originalData = ref<any>({})
const originalLocationData = ref<any>({})

// 加载用户资料
const loadProfile = async () => {
  loading.value = true
  try {
    const data = await getProfile()

    if (data?.userInfo) {
      // 设置基本信息
      formData.value = {
        nickname: data.userInfo.nickname || '',
        avatar: data.userInfo.avatar || '',
        email: data.userInfo.email || '',
        phone: data.userInfo.phone || '',
        gender: data.userInfo.gender || 0,
        realName: data.userInfo.realName || '',
        companyName: data.userInfo.companyName || '',
        jobTitle: data.userInfo.jobTitle || '',
        industry: data.userInfo.industry || '',
        bio: data.userInfo.bio || '',
        birthday: data.userInfo.birthday || '',
        qq: data.userInfo.qq || '',
        wechat: data.userInfo.wechat || '',
        username: data.userInfo.username || '',
      }

      // 设置位置信息
      if (data.userInfo.locationResponse) {
        locationData.value = {
          province: data.userInfo.locationResponse.province || '',
          city: data.userInfo.locationResponse.city || '',
          district: data.userInfo.locationResponse.district || '',
        }
      }

      // 备份原始数据
      originalData.value = JSON.parse(JSON.stringify(formData.value))
      originalLocationData.value = JSON.parse(
        JSON.stringify(locationData.value),
      )
    }
  } catch (error) {
    console.error('加载资料失败:', error)
    ElMessage.error('加载资料失败')
  } finally {
    loading.value = false
  }
}

// 触发文件选择
const triggerFileUpload = () => {
  if (uploadingAvatar.value) return
  fileInputRef.value?.click()
}

// 处理拖拽上传
const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0 && files[0]) {
    handleFileUpload(files[0])
  }
}

// 处理文件选择
const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0 && files[0]) {
    handleFileUpload(files[0])
  }
  // 清空 input，允许重复选择同一文件
  target.value = ''
}

// 处理文件上传
const handleFileUpload = async (file: File) => {
  // 验证文件类型
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
  if (!validTypes.includes(file.type)) {
    ElMessage.error('只支持 JPG、PNG 格式的图片')
    return
  }

  // 验证文件大小 (2MB)
  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过 2MB')
    return
  }

  uploadingAvatar.value = true
  uploadProgress.value = 0

  try {
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 100)

    // 上传文件到 COS
    const uploadedUrl = await communityApi.postCommunityUpload({ file })

    clearInterval(progressInterval)
    uploadProgress.value = 100

    // 更新头像 URL
    formData.value.avatar = uploadedUrl

    // 保存到后端
    await updateProfile({
      avatar: uploadedUrl,
    })

    ElMessage.success('头像更新成功')

    // 同步更新 userStore
    userStore.updateUserInfo({
      avatar: uploadedUrl,
    })

    // 重新加载资料
    await loadProfile()
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败，请重试')
  } finally {
    uploadingAvatar.value = false
    uploadProgress.value = 0
  }
}

// 切换编辑模式
const toggleEdit = (section: keyof typeof editMode) => {
  if (editMode[section]) {
    // 如果是保存操作
    saveProfile()
  } else {
    // 关闭其他编辑模式
    Object.keys(editMode).forEach((key) => {
      if (key !== section) {
        editMode[key as keyof typeof editMode] = false
      }
    })
    // 开启当前编辑模式
    editMode[section] = true
  }
}

// 取消编辑
const cancelEdit = (section: keyof typeof editMode) => {
  // 恢复原始数据
  formData.value = JSON.parse(JSON.stringify(originalData.value))
  locationData.value = JSON.parse(JSON.stringify(originalLocationData.value))

  // 关闭编辑模式
  editMode[section] = false
}

// 保存资料
const saveProfile = async () => {
  try {
    // 准备提交的数据
    const submitData: UpdateProfileRequest = {
      nickname: formData.value.nickname,
      avatar: formData.value.avatar,
      email: formData.value.email,
      phone: formData.value.phone,
      gender: formData.value.gender,
      realName: formData.value.realName,
      companyName: formData.value.companyName,
      jobTitle: formData.value.jobTitle,
      industry: formData.value.industry,
      bio: formData.value.bio,
      birthday: formData.value.birthday,
      qq: formData.value.qq,
      wechat: formData.value.wechat,
    }

    // 如果位置信息有填写，则添加到提交数据中
    if (
      locationData.value.province ||
      locationData.value.city ||
      locationData.value.district
    ) {
      submitData.locationUpdateRequest = {
        longitude: 0, // 这里需要根据实际情况获取经纬度
        latitude: 0,
        province: locationData.value.province,
        city: locationData.value.city,
        district: locationData.value.district,
      }
    }

    await updateProfile(submitData)

    ElMessage.success('保存成功')

    // 同步更新 userStore 中的关键信息
    userStore.updateUserInfo({
      nickname: submitData.nickname,
      avatar: submitData.avatar,
    })

    // 关闭所有编辑模式
    Object.keys(editMode).forEach((key) => {
      editMode[key as keyof typeof editMode] = false
    })

    // 重新加载数据
    await loadProfile()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  }
}

// 页面加载时获取资料
onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
  padding: 24px;
}

html.dark .profile-page {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 页面头部 */
.profile-header {
  margin-bottom: 32px;
  text-align: center;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, var(--brand-primary) 0%, #990033 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

html.dark .page-title {
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

/* 加载状态 */
.loading-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

html.dark .loading-container {
  background: #2d2d2d;
}

/* 主要内容 */
.profile-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 卡片样式 */
.profile-card {
  border-radius: 12px;
  transition: all 0.3s;
  border: 1px solid var(--border-color);
}

.profile-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

html.dark .profile-card {
  background: #2d2d2d;
  border-color: var(--border-color-dark);
}

html.dark .profile-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.card-title .el-icon {
  font-size: 18px;
  color: var(--brand-primary);
}

/* 头像卡片 */
.avatar-card {
  background: linear-gradient(135deg, #fff 0%, #f8f9fc 100%);
}

html.dark .avatar-card {
  background: linear-gradient(135deg, #2d2d2d 0%, #3a3a3a 100%);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 8px 0;
}

/* 头像上传容器 */
.avatar-upload-wrapper {
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
}

.avatar-upload-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.profile-avatar {
  border: 4px solid var(--brand-primary);
  box-shadow: 0 4px 12px rgba(153, 0, 51, 0.2);
  transition: all 0.3s;
}

.avatar-dragging {
  transform: scale(1.05);
  border-color: #67c23a !important;
  box-shadow: 0 6px 16px rgba(103, 194, 58, 0.4) !important;
}

.avatar-uploading {
  opacity: 0.6;
}

html.dark .profile-avatar {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

/* 头像悬停遮罩 */
.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: white;
  gap: 8px;
}

.overlay-text {
  font-size: 12px;
  margin: 0;
  text-align: center;
  padding: 0 12px;
}

.avatar-info {
  flex: 1;
}

.user-name {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.user-username {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
}

.avatar-tips {
  margin-top: 8px;
}

.avatar-tips .el-text {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 表单样式 */
.form-tip {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .profile-page {
    padding: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .avatar-section {
    flex-direction: column;
    text-align: center;
  }

  .avatar-upload-wrapper {
    margin: 0 auto;
  }

  :deep(.el-col) {
    margin-bottom: 0;
  }
}

/* Element Plus 样式覆盖 */
:deep(.el-card__header) {
  padding: 16px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

html.dark :deep(.el-card__header) {
  background: #3a3a3a;
  border-bottom-color: var(--border-color-dark);
}

:deep(.el-card__body) {
  padding: 24px;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--text-primary);
}

:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: var(--bg-secondary);
  box-shadow: none;
}

:deep(.el-textarea.is-disabled .el-textarea__inner) {
  background-color: var(--bg-secondary);
}

:deep(.el-radio-group.is-disabled .el-radio) {
  cursor: not-allowed;
}
</style>
