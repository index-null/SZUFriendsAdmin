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
                  <el-radio-button :value="ContentBlockType.text"
                    >文本</el-radio-button
                  >
                  <el-radio-button :value="ContentBlockType.image"
                    >图片</el-radio-button
                  >
                  <el-radio-button :value="ContentBlockType.video"
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
                v-if="item.block.type === ContentBlockType.text"
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
                v-else-if="item.block.type === ContentBlockType.image"
                class="cbe-media-block"
              >
                <!-- 已上传：显示图片网格 -->
                <div
                  v-if="getBlockUrls(item).length > 0"
                  class="cbe-media-preview cbe-media-grid-preview"
                  @dragover.prevent="onDragOver(index, $event)"
                  @dragleave.prevent="onDragLeave(index, $event)"
                  @drop.prevent="onDrop(index, $event)"
                >
                  <div
                    v-for="(url, urlIdx) in getBlockUrls(item)"
                    :key="urlIdx"
                    class="cbe-media-grid-item"
                  >
                    <img :src="url" :alt="`图片 ${urlIdx + 1}`" />
                    <el-button
                      class="media-remove-btn"
                      type="danger"
                      circle
                      size="small"
                      :icon="Close"
                      @click="removeBlockUrl(index, urlIdx)"
                    />
                  </div>
                  <div class="cbe-media-grid-add" @click="triggerUpload(index)">
                    <el-icon><Plus /></el-icon>
                    <span>添加</span>
                  </div>
                  <el-button
                    class="media-replace-btn"
                    size="small"
                    @click="triggerUpload(index)"
                  >
                    上传更多
                  </el-button>
                </div>
                <!-- 未上传：占位符 + 拖拽支持 -->
                <div
                  v-else
                  class="cbe-media-placeholder"
                  :class="{
                    'is-uploading': item.uploading,
                    'is-dragover': item.dragover,
                  }"
                  @click="triggerUpload(index)"
                  @dragover.prevent="onDragOver(index, $event)"
                  @dragleave.prevent="onDragLeave(index, $event)"
                  @drop.prevent="onDrop(index, $event)"
                >
                  <el-icon v-if="!item.uploading" class="placeholder-icon"
                    ><Picture
                  /></el-icon>
                  <el-icon v-else class="placeholder-icon is-loading"
                    ><Loading
                  /></el-icon>
                  <span>{{
                    item.uploading ? '上传中...' : '点击或拖入图片'
                  }}</span>
                  <span class="placeholder-hint"
                    >支持 JPG / PNG / WebP，单张不超过 10MB，可多选</span
                  >
                </div>
                <input
                  :ref="
                    (el) =>
                      setUploadInputRef(index, el as HTMLInputElement | null)
                  "
                  type="file"
                  accept="image/*"
                  multiple
                  style="display: none"
                  @change="(e) => handleFileChange(index, e)"
                />
              </div>

              <!-- 视频块 -->
              <div
                v-else-if="item.block.type === ContentBlockType.video"
                class="cbe-media-block"
              >
                <!-- 已上传：显示视频网格 -->
                <div
                  v-if="getBlockUrls(item).length > 0"
                  class="cbe-media-preview cbe-media-grid-preview cbe-video-grid"
                  @dragover.prevent="onDragOver(index, $event)"
                  @dragleave.prevent="onDragLeave(index, $event)"
                  @drop.prevent="onDrop(index, $event)"
                >
                  <div
                    v-for="(url, urlIdx) in getBlockUrls(item)"
                    :key="urlIdx"
                    class="cbe-media-grid-item cbe-video-grid-item"
                  >
                    <video :src="url" controls preload="metadata" />
                    <el-button
                      class="media-remove-btn"
                      type="danger"
                      circle
                      size="small"
                      :icon="Close"
                      @click="removeBlockUrl(index, urlIdx)"
                    />
                  </div>
                  <div class="cbe-media-grid-add" @click="triggerUpload(index)">
                    <el-icon><Plus /></el-icon>
                    <span>添加</span>
                  </div>
                  <el-button
                    class="media-replace-btn"
                    size="small"
                    @click="triggerUpload(index)"
                  >
                    上传更多
                  </el-button>
                </div>
                <!-- 未上传：占位符 + 拖拽支持 -->
                <div
                  v-else
                  class="cbe-media-placeholder"
                  :class="{
                    'is-uploading': item.uploading,
                    'is-dragover': item.dragover,
                  }"
                  @click="triggerUpload(index)"
                  @dragover.prevent="onDragOver(index, $event)"
                  @dragleave.prevent="onDragLeave(index, $event)"
                  @drop.prevent="onDrop(index, $event)"
                >
                  <el-icon v-if="!item.uploading" class="placeholder-icon"
                    ><VideoPlay
                  /></el-icon>
                  <el-icon v-else class="placeholder-icon is-loading"
                    ><Loading
                  /></el-icon>
                  <span>{{
                    item.uploading ? '上传中...' : '点击或拖入视频'
                  }}</span>
                  <span class="placeholder-hint"
                    >支持 MP4 / WebM，建议不超过 100MB，可多选</span
                  >
                </div>
                <input
                  :ref="
                    (el) =>
                      setUploadInputRef(index, el as HTMLInputElement | null)
                  "
                  type="file"
                  accept="video/*"
                  multiple
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
            @click="addBlock(ContentBlockType.text)"
          >
            <el-icon><Document /></el-icon>
            添加文本
          </el-button>
          <el-button
            plain
            size="small"
            @click="addBlock(ContentBlockType.image)"
          >
            <el-icon><Picture /></el-icon>
            添加图片
          </el-button>
          <el-button
            plain
            size="small"
            @click="addBlock(ContentBlockType.video)"
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
  Close,
  Plus,
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
  dragover: boolean
  urls: string[] // 支持多个 url（用于一个块上传多个文件）
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
  blocks.map((b) => ({
    key: genKey(),
    block: { ...b },
    uploading: false,
    dragover: false,
    urls: b.url ? [b.url] : [],
  }))

