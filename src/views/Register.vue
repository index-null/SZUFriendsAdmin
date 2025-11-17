<template>
  <div class="register-container">
    <AuthLeftPanel title="注册" />

    <div class="register-right">
      <div class="register-card">
        <div class="register-header">
          <h2 class="register-title">创建账户</h2>
          <p class="register-subtitle">Create Account</p>
        </div>

        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          class="register-form"
          size="large"
        >
          <el-form-item prop="username">
            <div class="input-wrapper">
              <img src="/images/user-icon.png" alt="用户" class="input-icon" />
              <el-input
                v-model="registerForm.username"
                placeholder="请输入用户名（用于登录）"
                clearable
                class="custom-input"
              />
            </div>
          </el-form-item>

          <el-form-item prop="nickname">
            <div class="input-wrapper">
              <img src="/images/nick-name.png" alt="昵称" class="input-icon" />
              <el-input
                v-model="registerForm.nickname"
                placeholder="请输入昵称"
                clearable
                class="custom-input"
              />
            </div>
          </el-form-item>

          <el-form-item prop="password">
            <div class="input-wrapper">
              <img src="/images/pwd-icon.png" alt="密码" class="input-icon" />
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码（至少 6 位）"
                show-password
                class="custom-input"
              />
            </div>
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <div class="input-wrapper">
              <img
                src="/images/pwd-icon.png"
                alt="确认密码"
                class="input-icon"
              />
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请确认密码"
                show-password
                class="custom-input"
                @keyup.enter="handleRegister"
              />
            </div>
          </el-form-item>

          <el-form-item prop="agree">
            <el-checkbox v-model="registerForm.agree" class="agree-checkbox">
              我已阅读并同意
              <el-link type="primary" :underline="false">用户协议</el-link>
              和
              <el-link type="primary" :underline="false">隐私政策</el-link>
            </el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              class="register-button"
              :loading="loading"
              @click="handleRegister"
            >
              {{ loading ? '注册中...' : '注册' }}
            </el-button>
          </el-form-item>

          <div class="register-footer">
            <span>已有账户？</span>
            <el-link
              type="primary"
              :underline="false"
              class="login-link"
              @click="goToLogin"
            >
              立即登录
            </el-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'
import AuthLeftPanel from '@/components/AuthLeftPanel.vue'

const router = useRouter()
const userStore = useUserStore()

const registerFormRef = ref<FormInstance>()
const loading = ref(false)

// 表单数据（匹配后端的 RegisterRequest）
const registerForm = reactive({
  username: '', // 用户名（登录账号）
  nickname: '', // 用户昵称（显示用）
  password: '',
  confirmPassword: '',
  agree: false,
})

// 自定义验证：确认密码
const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 自定义验证：同意协议
const validateAgree = (_rule: any, value: boolean, callback: any) => {
  if (!value) {
    callback(new Error('请阅读并同意用户协议和隐私政策'))
  } else {
    callback()
  }
}

// 表单验证规则
const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    {
      min: 3,
      max: 20,
      message: '用户名长度为 3-20 个字符',
      trigger: 'blur',
    },
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    {
      min: 2,
      max: 20,
      message: '昵称长度为 2-20 个字符',
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于 6 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' },
  ],
  agree: [{ required: true, validator: validateAgree, trigger: 'change' }],
}

// 注册处理
const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    await registerFormRef.value.validate()
    loading.value = true

    const success = await userStore.register({
      username: registerForm.username,
      nickname: registerForm.nickname,
      password: registerForm.password,
    })

    if (success) {
      setTimeout(() => {
        router.push('/login')
      }, 1000)
    }
  } finally {
    loading.value = false
  }
}

// 跳转到登录页
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  background: #ffffff;
}

html.dark .register-container {
  background: #0f0f0f;
}

/* 右侧注册区域 */
.register-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.register-right::before {
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

html.dark .register-right::before {
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

.register-card {
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

html.dark .register-card {
  background: rgba(38, 38, 38, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.register-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #990033;
}

html.dark .register-header {
  border-bottom-color: #409eff;
}

.register-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
  letter-spacing: 1px;
}

html.dark .register-title {
  color: #e5e7eb;
}

.register-subtitle {
  font-size: 13px;
  color: #909399;
  margin: 0;
  font-weight: 300;
  letter-spacing: 1px;
  text-transform: uppercase;
}

html.dark .register-subtitle {
  color: #6b7280;
}

.register-form {
  margin-top: 0;
}

.register-form :deep(.el-form-item__content) {
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

.agree-checkbox {
  font-size: 13px;
}

.agree-checkbox :deep(.el-checkbox__label) {
  white-space: normal;
  line-height: 1.6;
  color: #606266;
}

html.dark .agree-checkbox :deep(.el-checkbox__label) {
  color: #9ca3af;
}

.agree-checkbox :deep(.el-link) {
  color: #990033;
  font-size: 13px;
}

html.dark .agree-checkbox :deep(.el-link) {
  color: #409eff;
}

.register-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  background: #990033;
  border-color: #990033;
  border-radius: 8px;
  letter-spacing: 1px;
  transition: all 0.3s;
  margin-top: 8px;
}

.register-button:hover,
.register-button:focus {
  background: #770028;
  border-color: #770028;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(153, 0, 51, 0.3);
}

html.dark .register-button {
  background: #409eff;
  border-color: #409eff;
}

html.dark .register-button:hover,
html.dark .register-button:focus {
  background: #66b1ff;
  border-color: #66b1ff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.register-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #606266;
}

html.dark .register-footer {
  color: #9ca3af;
}

.register-footer span {
  margin-right: 8px;
}

.login-link {
  color: #990033;
  font-size: 14px;
}

html.dark .login-link {
  color: #409eff;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .register-right {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .register-right {
    padding: 20px;
  }

  .register-card {
    padding: 40px 30px;
  }

  .register-title {
    font-size: 24px;
  }
}

:deep(.el-checkbox) {
  height: auto;
  white-space: normal;
  align-items: flex-start;
}
</style>
