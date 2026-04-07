<template>
  <div class="post-batch-import">
    <!-- 步骤条 -->
    <el-card class="steps-card" shadow="never">
      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step title="输入原文" description="粘贴需要改写的帖子原文" />
        <el-step title="AI 改写" description="调用 Coze 工作流改写内容" />
        <el-step title="预览确认" description="检查编辑改写结果" />
        <el-step title="批量发布" description="确认后统一提交" />
      </el-steps>
    </el-card>

    <!-- Step 0: 输入原文 -->
    <div v-show="currentStep === 0" class="step-content">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">输入帖子原文</span>
            <div class="card-actions">
              <el-button size="small" @click="addTextItem">
                <el-icon><Plus /></el-icon>
                添加一条
              </el-button>
              <el-button
                size="small"
                type="danger"
                plain
                @click="clearAllTexts"
              >
                <el-icon><Delete /></el-icon>
                清空全部
              </el-button>
            </div>
          </div>
        </template>

        <div class="text-input-list">
          <div
            v-for="(item, index) in rawTexts"
            :key="item.id"
            class="text-input-item"
          >
            <div class="item-header">
              <span class="item-index">{{ index + 1 }}</span>
              <el-button
                type="danger"
                :icon="Close"
                circle
                size="small"
                @click="removeTextItem(index)"
              />
            </div>
            <el-input
              v-model="item.text"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 12 }"
              placeholder="粘贴一条帖子原文内容..."
              resize="vertical"
            />
          </div>
        </div>

        <div class="step-actions">
          <el-button
            type="primary"
            size="large"
            :disabled="!hasValidTexts"
            @click="startRewrite"
          >
            开始 AI 改写
            <el-icon class="el-icon--right"><Right /></el-icon>
          </el-button>
          <span v-if="!hasValidTexts" class="action-hint">
            请至少输入一条帖子原文
          </span>
          <span v-else class="action-hint success">
            共 {{ validTextCount }} 条待改写
          </span>
        </div>
      </el-card>
    </div>

    <!-- Step 1: AI 改写中 -->
    <div v-show="currentStep === 1" class="step-content">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">AI 改写进行中</span>
            <el-tag type="info" effect="plain">
              {{ rewriteProgress.completed }} / {{ rewriteProgress.total }}
            </el-tag>
          </div>
        </template>

        <el-progress
          :percentage="rewriteProgressPercent"
          :status="rewriteProgressStatus"
          :stroke-width="20"
          text-inside
          class="rewrite-progress"
        />

        <div class="rewrite-status-list">
          <div
            v-for="(item, index) in rewriteStatusList"
            :key="index"
            class="rewrite-status-item"
            :class="item.status"
          >
            <span class="status-index">{{ index + 1 }}</span>
            <span class="status-text">{{
              getTextPreview(rawTexts[index]?.text)
            }}</span>
            <el-icon v-if="item.status === 'pending'" class="status-icon"
              ><Clock
            /></el-icon>
            <el-icon
              v-else-if="item.status === 'processing'"
              class="status-icon spinning"
              ><Loading
            /></el-icon>
            <el-icon
              v-else-if="item.status === 'success'"
              class="status-icon success"
              ><CircleCheck
            /></el-icon>
            <el-icon
              v-else-if="item.status === 'error'"
              class="status-icon error"
              ><CircleClose
            /></el-icon>
          </div>
        </div>

        <div
          v-if="rewriteProgress.completed === rewriteProgress.total"
          class="step-actions"
        >
          <el-button @click="currentStep = 0">
            <el-icon><Back /></el-icon>
            返回修改
          </el-button>
          <el-button type="primary" size="large" @click="currentStep = 2">
            查看改写结果
            <el-icon class="el-icon--right"><Right /></el-icon>
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- Step 2: 预览确认 -->
    <div v-show="currentStep === 2" class="step-content">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">预览改写结果</span>
            <div class="card-actions">
              <el-tag type="success" effect="plain">
                成功 {{ successCount }} 条
              </el-tag>
              <el-tag v-if="errorCount > 0" type="danger" effect="plain">
                失败 {{ errorCount }} 条
              </el-tag>
            </div>
          </div>
        </template>

        <div class="preview-list">
          <el-collapse v-model="expandedPreviews">
            <el-collapse-item
              v-for="(item, index) in rewriteResults"
              :key="index"
              :name="index"
            >
              <template #title>
                <div class="preview-title">
                  <el-checkbox
                    v-if="item.result"
                    v-model="item.selected"
                    @click.stop
                  />
                  <el-tag
                    :type="item.error ? 'danger' : 'success'"
                    size="small"
                  >
                    {{ item.error ? '失败' : '成功' }}
                  </el-tag>
                  <span class="preview-name">
                    {{ item.result?.title || item.error || '未知' }}
                  </span>
                  <el-button
                    v-if="item.error"
                    type="primary"
                    size="small"
                    link
                    @click.stop="retryRewrite(index)"
                  >
                    重试
                  </el-button>
                </div>
              </template>

              <!-- 失败的展示错误 -->
              <div v-if="item.error" class="preview-error">
                <el-alert :title="item.error" type="error" :closable="false" />

                <!-- 有原始响应数据时，展示 JSON 编辑器 -->
                <div v-if="item.rawData" class="raw-data-editor">
                  <div class="section-label">
                    Coze 原始响应（可手动修正 JSON 后重新解析）：
                  </div>
                  <el-input
                    v-model="item.editingRawData"
                    type="textarea"
                    :autosize="{ minRows: 6, maxRows: 20 }"
                    resize="vertical"
                    class="json-editor"
                    spellcheck="false"
                  />
                  <div class="raw-data-actions">
                    <el-button
                      type="primary"
                      size="small"
                      @click="manualParseRawData(index)"
                    >
                      重新解析 JSON
                    </el-button>
                    <el-button size="small" @click="formatRawJson(index)">
                      格式化 JSON
                    </el-button>
                    <el-button size="small" @click="resetRawData(index)">
                      还原原始数据
                    </el-button>
                  </div>
                </div>

                <div class="original-text">
                  <div class="section-label">原文内容：</div>
                  <div class="text-content">
                    {{ rawTexts[item.index]?.text }}
                  </div>
                </div>
              </div>

              <!-- 成功的展示编辑表单 -->
              <div v-else-if="item.result" class="preview-form">
                <el-form label-position="top" size="default">
                  <el-form-item label="标题">
                    <el-input
                      v-model="item.result.title"
                      placeholder="帖子标题"
                    />
                  </el-form-item>

                  <el-form-item label="封面图片">
                    <el-input
                      v-model="item.result.cover"
                      placeholder="封面图片 URL（可选）"
                    />
                  </el-form-item>

                  <el-form-item label="帖子类型">
                    <el-select
                      v-model="item.result.postType"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="type in postTypeOptions"
                        :key="type.value"
                        :label="type.label"
                        :value="type.value"
                      />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="标签">
                    <el-select
                      v-model="item.result.tags"
                      multiple
                      filterable
                      allow-create
                      style="width: 100%"
                      placeholder="选择或输入标签"
                    >
                      <el-option
                        v-for="tag in tagOptions"
                        :key="tag.value"
                        :label="tag.label"
                        :value="tag.value"
                      />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="内容块">
                    <div class="content-blocks-editor">
                      <div
                        v-for="(block, bIndex) in item.result.contentBlocks"
                        :key="bIndex"
                        class="block-item"
                      >
                        <div class="block-header">
                          <el-tag size="small" type="info">
                            {{
                              block.type === ContentBlockType.TEXT
                                ? '文本'
                                : block.type === ContentBlockType.IMAGE
                                  ? '图片'
                                  : '视频'
                            }}
                          </el-tag>
                          <span class="block-order">{{
                            block.order || bIndex + 1
                          }}</span>
                          <el-button
                            type="danger"
                            size="small"
                            :icon="Delete"
                            circle
                            @click="removeBlock(item.result!, bIndex)"
                          />
                        </div>
                        <el-input
                          v-if="block.type === ContentBlockType.TEXT"
                          v-model="block.content"
                          type="textarea"
                          :autosize="{ minRows: 2, maxRows: 8 }"
                          resize="vertical"
                        />
                        <el-input
                          v-else
                          v-model="block.url"
                          placeholder="资源 URL"
                        />
                      </div>
                    </div>
                  </el-form-item>
                </el-form>

                <!-- 原文对照 -->
                <el-collapse class="original-collapse">
                  <el-collapse-item title="查看原文对照">
                    <div class="text-content">
                      {{ rawTexts[item.index]?.text }}
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>

        <div class="step-actions">
          <el-button @click="currentStep = 0">
            <el-icon><Back /></el-icon>
            返回修改原文
          </el-button>
          <div class="action-right">
            <el-checkbox v-model="selectAll" @change="handleSelectAll">
              全选/取消
            </el-checkbox>
            <el-button
              type="primary"
              size="large"
              :disabled="selectedCount === 0"
              @click="confirmPublish"
            >
              发布选中的 {{ selectedCount }} 条
              <el-icon class="el-icon--right"><Upload /></el-icon>
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Step 3: 发布结果 -->
    <div v-show="currentStep === 3" class="step-content">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">发布结果</span>
          </div>
        </template>

        <el-result
          v-if="publishResult.success"
          icon="success"
          title="批量发布成功"
          :sub-title="`成功发布了 ${publishResult.count} 条帖子`"
        >
          <template #extra>
            <el-button type="primary" @click="resetAll"> 继续导入 </el-button>
            <el-button @click="goToPostManagement"> 查看帖子管理 </el-button>
          </template>
        </el-result>

        <el-result
          v-else-if="publishResult.error"
          icon="error"
          title="发布失败"
          :sub-title="publishResult.error"
        >
          <template #extra>
            <el-button type="primary" @click="currentStep = 2">
              返回重试
            </el-button>
          </template>
        </el-result>

        <div v-else-if="publishing" class="publishing-state">
          <el-icon class="spinning" :size="48"><Loading /></el-icon>
          <p>正在批量发布中，请稍候...</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Delete,
  Close,
  Right,
  Back,
  Clock,
  Loading,
  CircleCheck,
  CircleClose,
  Upload,
} from '@element-plus/icons-vue'
import { useDict } from '@/stores'
import { DICT_TYPE } from '@/utils/dict'
import { get as getPostApi } from '@/api/generated/帖子管理/帖子管理'
import {
  rewritePost,
  batchRewritePosts,
  CozeParseError,
  parseRawDataToResult,
} from '@/api/coze'
import type { RewriteResult } from '@/api/coze'
import { ContentBlockType } from '@/api/generated/.ts.schemas'
import type {
  PostPublishRequest,
  ContentBlock,
} from '@/api/generated/.ts.schemas'

