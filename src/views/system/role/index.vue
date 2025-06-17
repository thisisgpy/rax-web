<template>
  <div class="role-manage">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        :inline="true"
        class="search-form"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入角色名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>角色列表</span>
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
            <el-button type="primary" :icon="Plus" @click="handleCreate">
              新增角色
            </el-button>
          </div>
        </div>
      </template>
      <el-table
        v-loading="tableLoading"
        :data="tableData"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column 
          v-if="getColumnVisible('id')" 
          prop="id" 
          label="角色ID" 
          width="80" 
        />
        <el-table-column 
          v-if="getColumnVisible('code')" 
          prop="code" 
          label="角色编码" 
          min-width="120" 
        />
        <el-table-column 
          v-if="getColumnVisible('name')" 
          prop="name" 
          label="角色名称" 
          min-width="120" 
        />
        <el-table-column 
          v-if="getColumnVisible('comment')" 
          prop="comment" 
          label="角色备注" 
          min-width="150" 
          show-overflow-tooltip 
        />

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
                  <el-dropdown-item command="edit" :icon="Edit">
                    编辑
                  </el-dropdown-item>
                  <el-dropdown-item command="setPermissions" :icon="Key">
                    权限设置
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
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.pageNo"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 权限设置抽屉 -->
    <el-drawer
      v-model="permissionDialogVisible"
      title="权限设置"
      direction="rtl"
      size="600px"
      :close-on-click-modal="false"
      :with-header="true"
      destroy-on-close
    >
      <div v-loading="permissionLoading" class="permission-drawer-content">
        <div class="permission-info">
          <p><strong>角色：</strong>{{ currentRole?.name }} <span class="role-code">{{ currentRole?.code }}</span></p>
        </div>
        
        <div class="permission-tree">
          <div class="tree-header">
            <p><strong>选择权限：</strong></p>
            <div class="tree-actions">
              <el-button size="small" text @click="expandAllNodes">
                展开全部
              </el-button>
              <el-button size="small" text @click="collapseAllNodes">
                收起全部
              </el-button>
            </div>
          </div>
          <el-tree
            ref="permissionTreeRef"
            :data="resourceTreeData"
            :props="treeProps"
            show-checkbox
            node-key="id"
            :check-strictly="true"
            style="max-height: calc(100vh - 200px); overflow-y: auto;"
          >
            <template #default="{ data }">
              <div class="tree-node">
                <span class="node-label">{{ data.name }}</span>
                <el-tag 
                  :type="getResourceTypeTag(data.type)" 
                  size="small" 
                  style="margin-left: 8px;"
                >
                  {{ getResourceTypeText(data.type) }}
                </el-tag>
                <span v-if="data.code" class="node-code">{{ data.code }}</span>
              </div>
            </template>
          </el-tree>
        </div>
      </div>
      
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="permissionSaving" @click="handleSavePermissions">
            确定
          </el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 新增角色对话框 -->
    <CreateRoleDialog
      v-model:visible="createDialogVisible"
      @success="handleFormSuccess"
    />

    <!-- 编辑角色对话框 -->
    <EditRoleDialog
      v-model:visible="editDialogVisible"
      :role-data="currentEditRole"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Edit,
  Delete,
  ArrowDown,
  SwitchFilled,
  Key
} from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { roleApi } from '@/api/modules/role'
import { permissionApi } from '@/api/modules/permission'
import { resourceApi } from '@/api/modules/resource'
import CreateRoleDialog from './components/CreateRoleDialog.vue'
import EditRoleDialog from './components/EditRoleDialog.vue'

// 组件引用
const searchFormRef = ref<FormInstance>()

// 响应式数据
const tableLoading = ref(false)
const createDialogVisible = ref(false)
const editDialogVisible = ref(false)
const tableData = ref<SysRole[]>([])
const currentEditRole = ref<SysRole | null>(null)

// 权限设置相关
const permissionDialogVisible = ref(false)
const permissionLoading = ref(false)
const permissionSaving = ref(false)
const currentRole = ref<SysRole | null>(null)
const resourceTreeData = ref<SysResource[]>([])
const selectedResourceIds = ref<number[]>([])
const permissionTreeRef = ref()

