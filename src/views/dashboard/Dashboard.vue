<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useCurrencySettings } from '@/composables/useCurrencySettings'
import CurrencyDisplay from '@/components/CurrencyDisplay.vue'
import DictSelect from '@/components/DictSelect.vue'
import { ElMessage } from 'element-plus'
import { 
  DataAnalysis,
  Warning,
  TrendCharts,
  Money,
  Setting
} from '@element-plus/icons-vue'

/** 用户信息 */
const userInfo = ref<UserInfo | null>(null)

/** 货币设置 */
const { getCurrentCurrencyInfo } = useCurrencySettings()

/** 模拟数据（以分为单位） */
const financialData = ref([
  { label: '总资产', value: 1234567890, icon: Money, color: '#409eff' }, // 12,345,678.90 元
  { label: '总负债', value: 543210987, icon: Warning, color: '#f56c6c' },  // 5,432,109.87 元
  { label: '净资产', value: 691356903, icon: TrendCharts, color: '#67c23a' }, // 6,913,569.03 元
  { label: '月收入', value: 123456780, icon: DataAnalysis, color: '#e6a23c' }  // 1,234,567.80 元
])



/** 当前货币设置信息 */
const currencyInfo = computed(() => getCurrentCurrencyInfo.value)

/** 字典组件演示表单 */
const demoForm = reactive({
  interestRateType: '',
  financingStructure: ''
})

/** 处理利率类型变化 */
const handleInterestRateChange = (value: string | number | null) => {
  console.log('利率类型变化:', value)
  ElMessage.info(`选择了利率类型: ${value || '未选择'}`)
}

/** 处理融资结构变化 */
const handleFinancingStructureChange = (value: string | number | null) => {
  console.log('融资结构变化:', value)
  ElMessage.info(`选择了融资结构: ${value || '未选择'}`)
}

/** 加载用户信息 */
const loadUserInfo = () => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    userInfo.value = JSON.parse(userInfoStr)
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<template>
  <div class="dashboard-page">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">
          欢迎回来，{{ userInfo?.realName || userInfo?.username || '用户' }}！
        </h1>
        <p class="welcome-subtitle">
          今天是新的一天，让我们一起创造更多价值
        </p>
      </div>
    </div>

    <!-- 货币设置提示 -->
    <div class="currency-info">
      <el-alert
        title="当前货币设置"
        type="info"
        show-icon
        :closable="false"
      >
        <template #default>
          <div class="currency-setting">
            <span>货币单位：<strong>{{ currencyInfo.label }}</strong></span>
            <span class="separator">|</span>
            <span>小数位数：<strong>{{ currencyInfo.decimal }} 位</strong></span>
            <span class="separator">|</span>
            <span class="hint">
              <el-icon><Setting /></el-icon>
              点击右上角设置按钮可以修改全局货币设置
            </span>
          </div>
        </template>
      </el-alert>
    </div>

    <!-- 财务数据卡片 -->
    <div class="stats-grid">
      <el-card 
        v-for="item in financialData" 
        :key="item.label"
        class="stats-card"
        shadow="hover"
      >
        <div class="stats-content">
          <div class="stats-icon" :style="{ backgroundColor: item.color }">
            <el-icon :size="24"><component :is="item.icon" /></el-icon>
          </div>
          <div class="stats-info">
            <div class="stats-label">{{ item.label }}</div>
            <div class="stats-value">
              <CurrencyDisplay 
                :value="item.value" 
                size="large" 
                :theme="item.label.includes('负债') ? 'danger' : 'primary'"
                bold
              />
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 字典组件示例 -->
    <div class="dict-demo-section">
      <el-card>
        <template #header>
          <h3>字典下拉框组件示例</h3>
        </template>
        <div class="dict-demo-content">
          <div class="dict-demo-grid">
            <div class="dict-demo-item">
              <div class="demo-label">利率类型选择（支持搜索）</div>
              <DictSelect
                v-model="demoForm.interestRateType"
                dict-code="INTEREST_RATE_TYPE"
                placeholder="请选择利率类型，支持输入搜索"
                @change="handleInterestRateChange"
              />
              <div class="demo-value">
                选中值: <code>{{ demoForm.interestRateType || '未选择' }}</code>
              </div>
            </div>

            <div class="dict-demo-item">
              <div class="demo-label">融资结构选择（支持搜索）</div>
              <DictSelect
                v-model="demoForm.financingStructure"
                dict-code="FINANCING_STRUCTURE"
                placeholder="请选择融资结构，支持输入搜索"
                width="250px"
                @change="handleFinancingStructureChange"
              />
              <div class="demo-value">
                选中值: <code>{{ demoForm.financingStructure || '未选择' }}</code>
              </div>
            </div>
          </div>

          <div class="demo-form-result">
            <div class="result-title">表单数据:</div>
            <pre>{{ JSON.stringify(demoForm, null, 2) }}</pre>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 数据对比表格 -->
    <div class="data-table-section">
      <el-card>
        <template #header>
          <h3>金额格式化演示</h3>
        </template>
        <el-table :data="financialData" style="width: 100%">
          <el-table-column prop="label" label="项目" width="120" />
          <el-table-column prop="value" label="原始金额" width="200">
            <template #default="scope">
              <div>{{ scope.row.value.toLocaleString() }} 分</div>
              <div style="font-size: 12px; color: #909399;">
                ({{ (scope.row.value / 100).toLocaleString() }} 元)
              </div>
            </template>
          </el-table-column>
          <el-table-column label="格式化显示" width="200">
            <template #default="scope">
              <CurrencyDisplay 
                :value="scope.row.value" 
                size="default" 
                theme="primary"
                bold
              />
            </template>
          </el-table-column>
          <el-table-column label="不带单位" width="150">
            <template #default="scope">
              <CurrencyDisplay 
                :value="scope.row.value" 
                size="small"
                :show-unit="false"
              />
            </template>
          </el-table-column>
          <el-table-column label="指定为元" width="180">
            <template #default="scope">
              <CurrencyDisplay 
                :value="scope.row.value" 
                size="small"
                force-unit="yuan"
                :force-decimal="2"
                theme="success"
              />
            </template>
          </el-table-column>
          <el-table-column label="指定为亿" width="180">
            <template #default="scope">
              <CurrencyDisplay 
                :value="scope.row.value" 
                size="small"
                force-unit="yi"
                :force-decimal="6"
                theme="warning"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  padding: 0;
}

