<template>
  <div class="cbe-root">
    <div class="cbe-layout">
      <!-- 左：编辑区 -->
      <div class="cbe-editor">
        <div ref="listRef" class="cbe-block-list">
          <div
            v-for="(item, index) in internalBlocks"
            :key="item.key"
            class="cbe-block-item"
          >
            <!-- 拖拽手柄 -->
            <div class="cbe-block-handle drag-handle">
              <el-icon class="handle-icon"><Grid /></el-icon>
            </div>

            <div class="cbe-block-body">
              <!-- 类型切换 + 操作 -->
              <div class="cbe-block-toolbar">
                <el-radio-group
                  :model-value="item.block.type"
                  size="small"
                  @update:model-value="
                    (v: ContentBlockType) => changeBlockType(index, v)
                  "
                >
                  <el-radio-button :value="ContentBlockType.TEXT"
                    >文本</el-radio-button
                  >
                  <el-radio-button :value="ContentBlockType.IMAGE"
                    >图片</el-radio-button
                  >
                  <el-radio-button :value="ContentBlockType.VIDEO"
                    >视频</el-radio-button
                  >
                </el-radio-group>

                <div class="toolbar-right">
                  <el-button
                    text
                    :icon="ArrowUp"
                    size="small"
                    :disabled="index === 0"
                    @click="moveBlock(index, -1)"
                  />
                  <el-button
                    text
                    :icon="ArrowDown"
                    size="small"
                    :disabled="index === internalBlocks.length - 1"
                    @click="moveBlock(index, 1)"
                  />
                  <el-button
                    text
                    type="danger"
                    :icon="Delete"
                    size="small"
                    :disabled="internalBlocks.length <= 1"
                    @click="removeBlock(index)"
                  />
                </div>
              </div>

              <!-- 文本块 -->
              <el-input
                v-if="item.block.type === ContentBlockType.TEXT"
                :model-value="item.block.content"
                type="textarea"
                :autosize="{ minRows: 3, maxRows: 12 }"
                placeholder="输入文本内容..."
                resize="none"
                @update:model-value="
                  (v: string) => updateField(index, 'content', v)
                "
              />

              <!-- 图片块 -->
              <div
                v-else-if="item.block.type === ContentBlockType.IMAGE"
                class="cbe-media-block"
              >
                <div v-if="item.block.url" class="cbe-media-preview">
                  <img :src="item.block.url" alt="图片预览" />
                  <el-button
                    class="media-replace-btn"
                    size="small"
                    @click="triggerUpload(index)"
                  >
                    替换
                  </el-button>
                </div>
                <div
                  v-else
                  class="cbe-media-placeholder"
                  :class="{ 'is-uploading': item.uploading }"
                  @click="triggerUpload(index)"
                >
                  <el-icon v-if="!item.uploading" class="placeholder-icon"
                    ><Picture
                  /></el-icon>
                  <el-icon v-else class="placeholder-icon is-loading"
                    ><Loading
                  /></el-icon>
                  <span>{{
                    item.uploading ? '上传中...' : '点击上传图片'
                  }}</span>
                  <span class="placeholder-hint"
                    >支持 JPG / PNG / WebP，单张不超过 10MB</span
                  >
                </div>
                <input
                  :ref="
                    (el) =>
                      setUploadInputRef(index, el as HTMLInputElement | null)
                  "
                  type="file"
                  accept="image/*"
                  style="display: none"
                  @change="(e) => handleFileChange(index, e)"
                />
              </div>

              <!-- 视频块 -->
              <div
                v-else-if="item.block.type === ContentBlockType.VIDEO"
                class="cbe-media-block"
              >
                <div
                  v-if="item.block.url"
                  class="cbe-media-preview cbe-video-preview"
                >
                  <video :src="item.block.url" controls />
                  <el-button
                    class="media-replace-btn"
                    size="small"
                    @click="triggerUpload(index)"
                  >
                    替换
                  </el-button>
                </div>
                <div
                  v-else
                  class="cbe-media-placeholder"
                  :class="{ 'is-uploading': item.uploading }"
                  @click="triggerUpload(index)"
                >
                  <el-icon v-if="!item.uploading" class="placeholder-icon"
                    ><VideoPlay
                  /></el-icon>
                  <el-icon v-else class="placeholder-icon is-loading"
                    ><Loading
                  /></el-icon>
                  <span>{{
                    item.uploading ? '上传中...' : '点击上传视频'
                  }}</span>
                  <span class="placeholder-hint"
                    >支持 MP4 / WebM，建议不超过 100MB</span
                  >
                </div>
                <input
                  :ref="
                    (el) =>
                      setUploadInputRef(index, el as HTMLInputElement | null)
                  "
                  type="file"
                  accept="video/*"
                  style="display: none"
                  @change="(e) => handleFileChange(index, e)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 添加块 -->
        <div class="cbe-add-row">
          <el-button
            plain
            size="small"
            @click="addBlock(ContentBlockType.TEXT)"
          >
            <el-icon><Document /></el-icon>
            添加文本
          </el-button>
          <el-button
            plain
            size="small"
            @click="addBlock(ContentBlockType.IMAGE)"
          >
            <el-icon><Picture /></el-icon>
            添加图片
          </el-button>
          <el-button
            plain
            size="small"
            @click="addBlock(ContentBlockType.VIDEO)"
          >
            <el-icon><VideoPlay /></el-icon>
            添加视频
          </el-button>
        </div>
      </div>

      <!-- 右：实时预览 -->
      <div class="cbe-preview-panel">
        <div class="preview-header">
          <span>预览</span>
        </div>
        <div class="preview-scroll">
          <div v-if="previewBlocks.length === 0" class="preview-empty">
            <el-icon><Document /></el-icon>
            <span>内容将在此预览</span>
          </div>
          <ContentBlockRenderer v-else :blocks="previewBlocks" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Sortable from 'sortablejs'