// 列配置
const columnConfig = ref([
  { key: 'id', label: '角色ID', visible: true },
  { key: 'code', label: '角色编码', visible: true },
  { key: 'name', label: '角色名称', visible: true },
  { key: 'comment', label: '角色备注', visible: true }
])

// 搜索表单
const searchForm = reactive({
  name: ''
})

// 分页信息
const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0
})



// 初始化列配置
const initColumnConfig = () => {
  const savedConfig = localStorage.getItem('roleManageColumns')
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
  fetchRoleList()
})

// 监听权限对话框关闭，清理状态
watch(permissionDialogVisible, (newVal) => {
  if (!newVal) {
    // 对话框关闭时清理状态
    currentRole.value = null
    resourceTreeData.value = []
    selectedResourceIds.value = []
    if (permissionTreeRef.value) {
      permissionTreeRef.value.setCheckedKeys([])
    }
  }
})

// 获取角色列表
const fetchRoleList = async () => {
  tableLoading.value = true
  try {
    const params: QueryRoleDto = {
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    
    const { data } = await roleApi.getRoleList(params)
    tableData.value = data.rows || []
    pagination.total = data.total
  } catch (error: any) {
    console.error('获取角色列表失败:', error)
    ElMessage.error(error.message || '获取角色列表失败，请重试')
  } finally {
    tableLoading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNo = 1
  fetchRoleList()
}

// 重置搜索
const handleReset = () => {
  searchFormRef.value?.resetFields()
  pagination.pageNo = 1
  fetchRoleList()
}

// 新增角色
const handleCreate = () => {
  createDialogVisible.value = true
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
    // 保存到 localStorage
    localStorage.setItem('roleManageColumns', JSON.stringify(columnConfig.value))
  }
}

// 处理表格操作下拉菜单命令
const handleCommand = (command: string, row: SysRole) => {
  switch (command) {
    case 'edit':
      handleEdit(row)
      break
    case 'setPermissions':
      handleSetPermissions(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

// 编辑角色
const handleEdit = (row: SysRole) => {
  currentEditRole.value = row
  editDialogVisible.value = true
}

// 删除角色
const handleDelete = async (row: SysRole) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色"${row.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await roleApi.removeRole(row.id)
    ElMessage.success('删除成功')
    fetchRoleList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除角色失败:', error)
      ElMessage.error(error.message || '删除角色失败，请重试')
    }
  }
}

// 表单成功回调
const handleFormSuccess = () => {
  fetchRoleList()
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.pageNo = 1
  fetchRoleList()
}

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.pageNo = page
  fetchRoleList()
}

// 树形组件配置
const treeProps = {
  children: 'children',
  label: 'name'
}

// 权限设置
const handleSetPermissions = async (row: SysRole) => {
  currentRole.value = row
  permissionDialogVisible.value = true
  await loadRolePermissionsAndResources(row.id)
}

// 加载角色权限和资源树
const loadRolePermissionsAndResources = async (roleId: number) => {
  permissionLoading.value = true
  try {
    // 先清理之前的状态
    selectedResourceIds.value = []
    resourceTreeData.value = []
    if (permissionTreeRef.value) {
      permissionTreeRef.value.setCheckedKeys([])
    }
    
    // 并行获取角色当前权限和所有资源树
    const [roleResourcesResponse, resourceTreeResponse] = await Promise.all([
      permissionApi.getRoleResources(roleId),
      resourceApi.getAllResourcesTree()
    ])
    
    selectedResourceIds.value = roleResourcesResponse.data || []
    resourceTreeData.value = resourceTreeResponse.data || []
    
    // 等待DOM更新后设置选中状态
    await nextTick()
    if (permissionTreeRef.value && selectedResourceIds.value.length > 0) {
      // 设置选中状态 - 精确权限控制
      permissionTreeRef.value.setCheckedKeys(selectedResourceIds.value)
    }
  } catch (error: any) {
    console.error('加载权限数据失败:', error)
    ElMessage.error(error.message || '加载权限数据失败，请重试')
  } finally {
    permissionLoading.value = false
  }
}

