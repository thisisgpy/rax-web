<template>
  <div class="user-manage">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        :inline="true"
        class="search-form"
      >
        <el-form-item label="用户名称" prop="name">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入用户名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="手机号" prop="mobile">
          <el-input
            v-model="searchForm.mobile"
            placeholder="请输入手机号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="组织" prop="orgId">
          <OrgSelect
            v-model="searchForm.orgId"
            placeholder="请选择组织"
            width="200px"
          />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
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
          <span>用户列表</span>
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
              新增用户
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
          label="用户ID" 
          width="80" 
        />
        <el-table-column 
          v-if="getColumnVisible('name')" 
          prop="name" 
          label="用户名称" 
          min-width="120" 
        />
        <el-table-column 
          v-if="getColumnVisible('mobile')" 
          prop="mobile" 
          label="手机号" 
          width="120" 
        />
        <el-table-column 
          v-if="getColumnVisible('gender')" 
          prop="gender" 
          label="性别" 
          width="80" 
        />
        <el-table-column 
          v-if="getColumnVisible('idCard')" 
          prop="idCard" 
          label="身份证号" 
          width="180" 
          show-overflow-tooltip 
        />
        <el-table-column 
          v-if="getColumnVisible('orgName')" 
          prop="orgNameAbbr" 
          label="所属组织" 
          min-width="150" 
        />
        <el-table-column 
          v-if="getColumnVisible('status')" 
          prop="status" 
          label="状态" 
          width="80"
        >
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column 
          v-if="getColumnVisible('isInitPassword')" 
          prop="isInitPassword" 
          label="密码状态" 
          width="100"
        >
          <template #default="{ row }">
            <el-tag :type="row.isInitPassword ? 'warning' : 'success'">
              {{ row.isInitPassword ? '已修改' : '初始密码' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column 
          v-if="getColumnVisible('createTime')" 
          prop="createTime" 
          label="创建时间" 
          width="160" 
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
                  <el-dropdown-item command="resetPassword" :icon="Key">
                    重置密码
                  </el-dropdown-item>
                  <el-dropdown-item command="setRoles" :icon="UserFilled">
                    角色设置
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

    <!-- 角色设置对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      title="角色设置"
      width="1000px"
      :close-on-click-modal="false"
    >
      <div v-loading="roleLoading">
        <div class="role-info">
          <p><strong>用户：</strong>{{ currentUser?.name }}</p>
        </div>
        
        <el-divider />
        
        <div class="role-transfer">
          <el-transfer
            v-model="selectedRoleIds"
            :data="transferData"
            :titles="['可选角色', '已分配角色']"
            :button-texts="['移除', '分配']"
            :format="{
              noChecked: '${total}',
              hasChecked: '${checked}/${total}'
            }"
            filterable
            filter-placeholder="搜索角色"
            style="text-align: left; display: inline-block"
          >
            <template #default="{ option }">
              <div class="transfer-item">
                <span class="role-name">{{ option.label }}</span>
                <span v-if="option.comment" class="role-comment">{{ option.comment }}</span>
              </div>
            </template>
          </el-transfer>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="roleSaving" @click="handleSaveRoles">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增用户对话框 -->
    <CreateUserDialog
      v-model:visible="createDialogVisible"
      @success="handleFormSuccess"
    />

    <!-- 编辑用户对话框 -->
    <EditUserDialog
      v-model:visible="editDialogVisible"
      :user-data="currentEditUser"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Edit,
  Delete,
  Key,
  ArrowDown,
  SwitchFilled,
  UserFilled
} from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { userApi } from '@/api/modules/user'
import { orgApi } from '@/api/modules/org'
import { permissionApi } from '@/api/modules/permission'
import { roleApi } from '@/api/modules/role'
import CreateUserDialog from './components/CreateUserDialog.vue'
import EditUserDialog from './components/EditUserDialog.vue'

// 组件引用
const searchFormRef = ref<FormInstance>()

// 响应式数据
const tableLoading = ref(false)
const createDialogVisible = ref(false)
const editDialogVisible = ref(false)
const tableData = ref<UserResponseDto[]>([])
const currentEditUser = ref<UserResponseDto | null>(null)

// 角色设置相关
const roleDialogVisible = ref(false)
const roleLoading = ref(false)
const roleSaving = ref(false)
const currentUser = ref<UserResponseDto | null>(null)
const currentUserRoles = ref<SysRole[]>([])
const allRoles = ref<SysRole[]>([])
const selectedRoleIds = ref<number[]>([])
const transferData = ref<Array<{
  key: number
  label: string
  comment?: string
}>>([])

// 列配置
const columnConfig = ref([
  { key: 'id', label: '用户ID', visible: true },
  { key: 'name', label: '用户名称', visible: true },
  { key: 'mobile', label: '手机号', visible: true },
  { key: 'gender', label: '性别', visible: true },
  { key: 'idCard', label: '身份证号', visible: true },
  { key: 'orgName', label: '所属组织', visible: true },
  { key: 'status', label: '状态', visible: true },
  { key: 'isInitPassword', label: '密码状态', visible: true },
  { key: 'createTime', label: '创建时间', visible: true }
])

