<template>
  <el-dialog
    v-model="dialogVisible"
    title="编辑角色"
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
      <el-form-item label="角色编码" prop="code">
        <el-input
          v-model="formData.code"
          placeholder="请输入角色编码"
          maxlength="64"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="角色名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入角色名称"
          maxlength="64"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="角色备注" prop="comment">
        <el-input
          v-model="formData.comment"
          type="textarea"
          placeholder="请输入角色备注"
          :rows="3"
          maxlength="200"
          show-word-limit
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
import { roleApi } from '@/api/modules/role'

// Props
interface Props {
  visible: boolean
  roleData: SysRole | null
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  roleData: null
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
const formData = reactive<UpdateRoleDto>({
  id: 0,
  code: '',
  name: '',
  comment: ''
})

// 表单验证规则
const formRules = computed((): FormRules => ({
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { min: 2, max: 64, message: '长度在 2 到 64 个字符', trigger: 'blur' },
    { pattern: /^[A-Z_][A-Z0-9_]*$/, message: '角色编码只能包含大写字母、数字和下划线，且以大写字母或下划线开头', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 64, message: '长度在 2 到 64 个字符', trigger: 'blur' }
  ],
  comment: [
    { max: 200, message: '角色备注不能超过200个字符', trigger: 'blur' }
  ]
}))

// 监听角色数据变化，填充表单
watch(() => props.roleData, (roleData) => {
  if (roleData) {
    Object.assign(formData, {
      id: roleData.id,
      code: roleData.code,
      name: roleData.name,
      comment: roleData.comment || ''
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
    
    const data = {
      ...formData,
      id: Number(formData.id)
    }
    await roleApi.updateRole(data)
    ElMessage.success('更新成功')
    
    dialogVisible.value = false
    emit('success')
  } catch (error: any) {
    if (error !== 'validation-failed') {
      console.error('更新角色失败:', error)
      ElMessage.error(error.message || '更新角色失败，请重试')
    }
  } finally {
    saving.value = false
  }
}

// 取消
const handleCancel = () => {
  dialogVisible.value = false
}

// 关闭对话框
const handleClose = () => {
  // 编辑模式不需要重置表单，因为数据来自外部
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style> 