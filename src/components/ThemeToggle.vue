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
  console.log('点击前 isDark:', isDark.value)
  toggleDark()
  console.log('点击后 isDark:', isDark.value)
}
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 1000;
  width: 50px;
  height: 50px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}

.theme-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

html.dark .theme-toggle {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

html.dark .theme-toggle:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
}
</style>
