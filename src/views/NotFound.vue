<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push({ name: 'Home' })
}
</script>

<template>
  <div class="not-found">
    <div class="error-container">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">页面未找到</h2>
      <p class="error-message">抱歉，您访问的页面不存在或已被移除。</p>
      <button class="home-btn" @click="goHome">返回首页</button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.error-container {
  text-align: center;
  color: white;
}

.error-code {
  font-size: 6rem;
  font-weight: bold;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.error-title {
  font-size: 2rem;
  margin: 1rem 0;
}

.error-message {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.home-btn {
  padding: 0.8rem 2rem;
  border-radius: 8px;
  border: none;
  background-color: white;
  color: #667eea;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>