const router = useRouter()
const postApi = getPostApi()

// 字典
const { dictOptions: tagOptions } = useDict(DICT_TYPE.POST_TAG)
const { dictOptions: postTypeOptions } = useDict(DICT_TYPE.POST_TYPE)

// ============ 步骤管理 ============
const currentStep = ref(0)

// ============ Step 0: 输入原文 ============
interface RawTextItem {
  id: number
  text: string
}

let nextId = 1
const rawTexts = ref<RawTextItem[]>([{ id: nextId++, text: '' }])

const hasValidTexts = computed(() =>
  rawTexts.value.some((item) => item.text.trim().length > 0),
)

const validTextCount = computed(
  () => rawTexts.value.filter((item) => item.text.trim().length > 0).length,
)

const addTextItem = () => {
  rawTexts.value.push({ id: nextId++, text: '' })
}

const removeTextItem = (index: number) => {
  if (rawTexts.value.length <= 1) {
    if (rawTexts.value[0]) rawTexts.value[0].text = ''
    return
  }
  rawTexts.value.splice(index, 1)
}

const clearAllTexts = () => {
  rawTexts.value = [{ id: nextId++, text: '' }]
}

// ============ Step 1: AI 改写 ============
const rewriteProgress = reactive({
  completed: 0,
  total: 0,
})