/* 欢迎区域 */
.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  color: white;
}

.welcome-content {
  text-align: center;
}

.welcome-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.welcome-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

/* 货币设置提示 */
.currency-info {
  margin-bottom: 24px;
}

.currency-setting {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
}

.separator {
  color: #c0c4cc;
}

.hint {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 13px;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stats-card {
  transition: transform 0.2s;
}

.stats-card:hover {
  transform: translateY(-2px);
}

.stats-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stats-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stats-info {
  flex: 1;
}

.stats-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.stats-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* 组件演示区域 */
.size-demo-section,
.theme-demo-section,
.boundary-test-section,
.dict-demo-section,
.data-table-section {
  margin-bottom: 24px;
}

/* 字典组件演示样式 */
.dict-demo-content {
  padding: 16px;
}

.dict-demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.dict-demo-item {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.2s;
}

.dict-demo-item:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
}

.demo-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  margin-bottom: 12px;
}

.demo-value {
  margin-top: 12px;
  font-size: 13px;
  color: #909399;
}

.demo-value code {
  background: #f1f1f1;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: #e6a23c;
}

.demo-form-result {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
}

.result-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.demo-form-result pre {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.size-demo-grid {
  display: flex;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.size-demo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 120px;
}

.size-label {
  font-size: 12px;
  color: #909399;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.theme-demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  padding: 16px;
}

.theme-demo-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.2s;
}

.theme-demo-item:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
}

.demo-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

/* 边界测试样式 */
.boundary-test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 16px;
  padding: 16px;
}

.boundary-test-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.2s;
}

.boundary-test-item:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
}

.test-info {
  flex: 1;
  margin-right: 16px;
}

.test-label {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.test-description {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}

.test-original {
  font-size: 12px;
  color: #909399;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.test-result {
  flex-shrink: 0;
  text-align: right;
}

.result-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

:deep(.el-table th) {
  background-color: #f8f9fa;
}

:deep(.el-table .cell) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* 启用表格内容的文本选择 */
:deep(.el-table__body) {
  user-select: text;
}

:deep(.el-table__body td) {
  user-select: text;
}

:deep(.el-table__body .cell) {
  user-select: text;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .dict-demo-grid {
    grid-template-columns: 1fr;
  }
  
  .welcome-title {
    font-size: 24px;
  }
  
  .welcome-subtitle {
    font-size: 14px;
  }
  
  .currency-setting {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .separator {
    display: none;
  }
}
</style> 