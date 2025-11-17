<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1 class="register-title">创建账户</h1>
        <p class="register-subtitle">加入深大校友录管理系统</p>
      </div>

      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
        size="large"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名（用于登录）"
            prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="nickname">
          <el-input
            v-model="registerForm.nickname"
            placeholder="请输入昵称（用于显示）"
            prefix-icon="Avatar"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码（至少 6 位）"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleRegister"
          />
        </el-form-item>

        <el-form-item prop="agree">
          <el-checkbox v-model="registerForm.agree">
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
          <el-link type="primary" :underline="false" @click="goToLogin">
            立即登录
          </el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'

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
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 20px;
}

html.dark .register-container {
  background: linear-gradient(135deg, #7c2d92 0%, #991b1b 100%);
}

.register-card {
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

html.dark .register-card {
  background: rgba(26, 26, 26, 0.95);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}

.register-header {
  text-align: center;
  margin-bottom: 40px;
}

.register-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

html.dark .register-title {
  color: #e5e7eb;
}

.register-subtitle {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

html.dark .register-subtitle {
  color: #9ca3af;
}

.register-form {
  margin-top: 0;
}

.register-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
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

:deep(.el-checkbox) {
  height: auto;
  white-space: normal;
  align-items: flex-start;
}

:deep(.el-checkbox__label) {
  white-space: normal;
  line-height: 1.5;
}
</style>
