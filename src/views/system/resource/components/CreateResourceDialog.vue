<template>
  <el-dialog
    v-model="dialogVisible"
    title="新增资源"
    width="600px"
    :close-on-click-modal="false"
    @close="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="资源名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入资源名称"
          maxlength="64"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="资源编码" prop="code">
        <el-input
          v-model="formData.code"
          placeholder="请输入资源编码"
          maxlength="64"
        />
      </el-form-item>
      
      <el-form-item label="资源类型" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio :label="0">目录</el-radio>
          <el-radio :label="1">菜单</el-radio>
          <el-radio :label="2">按钮</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item v-if="formData.type !== 2" label="资源路径" prop="path">
        <el-input
          v-model="formData.path"
          placeholder="请输入资源路径"
          maxlength="128"
        />
      </el-form-item>
      
      <el-form-item v-if="formData.type === 1" label="组件路径" prop="component">
        <el-input
          v-model="formData.component"
          placeholder="请输入组件路径"
          maxlength="128"
        />
      </el-form-item>
      
      <el-form-item v-if="formData.type !== 2" label="资源图标" prop="icon">
        <IconSelector v-model="formData.icon" />
      </el-form-item>
      
      <el-form-item v-if="formData.type !== 2" label="排序" prop="sort">
        <el-input-number
          v-model="formData.sort"
          :min="0"
          :max="9999"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>
      
      <el-form-item v-if="parentResource" label="父级资源">
        <el-input :value="parentResource.name" readonly />
      </el-form-item>
      
      <el-form-item v-if="formData.type !== 2" label="是否隐藏" prop="isHidden">
        <el-radio-group v-model="formData.isHidden">
          <el-radio :label="false">显示</el-radio>
          <el-radio :label="true">隐藏</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item v-if="formData.type === 1" label="是否缓存" prop="isKeepAlive">
        <el-radio-group v-model="formData.isKeepAlive">
          <el-radio :label="false">不缓存</el-radio>
          <el-radio :label="true">缓存</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item v-if="formData.type === 1" label="外部链接" prop="isExternalLink">
        <el-radio-group v-model="formData.isExternalLink">
          <el-radio :label="false">否</el-radio>
          <el-radio :label="true">是</el-radio>
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
import { resourceApi } from '@/api/modules/resource'
import IconSelector from '@/components/IconSelector.vue'

// 定义组件属性
interface Props {
  visible: boolean
  parentResource?: SysResource | null
}

// 定义组件事件
interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  parentResource: null
})

const emit = defineEmits<Emits>()

// 组件引用
const formRef = ref<FormInstance>()

// 响应式数据
const saving = ref(false)

// 对话框显示状态的计算属性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 表单数据
const formData = reactive<CreateResourceDto>({
  code: '',
  name: '',
  type: 0,
  parentId: 0,
  path: '',
  component: '',
  icon: '',
  sort: 0,
  isHidden: false,
  isKeepAlive: false,
  isExternalLink: false
})

// 表单验证规则
const formRules = computed((): FormRules => ({
  name: [
    { required: true, message: '请输入资源名称', trigger: 'blur' },
    { min: 2, max: 64, message: '长度在 2 到 64 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入资源编码', trigger: 'blur' },
    { min: 2, max: 64, message: '长度在 2 到 64 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择资源类型', trigger: 'change' }
  ],
  path: formData.type !== 2 ? [
    { required: true, message: '请输入资源路径', trigger: 'blur' }
  ] : [],
  component: formData.type === 1 ? [
    { required: true, message: '请输入组件路径', trigger: 'blur' }
  ] : []
}))

// 重置表单数据
const resetFormData = () => {
  nextTick(() => {
    formRef.value?.resetFields()
    formRef.value?.clearValidate()
  })
  
  Object.assign(formData, {
    code: '',
    name: '',
    type: 0,
    parentId: props.parentResource?.id || 0,
    path: '',
    component: '',
    icon: '',
    sort: 0,
    isHidden: false,
    isKeepAlive: false,
    isExternalLink: false
  })
}

// 监听对话框显示状态
watch(() => props.visible, (newValue) => {
  if (newValue) {
    resetFormData()
  }
})

// 取消操作
const handleCancel = () => {
  resetFormData()
  emit('update:visible', false)
}

// 保存
const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true
    
    await resourceApi.createResource(formData)
    ElMessage.success('创建成功')
    
    emit('success')
    emit('update:visible', false)
  } catch (error: any) {
    if (error !== 'validation-failed') {
      console.error('创建资源失败:', error)
      ElMessage.error(error.message || '创建资源失败，请重试')
    }
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style> 