interface RewriteStatusItem {
  status: 'pending' | 'processing' | 'success' | 'error'
}

const rewriteStatusList = ref<RewriteStatusItem[]>([])

const rewriteProgressPercent = computed(() => {
  if (rewriteProgress.total === 0) return 0
  return Math.round((rewriteProgress.completed / rewriteProgress.total) * 100)
})

const rewriteProgressStatus = computed(() => {
  if (
    rewriteProgress.completed === rewriteProgress.total &&
    rewriteProgress.total > 0
  ) {
    return 'success'
  }
  return undefined
})

const getTextPreview = (text?: string) => {
  if (!text) return '(空)'
  return text.length > 60 ? text.slice(0, 60) + '...' : text
}

// ============ Step 2: 预览确认 ============
interface RewriteResultItem {
  index: number
  result?: RewriteResult
  error?: string
  /** Coze 原始响应数据（解析失败时存在） */
  rawData?: string
  /** 用户正在编辑的 JSON（用于手动修正） */
  editingRawData?: string
  selected: boolean
}

const rewriteResults = ref<RewriteResultItem[]>([])
const expandedPreviews = ref<number[]>([])
const selectAll = ref(true)

const successCount = computed(
  () => rewriteResults.value.filter((r) => r.result && !r.error).length,
)

