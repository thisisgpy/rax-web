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
                      @change="(value) => toggleColumn(column.key, value)"
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
            <el-dropdown @command="(command) => handleCommand(command, row)">
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑角色' : '新增角色'"
      width="600px"
      :close-on-click-modal="false"
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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Edit,
  Delete,
  ArrowDown,
  SwitchFilled
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { roleApi } from '@/api/modules/role'

// 组件引用
const searchFormRef = ref<FormInstance>()
const formRef = ref<FormInstance>()

// 响应式数据
const tableLoading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const isEditMode = ref(false)
const tableData = ref<SysRole[]>([])

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

// 表单数据
const formData = reactive<CreateRoleDto & UpdateRoleDto>({
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
    tableData.value = data.rows || data.list || []
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
  isEditMode.value = false
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
    case 'delete':
      handleDelete(row)
      break
  }
}

// 编辑角色
const handleEdit = (row: SysRole) => {
  isEditMode.value = true
  Object.assign(formData, {
    id: row.id,
    code: row.code,
    name: row.name,
    comment: row.comment || ''
  })
  dialogVisible.value = true
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

// 保存
const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true
    
    if (isEditMode.value) {
      await roleApi.updateRole(formData as UpdateRoleDto)
      ElMessage.success('更新成功')
    } else {
      await roleApi.createRole(formData as CreateRoleDto)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    fetchRoleList()
  } catch (error: any) {
    if (error !== 'validation-failed') {
      console.error('保存角色失败:', error)
      ElMessage.error(error.message || '保存角色失败，请重试')
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
    comment: ''
  })
  formRef.value?.resetFields()
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

.dialog-footer {
  text-align: right;
}

:deep(.el-table .cell) {
  word-break: break-word;
}
</style> 