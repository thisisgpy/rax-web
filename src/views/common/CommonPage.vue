<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Document } from '@element-plus/icons-vue'

const route = useRoute()
const pageTitle = route.meta?.title || route.name || '页面'
</script>

<template>
  <div class="common-page">
    <el-card>
      <div class="page-content">
        <el-icon size="64" class="page-icon">
          <Document />
        </el-icon>
        <h2>{{ pageTitle }}</h2>
        <p class="page-description">
          这是 {{ pageTitle }} 页面，内容正在开发中...
        </p>
        <el-button type="primary" @click="$router.go(-1)">
          返回上一页
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.common-page {
  padding: 24px;
}

.page-content {
  text-align: center;
  padding: 60px 20px;
}

.page-icon {
  color: #409eff;
  margin-bottom: 20px;
}

.page-content h2 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 16px;
}

.page-description {
  font-size: 16px;
  color: #606266;
  margin-bottom: 32px;
  line-height: 1.6;
}
</style> 