<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { DefaultLayout } from '@/layouts'

const route = useRoute()

// 判断是否使用布局（登录/注册页面不使用）
const useLayout = computed(() => !route.meta.hideNavbar)
</script>

<template>
  <div id="app">
    <!-- 使用布局的页面 -->
    <DefaultLayout v-if="useLayout" />

    <!-- 不使用布局的页面（登录/注册） -->
    <router-view v-else v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<style scoped>
#app {
  height: 100vh;
  overflow: hidden;
}

/* === 过渡动画 === */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style>
/* === 全局 CSS 变量 === */
:root {
  /* 品牌色 */
  --brand-primary: #990033;
  --brand-gradient-start: #b8174f;
  --brand-gradient-end: #7a0028;

  /* 文字颜色 */
  --text-primary: #2c3e50;
  --text-secondary: rgba(44, 62, 80, 0.65);
  --text-tertiary: rgba(44, 62, 80, 0.5);

  /* 边框颜色 */
  --border-color: #e5e7eb;
}

html.dark {
  /* 品牌色（暗色模式） */
  --brand-primary: #409eff;
  --brand-gradient-start: #66b1ff;
  --brand-gradient-end: #267de8;

  /* 文字颜色 */
  --text-primary: #e5e7eb;
  --text-secondary: rgba(229, 231, 235, 0.65);
  --text-tertiary: rgba(229, 231, 235, 0.5);

  /* 边框颜色 */
  --border-color-dark: #333;
}
</style>
