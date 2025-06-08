<template>
  <div class="dict-example">
    <div class="page-header">
      <h2>数据字典使用示例</h2>
      <p>本页面演示了如何在表单和表格中使用数据字典功能</p>
    </div>

    <el-row :gutter="20">
      <!-- 表单示例 -->
      <el-col :span="12">
        <el-card header="表单中使用字典">
          <el-form :model="form" label-width="120px">
            <el-form-item label="性别">
              <DictSelect
                v-model="form.gender"
                dict-code="GENDER"
                placeholder="请选择性别"
                @change="handleGenderChange"
              />
            </el-form-item>
            
            <el-form-item label="学历">
              <DictSelect
                v-model="form.education"
                dict-code="EDUCATION"
                placeholder="请选择学历"
                filterable
              />
            </el-form-item>
            
            <el-form-item label="兴趣爱好">
              <DictSelect
                v-model="form.hobbies"
                dict-code="HOBBIES"
                placeholder="请选择兴趣爱好"
              />
            </el-form-item>
            
            <el-form-item label="状态">
              <DictSelect
                v-model="form.status"
                dict-code="USER_STATUS"
                placeholder="请选择状态"
                :only-enabled="false"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleSubmit">
                提交
              </el-button>
              <el-button @click="handleReset">
                重置
              </el-button>
            </el-form-item>
          </el-form>
          
          <!-- 表单数据预览 -->
          <el-divider>表单数据预览</el-divider>
          <pre>{{ JSON.stringify(form, null, 2) }}</pre>
        </el-card>
      </el-col>

      <!-- 表格示例 -->
      <el-col :span="12">
        <el-card header="表格中使用字典">
          <el-table :data="tableData" border>
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="gender" label="性别" width="80" />
            <el-table-column prop="education" label="学历" />
            <el-table-column prop="status" label="状态" width="100" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- API调用示例 -->
    <el-row class="api-examples">
      <el-col :span="24">
        <el-card header="API调用示例">
          <div class="button-group">
            <el-button @click="testGetDictItems">
              获取字典项列表
            </el-button>
            <el-button @click="testGetDictLabel">
              获取字典标签
            </el-button>
            <el-button @click="testGetFlatItems">
              获取扁平化列表
            </el-button>
            <el-button @click="testPreloadDicts">
              预加载字典
            </el-button>
            <el-button @click="testClearCache">
              清除缓存
            </el-button>
          </div>
          
          <!-- 结果显示 -->
          <el-divider>API调用结果</el-divider>
          <div v-if="apiResult" class="api-result">
            <pre>{{ apiResult }}</pre>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import DictSelect from '@/components/DictSelect.vue'
import { useDict } from '@/composables/useDict'

// 使用字典功能
const { getDictItems, getDictLabel, getFlatDictItems, preloadDicts, clearCache } = useDict()

// 表单数据
const form = reactive({
  gender: '',
  education: '',
  hobbies: '',
  status: ''
})

// 表格数据
const tableData = ref([
  { name: '张三', gender: 'M', education: 'BACHELOR', status: 'ACTIVE' },
  { name: '李四', gender: 'F', education: 'MASTER', status: 'INACTIVE' },
  { name: '王五', gender: 'M', education: 'DOCTOR', status: 'PENDING' }
])

// API调用结果
const apiResult = ref('')

// 性别变化处理
const handleGenderChange = (value: string | number | null) => {
  console.log('性别变化:', value)
  ElMessage.success(`选择了性别: ${value}`)
}

// 提交表单
const handleSubmit = () => {
  console.log('提交表单:', form)
  ElMessage.success('表单提交成功')
}

// 重置表单
const handleReset = () => {
  Object.assign(form, {
    gender: '',
    education: '',
    hobbies: '',
    status: ''
  })
  ElMessage.info('表单已重置')
}

// API测试方法
const testGetDictItems = async () => {
  try {
    const items = await getDictItems('GENDER')
    apiResult.value = JSON.stringify(items, null, 2)
  } catch (error) {
    ElMessage.error('获取字典项失败')
  }
}

const testGetDictLabel = async () => {
  try {
    const label = await getDictLabel('GENDER', 'M')
    apiResult.value = `字典标签: ${label}`
  } catch (error) {
    ElMessage.error('获取字典标签失败')
  }
}

const testGetFlatItems = async () => {
  try {
    const items = await getFlatDictItems('EDUCATION')
    apiResult.value = JSON.stringify(items, null, 2)
  } catch (error) {
    ElMessage.error('获取扁平化列表失败')
  }
}

const testPreloadDicts = async () => {
  try {
    await preloadDicts(['GENDER', 'EDUCATION', 'USER_STATUS'])
    apiResult.value = '字典预加载完成'
    ElMessage.success('字典预加载成功')
  } catch (error) {
    ElMessage.error('字典预加载失败')
  }
}

const testClearCache = () => {
  clearCache()
  apiResult.value = '缓存已清除'
  ElMessage.info('缓存清除成功')
}

// 页面初始化
onMounted(() => {
  // 预加载常用字典
  preloadDicts(['GENDER', 'EDUCATION', 'USER_STATUS', 'HOBBIES'])
})
</script>

<style scoped>
.dict-example {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.api-examples {
  margin-top: 20px;
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.api-result {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  max-height: 300px;
  overflow: auto;
}

.api-result pre {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .dict-example {
    padding: 10px;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .button-group .el-button {
    width: 100%;
  }
}
</style> 