const errorCount = computed(
  () => rewriteResults.value.filter((r) => r.error).length,
)

const selectedCount = computed(
  () => rewriteResults.value.filter((r) => r.selected && r.result).length,
)

const handleSelectAll = (val: boolean | string | number) => {
  rewriteResults.value.forEach((item) => {
    if (item.result) {
      item.selected = !!val
    }
  })
}

const removeBlock = (result: RewriteResult, blockIndex: number) => {
  result.contentBlocks.splice(blockIndex, 1)
  // 重新编号
  result.contentBlocks.forEach((block, i) => {
    block.order = i + 1
  })
}

// ============ 核心流程 ============

/**
 * 开始改写
 */
const startRewrite = async () => {
  const validTexts = rawTexts.value
    .map((item, index) => ({ text: item.text.trim(), originalIndex: index }))
    .filter((item) => item.text.length > 0)

  if (validTexts.length === 0) return

  // 切换到改写步骤
  currentStep.value = 1
  rewriteProgress.completed = 0
  rewriteProgress.total = validTexts.length

  // 初始化状态列表（只显示有效的条目）
  rewriteStatusList.value = rawTexts.value.map((item) => ({
    status:
      item.text.trim().length > 0 ? ('pending' as const) : ('pending' as const),
  }))

  // 调用批量改写，使用进度回调实时更新状态
  const texts = validTexts.map((v) => v.text)
  const results = await batchRewritePosts(
    texts,
    2,
    (completed, _total, completedBatchIndex) => {
      rewriteProgress.completed = completed
      // 更新对应条目的状态
      const originalIndex = validTexts[completedBatchIndex]?.originalIndex
      if (
        originalIndex !== undefined &&
        rewriteStatusList.value[originalIndex]
      ) {
        // 已完成的标记为 success（具体错误在最终处理时区分）
        rewriteStatusList.value[originalIndex].status = 'success'
      }
      // 标记下一个正在处理的
      validTexts.forEach(({ originalIndex: idx }, batchIdx) => {
        const statusItem = rewriteStatusList.value[idx]
        if (
          batchIdx >= completed &&
          statusItem &&
          statusItem.status === 'pending'
        ) {
          statusItem.status =
            batchIdx < completed + 2 ? 'processing' : 'pending'
        }
      })
    },
  )

  // 更新完成后的最终状态
  const finalResults: RewriteResultItem[] = []
  results.forEach((r) => {
    const originalIndex = validTexts[r.index]?.originalIndex
    if (originalIndex !== undefined) {
      const statusItem = rewriteStatusList.value[originalIndex]
      if (statusItem) {
        statusItem.status = r.result ? 'success' : 'error'
      }
      // rawData 存在时，初始化编辑用副本（格式化方便阅读）
      let editingRawData: string | undefined
      if (r.rawData) {
        try {
          editingRawData = JSON.stringify(JSON.parse(r.rawData), null, 2)
        } catch {
          editingRawData = r.rawData
        }
      }
      finalResults.push({
        index: originalIndex,
        result: r.result,
        error: r.error,
        rawData: r.rawData,
        editingRawData,
        selected: !!r.result,
      })
    }
  })

  rewriteResults.value = finalResults
  rewriteProgress.completed = rewriteProgress.total

  // 默认展开第一个
  if (finalResults.length > 0) {
    expandedPreviews.value = [0]
  }
}

/**
 * 重试单条改写
 */
