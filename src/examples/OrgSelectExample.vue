<template>
  <div class="org-select-example">
    <h1>OrgSelect 组织选择组件示例</h1>
    
    <div class="example-section">
      <h2>基础用法</h2>
      <div class="example-item">
        <label>选择组织：</label>
        <OrgSelect v-model="basicSelected" />
        <p>选中的组织ID: {{ basicSelected }}</p>
      </div>
    </div>

    <div class="example-section">
      <h2>自定义样式</h2>
      <div class="example-item">
        <label>小尺寸选择器：</label>
        <OrgSelect 
          v-model="customSelected" 
          width="200px"
          placeholder="请选择部门"
        />
        <p>选中的组织ID: {{ customSelected }}</p>
      </div>
    </div>

    <div class="example-section">
      <h2>禁用状态</h2>
      <div class="example-item">
        <label>禁用选择器：</label>
        <OrgSelect 
          v-model="disabledSelected" 
          disabled
        />
        <p>选中的组织ID: {{ disabledSelected }}</p>
      </div>
    </div>

    <div class="example-section">
      <h2>表单中使用</h2>
      <el-form :model="form" label-width="120px" style="max-width: 400px">
        <el-form-item label="员工姓名">
          <el-input v-model="form.name" placeholder="请输入员工姓名" />
        </el-form-item>
        <el-form-item label="所属组织">
          <OrgSelect
            v-model="form.orgId"
            @change="handleOrgChange"
            width="100%"
          />
        </el-form-item>
        <el-form-item label="职位">
          <el-input v-model="form.position" placeholder="请输入职位" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="example-section">
      <h2>使用ref方法</h2>
      <div class="example-item">
        <label>操作组织选择器：</label>
        <OrgSelect ref="orgSelectRef" v-model="refSelected" />
        <div class="button-group">
          <el-button @click="refreshData">刷新数据</el-button>
          <el-button @click="getOrgInfo">获取组织信息</el-button>
        </div>
        <p>选中的组织ID: {{ refSelected }}</p>
        <p v-if="orgInfo">组织信息: {{ JSON.stringify(orgInfo, null, 2) }}</p>
      </div>
    </div>

    <div class="example-section">
      <h2>搜索功能演示</h2>
      <div class="example-item">
        <label>搜索组织：</label>
        <OrgSelect 
          v-model="searchSelected" 
          placeholder="输入关键字搜索组织"
          width="300px"
        />
        <p class="tips">💡 支持按组织名称、简称、编码进行搜索</p>
        <p>选中的组织ID: {{ searchSelected }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 基础用法
const basicSelected = ref<number | null>(null)

// 自定义样式
const customSelected = ref<number | null>(null)

// 禁用状态
const disabledSelected = ref<number | null>(1) // 设置一个默认值

// 表单数据
const form = reactive({
  name: '',
  orgId: null as number | null,
  position: ''
})

// 使用ref方法
const orgSelectRef = ref()
const refSelected = ref<number | null>(null)
const orgInfo = ref<any>(null)

// 搜索功能
const searchSelected = ref<number | null>(null)

// 处理组织变化
const handleOrgChange = (value: number | null, orgData?: OrgTreeDto) => {
  console.log('组织变化:', value, orgData)
  ElMessage.success(`选择了组织: ${orgData?.name || '未知'}`)
}

// 提交表单
const handleSubmit = () => {
  console.log('表单数据:', form)
  ElMessage.success('表单提交成功！')
}

// 重置表单
const handleReset = () => {
  form.name = ''
  form.orgId = null
  form.position = ''
  ElMessage.info('表单已重置')
}

// 刷新数据
const refreshData = () => {
  if (orgSelectRef.value) {
    orgSelectRef.value.refresh()
    ElMessage.success('数据刷新成功')
  }
}

// 获取组织信息
const getOrgInfo = () => {
  if (refSelected.value && orgSelectRef.value) {
    orgInfo.value = orgSelectRef.value.getSelectedOrg(refSelected.value)
    ElMessage.success('组织信息已获取')
  } else {
    ElMessage.warning('请先选择一个组织')
  }
}
</script>

<style scoped>
.org-select-example {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.example-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fafafa;
}

.example-section h2 {
  margin-top: 0;
  color: #303133;
  font-size: 18px;
  margin-bottom: 20px;
}

.example-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.example-item label {
  font-weight: bold;
  color: #606266;
}

.example-item p {
  margin: 5px 0;
  color: #909399;
  font-size: 14px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.tips {
  color: #67c23a !important;
  font-style: italic;
}

pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}
</style> 