// 保存权限设置
const handleSavePermissions = async () => {
  if (!currentRole.value || !permissionTreeRef.value) return
  
  try {
    permissionSaving.value = true
    
    // 获取选中的节点ID（精确权限控制，不包括半选中状态）
    const checkedKeys = permissionTreeRef.value.getCheckedKeys()
    const allSelectedIds = checkedKeys
    
    const assignData: AssignRoleResourceDto = {
      roleId: currentRole.value.id,
      resourceIds: allSelectedIds
    }
    
    await permissionApi.assignRoleResources(assignData)
    ElMessage.success('权限设置成功')
    permissionDialogVisible.value = false
  } catch (error: any) {
    console.error('设置权限失败:', error)
    ElMessage.error(error.message || '设置权限失败，请重试')
  } finally {
    permissionSaving.value = false
  }
}

// 获取资源类型文本
const getResourceTypeText = (type: number) => {
  const typeMap = { 0: '目录', 1: '菜单', 2: '按钮' }
  return typeMap[type as keyof typeof typeMap] || '未知'
}

// 获取资源类型标签颜色
const getResourceTypeTag = (type: number) => {
  const typeMap = { 0: 'info', 1: 'success', 2: 'warning' }
  return typeMap[type as keyof typeof typeMap] || 'info'
}

// 展开所有节点
const expandAllNodes = () => {
  if (permissionTreeRef.value) {
    // 获取所有节点的key
    const allKeys: number[] = []
    const getAllKeys = (nodes: SysResource[]) => {
      nodes.forEach(node => {
        allKeys.push(node.id)
        if (node.children && node.children.length > 0) {
          getAllKeys(node.children)
        }
      })
    }
    getAllKeys(resourceTreeData.value)
    
    // 展开所有节点
    permissionTreeRef.value.store.nodesMap = permissionTreeRef.value.store.nodesMap || {}
    allKeys.forEach(key => {
      const node = permissionTreeRef.value.store.nodesMap[key]
      if (node) {
        node.expanded = true
      }
    })
  }
}

// 收起所有节点
const collapseAllNodes = () => {
  if (permissionTreeRef.value) {
    // 获取所有节点的key
    const allKeys: number[] = []
    const getAllKeys = (nodes: SysResource[]) => {
      nodes.forEach(node => {
        allKeys.push(node.id)
        if (node.children && node.children.length > 0) {
          getAllKeys(node.children)
        }
      })
    }
    getAllKeys(resourceTreeData.value)
    
    // 收起所有节点
    permissionTreeRef.value.store.nodesMap = permissionTreeRef.value.store.nodesMap || {}
    allKeys.forEach(key => {
      const node = permissionTreeRef.value.store.nodesMap[key]
      if (node) {
        node.expanded = false
      }
    })
  }
}


</script>

<style scoped>
.role-manage {
  padding: 20px;
}

.search-card,
.table-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
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

/* 优化下拉菜单的整体样式 */
:deep(.el-dropdown-menu) {
  padding: 4px 0;
  min-width: 120px;
}

:deep(.el-dropdown-menu .el-popper__arrow) {
  display: none;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

:deep(.el-table .cell) {
  word-break: break-word;
}

/* 权限设置抽屉样式 */
.permission-drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.permission-info {
  background-color: var(--el-bg-color-page);
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.permission-info p {
  margin: 0;
  color: var(--el-text-color-regular);
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-code {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background-color: var(--el-fill-color-light);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: var(--el-font-family-mono, 'Courier New', monospace);
}

.permission-tree {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.tree-header p {
  margin: 0;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.tree-actions {
  display: flex;
  gap: 8px;
}

.tree-node {
  display: flex;
  align-items: center;
  flex: 1;
  padding-right: 8px;
}

.node-label {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.node-code {
  margin-left: auto;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background-color: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 3px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 0 0 0;
  border-top: 1px solid var(--el-border-color-light);
  margin-top: 12px;
}
</style> 