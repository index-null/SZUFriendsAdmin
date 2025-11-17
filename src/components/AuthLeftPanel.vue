<template>
  <div class="auth-left">
    <div class="left-content">
      <SzuLogo :title="title" :size="logoSize" />
      <p class="welcome-text">{{ subtitle }}</p>
      <div class="decoration-line"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SzuLogo from './SzuLogo.vue'

interface Props {
  title?: string
  subtitle?: string
  logoSize?: number
}

withDefaults(defineProps<Props>(), {
  title: '统一认证',
  subtitle: '深圳大学校友录管理系统',
  logoSize: 240,
})
</script>

<style scoped>
/* 左侧装饰区域 */
.auth-left {
  flex: 1;
  background: linear-gradient(135deg, #990033 0%, #660022 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  position: relative;
  overflow: hidden;
}

html.dark .auth-left {
  background: linear-gradient(135deg, #1e3a8a 0%, #4c1d95 100%);
}

.auth-left::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.auth-left::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 500px;
  height: 500px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 50%;
}

.left-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  max-width: 450px;
}

.welcome-text {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin: 20px 0;
  font-weight: 300;
}

.decoration-line {
  width: 100px;
  height: 3px;
  background: white;
  margin: 30px auto;
  border-radius: 2px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .auth-left {
    display: none;
  }
}
</style>