import {
  Delete,
  ArrowUp,
  ArrowDown,
  Picture,
  VideoPlay,
  Loading,
  Document,
  Grid,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { get as getFileApi } from '@/api/generated/文件管理/文件管理'
import { ContentBlockType } from '@/api/generated/.ts.schemas'
import type { ContentBlock } from '@/api/generated/.ts.schemas'
import ContentBlockRenderer from '@/components/ContentBlockRenderer.vue'

// 内部条目：原始 block + 运行时辅助字段
interface InternalItem {
  key: string
  block: ContentBlock
  uploading: boolean
}

const props = defineProps<{
  modelValue: ContentBlock[]
}>()

const emit = defineEmits<{
  'update:modelValue': [blocks: ContentBlock[]]
}>()

const fileApi = getFileApi()
const listRef = ref<HTMLElement | null>(null)
const uploadInputRefs = ref<Map<number, HTMLInputElement>>(new Map())

let keySeq = 0
const genKey = () => `k${Date.now()}${keySeq++}`

// 内部状态：从 modelValue 同步而来
const internalBlocks = ref<InternalItem[]>([])

const toInternal = (blocks: ContentBlock[]): InternalItem[] =>
  blocks.map((b) => ({ key: genKey(), block: { ...b }, uploading: false }))

// 初始化 & 外部 v-model 变更同步（仅当外部主动替换整个数组时）
let skipNextWatch = false
watch(
  () => props.modelValue,
  (val) => {
    if (skipNextWatch) {
      skipNextWatch = false
      return
    }
    internalBlocks.value = toInternal(val)
  },
  { immediate: true, deep: false },
)

// 向外 emit（reorder order 字段）
const emitUpdate = () => {
  skipNextWatch = true
  emit(
    'update:modelValue',
    internalBlocks.value.map((item, i) => ({ ...item.block, order: i + 1 })),
  )
}

// 预览用 blocks
const previewBlocks = computed<ContentBlock[]>(() =>
  internalBlocks.value
    .filter((item) => {
      const b = item.block
      if (b.type === ContentBlockType.TEXT) return !!b.content?.trim()
      return !!b.url
    })
    .map((item) => item.block),
)

// ── 操作 ──
const addBlock = (type: ContentBlockType) => {
  internalBlocks.value.push({
    key: genKey(),
    block: {
      type,
      order: internalBlocks.value.length + 1,
      content: type === ContentBlockType.TEXT ? '' : undefined,
      url: undefined,
    },
    uploading: false,
  })
  emitUpdate()
}

const removeBlock = (index: number) => {
  internalBlocks.value.splice(index, 1)
  emitUpdate()
}

const moveBlock = (index: number, dir: -1 | 1) => {
  const target = index + dir
  if (target < 0 || target >= internalBlocks.value.length) return
  const arr = internalBlocks.value
  const a = arr[index]!
  const b = arr[target]!
  arr[index] = b
  arr[target] = a
  emitUpdate()
}

const updateField = (
  index: number,
  field: keyof ContentBlock,
  value: unknown,
) => {
  const item = internalBlocks.value[index]
  if (!item) return
  item.block = { ...item.block, [field]: value }
  emitUpdate()
}

const changeBlockType = (index: number, type: ContentBlockType) => {
  const item = internalBlocks.value[index]
  if (!item) return
  item.block = {
    ...item.block,
    type,
    content:
      type === ContentBlockType.TEXT ? (item.block.content ?? '') : undefined,
    url:
      type !== ContentBlockType.TEXT
        ? (item.block.url ?? undefined)
        : undefined,
  }
  item.uploading = false
  emitUpdate()
}

// ── 上传 ──
const setUploadInputRef = (index: number, el: HTMLInputElement | null) => {
  if (el) uploadInputRefs.value.set(index, el)
  else uploadInputRefs.value.delete(index)
}

const triggerUpload = (index: number) => {
  const input = uploadInputRefs.value.get(index)
  if (input) {
    input.value = ''
    input.click()
  }
}

const handleFileChange = async (index: number, event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const isVideo =
    internalBlocks.value[index]?.block.type === ContentBlockType.VIDEO
  const maxMB = isVideo ? 100 : 10
  if (file.size > maxMB * 1024 * 1024) {
    ElMessage.error(`文件大小不能超过 ${maxMB}MB`)
    return
  }

  const item = internalBlocks.value[index]
  if (!item) return
  item.uploading = true

  try {
    const url = await fileApi.postManagerFileUpload({ file })
    item.block = { ...item.block, url }
    emitUpdate()
  } catch {
    ElMessage.error('文件上传失败，请重试')
  } finally {
    item.uploading = false
  }
}

// ── Sortable ──
let sortable: Sortable | null = null

onMounted(async () => {
  await nextTick()
  if (!listRef.value) return
  sortable = Sortable.create(listRef.value, {
    handle: '.drag-handle',
    animation: 180,
    ghostClass: 'cbe-ghost',
    dragClass: 'cbe-dragging',
    onEnd: ({ oldIndex, newIndex }) => {
      if (
        oldIndex === undefined ||
        newIndex === undefined ||
        oldIndex === newIndex
      )
        return
      const arr = internalBlocks.value
      const [moved] = arr.splice(oldIndex, 1) as [InternalItem]
      arr.splice(newIndex, 0, moved)
      emitUpdate()
    },
  })
})

onBeforeUnmount(() => {
  sortable?.destroy()
  sortable = null
})
</script>

<style lang="scss" scoped>
.cbe-root {
  width: 100%;
}

.cbe-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 16px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

// ===== 编辑区 =====
.cbe-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cbe-block-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 60px;
}

