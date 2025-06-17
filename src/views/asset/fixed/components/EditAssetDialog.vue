<template>
  <el-dialog
    v-model="dialogVisible"
    title="编辑固定资产"
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
  assetData: AssetFixedResponseDto | null
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  assetData: null
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
const formData = reactive<UpdateAssetFixedDto>({
  id: 0,
  name: '',
  orgId: 0
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

// 监听资产数据变化，填充表单
watch(() => props.assetData, (assetData) => {
  if (assetData) {
    Object.assign(formData, {
      id: assetData.id,
      name: assetData.name,
      // 确保 orgId 是数字类型
      orgId: typeof assetData.orgId === 'string' ? Number(assetData.orgId) : assetData.orgId
    })
  }
}, { immediate: true })

// 监听对话框显示状态，清除验证
watch(() => props.visible, (visible) => {
  if (visible) {
    nextTick(() => {
      formRef.value?.clearValidate()
    })
  }
})

// 保存
const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true
    
    // 确保所有数字字段都是正确的类型
    const data: UpdateAssetFixedDto = {
      id: Number(formData.id),
      name: formData.name,
      orgId: Number(formData.orgId)
    }
    
    await assetApi.updateAssetFixed(data)
    ElMessage.success('更新成功')
    
    dialogVisible.value = false
    emit('success')
  } catch (error: any) {
    if (error !== 'validation-failed') {
      console.error('更新固定资产失败:', error)
      ElMessage.error(error.message || '更新固定资产失败，请重试')
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
  // 编辑对话框关闭时不需要重置数据，因为数据是从props传入的
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 