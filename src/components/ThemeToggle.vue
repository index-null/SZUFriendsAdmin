<template>
  <el-button
    class="theme-toggle"
    :icon="isDark ? Moon : Sunny"
    circle
    size="large"
    @click="handleToggle"
  />
</template>

<script setup lang="ts">
import { Sunny, Moon } from '@element-plus/icons-vue'
import { isDark, toggleDark } from '@/element-plus'

const handleToggle = () => {
  toggleDark()
}
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 1000;
  width: 50px !important;
  height: 50px !important;
  min-width: 50px !important;
  min-height: 50px !important;
  border-radius: 50% !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition:
    transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  aspect-ratio: 1 / 1;
}

.theme-toggle:hover {
  transform: scale(1.1) rotate(15deg);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

html.dark .theme-toggle {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

html.dark .theme-toggle:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
  transform: scale(1.1) rotate(-15deg);
}

/* 确保图标居中 */
.theme-toggle :deep(.el-icon) {
  margin: 0 !important;
  transition:
    transform 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 图标切换动画 */
.theme-toggle:active :deep(.el-icon) {
  transform: scale(0.8) rotate(180deg);
}

/* 移除 Element Plus 按钮默认样式干扰 */
.theme-toggle :deep(span) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
</style>