// 搜索表单
const searchForm = reactive({
  name: '',
  mobile: '',
  orgId: undefined,
  status: undefined
})

// 分页信息
const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0
})

// 初始化列配置
const initColumnConfig = () => {
  const savedConfig = localStorage.getItem('userManageColumns')
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
  fetchUserList()
})

// 获取用户列表
const fetchUserList = async () => {
  tableLoading.value = true
  try {
    const params: QueryUserDto = {
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    
    const { data } = await userApi.getUserList(params)
    tableData.value = data.rows || []
    pagination.total = data.total || 0
  } catch (error: any) {
    console.error('获取用户列表失败:', error)
    ElMessage.error(error.message || '获取用户列表失败，请重试')
  } finally {
    tableLoading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNo = 1
  fetchUserList()
}

// 重置搜索
const handleReset = () => {
  searchFormRef.value?.resetFields()
  pagination.pageNo = 1
  fetchUserList()
}

// 新增用户
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
    localStorage.setItem('userManageColumns', JSON.stringify(columnConfig.value))
  }
}

// 处理表格操作下拉菜单命令
const handleCommand = (command: string, row: UserResponseDto) => {
  switch (command) {
    case 'edit':
      handleEdit(row)
      break
    case 'resetPassword':
      handleResetPassword(row)
      break
    case 'setRoles':
      handleSetRoles(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

// 编辑用户
const handleEdit = (row: UserResponseDto) => {
  currentEditUser.value = row
  editDialogVisible.value = true
}

// 删除用户
const handleDelete = async (row: UserResponseDto) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户"${row.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await userApi.removeUser(row.id)
    ElMessage.success('删除成功')
    fetchUserList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error(error.message || '删除用户失败，请重试')
    }
  }
}

// 重置密码
const handleResetPassword = async (row: UserResponseDto) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置用户"${row.name}"的密码吗？`,
      '确认重置密码',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await userApi.resetPassword(row.id)
    ElMessage.success('密码重置成功')
    fetchUserList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('重置密码失败:', error)
      ElMessage.error(error.message || '重置密码失败，请重试')
    }
  }
}

// 表单成功回调
const handleFormSuccess = () => {
  fetchUserList()
}



// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.pageNo = 1
  fetchUserList()
}

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.pageNo = page
  fetchUserList()
}

// 角色设置
const handleSetRoles = async (row: UserResponseDto) => {
  currentUser.value = row
  roleDialogVisible.value = true
  await loadUserRolesAndAllRoles(row.id)
}

// 加载用户角色和所有角色
const loadUserRolesAndAllRoles = async (userId: number) => {
  roleLoading.value = true
  try {
    // 并行获取用户当前角色和所有角色
    const [userRolesResponse, allRolesResponse] = await Promise.all([
      permissionApi.getUserRoles(userId),
      roleApi.getAllRoles()
    ])
    
    currentUserRoles.value = userRolesResponse.data
    allRoles.value = allRolesResponse.data
    
    // 转换为 Transfer 组件需要的数据格式
    transferData.value = allRoles.value.map(role => ({
      key: role.id,
      label: role.name,
      comment: role.comment
    }))
    
    // 设置已选中的角色ID
    selectedRoleIds.value = currentUserRoles.value.map(role => role.id)
  } catch (error: any) {
    console.error('加载角色数据失败:', error)
    ElMessage.error(error.message || '加载角色数据失败，请重试')
  } finally {
    roleLoading.value = false
  }
}

// 保存角色设置
const handleSaveRoles = async () => {
  if (!currentUser.value) return
  
  try {
    roleSaving.value = true
    
    const assignData: AssignUserRoleDto = {
      userId: Number(currentUser.value.id),
      roleIds: selectedRoleIds.value
    }
    
    await permissionApi.assignUserRoles(assignData)
    ElMessage.success('角色设置成功')
    roleDialogVisible.value = false
  } catch (error: any) {
    console.error('设置角色失败:', error)
    ElMessage.error(error.message || '设置角色失败，请重试')
  } finally {
    roleSaving.value = false
  }
}
</script>

<style scoped>
.user-manage {
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

/* 角色设置对话框样式 */
.role-info {
  margin-bottom: 16px;
}

.role-info p {
  margin: 8px 0;
  color: var(--el-text-color-regular);
}

.role-transfer {
  display: flex;
  justify-content: center;
  margin: 20px 0;
  width: 100%;
  overflow-x: auto;
}

.transfer-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.role-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.role-comment {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-top: 2px;
  line-height: 1.2;
}

:deep(.el-transfer) {
  text-align: center;
}

:deep(.el-transfer-panel) {
  width: 350px;
}

:deep(.el-transfer-panel__item) {
  height: auto;
  padding: 8px 12px;
}

:deep(.el-transfer-panel__item .el-checkbox__label) {
  width: 100%;
  text-align: left;
}
</style>