// 获取 block 中的所有 url（兼容单 url 和多 urls）
const getBlockUrls = (item: InternalItem): string[] => {
  // 优先使用 InternalItem 的 urls 数组
  if (item.urls && item.urls.length > 0) return item.urls
  // 兼容旧的单 url 字段
  if (item.block.url) return [item.block.url]
  return []
}

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
// 如果 block 有多个 url，拆分成多个 ContentBlock
const emitUpdate = () => {
  skipNextWatch = true
  const result: ContentBlock[] = []
  internalBlocks.value.forEach((item) => {
    const urls =
      item.urls?.length > 0 ? item.urls : item.block.url ? [item.block.url] : []
    if (urls.length > 1) {
      // 多文件：拆分成多个 block
      urls.forEach((url, _idx) => {
        result.push({
          ...item.block,
          url,
          order: result.length + 1,
        })
      })
    } else {
      // 单文件或文本
      result.push({ ...item.block, order: result.length + 1 })
    }
  })
  emit('update:modelValue', result)
}

// 预览用 blocks（多 url 时拆分成多个 block）
// 每个 block 都正确设置 order，确保与左侧编辑区顺序一致
const previewBlocks = computed<ContentBlock[]>(() => {
  const result: ContentBlock[] = []
  internalBlocks.value.forEach((item) => {
    const b = item.block
    if (b.type === ContentBlockType.text) {
      if (b.content?.trim()) {
        result.push({ ...b, order: result.length + 1 })
      }
    } else {
      // 媒体块：如果有多个 url，拆分成多个 block
      const urls = item.urls?.length > 0 ? item.urls : b.url ? [b.url] : []
      if (urls.length > 0) {
        urls.forEach((url) => {
          result.push({
            ...b,
            url,
            content: undefined,
            order: result.length + 1,
          })
        })
      }
    }
  })
  return result
})

