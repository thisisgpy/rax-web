<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useCurrencySettings } from '@/composables/useCurrencySettings'

/** 货币单位选项 */
const currencyOptions = [
  { label: '元', value: 'yuan', decimal: 2 },
  { label: '万元', value: 'wan', decimal: 2 },
  { label: '亿', value: 'yi', decimal: 2 }
]

/** 组件 Props */
interface Props {
  visible: boolean
}

/** 组件 Emits */
interface Emits {
  'update:visible': [visible: boolean]
  'settings-change': [settings: GlobalCurrencySettings]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/** 货币设置 composable */
const { saveSettings: saveCurrencySettings } = useCurrencySettings()

/** 全局货币设置类型 */
interface GlobalCurrencySettings {
  currencyUnit: string
  decimalPlaces: number
}

/** 设置表单数据 */
const settingsForm = ref<GlobalCurrencySettings>({
  currencyUnit: 'wan', // 默认万元
  decimalPlaces: 6     // 默认6位小数
})

/** 加载保存的设置 */
const loadSettings = () => {
  const savedSettings = localStorage.getItem('globalCurrencySettings')
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings)
      settingsForm.value = { ...settingsForm.value, ...settings }
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }
}

/** 监听货币单位变化，自动更新小数位数 */
watch(() => settingsForm.value.currencyUnit, (newUnit) => {
  const option = currencyOptions.find(opt => opt.value === newUnit)
  if (option) {
    settingsForm.value.decimalPlaces = option.decimal
  }
})

/** 保存设置 */
const handleSave = () => {
  try {
    // 使用 composable 保存设置（会同时更新全局状态和 localStorage）
    saveCurrencySettings({ ...settingsForm.value })
    
    // 发出设置变更事件
    emit('settings-change', { ...settingsForm.value })
    
    // 关闭弹窗
    emit('update:visible', false)
    
    ElMessage.success('设置保存成功')
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败')
  }
}

/** 重置为默认设置 */
const handleReset = () => {
  const defaultSettings = {
    currencyUnit: 'wan',
    decimalPlaces: 6
  }
  
  settingsForm.value = { ...defaultSettings }
  
  // 立即保存默认设置
  try {
    saveCurrencySettings(defaultSettings)
  } catch (error) {
    console.error('重置设置失败:', error)
    ElMessage.error('重置设置失败')
  }
}

/** 关闭弹窗 */
const handleClose = () => {
  emit('update:visible', false)
}

/** 获取预览金额 */
const getPreviewAmount = () => {
  return formatPreviewAmount(19931026, settingsForm.value.currencyUnit, settingsForm.value.decimalPlaces)
}

/** 格式化预览金额 */
const formatPreviewAmount = (amount: number, unit: string, decimal: number): string => {
  let convertedAmount = amount
  let unitLabel = ''
  
  switch (unit) {
    case 'yuan':
      convertedAmount = amount
      unitLabel = '元'
      break
    case 'wan':
      convertedAmount = amount / 10000
      unitLabel = '万元'
      break
    case 'yi':
      convertedAmount = amount / 100000000
      unitLabel = '亿'
      break
  }
  
  return `${convertedAmount.toFixed(decimal)} ${unitLabel}`
}

/** 初始化 */
loadSettings()
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="全局设置"
    width="480px"
    @update:model-value="emit('update:visible', $event)"
    @close="handleClose"
  >
    <el-form :model="settingsForm" label-width="120px" label-position="left">
      <el-form-item label="货币显示单位">
        <el-radio-group v-model="settingsForm.currencyUnit">
          <el-radio 
            v-for="option in currencyOptions" 
            :key="option.value" 
            :value="option.value"
            class="currency-radio"
          >
            {{ option.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="保留小数位数">
        <el-input-number 
          v-model="settingsForm.decimalPlaces"
          :min="0"
          :max="8"
          :step="1"
          controls-position="right"
          style="width: 200px;"
        />
      </el-form-item>
      
      <el-form-item label="预览效果">
        <div class="preview-section">
          <span>初始金额: 19931026 元</span>
          <div class="preview-item">
            <!-- <span class="preview-label">示例金额：</span> -->
            <span class="preview-value">
              {{ getPreviewAmount() }}
            </span>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleReset">重置默认</el-button>
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave">保存设置</el-button>
      </div>
    </template>
  </el-dialog>
</template>



<style scoped>
:deep(.el-radio-group) {
  display: flex;
  align-items: center;
  gap: 24px;
}

:deep(.el-radio) {
  display: flex;
  align-items: center;
  height: 32px;
  margin-right: 0;
}

:deep(.el-radio__input) {
  display: flex;
  align-items: center;
}

:deep(.el-radio__label) {
  line-height: 32px;
  padding-left: 8px;
  font-size: 14px;
}

.helper-text {
  font-size: 12px;
  color: #909399;
  margin-left: 12px;
}

.preview-section {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 16px;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-label {
  font-size: 14px;
  color: #606266;
}

.preview-value {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 16px;
}

:deep(.el-dialog__body) {
  padding-top: 24px;
}
</style> 