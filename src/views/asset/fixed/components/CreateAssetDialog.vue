<template>
  <el-dialog
    v-model="dialogVisible"
    title="新增固定资产"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="资产名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入资产名称"
          maxlength="128"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="所属组织" prop="orgId">
        <OrgSelect
          v-model="formData.orgId"
          placeholder="请选择所属组织"
          width="100%"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { assetApi } from '@/api/modules/asset'
import OrgSelect from '@/components/OrgSelect.vue'

// Props
interface Props {
  visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false
})

// Emits
interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const emit = defineEmits<Emits>()

// 组件引用
const formRef = ref<FormInstance>()

// 响应式数据
const saving = ref(false)

// 计算属性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 表单数据
const formData = reactive<CreateAssetFixedDto>({
  name: '',
  orgId: undefined
})

// 表单验证规则
const formRules = computed((): FormRules => ({
  name: [
    { required: true, message: '请输入资产名称', trigger: 'blur' },
    { min: 1, max: 128, message: '长度在 1 到 128 个字符', trigger: 'blur' }
  ],
  orgId: [
    { required: true, message: '请选择所属组织', trigger: 'change' },
    { type: 'number', min: 1, message: '请选择有效的组织', trigger: 'change' }
  ]
}))

// 监听对话框显示状态，重置表单
watch(() => props.visible, (visible) => {
  if (visible) {
    resetFormData()
  }
})

// 重置表单数据
const resetFormData = () => {
  Object.assign(formData, {
    name: '',
    orgId: 0
  })
  
  nextTick(() => {
    formRef.value?.resetFields()
    formRef.value?.clearValidate()
  })
}

// 保存
const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true
    
    // 确保 orgId 是数字类型
    const data: CreateAssetFixedDto = {
      name: formData.name,
      orgId: Number(formData.orgId)
    }
    
    await assetApi.createAssetFixed(data)
    ElMessage.success('创建成功')
    
    dialogVisible.value = false
    emit('success')
  } catch (error: any) {
    if (error !== 'validation-failed') {
      console.error('创建固定资产失败:', error)
      ElMessage.error(error.message || '创建固定资产失败，请重试')
    }
  } finally {
    saving.value = false
  }
}

// 取消
const handleCancel = () => {
  dialogVisible.value = false
}

// 关闭
const handleClose = () => {
  resetFormData()
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 