// ── 操作 ──
const addBlock = (type: ContentBlockType) => {
  internalBlocks.value.push({
    key: genKey(),
    block: {
      type,
      order: internalBlocks.value.length + 1,
      content: type === ContentBlockType.text ? '' : undefined,
      url: undefined,
    },
    uploading: false,
    dragover: false,
    urls: [],
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
      type === ContentBlockType.text ? (item.block.content ?? '') : undefined,
    url:
      type !== ContentBlockType.text
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
  const files = input.files
  if (!files || files.length === 0) return

  const item = internalBlocks.value[index]
  if (!item) return

  const isVideo = item.block.type === ContentBlockType.video
  const maxMB = isVideo ? 100 : 10

  // 验证所有文件
  for (const file of Array.from(files)) {
    if (file.size > maxMB * 1024 * 1024) {
      ElMessage.error(`文件 ${file.name} 大小不能超过 ${maxMB}MB`)
      return
    }
  }

  item.uploading = true
  const uploadedUrls: string[] = []

  try {
    // 逐个上传文件
    for (const file of Array.from(files)) {
      const url = await fileApi.postManagerFileUpload({ file })
      uploadedUrls.push(url)
    }

    // 更新 urls 数组
    if (!item.urls) item.urls = []
    item.urls = [...item.urls, ...uploadedUrls]

    // 兼容单 url 字段（用于预览等）
    if (item.urls.length > 0) {
      item.block = { ...item.block, url: item.urls[0] }
    }

    emitUpdate()
  } catch {
    ElMessage.error('文件上传失败，请重试')
  } finally {
    item.uploading = false
    if (input) input.value = ''
  }
}

// ── 拖拽上传 ──
const onDragOver = (index: number, _event: DragEvent) => {
  const item = internalBlocks.value[index]
  if (item) item.dragover = true
}

const onDragLeave = (index: number, event: DragEvent) => {
  // 只有当鼠标真正离开元素时才移除效果
  const relatedTarget = event.relatedTarget as Node | null
  const target = event.currentTarget as HTMLElement
  if (!relatedTarget || !target.contains(relatedTarget)) {
    const item = internalBlocks.value[index]
    if (item) item.dragover = false
  }
}

const onDrop = async (index: number, event: DragEvent) => {
  const item = internalBlocks.value[index]
  if (!item) return

  item.dragover = false
  const files = event.dataTransfer?.files
  if (!files || files.length === 0) return

  const isVideo = item.block.type === ContentBlockType.video
  const maxMB = isVideo ? 100 : 10

  // 验证所有文件
  for (const file of Array.from(files)) {
    if (file.size > maxMB * 1024 * 1024) {
      ElMessage.error(`文件 ${file.name} 大小不能超过 ${maxMB}MB`)
      return
    }
    // 检查文件类型
    if (isVideo && !file.type.startsWith('video/')) {
      ElMessage.error(`文件 ${file.name} 不是有效的视频文件`)
      return
    }
    if (!isVideo && !file.type.startsWith('image/')) {
      ElMessage.error(`文件 ${file.name} 不是有效的图片文件`)
      return
    }
  }

  item.uploading = true
  const uploadedUrls: string[] = []

  try {
    for (const file of Array.from(files)) {
      const url = await fileApi.postManagerFileUpload({ file })
      uploadedUrls.push(url)
    }

    if (!item.urls) item.urls = []
    item.urls = [...item.urls, ...uploadedUrls]

    if (item.urls.length > 0) {
      item.block = { ...item.block, url: item.urls[0] }
    }

    emitUpdate()
  } catch {
    ElMessage.error('文件上传失败，请重试')
  } finally {
    item.uploading = false
  }
}

// ── 删除某个 url ──
const removeBlockUrl = (index: number, urlIdx: number) => {
  const item = internalBlocks.value[index]
  if (!item || !item.urls) return

  item.urls.splice(urlIdx, 1)

  // 更新 block.url
  if (item.urls.length > 0) {
    item.block = { ...item.block, url: item.urls[0] }
  } else {
    item.block = { ...item.block, url: undefined }
  }

  emitUpdate()
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

  &.is-dragover {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-8);
    box-shadow: 0 0 0 3px var(--el-color-primary-light-7);
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
    z-index: 10;

    &:hover {
      background: rgba(0, 0, 0, 0.75);
    }
  }

  &:hover .media-replace-btn {
    opacity: 1;
  }
}

// 多文件网格预览
.cbe-media-grid-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  min-height: 100px;

  .cbe-media-grid-item {
    position: relative;
    width: calc(33.333% - 6px);
    aspect-ratio: 1;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid var(--el-border-color-lighter);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .media-remove-btn {
      position: absolute;
      top: 4px;
      right: 4px;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 10;
      padding: 4px;
    }

    &:hover .media-remove-btn {
      opacity: 1;
    }
  }

  .cbe-media-grid-add {
    width: calc(33.333% - 6px);
    aspect-ratio: 1;
    border: 1.5px dashed var(--el-border-color);
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
    transition:
      border-color 0.2s,
      background 0.2s;
    color: var(--el-text-color-placeholder);

    &:hover {
      border-color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }

    .el-icon {
      font-size: 24px;
    }

    span {
      font-size: 12px;
    }
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
