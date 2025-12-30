<template>
  <div class="content-block-renderer">
    <template v-for="(block, index) in sortedBlocks" :key="index">
      <!-- 文本内容 -->
      <p v-if="isTextBlock(block)" class="content-text">
        {{ block.content }}
      </p>

      <!-- 图片内容 -->
      <div v-else-if="isImageBlock(block)" class="content-media content-image">
        <el-image
          :src="block.url || block.content"
          fit="contain"
          :preview-src-list="imageList"
          :initial-index="getImageIndex(block)"
          preview-teleported
          lazy
        >
          <template #placeholder>
            <div class="media-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
            </div>
          </template>
          <template #error>
            <div class="media-error">
              <el-icon><PictureFilled /></el-icon>
              <span>图片加载失败</span>
            </div>
          </template>
        </el-image>
      </div>

      <!-- 视频内容 -->
      <div v-else-if="isVideoBlock(block)" class="content-media content-video">
        <video
          :src="block.url"
          :poster="block.coverUrl || block.thumbnail"
          controls
          preload="metadata"
          playsinline
          @error="handleVideoError($event, block)"
        >
          您的浏览器不支持视频播放
        </video>
        <div v-if="block.duration" class="video-duration">
          {{ formatDuration(block.duration) }}
        </div>
      </div>
    </template>

    <!-- 空内容提示 -->
    <el-empty
      v-if="!sortedBlocks || sortedBlocks.length === 0"
      description="暂无内容"
      :image-size="60"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Loading, PictureFilled } from '@element-plus/icons-vue'
import type { ContentBlock } from '@/api/generated/.ts.schemas'

interface Props {
  /** 内容块数组 */
  blocks?: ContentBlock[]
}

const props = withDefaults(defineProps<Props>(), {
  blocks: () => [],
})

// 图片扩展名
const IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.bmp',
  '.svg',
]
// 视频扩展名
const VIDEO_EXTENSIONS = [
  '.mp4',
  '.webm',
  '.ogg',
  '.mov',
  '.avi',
  '.mkv',
  '.m4v',
]

/**
 * 根据 URL 后缀判断媒体类型
 */
const getMediaTypeByUrl = (url?: string): 'image' | 'video' | null => {
  if (!url) return null
  const lowerUrl = url.toLowerCase()
  if (IMAGE_EXTENSIONS.some((ext) => lowerUrl.endsWith(ext))) {
    return 'image'
  }
  if (VIDEO_EXTENSIONS.some((ext) => lowerUrl.endsWith(ext))) {
    return 'video'
  }
  return null
}

/**
 * 判断是否为文本块
 */
const isTextBlock = (block: ContentBlock): boolean => {
  const type = block.type?.toUpperCase()
  return type === 'TEXT' && !!block.content
}

/**
 * 判断是否为图片块
 */
const isImageBlock = (block: ContentBlock): boolean => {
  const type = block.type?.toUpperCase()
  // 优先使用 type 字段判断
  if (type === 'IMAGE') return true
  // 如果 type 不明确，根据 URL 后缀判断
  if (!type || type === 'UNKNOWN') {
    const mediaType = getMediaTypeByUrl(block.url || block.content)
    return mediaType === 'image'
  }
  return false
}

/**
 * 判断是否为视频块
 */
const isVideoBlock = (block: ContentBlock): boolean => {
  const type = block.type?.toUpperCase()
  // 优先使用 type 字段判断
  if (type === 'VIDEO') return true
  // 如果 type 不明确，根据 URL 后缀判断
  if (!type || type === 'UNKNOWN') {
    const mediaType = getMediaTypeByUrl(block.url || block.content)
    return mediaType === 'video'
  }
  return false
}

/**
 * 按 order 排序的内容块
 */
const sortedBlocks = computed(() => {
  if (!props.blocks || props.blocks.length === 0) return []
  return [...props.blocks].sort((a, b) => (a.order || 0) - (b.order || 0))
})

/**
 * 提取所有图片 URL 用于预览
 */
const imageList = computed(() => {
  return sortedBlocks.value
    .filter((block) => isImageBlock(block))
    .map((block) => block.url || block.content || '')
    .filter(Boolean)
})

/**
 * 获取图片在预览列表中的索引
 */
const getImageIndex = (block: ContentBlock): number => {
  const url = block.url || block.content || ''
  return imageList.value.indexOf(url)
}

/**
 * 格式化视频时长
 */
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * 处理视频加载错误
 */
const handleVideoError = (event: Event, block: ContentBlock) => {
  console.error('视频加载失败:', block.url, event)
}
</script>

<style lang="scss" scoped>
.content-block-renderer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// 文本内容
.content-text {
  font-size: 14px;
  line-height: 1.8;
  color: var(--el-text-color-primary);
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

// 媒体内容通用样式
.content-media {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-fill-color-light);
}

// 图片内容
.content-image {
  :deep(.el-image) {
    display: block;
    width: 100%;
    max-height: 400px;

    img {
      width: 100%;
      height: auto;
      object-fit: contain;
    }
  }
}

// 视频内容
.content-video {
  video {
    display: block;
    width: 100%;
    max-height: 400px;
    background: #000;
    outline: none;
  }

  .video-duration {
    position: absolute;
    bottom: 8px;
    right: 8px;
    padding: 2px 6px;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    font-size: 12px;
    border-radius: 4px;
    pointer-events: none;
  }
}

// 加载状态
.media-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 200px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 24px;
}

// 错误状态
.media-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 200px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-placeholder);

  .el-icon {
    font-size: 32px;
  }

  span {
    font-size: 12px;
  }
}
</style>
