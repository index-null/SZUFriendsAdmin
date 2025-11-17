<template>
  <div class="login-container">
    <AuthLeftPanel title="登录" />

    <div class="login-right">
      <div class="login-card">
        <div class="login-header">
          <h2 class="login-title">账号登录</h2>
          <p class="login-subtitle">Account Login</p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          size="large"
        >
          <el-form-item prop="username">
            <div class="input-wrapper">
              <img src="/images/user-icon.png" alt="用户" class="input-icon" />
              <el-input
                v-model="loginForm.username"
                placeholder="请输入帐户名"
                clearable
                class="custom-input"
              />
            </div>
          </el-form-item>

          <el-form-item prop="password">
            <div class="input-wrapper">
              <img src="/images/pwd-icon.png" alt="密码" class="input-icon" />
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                class="custom-input"
                @keyup.enter="handleLogin"
              />
            </div>
          </el-form-item>

          <el-form-item>
            <div class="login-options">
              <el-checkbox v-model="loginForm.remember">
                <span class="remember-text">保存账号</span>
              </el-checkbox>
              <el-link type="primary" :underline="false" class="forgot-link">
                忘记密码
              </el-link>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              class="login-button"
              :loading="loading"
              @click="handleLogin"
            >
              {{ loading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>

          <div class="login-footer">
            <el-link :underline="false" class="help-link"> 帮助 </el-link>
            <span class="divider">|</span>
            <el-link :underline="false" class="help-link" @click="goToRegister">
              立即注册
            </el-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'
import AuthLeftPanel from '@/components/AuthLeftPanel.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)

// LocalStorage key
const REMEMBER_USERNAME_KEY = 'remember_username'

// 表单数据
const loginForm = reactive({
  username: '',
  password: '',
  remember: false,
})

// 表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能小于 3 位', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于 6 位', trigger: 'blur' },
  ],
}

// 从 localStorage 加载记住的用户名
const loadRememberedUsername = () => {
  try {
    const rememberedUsername = localStorage.getItem(REMEMBER_USERNAME_KEY)

    if (rememberedUsername) {
      loginForm.username = rememberedUsername
      loginForm.remember = true
    }
  } catch (error) {
    localStorage.removeItem(REMEMBER_USERNAME_KEY)
  }
}

// 保存或清除记住的用户名
const saveOrClearUsername = () => {
  if (loginForm.remember) {
    localStorage.setItem(REMEMBER_USERNAME_KEY, loginForm.username)
  } else {
    localStorage.removeItem(REMEMBER_USERNAME_KEY)
  }
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true

    const success = await userStore.login({
      username: loginForm.username,
      password: loginForm.password,
    })

    if (success) {
      saveOrClearUsername()
      const redirect = (route.query.redirect as string) || '/home'
      await router.push(redirect)
    }
  } finally {
    loading.value = false
  }
}

// 跳转到注册页
const goToRegister = () => {
  router.push('/register')
}

// 组件挂载时加载记住的用户名
onMounted(() => {
  loadRememberedUsername()
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  background: #ffffff;
}

html.dark .login-container {
  background: #0f0f0f;
}

/* 左侧装饰区域 */
.login-left {
  flex: 1;
  background: linear-gradient(135deg, #990033 0%, #660022 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  position: relative;
  overflow: hidden;
}

html.dark .login-left {
  background: linear-gradient(135deg, #1e3a8a 0%, #4c1d95 100%);
}

.login-left::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.login-left::after {
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

/* 右侧登录区域 */
.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.login-right::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/login-bg.png');
  background-size: cover;
  background-position: center;
  animation: slowMove 30s ease-in-out infinite;
  z-index: 0;
  opacity: 0.15;
}

html.dark .login-right::before {
  opacity: 0.08;
}

@keyframes slowMove {
  0% {
    transform: scale(1) translate(0, 0);
  }
  25% {
    transform: scale(1.05) translate(-1%, -1%);
  }
  50% {
    transform: scale(1.08) translate(1%, 1%);
  }
  75% {
    transform: scale(1.05) translate(-0.5%, 0.5%);
  }
  100% {
    transform: scale(1) translate(0, 0);
  }
}

.login-card {
  width: 100%;
  max-width: 460px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 50px 45px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

html.dark .login-card {
  background: rgba(38, 38, 38, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #990033;
}

html.dark .login-header {
  border-bottom-color: #409eff;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
  letter-spacing: 1px;
}

html.dark .login-title {
  color: #e5e7eb;
}

.login-subtitle {
  font-size: 13px;
  color: #909399;
  margin: 0;
  font-weight: 300;
  letter-spacing: 1px;
  text-transform: uppercase;
}

html.dark .login-subtitle {
  color: #6b7280;
}

.login-form {
  margin-top: 0;
}

.login-form :deep(.el-form-item__content) {
  justify-content: center;
  width: 100%;
}

/* 自定义输入框样式 */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 15px;
  width: 20px;
  height: 20px;
  z-index: 1;
  opacity: 0.6;
}

html.dark .input-icon {
  filter: brightness(0) invert(0.7);
}

.custom-input :deep(.el-input__wrapper) {
  padding-left: 45px;
  height: 48px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: none;
  transition: all 0.3s;
}

html.dark .custom-input :deep(.el-input__wrapper) {
  border-color: #404040;
  background-color: #333333;
}

.custom-input :deep(.el-input__wrapper:hover) {
  border-color: #990033;
}

html.dark .custom-input :deep(.el-input__wrapper:hover) {
  border-color: #409eff;
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  border-color: #990033;
  box-shadow: 0 0 0 3px rgba(153, 0, 51, 0.1);
}

html.dark .custom-input :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.custom-input :deep(.el-input__inner) {
  font-size: 15px;
}

.login-options {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.remember-text {
  font-size: 13px;
  color: #606266;
}

html.dark .remember-text {
  color: #9ca3af;
}

.forgot-link {
  font-size: 13px;
  color: #990033;
}

html.dark .forgot-link {
  color: #409eff;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  background: #990033;
  border-color: #990033;
  border-radius: 8px;
  letter-spacing: 1px;
  transition: all 0.3s;
}

.login-button:hover,
.login-button:focus {
  background: #770028;
  border-color: #770028;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(153, 0, 51, 0.3);
}

html.dark .login-button {
  background: #409eff;
  border-color: #409eff;
}

html.dark .login-button:hover,
html.dark .login-button:focus {
  background: #66b1ff;
  border-color: #66b1ff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
}

.help-link {
  color: #606266;
  font-size: 13px;
  transition: color 0.3s;
}

html.dark .help-link {
  color: #9ca3af;
}

.help-link:hover {
  color: #990033;
}

html.dark .help-link:hover {
  color: #409eff;
}

.divider {
  margin: 0 12px;
  color: #dcdfe6;
}

html.dark .divider {
  color: #404040;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .login-right {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .login-right {
    padding: 20px;
  }

  .login-card {
    padding: 40px 30px;
  }

  .login-title {
    font-size: 24px;
  }
}
</style>
