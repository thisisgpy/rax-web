<template>
  <el-select
    :model-value="modelValue"
    @update:model-value="handleChange"
    :placeholder="placeholder"
    :loading="loading[dictCode]"
    :disabled="disabled"
    :clearable="clearable"
    :multiple="multiple"
    :filterable="filterable"
    v-bind="$attrs"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
      :disabled="item.disabled"
    />
  </el-select>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useDict } from '@/composables/useDict'

interface Props {
  /** 字典编码 */
  dictCode: string
  /** 绑定值 */
  modelValue?: string | string[]
  /** 占位符 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否可清空 */
  clearable?: boolean
  /** 是否多选 */
  multiple?: boolean
  /** 是否可搜索 */
  filterable?: boolean
  /** 是否只显示启用的选项 */
  onlyEnabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  disabled: false,
  clearable: true,
  multiple: false,
  filterable: false,
  onlyEnabled: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
  'change': [value: string | string[], item?: { label: string; value: string }]
}>()

// 使用字典composable
const { loading, getFlatDictItems } = useDict()

// 选项列表
const options = ref<{ label: string; value: string; disabled?: boolean }[]>([])

// 计算属性：当前选中项的信息
const selectedItem = computed(() => {
  if (props.multiple || !props.modelValue) return null
  return options.value.find(item => item.value === props.modelValue) || null
})

// 加载字典选项
const loadOptions = async () => {
  if (!props.dictCode) return
  
  try {
    options.value = await getFlatDictItems(props.dictCode, props.onlyEnabled)
  } catch (error) {
    console.error('加载字典选项失败:', error)
    options.value = []
  }
}

// 处理值变化
const handleChange = (value: string | string[]) => {
  emit('update:modelValue', value)
  
  if (!props.multiple && typeof value === 'string') {
    const item = options.value.find(opt => opt.value === value)
    emit('change', value, item)
  } else {
    emit('change', value)
  }
}

// 监听字典编码变化
watch(() => props.dictCode, loadOptions, { immediate: false })

// 监听是否只显示启用项的变化
watch(() => props.onlyEnabled, loadOptions)

// 初始化
onMounted(() => {
  loadOptions()
})

// 暴露方法供外部调用
defineExpose({
  /** 重新加载选项 */
  reload: loadOptions,
  /** 获取当前选中项 */
  getSelectedItem: () => selectedItem.value,
  /** 获取所有选项 */
  getOptions: () => options.value
})
</script>

<style scoped>
/* 继承父组件的样式 */
</style> 