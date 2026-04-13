<template>
  <el-dialog
    v-model="visible"
    title="管理员发帖"
    width="900px"
    :close-on-click-modal="false"
    destroy-on-close
    @open="onOpen"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="apd-form"
    >
      <!-- 第一行：发帖人 + 帖子类型 -->
      <div class="apd-row-2">
        <el-form-item label="发帖人" prop="userId">
          <el-select
            v-model="form.userId"
            placeholder="选择发帖人"
            filterable
            :loading="userLoading"
            style="width: 100%"
          >
            <el-option
              v-for="user in publishUsers"
              :key="user.id"
              :value="user.id"
              :label="user.nickname || String(user.id)"
            >
              <div class="user-option">
                <el-avatar :size="22" :src="user.avatar" class="user-avatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span>{{ user.nickname || '用户' + user.id }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="帖子类型" prop="postType">
          <el-select
            v-model="form.postType"
            placeholder="选择类型"
            style="width: 100%"
          >
            <el-option
              v-for="t in postTypeOptions"
              :key="t.value"
              :label="t.label"
              :value="t.value"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- 标题 -->
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="form.title"
          placeholder="输入帖子标题（必填）"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <!-- 标签 -->
      <el-form-item label="标签">
        <el-select
          v-model="form.tags"
          multiple
          filterable
          placeholder="选择标签（可选）"
          style="width: 100%"
        >
          <el-option
            v-for="tag in tagOptions"
            :key="tag.value"
            :label="tag.label"
            :value="tag.value"
          />
        </el-select>
      </el-form-item>

      <!-- 封面图 -->
      <el-form-item label="封面图">
        <div class="apd-cover-row">
          <div v-if="form.cover" class="apd-cover-preview">
            <img :src="form.cover" alt="封面" />
            <el-button
              class="cover-remove-btn"
              type="danger"
              circle
              size="small"
              :icon="Close"
              @click="form.cover = ''"
            />
          </div>
          <div
            v-else
            class="apd-cover-placeholder"
            :class="{ 'is-uploading': coverUploading }"
            @click="triggerCoverUpload"
          >
            <el-icon v-if="!coverUploading" class="cover-icon"
              ><Picture
            /></el-icon>
            <el-icon v-else class="cover-icon is-loading"><Loading /></el-icon>
            <span>{{ coverUploading ? '上传中...' : '上传封面图' }}</span>
            <span class="cover-hint">不上传则自动取第一张图片块</span>
          </div>
          <input
            ref="coverInputRef"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleCoverChange"
          />
        </div>
      </el-form-item>

      <!-- 内容块编辑器 -->
      <el-form-item label="内容" prop="contentBlocks" class="apd-content-item">
        <ContentBlockEditor v-model="form.contentBlocks" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="apd-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          发布帖子
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { User, Picture, Loading, Close } from '@element-plus/icons-vue'
import { useDict } from '@/stores'
import { DICT_TYPE } from '@/utils/dict'
import { get as getPostApi } from '@/api/generated/帖子管理/帖子管理'
import { get as getUserApi } from '@/api/generated/用户管理/用户管理'
import { get as getFileApi } from '@/api/generated/文件管理/文件管理'
import { ContentBlockType } from '@/api/generated/.ts.schemas'
import type {
  ContentBlock,
  PublishPostUserInfoResponse,
} from '@/api/generated/.ts.schemas'
import ContentBlockEditor from '@/components/ContentBlockEditor.vue'

const emit = defineEmits<{
  success: []
}>()

const visible = defineModel<boolean>({ required: true })

const postApi = getPostApi()
const userApi = getUserApi()
const fileApi = getFileApi()

const { dictOptions: tagOptions } = useDict(DICT_TYPE.POST_TAG)
const { dictOptions: postTypeOptions } = useDict(DICT_TYPE.POST_TYPE)

// ── 状态 ──
const formRef = ref<FormInstance>()
const userLoading = ref(false)
const coverUploading = ref(false)
const submitting = ref(false)
const publishUsers = ref<PublishPostUserInfoResponse[]>([])
const coverInputRef = ref<HTMLInputElement>()

const defaultBlocks = (): ContentBlock[] => [
  { type: ContentBlockType.TEXT, order: 1, content: '' },
]

