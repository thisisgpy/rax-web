<template>
  <el-tree-select
    :model-value="props.modelValue"
    @update:model-value="handleChange"
    :data="orgTreeData"
    :props="treeProps"
    :placeholder="props.placeholder"
    :empty-values="[null, undefined]"
    :value-on-clear="null"
    :clearable="true"
    :disabled="props.disabled"
    :loading="loading"
    :filterable="true"
    :filter-node-method="filterNode"
    :style="{ width: props.width }"
    :check-strictly="true"
    :default-expanded-keys="defaultExpandedKeys"
    :render-after-expand="false"
    node-key="id"
    v-bind="$attrs"
  >
    <template #default="{ data }">
      <span class="custom-tree-node">
        <span>{{ data.nameAbbr || data.name }}</span>
      </span>
    </template>
  </el-tree-select>
</template>

<script setup lang="ts">
/**
 * 组织选择组件
 * 
 * 使用约定：
 * - modelValue 必须为数字类型，使用方负责确保传入正确的数字类型
 * - 组件会自动展开包含当前选中值的节点路径
 * - 支持按组织名称、简称、编码进行搜索过滤
 */
import { ref, computed, onMounted, watch } from 'vue'
import { orgApi } from '@/api/modules/org'
import { useErrorHandler } from '@/composables/useErrorHandler'

// 定义组件属性
interface Props {
  /** 绑定值 - 只接受数字类型，字符串会被强制转换为数字 */
  modelValue?: number | null
  /** 是否禁用 */
  disabled?: boolean
  /** 组件宽度 */
  width?: string
  /** 占位符文本 */
  placeholder?: string
}

// 定义组件事件
interface Emits {
  (e: 'update:modelValue', value: number | null): void
  (e: 'change', value: number | null, data?: OrgTreeDto): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  width: '100%',
  placeholder: '请选择组织'
})

const emit = defineEmits<Emits>()

// 错误处理
const { handleAsyncOperation } = useErrorHandler()

// 响应式数据
const loading = ref(false)
const orgTrees = ref<OrgTreeDto[]>([])

// 树形控件配置  
const treeProps = {
  value: 'id',
  label: 'nameAbbr',
  children: 'children'
}

// 注释：modelValue 应该在使用处就确保为正确的数字类型

// 组织树数据 - 处理简称显示
const orgTreeData = computed(() => {
  const processNodes = (nodes: OrgTreeDto[]): OrgTreeDto[] => {
    return nodes.map(node => ({
      ...node,
      nameAbbr: node.nameAbbr || node.name, // 如果没有简称，使用全名
      children: node.children ? processNodes(node.children) : undefined
    }))
  }
  return processNodes(orgTrees.value)
})

// 计算默认展开的节点键，确保当前选中值的路径被展开
const defaultExpandedKeys = computed(() => {
  if (!props.modelValue || orgTrees.value.length === 0) {
    return []
  }
  
  // 查找当前选中值的完整路径（包括所有父节点）
  const findNodePath = (nodes: OrgTreeDto[], targetId: number, path: number[] = []): number[] => {
    for (const node of nodes) {
      const currentPath = [...path, node.id]
      
      if (node.id === targetId) {
        return currentPath
      }
      
      if (node.children && node.children.length > 0) {
        const childPath = findNodePath(node.children, targetId, currentPath)
        if (childPath.length > 0) {
          return childPath
        }
      }
    }
    return []
  }
  
  const path = findNodePath(orgTrees.value, props.modelValue)
  // 返回路径中除了最后一个节点（叶子节点）外的所有节点，确保父节点都被展开
  return path.slice(0, -1)
})

// 处理值变化
const handleChange = (value: number | null) => {
  emit('update:modelValue', value)
  
  // 查找选中的组织数据
  let selectedOrg: OrgTreeDto | undefined
  if (value) {
    const findOrg = (nodes: OrgTreeDto[]): OrgTreeDto | undefined => {
      for (const node of nodes) {
        if (node.id === value) {
          return node
        }
        if (node.children) {
          const found = findOrg(node.children)
          if (found) return found
        }
      }
      return undefined
    }
    selectedOrg = findOrg(orgTrees.value)
  }
  
  emit('change', value, selectedOrg)
}

// 节点过滤方法
const filterNode = (value: string, data: OrgTreeDto) => {
  if (!value) return true
  return data.name.toLowerCase().includes(value.toLowerCase()) || 
         (data.nameAbbr && data.nameAbbr.toLowerCase().includes(value.toLowerCase())) ||
         (data.code && data.code.toLowerCase().includes(value.toLowerCase()))
}

// 获取组织树数据
const fetchOrgTrees = async () => {
  loading.value = true
  
  const result = await handleAsyncOperation(
    () => orgApi.getAllOrgTrees(),
    '获取组织数据',
    false // 不显示错误消息，避免干扰用户
  )
  
  if (result.success && result.data.data) {
    orgTrees.value = Array.isArray(result.data.data) ? result.data.data : [result.data.data]
  } else {
    orgTrees.value = []
  }
  
  loading.value = false
}

// 监听 modelValue 和 orgTrees 的变化，确保数据同步
watch([() => props.modelValue, orgTrees], ([newModelValue, newOrgTrees]) => {
  // 如果有值但数据未加载，则加载数据
  if (newModelValue && newOrgTrees.length === 0 && !loading.value) {
    fetchOrgTrees()
  }
}, { immediate: true })

// 组件挂载时获取数据
onMounted(() => {
  fetchOrgTrees()
})

// 暴露方法供父组件调用
defineExpose({
  /** 刷新组织数据 */
  refresh: fetchOrgTrees,
  /** 获取选中的组织信息 */
  getSelectedOrg: (id: number) => {
    const findOrg = (nodes: OrgTreeDto[]): OrgTreeDto | undefined => {
      for (const node of nodes) {
        if (node.id === id) {
          return node
        }
        if (node.children) {
          const found = findOrg(node.children)
          if (found) return found
        }
      }
      return undefined
    }
    return findOrg(orgTrees.value)
  }
})
</script>

<style scoped>
.custom-tree-node {
  display: flex;
  align-items: center;
}

/* 确保下拉框内容正确显示 */
:deep(.el-tree-select__item) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style> 