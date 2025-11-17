<template>
  <div :class="['logo-section', { 'logo-only': !title }]">
    <el-image :src="logoSrc" alt="深圳大学" class="szu-logo" fit="contain" />
    <h1 v-if="title" class="system-title">{{ title }}</h1>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  size?: number // logo尺寸，默认240px
  variant?: 'default' | 'navbar' // 变体类型
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  size: 240,
  variant: 'default',
})

const logoSrc = '/images/szu-logo.png'

const logoSize = computed(() => `${props.size}px`)
</script>

<style scoped>
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin-bottom: 40px;
}

.logo-section.logo-only {
  margin-bottom: 0;
  gap: 0;
}

.szu-logo {
  width: v-bind(logoSize);
  height: v-bind(logoSize);
  object-fit: contain;
  filter: brightness(0) invert(1);
}

/* 导航栏变体 - 不需要反色 */
.logo-section.logo-only .szu-logo {
  filter: none;
}

html.dark .logo-section.logo-only .szu-logo {
  filter: brightness(0) invert(1);
}

.system-title {
  font-size: 42px;
  font-weight: 600;
  color: white;
  margin: 0;
  letter-spacing: 2px;
  width: 100%;
  text-align: center;
}
</style>