.cbe-block-item {
  display: flex;
  align-items: stretch;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:hover {
    border-color: var(--el-color-primary-light-5);
  }

  &:focus-within {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
  }
}

.cbe-block-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  flex-shrink: 0;
  background: var(--el-fill-color-lighter);
  cursor: grab;
  border-right: 1px solid var(--el-border-color-lighter);
  transition: background 0.15s;

  &:hover {
    background: var(--el-fill-color-light);
  }

  &:active {
    cursor: grabbing;
  }

  .handle-icon {
    font-size: 14px;
    color: var(--el-text-color-placeholder);
  }
}

.cbe-block-body {
  flex: 1;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.cbe-block-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 2px;
  }
}

// ── 媒体 ──
.cbe-media-block {
  position: relative;
}

.cbe-media-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 130px;
  border: 1.5px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  background: var(--el-fill-color-lighter);
  transition:
    border-color 0.2s,
    background 0.2s;

  &:hover:not(.is-uploading) {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  .placeholder-icon {
    font-size: 26px;
    color: var(--el-text-color-placeholder);
  }

  span {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .placeholder-hint {
    font-size: 11px;
    color: var(--el-text-color-placeholder);
  }
}

.cbe-media-preview {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  background: var(--el-fill-color-light);

  img {
    display: block;
    width: 100%;
    max-height: 260px;
    object-fit: contain;
  }

  .media-replace-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    opacity: 0;
    transition: opacity 0.2s;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    border: none;

    &:hover {
      background: rgba(0, 0, 0, 0.75);
    }
  }

  &:hover .media-replace-btn {
    opacity: 1;
  }
}

.cbe-video-preview {
  video {
    display: block;
    width: 100%;
    max-height: 260px;
    background: #000;
  }
}

// ── 添加行 ──
.cbe-add-row {
  display: flex;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--el-border-color-lighter);

  .el-button {
    flex: 1;
  }
}

// Sortable ghost / drag
:global(.cbe-ghost) {
  opacity: 0.3;
  background: var(--el-color-primary-light-9) !important;
  border: 1.5px dashed var(--el-color-primary-light-3) !important;
  border-radius: 8px;
}

:global(.cbe-dragging) {
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.16) !important;
  border-color: var(--el-color-primary) !important;
}

// ===== 预览区 =====
.cbe-preview-panel {
  position: sticky;
  top: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color-page);
  overflow: hidden;
}

.preview-header {
  padding: 9px 14px;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.preview-scroll {
  padding: 14px;
  max-height: 580px;
  overflow-y: auto;
}

.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 100px;
  color: var(--el-text-color-placeholder);

  .el-icon {
    font-size: 26px;
  }

  span {
    font-size: 12px;
  }
}

// loading 动画
.is-loading {
  animation: cbe-spin 1s linear infinite;
}

@keyframes cbe-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