const form = reactive({
  userId: undefined as number | undefined,
  postType: 'NORMAL',
  title: '',
  tags: [] as string[],
  cover: '',
  contentBlocks: defaultBlocks() as ContentBlock[],
})

const rules: FormRules = {
  userId: [{ required: true, message: '请选择发帖人', trigger: 'change' }],
  postType: [{ required: true, message: '请选择帖子类型', trigger: 'change' }],
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 1, max: 100, message: '标题长度 1-100 字符', trigger: 'blur' },
  ],
  contentBlocks: [
    {
      validator: (_rule, value: ContentBlock[], callback) => {
        const valid = value.filter((b) =>
          b.type === ContentBlockType.TEXT ? !!b.content?.trim() : !!b.url,
        )
        if (valid.length === 0) {
          callback(new Error('至少需要一个有内容的块'))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
}

// ── 封面上传 ──
const triggerCoverUpload = () => {
  if (coverUploading.value) return
  coverInputRef.value?.click()
}

const handleCoverChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('封面图大小不能超过 10MB')
    return
  }
  coverUploading.value = true
  try {
    form.cover = await fileApi.postManagerFileUpload({ file })
  } catch {
    ElMessage.error('封面图上传失败')
  } finally {
    coverUploading.value = false
    input.value = ''
  }
}

// ── 加载发帖人列表 ──
const loadPublishUsers = async () => {
  userLoading.value = true
  try {
    publishUsers.value = (await userApi.getAuthUserPublishPost()) ?? []
  } catch {
    ElMessage.error('获取发帖人列表失败')
  } finally {
    userLoading.value = false
  }
}

// ── 对话框打开 ──
const onOpen = async () => {
  // 重置表单
  form.userId = undefined
  form.postType = 'NORMAL'
  form.title = ''
  form.tags = []
  form.cover = ''
  form.contentBlocks = defaultBlocks()
  formRef.value?.clearValidate()

  await loadPublishUsers()
}

// ── 提交 ──
const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  // 过滤空 blocks
  const contentBlocks = form.contentBlocks.filter((b) =>
    b.type === ContentBlockType.TEXT ? !!b.content?.trim() : !!b.url,
  )

  // 封面：有则用，无则取第一张图片 block 的 url
  const cover =
    form.cover ||
    contentBlocks.find((b) => b.type === ContentBlockType.IMAGE)?.url ||
    undefined

  submitting.value = true
  try {
    await postApi.postCommunityPostsAdmin({
      userId: form.userId,
      title: form.title,
      cover,
      postType: form.postType,
      tags: form.tags.length > 0 ? form.tags : undefined,
      contentBlocks,
    })
    ElMessage.success('帖子发布成功')
    visible.value = false
    emit('success')
  } catch {
    ElMessage.error('发布失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.apd-form {
  :deep(.el-form-item__label) {
    font-weight: 500;
    padding-bottom: 4px;
  }
}

.apd-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

// 用户下拉选项
.user-option {
  display: flex;
  align-items: center;
  gap: 8px;

  .user-avatar {
    flex-shrink: 0;
  }
}

// 封面图
.apd-cover-row {
  width: 100%;
}

.apd-cover-preview {
  position: relative;
  display: inline-block;
  border-radius: 8px;
  overflow: visible;

  img {
    display: block;
    max-width: 240px;
    max-height: 140px;
    object-fit: contain;
    border-radius: 8px;
    border: 1px solid var(--el-border-color);
    background: var(--el-fill-color-lighter);
  }

  .cover-remove-btn {
    position: absolute;
    top: -8px;
    right: -8px;
  }
}

.apd-cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 240px;
  height: 140px;
  border: 1.5px dashed var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
  background: var(--el-fill-color-lighter);

  &:hover:not(.is-uploading) {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  .cover-icon {
    font-size: 26px;
    color: var(--el-text-color-placeholder);
  }

  span {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .cover-hint {
    font-size: 11px;
    color: var(--el-text-color-placeholder);
    text-align: center;
    padding: 0 12px;
  }
}

.apd-content-item {
  :deep(.el-form-item__content) {
    display: block;
  }
}

.apd-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

// loading 旋转
.is-loading {
  animation: apd-spin 1s linear infinite;
}

@keyframes apd-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
