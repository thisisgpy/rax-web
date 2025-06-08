<template>
  <span class="dict-label">
    <el-tag
      v-if="showTag && label"
      :type="tagType"
      :size="tagSize"
      :effect="tagEffect"
    >
      {{ label }}
    </el-tag>
    <span v-else>{{ label || defaultLabel }}</span>
  </span>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useDict } from '@/composables/useDict'

interface Props {
  /** 字典编码 */
  dictCode: string
  /** 字典项值 */
  value: string
  /** 默认显示文本 */
  defaultLabel?: string
  /** 是否显示为标签 */
  showTag?: boolean
  /** 标签类型 */
  tagType?: 'success' | 'info' | 'warning' | 'danger' | ''
  /** 标签大小 */
  tagSize?: 'large' | 'default' | 'small'
  /** 标签效果 */
  tagEffect?: 'dark' | 'light' | 'plain'
}

const props = withDefaults(defineProps<Props>(), {
  defaultLabel: '',
  showTag: false,
  tagType: '',
  tagSize: 'default',
  tagEffect: 'light'
})

// 使用字典功能
const { getDictLabel } = useDict()

// 显示标签
const label = ref('')



// 加载字典标签
const loadLabel = async () => {
  if (!props.dictCode || !props.value) {
    label.value = props.defaultLabel || props.value
    return
  }
  
  try {
    label.value = await getDictLabel(props.dictCode, props.value, props.defaultLabel || props.value)
  } catch (error) {
    console.error('获取字典标签失败:', error)
    label.value = props.defaultLabel || props.value
  }
}

// 监听属性变化
watch([() => props.dictCode, () => props.value], loadLabel, { immediate: false })

// 初始化
onMounted(() => {
  loadLabel()
})

// 暴露方法
defineExpose({
  /** 重新加载标签 */
  reload: loadLabel,
  /** 获取当前标签 */
  getLabel: () => label.value
})
</script>

<style scoped>
.dict-label {
  display: inline-block;
}
</style> 