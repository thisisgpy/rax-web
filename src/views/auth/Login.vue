<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { authMockApi } from '@/api/modules/authMock'
import { User, Lock } from '@element-plus/icons-vue'

/** 路由实例 */
const router = useRouter()

/** 登录表单数据 */
const loginForm = reactive<LoginDto & { confirmPassword?: string }>({
  username: 'super',
  password: 'super', // 设置默认密码，方便测试
  remember: false
})

/** 表单引用 */
const loginFormRef = ref<FormInstance>()

/** 登录状态 */
const loading = ref(false)

/** 密码可见性 */
const passwordVisible = ref(false)

/** 表单验证规则 */
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 50, message: '用户名长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 2, max: 128, message: '密码长度在 2 到 128 个字符', trigger: 'blur' }
  ]
}

/** 显示消息提示 */
const showMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  if (typeof window !== 'undefined' && (window as any).ElMessage) {
    (window as any).ElMessage[type](message)
  } else {
    console.log(`${type.toUpperCase()}: ${message}`)
  }
}

/** 处理登录 */
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    
    loading.value = true
    
    // 使用模拟API进行登录
    const response = await authMockApi.login({
      username: loginForm.username,
      password: loginForm.password,
      remember: loginForm.remember
    })
    
    if (!response.success) {
      showMessage(response.message, 'error')
      return
    }
    
    // 保存token
    localStorage.setItem('token', response.data.token)
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken)
    }
    
    // 保存用户信息
    localStorage.setItem('userInfo', JSON.stringify(response.data.userInfo))
    
    showMessage('登录成功', 'success')
    
    // 跳转到仪表板
    router.push('/dashboard')
    
  } catch (error) {
    console.error('登录失败:', error)
    showMessage('登录失败，请重试', 'error')
  } finally {
    loading.value = false
  }
}

/** 处理忘记密码 */
const handleForgotPassword = () => {
  showMessage('请联系管理员重置密码，或使用测试账号：super/super', 'info')
}

/** 键盘事件处理 */
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleLogin()
  }
}
</script>

<template>
  <div class="login-container">
    <!-- 左侧品牌展示区 -->
    <div class="login-left">
      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="white" fill-opacity="0.1"/>
            <path d="M8 12L16 8L24 12V20C24 21.1046 23.1046 22 22 22H10C8.89543 22 8 21.1046 8 20V12Z" 
                  stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 8V22" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="logo-text">融安心</span>
      </div>

      <!-- 插画区域 -->
      <div class="illustration">
        <div class="illustration-content">
          <!-- 简化的办公场景插画 -->
          <div class="office-scene">
            <div class="person person-1">
              <div class="person-body"></div>
              <div class="person-head"></div>
            </div>
            <div class="person person-2">
              <div class="person-body"></div>
              <div class="person-head"></div>
            </div>
            <div class="desk"></div>
            <div class="chart">
              <div class="chart-bar" style="height: 60%"></div>
              <div class="chart-bar" style="height: 80%"></div>
              <div class="chart-bar" style="height: 40%"></div>
              <div class="chart-bar" style="height: 70%"></div>
            </div>
            <div class="documents">
              <div class="document"></div>
              <div class="document"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Slogan -->
      <div class="slogan">
        专业的企业融资风控服务平台
      </div>
    </div>

    <!-- 右侧登录表单区 -->
    <div class="login-right">
      <div class="login-form-container">
        <div class="login-header">
          <h1 class="login-title">欢迎回来</h1>
          <p class="login-subtitle">输入您的账号和密码登录</p>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          size="large"
          @keydown.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              :prefix-icon="User"
              clearable
              @keydown="handleKeydown"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              :show-password="true"
              clearable
              @keydown="handleKeydown"
            />
          </el-form-item>

          <div class="form-actions">
            <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
            <el-button 
              text 
              class="forgot-password"
              @click="handleForgotPassword"
            >
              忘记密码
            </el-button>
          </div>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              class="login-button"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  background: #f5f5f5;
  overflow: hidden;
}

/* 左侧品牌展示区 */
.login-left {
  flex: 1;
  background: linear-gradient(135deg, #409eff 0%, #1890ff 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px;
  color: white;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
}

.login-left::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1;
  position: relative;
}

.logo {
  width: 32px;
  height: 32px;
}

.logo-text {
  font-size: 24px;
  font-weight: 600;
  color: white;
}

.illustration {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  position: relative;
}

.illustration-content {
  width: 300px;
  height: 200px;
  position: relative;
}

.office-scene {
  width: 100%;
  height: 100%;
  position: relative;
}

.person {
  position: absolute;
  z-index: 2;
}

.person-1 {
  left: 20px;
  top: 60px;
}

.person-2 {
  right: 40px;
  top: 40px;
}

.person-body {
  width: 16px;
  height: 24px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  position: relative;
}

.person-head {
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  position: absolute;
  top: -8px;
  left: 2px;
}

.desk {
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 2px;
}

.chart {
  position: absolute;
  top: 20px;
  left: 100px;
  display: flex;
  align-items: end;
  gap: 4px;
  height: 60px;
}

.chart-bar {
  width: 8px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 2px;
}

.documents {
  position: absolute;
  top: 100px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.document {
  width: 30px;
  height: 20px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 2px;
}

.slogan {
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  z-index: 1;
  position: relative;
}

/* 右侧登录表单区 */
.login-right {
  width: 480px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  min-height: 100vh;
}

.login-form-container {
  width: 100%;
  max-width: 360px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
}

.login-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.forgot-password {
  color: var(--el-color-primary);
  padding: 0;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}

/* Element Plus 组件样式覆盖 */
.el-form-item {
  margin-bottom: 24px;
}

.el-input {
  height: 48px;
}

.el-input__wrapper {
  padding: 12px 16px;
}

.el-checkbox {
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }
  
  .login-left {
    min-height: 300px;
    padding: 20px;
  }
  
  .login-right {
    width: 100%;
    padding: 20px;
    min-height: calc(100vh - 300px);
  }
  
  .slogan {
    font-size: 16px;
  }
  
  .illustration-content {
    width: 200px;
    height: 120px;
  }
}

/* 确保在小屏幕设备上也能正常显示 */
@media (max-width: 480px) {
  .login-right {
    padding: 16px;
  }
  
  .login-form-container {
    max-width: 100%;
  }
}
</style> 