<template>
  <el-select
    :model-value="modelValue"
    @update:model-value="handleChange"
    :placeholder="placeholder"
    :clearable="true"
    :disabled="disabled"
    :loading="loading"
    :filterable="true"
    :style="{ width: width }"
    v-bind="$attrs"
  >
    <el-option
      v-for="item in flatOptions"
      :key="item.value"
      :label="item.label"
      :value="item.value"
      :disabled="item.disabled"
    >
      <span>{{ item.indentLabel }}</span>
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { dictApi } from '@/api/modules/dict'
import { useErrorHandler } from '@/composables/useErrorHandler'

// 定义组件属性
interface Props {
  /** 绑定值 */
  modelValue?: string | number | null
  /** 字典编码 */
  dictCode: string
  /** 占位符 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 组件宽度 */
  width?: string
}

// 定义组件事件
interface Emits {
  (e: 'update:modelValue', value: string | number | null): void
  (e: 'change', value: string | number | null): void
}

// 定义扁平化选项类型
interface FlatOption {
  value: string | number
  label: string
  indentLabel: string
  disabled: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  disabled: false,
  width: '100%'
})

const emit = defineEmits<Emits>()

// 错误处理
const { handleAsyncOperation } = useErrorHandler()

// 响应式数据
const loading = ref(false)
const dictItems = ref<DictItemTreeDto[]>([])

// 扁平化选项数据
const flatOptions = computed<FlatOption[]>(() => {
  const flatten = (items: DictItemTreeDto[], level = 0): FlatOption[] => {
    const result: FlatOption[] = []
    
    items.forEach(item => {
      const indent = '　'.repeat(level) // 使用全角空格进行缩进
      const disabled = !item.isEnabled
      
      result.push({
        value: item.value,
        label: item.label,
        indentLabel: `${indent}${item.label}`,
        disabled
      })
      
      if (item.children && item.children.length > 0) {
        result.push(...flatten(item.children, level + 1))
      }
    })
    
    return result
  }
  
  return flatten(dictItems.value)
})

// 处理值变化
const handleChange = (value: string | number | null) => {
  emit('update:modelValue', value)
  emit('change', value)
}

// 获取字典项数据
const fetchDictItems = async () => {
  if (!props.dictCode) {
    dictItems.value = []
    return
  }
  
  loading.value = true
  
  const result = await handleAsyncOperation(
    () => dictApi.getDictItemTreeByCode(props.dictCode, false),
    '获取字典项数据',
    false // 不显示错误消息，避免干扰用户
  )
  
  if (result.success) {
    // 根据API文档，需要读取 result.data.data.children
    if (result.data.data && result.data.data.children) {
      dictItems.value = result.data.data.children
    } else {
      dictItems.value = []
    }
  } else {
    dictItems.value = []
  }
  
  loading.value = false
}

// 监听字典编码变化
watch(() => props.dictCode, () => {
  fetchDictItems()
}, { immediate: false })

// 组件挂载时获取数据
onMounted(() => {
  fetchDictItems()
})
</script>

<style scoped>
/* 如果需要自定义样式，可以在这里添加 */
</style> 