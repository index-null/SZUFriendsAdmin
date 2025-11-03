<script setup lang="ts">
import { useRouter } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'

const router = useRouter()

const navigateTo = (name: string) => {
  router.push({ name })
}
</script>

<template>
  <div class="home">
    <div class="logo-container">
      <a href="https://vite.dev" target="_blank">
        <img src="/vite.svg" class="logo" alt="Vite logo" />
      </a>
      <a href="https://vuejs.org/" target="_blank">
        <img src="../assets/vue.svg" class="logo vue" alt="Vue logo" />
      </a>
    </div>
    <HelloWorld msg="Vite + Vue + Router" />
    <div class="nav-buttons">
      <button @click="navigateTo('About')" class="nav-btn">
        前往关于页面
      </button>
    </div>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
  padding: 2rem;
}

.logo-container {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.nav-buttons {
  margin-top: 2rem;
}

.nav-btn {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  border: 1px solid transparent;
  background-color: #1e90ff;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.nav-btn:hover {
  background-color: #1873cc;
}
</style>
