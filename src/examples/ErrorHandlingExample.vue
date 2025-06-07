<template>
  <div class="error-handling-example">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>API 错误处理示例</span>
        </div>
      </template>

      <div class="demo-section">
        <h3>业务错误处理</h3>
        <p>当API返回 <code>success: false</code> 时，会使用响应中的 <code>message</code> 字段作为错误提示。</p>
        
        <el-button 
          type="primary" 
          @click="simulateBusinessError"
          :loading="businessLoading"
        >
          模拟业务错误
        </el-button>
      </div>

      <el-divider />

      <div class="demo-section">
        <h3>HTTP状态码错误处理</h3>
        <p>当API返回HTTP错误状态码时，优先使用响应中的 <code>message</code> 字段，如果没有则使用默认错误消息。</p>
        
        <el-space>
          <el-button 
            @click="simulateNotFoundError"
            :loading="notFoundLoading"
          >
            模拟404错误
          </el-button>
          
          <el-button 
            @click="simulateServerError"
            :loading="serverErrorLoading"
          >
            模拟500错误
          </el-button>
          
          <el-button 
            @click="simulateAuthError"
            :loading="authErrorLoading"
          >
            模拟401错误
          </el-button>
        </el-space>
      </div>

      <el-divider />

      <div class="demo-section">
        <h3>网络错误处理</h3>
        <p>当网络请求失败时，会显示网络连接相关的错误提示。</p>
        
        <el-button 
          @click="simulateNetworkError"
          :loading="networkLoading"
        >
          模拟网络错误
        </el-button>
      </div>

      <el-divider />

      <div class="demo-section">
        <h3>错误处理最佳实践</h3>
        <el-alert
          title="错误处理优先级"
          type="info"
          :closable="false"
          show-icon
        >
          <ul>
            <li><strong>1. API业务错误</strong>：使用响应中的 <code>message</code> 字段</li>
            <li><strong>2. HTTP状态码错误</strong>：优先使用响应中的 <code>message</code>，没有则使用默认消息</li>
            <li><strong>3. 网络错误</strong>：显示网络连接错误提示</li>
            <li><strong>4. 配置错误</strong>：显示请求配置错误提示</li>
          </ul>
        </el-alert>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { orgApi } from '@/api/modules/org'

const businessLoading = ref(false)
const notFoundLoading = ref(false)
const serverErrorLoading = ref(false)
const authErrorLoading = ref(false)
const networkLoading = ref(false)

/**
 * 模拟业务错误
 * 这会触发 httpClient 响应拦截器中的业务错误处理逻辑
 */
const simulateBusinessError = async () => {
  businessLoading.value = true
  try {
    // 这里可以调用一个会返回 success: false 的API
    // 演示目的，直接抛出一个业务错误
    throw new Error('用户名已存在，请选择其他用户名')
  } catch (error: any) {
    console.error('业务错误:', error.message)
    ElMessage.error(error.message || '操作失败')
  } finally {
    businessLoading.value = false
  }
}

/**
 * 模拟404错误
 */
const simulateNotFoundError = async () => {
  notFoundLoading.value = true
  try {
    // 请求一个不存在的组织ID
    await orgApi.getOrgById(999999999)
  } catch (error: any) {
    console.error('404错误:', error.message)
    ElMessage.error(error.message || '请求失败')
  } finally {
    notFoundLoading.value = false
  }
}

/**
 * 模拟500错误
 */
const simulateServerError = async () => {
  serverErrorLoading.value = true
  try {
    // 这里可以调用一个会触发服务器错误的API
    // 演示目的，直接抛出一个HTTP错误
    const error = new Error('数据库连接失败，请稍后重试')
    error.name = 'HttpError'
    throw error
  } catch (error: any) {
    console.error('500错误:', error.message)
    ElMessage.error(error.message || '服务器内部错误')
  } finally {
    serverErrorLoading.value = false
  }
}

/**
 * 模拟401错误
 */
const simulateAuthError = async () => {
  authErrorLoading.value = true
  try {
    // 这里可以调用一个需要认证的API（当token过期时）
    // 演示目的，直接抛出一个认证错误
    const error = new Error('令牌已过期，请重新登录')
    error.name = 'HttpError'
    throw error
  } catch (error: any) {
    console.error('401错误:', error.message)
    ElMessage.error(error.message || '登录已过期')
    // 401错误会自动清除token并跳转登录页
  } finally {
    authErrorLoading.value = false
  }
}

/**
 * 模拟网络错误
 */
const simulateNetworkError = async () => {
  networkLoading.value = true
  try {
    // 模拟网络错误
    const error = new Error('网络请求失败，请检查网络连接')
    error.name = 'NetworkError'
    throw error
  } catch (error: any) {
    console.error('网络错误:', error.message)
    ElMessage.error(error.message || '网络连接失败')
  } finally {
    networkLoading.value = false
  }
}
</script>

<style scoped>
.error-handling-example {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.demo-section {
  margin-bottom: 20px;
}

.demo-section h3 {
  margin-bottom: 10px;
  color: #303133;
}

.demo-section p {
  margin-bottom: 15px;
  color: #606266;
  line-height: 1.6;
}

.demo-section ul {
  margin: 10px 0;
  padding-left: 20px;
}

.demo-section li {
  margin-bottom: 5px;
  line-height: 1.5;
}

code {
  background-color: #f5f7fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  color: #e6a23c;
}
</style> 