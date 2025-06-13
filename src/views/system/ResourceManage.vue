<template>
  <div class="resource-manage">
    <!-- 表格区域 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>资源列表</span>
          <div class="header-actions">
            <el-dropdown trigger="click">
              <el-button :icon="SwitchFilled" />
              <template #dropdown>
                <el-dropdown-menu>
                  <div v-for="column in columnConfig" :key="column.key" class="column-item">
                    <el-checkbox 
                      :model-value="column.visible" 
                      @change="(value: boolean) => toggleColumn(column.key, value)"
                      :label="column.label"
                    />
                  </div>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button @click="expandAllNodes">
              展开全部
            </el-button>
            <el-button @click="collapseAllNodes">
              收起全部
            </el-button>
            <el-button type="primary" :icon="Plus" @click="handleCreate">
              新增资源
            </el-button>
          </div>
        </div>
      </template>
      <el-table
        ref="resourceTableRef"
        v-loading="tableLoading"
        :data="tableData"
        stripe
        border
        style="width: 100%"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :lazy="true"
        :load="loadChildren"
      >
        <el-table-column 
          v-if="getColumnVisible('name')" 
          prop="name" 
          label="资源名称" 
          min-width="200" 
        />
        <el-table-column 
          v-if="getColumnVisible('code')" 
          prop="code" 
          label="资源编码" 
          min-width="150" 
        />
        <el-table-column 
          v-if="getColumnVisible('type')" 
          prop="type" 
          label="资源类型" 
          width="100"
        >
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column 
          v-if="getColumnVisible('path')" 
          prop="path" 
          label="资源路径" 
          min-width="150"
          show-overflow-tooltip 
        >
          <template #default="{ row }">
            <span v-if="row.type === 2" class="text-gray-400">-</span>
            <span v-else>{{ row.path || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column 
          v-if="getColumnVisible('component')" 
          prop="component" 
          label="组件路径" 
          min-width="150"
          show-overflow-tooltip 
        >
          <template #default="{ row }">
            <span v-if="row.type === 2" class="text-gray-400">-</span>
            <span v-else>{{ row.component || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column 
          v-if="getColumnVisible('icon')" 
          prop="icon" 
          label="图标" 
          width="100"
        >
          <template #default="{ row }">
            <span v-if="row.type === 2" class="text-gray-400">-</span>
            <span v-else-if="row.icon" class="icon-display">
              <el-icon :size="16" style="margin-right: 4px;">
                <component :is="row.icon" />
              </el-icon>
              {{ row.icon }}
            </span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column 
          v-if="getColumnVisible('sort')" 
          prop="sort" 
          label="排序" 
          width="80" 
        >
          <template #default="{ row }">
            <span v-if="row.type === 2" class="text-gray-400">-</span>
            <span v-else>{{ row.sort }}</span>
          </template>
        </el-table-column>
        <el-table-column 
          v-if="getColumnVisible('isHidden')" 
          prop="isHidden" 
          label="是否隐藏" 
          width="100"
        >
          <template #default="{ row }">
            <span v-if="row.type === 2" class="text-gray-400">-</span>
            <el-tag v-else :type="row.isHidden ? 'warning' : 'success'">
              {{ row.isHidden ? '隐藏' : '显示' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
                         <el-dropdown @command="(command: string) => handleCommand(command, row)">
              <el-button type="primary" size="small">
                操作
                <el-icon class="el-icon--right">
                  <ArrowDown />
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="add" :icon="Plus">
                    新增子资源
                  </el-dropdown-item>
                  <el-dropdown-item command="edit" :icon="Edit">
                    编辑
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" :icon="Delete" divided>
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑资源' : '新增资源'"
      width="600px"
      :close-on-click-modal="false"
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
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="saving" @click="handleSave">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Edit,
  Delete,
  ArrowDown,
  SwitchFilled
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { resourceApi } from '@/api/modules/resource'
import IconSelector from '@/components/IconSelector.vue'

// 组件引用
const formRef = ref<FormInstance>()
const resourceTableRef = ref()

// 响应式数据
const tableLoading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const isEditMode = ref(false)
const tableData = ref<SysResource[]>([])
const parentResource = ref<SysResource | null>(null)

// 列配置
const columnConfig = ref([
  { key: 'name', label: '资源名称', visible: true },
  { key: 'code', label: '资源编码', visible: true },
  { key: 'type', label: '资源类型', visible: true },
  { key: 'path', label: '资源路径', visible: true },
  { key: 'component', label: '组件路径', visible: true },
  { key: 'icon', label: '图标', visible: true },
  { key: 'sort', label: '排序', visible: true },
  { key: 'isHidden', label: '是否隐藏', visible: true }
])

// 表单数据
const formData = reactive<CreateResourceDto & UpdateResourceDto>({
  id: 0,
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

// 初始化列配置
const initColumnConfig = () => {
  const savedConfig = localStorage.getItem('resourceManageColumns')
  if (savedConfig) {
    try {
      const config = JSON.parse(savedConfig)
      columnConfig.value = config
    } catch (error) {
      console.error('解析列配置失败:', error)
    }
  }
}

// 初始化
onMounted(() => {
  initColumnConfig()
  fetchRootResources()
})

// 获取根级资源列表
const fetchRootResources = async () => {
  tableLoading.value = true
  try {
    const { data } = await resourceApi.getChildrenResources(0)
    tableData.value = data.map(item => ({
      ...item,
      hasChildren: true // 假设所有节点都可能有子节点，懒加载时再判断
    }))
  } catch (error: any) {
    console.error('获取资源列表失败:', error)
    ElMessage.error(error.message || '获取资源列表失败，请重试')
  } finally {
    tableLoading.value = false
  }
}

// 懒加载子节点
const loadChildren = async (row: SysResource, treeNode: any, resolve: (data: SysResource[]) => void) => {
  try {
    const { data } = await resourceApi.getChildrenResources(row.id)
    const children = data.map(item => ({
      ...item,
      hasChildren: true // 假设每个节点都可能有子节点，实际展开时再判断
    }))
    resolve(children)
  } catch (error: any) {
    console.error('获取子资源失败:', error)
    ElMessage.error(error.message || '获取子资源失败，请重试')
    resolve([])
  }
}

// 获取资源类型文本
const getTypeText = (type: number) => {
  const typeMap = { 0: '目录', 1: '菜单', 2: '按钮' }
  return typeMap[type as keyof typeof typeMap] || '未知'
}

// 获取资源类型标签颜色
const getTypeTagType = (type: number) => {
  const typeMap = { 0: 'info', 1: 'success', 2: 'warning' }
  return typeMap[type as keyof typeof typeMap] || 'info'
}

// 新增资源
const handleCreate = () => {
  isEditMode.value = false
  parentResource.value = null
  resetFormData()
  dialogVisible.value = true
}

// 获取列是否可见
const getColumnVisible = (key: string) => {
  return columnConfig.value.find(col => col.key === key)?.visible ?? true
}

// 切换列显示状态
const toggleColumn = (key: string, visible: boolean) => {
  const column = columnConfig.value.find(col => col.key === key)
  if (column) {
    column.visible = visible
    localStorage.setItem('resourceManageColumns', JSON.stringify(columnConfig.value))
  }
}

// 处理表格操作下拉菜单命令
const handleCommand = (command: string, row: SysResource) => {
  switch (command) {
    case 'add':
      handleAddChild(row)
      break
    case 'edit':
      handleEdit(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

// 新增子资源
const handleAddChild = (row: SysResource) => {
  isEditMode.value = false
  parentResource.value = row
  resetFormData()
  formData.parentId = row.id
  dialogVisible.value = true
}

// 编辑资源
const handleEdit = (row: SysResource) => {
  isEditMode.value = true
  parentResource.value = null
  Object.assign(formData, {
    id: row.id,
    code: row.code,
    name: row.name,
    type: row.type,
    parentId: row.parentId,
    path: row.path || '',
    component: row.component || '',
    icon: row.icon || '',
    sort: row.sort,
    isHidden: row.isHidden,
    isKeepAlive: row.isKeepAlive,
    isExternalLink: row.isExternalLink
  })
  dialogVisible.value = true
}

// 删除资源
const handleDelete = async (row: SysResource) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除资源"${row.name}"吗？此操作将同时删除其所有子资源。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await resourceApi.removeResource(row.id)
    ElMessage.success('删除成功')
    fetchRootResources()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除资源失败:', error)
      ElMessage.error(error.message || '删除资源失败，请重试')
    }
  }
}

// 保存
const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true
    
    if (isEditMode.value) {
      await resourceApi.updateResource(formData as UpdateResourceDto)
      ElMessage.success('更新成功')
    } else {
      await resourceApi.createResource(formData as CreateResourceDto)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    fetchRootResources()
  } catch (error: any) {
    if (error !== 'validation-failed') {
      console.error('保存资源失败:', error)
      ElMessage.error(error.message || '保存资源失败，请重试')
    }
  } finally {
    saving.value = false
  }
}

// 重置表单数据
const resetFormData = () => {
  Object.assign(formData, {
    id: undefined,
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
  formRef.value?.resetFields()
}

// 展开所有节点
const expandAllNodes = async () => {
  if (!resourceTableRef.value) return
  
  try {
    // 先加载完整的资源树
    const { data } = await resourceApi.getAllResourcesTree()
    
    // 更新表格数据为完整的树结构
    tableData.value = data
    
    // 等待DOM更新
    await nextTick()
    
    // 递归展开所有节点
    const expandRecursively = (items: SysResource[]) => {
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          resourceTableRef.value.toggleRowExpansion(item, true)
          expandRecursively(item.children)
        }
      })
    }
    
    expandRecursively(tableData.value)
  } catch (error: any) {
    console.error('展开所有节点失败:', error)
    ElMessage.error(error.message || '展开所有节点失败，请重试')
  }
}

// 收起所有节点
const collapseAllNodes = () => {
  if (!resourceTableRef.value) return
  
  // 递归收起所有节点
  const collapseRecursively = (items: SysResource[]) => {
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        resourceTableRef.value.toggleRowExpansion(item, false)
        collapseRecursively(item.children)
      }
    })
  }
  
  collapseRecursively(tableData.value)
}
</script>

<style scoped>
.resource-manage {
  padding: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.column-item {
  padding: 4px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  min-height: auto;
}

.column-item:hover {
  background-color: var(--el-dropdown-menuItem-hover-fill);
}

:deep(.column-item .el-checkbox) {
  width: 100%;
  margin-right: 0;
  height: auto;
}

:deep(.column-item .el-checkbox__label) {
  width: 100%;
  padding-left: 6px;
  font-size: 14px;
  line-height: 1.2;
}

:deep(.column-item .el-checkbox__input) {
  line-height: 1;
}

:deep(.el-dropdown-menu) {
  padding: 4px 0;
  min-width: 120px;
}

:deep(.el-dropdown-menu .el-popper__arrow) {
  display: none;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-table .cell) {
  word-break: break-word;
}

.icon-display {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.text-gray-400 {
  color: var(--el-text-color-placeholder);
}
</style> 