const retryRewrite = async (resultIndex: number) => {
  const item = rewriteResults.value[resultIndex]
  if (!item) return

  const text = rawTexts.value[item.index]?.text?.trim()
  if (!text) return

  const statusItem = rewriteStatusList.value[item.index]
  if (statusItem) statusItem.status = 'processing'

  try {
    const result = await rewritePost(text)
    item.result = result
    item.error = undefined
    item.rawData = undefined
    item.editingRawData = undefined
    item.selected = true
    if (statusItem) statusItem.status = 'success'
    ElMessage.success('重试改写成功')
  } catch (error) {
    item.error = error instanceof Error ? error.message : '改写失败'
    if (error instanceof CozeParseError) {
      item.rawData = error.rawData
      try {
        item.editingRawData = JSON.stringify(JSON.parse(error.rawData), null, 2)
      } catch {
        item.editingRawData = error.rawData
      }
    }
    if (statusItem) statusItem.status = 'error'
    ElMessage.error('重试改写失败')
  }
}

/**
 * 手动解析编辑后的 JSON 数据
 */
const manualParseRawData = (resultIndex: number) => {
  const item = rewriteResults.value[resultIndex]
  if (!item?.editingRawData) return

  try {
    const result = parseRawDataToResult(item.editingRawData)
    item.result = result
    item.error = undefined
    item.selected = true
    const statusItem = rewriteStatusList.value[item.index]
    if (statusItem) statusItem.status = 'success'
    ElMessage.success('手动解析成功')
  } catch (error) {
    ElMessage.error(
      error instanceof Error ? error.message : '解析失败，请检查 JSON 格式',
    )
  }
}

/**
 * 格式化 JSON
 */
const formatRawJson = (resultIndex: number) => {
  const item = rewriteResults.value[resultIndex]
  if (!item?.editingRawData) return

  try {
    const parsed = JSON.parse(item.editingRawData)
    item.editingRawData = JSON.stringify(parsed, null, 2)
    ElMessage.success('格式化成功')
  } catch {
    ElMessage.error('JSON 格式无效，无法格式化')
  }
}

/**
 * 还原为原始数据
 */
const resetRawData = (resultIndex: number) => {
  const item = rewriteResults.value[resultIndex]
  if (!item?.rawData) return

  try {
    item.editingRawData = JSON.stringify(JSON.parse(item.rawData), null, 2)
  } catch {
    item.editingRawData = item.rawData
  }
}

// ============ Step 3: 发布 ============

const publishing = ref(false)
const publishResult = reactive({
  success: false,
  count: 0,
  error: '',
})

