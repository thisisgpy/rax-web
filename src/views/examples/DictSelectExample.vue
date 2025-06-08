<template>
  <div class="dict-select-example">
    <el-card>
      <template #header>
        <h2>字典下拉框组件示例</h2>
      </template>

      <el-form :model="form" label-width="120px">
        <el-form-item label="利率类型">
          <dict-select
            v-model="form.interestRateType"
            dict-code="INTEREST_RATE_TYPE"
            placeholder="请选择利率类型"
            @change="handleInterestRateChange"
          />
        </el-form-item>

        <el-form-item label="客户类型">
          <dict-select
            v-model="form.customerType"
            dict-code="CUSTOMER_TYPE"
            placeholder="请选择客户类型"
            width="300px"
            @change="handleCustomerTypeChange"
          />
        </el-form-item>

        <el-form-item label="业务状态">
          <dict-select
            v-model="form.businessStatus"
            dict-code="BUSINESS_STATUS"
            placeholder="请选择业务状态"
            @change="handleBusinessStatusChange"
          />
        </el-form-item>

        <el-form-item label="禁用示例">
          <dict-select
            v-model="form.disabledExample"
            dict-code="EXAMPLE_DICT"
            placeholder="这是禁用状态"
            :disabled="true"
          />
        </el-form-item>

        <el-form-item label="包含禁用项">
          <dict-select
            v-model="form.withDisabledItems"
            dict-code="MIXED_STATUS_DICT"
            placeholder="选项中包含禁用项"
            @change="handleMixedStatusChange"
          />
        </el-form-item>
      </el-form>

      <el-divider />

      <h3>表单数据</h3>
      <pre>{{ JSON.stringify(form, null, 2) }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 表单数据
const form = reactive({
  interestRateType: '',
  customerType: '',
  businessStatus: '',
  disabledExample: '',
  withDisabledItems: ''
})

// 事件处理
const handleInterestRateChange = (value: string | number | null) => {
  console.log('利率类型变化:', value)
  ElMessage.info(`选择了利率类型: ${value}`)
}

const handleCustomerTypeChange = (value: string | number | null) => {
  console.log('客户类型变化:', value)
  ElMessage.info(`选择了客户类型: ${value}`)
}

const handleBusinessStatusChange = (value: string | number | null) => {
  console.log('业务状态变化:', value)
  ElMessage.info(`选择了业务状态: ${value}`)
}

const handleMixedStatusChange = (value: string | number | null) => {
  console.log('混合状态变化:', value)
  ElMessage.info(`选择了项目: ${value}`)
}
</script>

<style scoped>
.dict-select-example {
  padding: 20px;
}

pre {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
}
</style> 