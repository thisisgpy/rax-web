<template>
  <el-tree-select
    :model-value="modelValue"
    @update:model-value="handleChange"
    :data="orgTreeData"
    :props="treeProps"
    :placeholder="placeholder"
    :clearable="true"
    :disabled="disabled"
    :loading="loading"
    :filterable="true"
    :filter-node-method="filterNode"
    :style="{ width: width }"
    :check-strictly="true"
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
import { ref, computed, onMounted } from 'vue'
import { orgApi } from '@/api/modules/org'
import { useErrorHandler } from '@/composables/useErrorHandler'

// 定义组件属性
interface Props {
  /** 绑定值 */
  modelValue?: number | null
  /** 占位符 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 组件宽度 */
  width?: string
  /** 是否显示完整路径 */
  showFullPath?: boolean
}

// 定义组件事件
interface Emits {
  (e: 'update:modelValue', value: number | null): void
  (e: 'change', value: number | null, data?: OrgTreeDto): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择组织',
  disabled: false,
  width: '100%',
  showFullPath: false
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