const confirmPublish = async () => {
  const selectedItems = rewriteResults.value.filter(
    (r) => r.selected && r.result,
  )

  if (selectedItems.length === 0) {
    ElMessage.warning('请至少选择一条帖子')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要发布选中的 ${selectedItems.length} 条帖子吗？将通过机器人批量发帖接口提交。`,
      '确认批量发布',
      {
        confirmButtonText: '确认发布',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
  } catch {
    return // 用户取消
  }

  currentStep.value = 3
  publishing.value = true
  publishResult.success = false
  publishResult.count = 0
  publishResult.error = ''

  try {
    // 构建发布请求数组
    const publishRequests: PostPublishRequest[] = selectedItems.map((item) => ({
      title: item.result!.title,
      cover: item.result!.cover || undefined,
      contentBlocks: item.result!.contentBlocks.map((block) => ({
        type: block.type,
        order: block.order,
        content: block.content,
        url: block.url,
      })) as ContentBlock[],
      postType: 'NORMAL',
      tags: item.result!.tags,
    }))

    await postApi.postCommunityPostsRobotBatch(publishRequests)

    publishResult.success = true
    publishResult.count = selectedItems.length
    ElMessage.success(`成功发布 ${selectedItems.length} 条帖子`)
  } catch (error) {
    publishResult.error =
      error instanceof Error ? error.message : '批量发布失败，请重试'
    ElMessage.error('批量发布失败')
  } finally {
    publishing.value = false
  }
}

/**
 * 重置全部
 */
const resetAll = () => {
  currentStep.value = 0
  rawTexts.value = [{ id: nextId++, text: '' }]
  rewriteResults.value = []
  rewriteStatusList.value = []
  rewriteProgress.completed = 0
  rewriteProgress.total = 0
  publishResult.success = false
  publishResult.count = 0
  publishResult.error = ''
}

/**
 * 跳转帖子管理
 */
const goToPostManagement = () => {
  router.push('/post-management')
}
</script>

<style lang="scss" scoped>
$primary-padding: 16px;
$border-radius: 8px;
$gap: 12px;

.post-batch-import {
  padding: $primary-padding;
  background: #f5f7fa;
  min-height: 100vh;

  html.dark & {
    background: #141414;
  }
}

// 步骤条
.steps-card {
  margin-bottom: $gap;
  border-radius: $border-radius;
  border: none;

  :deep(.el-card__body) {
    padding: 20px 40px;
  }
}

// 步骤内容
.step-content {
  :deep(.el-card) {
    border-radius: $border-radius;
    border: none;
  }
}

// 卡片头部
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .card-title {
    font-size: 16px;
    font-weight: 600;
  }

  .card-actions {
    display: flex;
    gap: 8px;
  }
}

// 文本输入列表
.text-input-list {
  display: flex;
  flex-direction: column;
  gap: $gap;
}

.text-input-item {
  background: #f9fafb;
  border-radius: $border-radius;
  padding: 12px;
  border: 1px solid #e4e7ed;
  transition: border-color 0.3s;

  html.dark & {
    background: #1a1a1a;
    border-color: #363636;
  }

  &:focus-within {
    border-color: var(--el-color-primary);
  }

  .item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .item-index {
      font-size: 14px;
      font-weight: 600;
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

// 步骤操作按钮
.step-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;

  html.dark & {
    border-top-color: #363636;
  }

  .action-hint {
    font-size: 13px;
    color: #909399;

    &.success {
      color: var(--el-color-success);
    }
  }

  .action-right {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: auto;
  }
}

// 改写进度
.rewrite-progress {
  margin-bottom: 20px;
}

.rewrite-status-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rewrite-status-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  background: #f9fafb;
  transition: all 0.3s;

  html.dark & {
    background: #1a1a1a;
  }

  &.processing {
    background: var(--el-color-primary-light-9);
  }

  &.success {
    background: var(--el-color-success-light-9);
  }

  &.error {
    background: var(--el-color-danger-light-9);
  }

  .status-index {
    font-size: 13px;
    font-weight: 600;
    color: #909399;
    min-width: 20px;
  }

  .status-text {
    flex: 1;
    font-size: 13px;
    color: #606266;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    html.dark & {
      color: #a3a6ad;
    }
  }

  .status-icon {
    font-size: 18px;
    color: #909399;

    &.spinning {
      animation: spin 1.2s linear infinite;
      color: var(--el-color-primary);
    }

    &.success {
      color: var(--el-color-success);
    }

    &.error {
      color: var(--el-color-danger);
    }
  }
}

// 预览列表
.preview-list {
  :deep(.el-collapse) {
    border: none;
  }

  :deep(.el-collapse-item__header) {
    border: none;
    background: transparent;
    height: auto;
    padding: 12px 0;
  }

  :deep(.el-collapse-item__wrap) {
    border: none;
  }
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding-right: 12px;

  .preview-name {
    flex: 1;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.preview-error {
  .original-text {
    margin-top: 12px;
  }
}

.raw-data-editor {
  margin-top: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;

  html.dark & {
    background: #1a1a1a;
    border-color: #363636;
  }

  .json-editor {
    margin-top: 8px;

    :deep(.el-textarea__inner) {
      font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
      font-size: 12px;
      line-height: 1.6;
      tab-size: 2;
    }
  }

  .raw-data-actions {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }
}

.preview-form {
  padding: 0 4px;
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 6px;

  html.dark & {
    color: #a3a6ad;
  }
}

.text-content {
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  background: #f9fafb;
  padding: 12px;
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;

  html.dark & {
    background: #1a1a1a;
    color: #a3a6ad;
  }
}

// 内容块编辑器
.content-blocks-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.block-item {
  background: #f9fafb;
  border-radius: 6px;
  padding: 10px;
  border: 1px solid #e4e7ed;

  html.dark & {
    background: #1a1a1a;
    border-color: #363636;
  }

  .block-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .block-order {
      font-size: 12px;
      color: #909399;
    }

    .el-button {
      margin-left: auto;
    }
  }
}

.original-collapse {
  margin-top: 12px;

  :deep(.el-collapse-item__header) {
    font-size: 13px;
    color: #909399;
    height: 36px;
  }
}

// 发布中状态
.publishing-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  gap: 16px;

  p {
    font-size: 14px;
    color: #909399;
  }
}

// 旋转动画
@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.spinning {
  animation: spin 1.2s linear infinite;
}
</style>
