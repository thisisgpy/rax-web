<template>
  <el-dialog
    v-model="dialogVisible"
    title="新增用户"
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
      <el-form-item label="用户名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入用户名称"
          maxlength="64"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="手机号" prop="mobile">
        <el-input
          v-model="formData.mobile"
          placeholder="请输入手机号"
          maxlength="11"
        />
      </el-form-item>
      
      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="formData.gender">
          <el-radio label="男">男</el-radio>
          <el-radio label="女">女</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="身份证号" prop="idCard">
        <el-input
          v-model="formData.idCard"
          placeholder="请输入身份证号"
          maxlength="18"
        />
      </el-form-item>
      
      <el-form-item label="所属组织" prop="orgId">
        <OrgSelect
          v-model="formData.orgId"
          placeholder="请选择所属组织"
          width="100%"
        />
      </el-form-item>
      
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
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
import { userApi } from '@/api/modules/user'

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
const formData = reactive<CreateUserDto>({
  name: '',
  mobile: '',
  gender: '男',
  idCard: '',
  orgId: null,
  password: '123456', // 新增用户默认密码
  status: 1
})

// 表单验证规则
const formRules = computed((): FormRules => ({
  name: [
    { required: true, message: '请输入用户名称', trigger: 'blur' },
    { min: 2, max: 64, message: '长度在 2 到 64 个字符', trigger: 'blur' }
  ],
  mobile: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
  ],
  orgId: [
    { required: true, message: '请选择所属组织', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
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
    mobile: '',
    gender: '男',
    idCard: '',
    orgId: null,
    password: '123456',
    status: 1
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
    
    const data = {
      ...formData,
      orgId: Number(formData.orgId)
    }
    
    await userApi.createUser(data)
    ElMessage.success('创建成功')
    
    dialogVisible.value = false
    emit('success')
  } catch (error: any) {
    if (error !== 'validation-failed') {
      console.error('创建用户失败:', error)
      ElMessage.error(error.message || '创建用户失败，请重试')
    }
  } finally {
    saving.value = false
  }
}

// 取消
const handleCancel = () => {
  dialogVisible.value = false
  resetFormData()
}

// 关闭对话框
const handleClose = () => {
  resetFormData()
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style> 