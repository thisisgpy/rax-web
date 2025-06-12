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
                      @change="(value) => toggleColumn(column.key, value)"
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
          prop="orgName" 
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
                  <el-dropdown-item command="resetPassword" :icon="Key">
                    重置密码
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
      :title="isEditMode ? '编辑用户' : '新增用户'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="用户名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入用户名称"
            maxlength="64"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="手机号" prop="mobile">
          <el-input
            v-model="formData.mobile"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </el-form-item>
        
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="formData.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="身份证号" prop="idCard">
          <el-input
            v-model="formData.idCard"
            placeholder="请输入身份证号"
            maxlength="18"
          />
        </el-form-item>
        
        <el-form-item label="所属组织" prop="orgId">
          <OrgSelect
            v-model="formData.orgId"
            placeholder="请选择所属组织"
            width="100%"
          />
        </el-form-item>
        
        <el-form-item v-if="!isEditMode" label="初始密码" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入初始密码"
            show-password
            maxlength="32"
          />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Edit,
  Delete,
  Key,
  ArrowDown,
  SwitchFilled
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { userApi } from '@/api/modules/user'
import { orgApi } from '@/api/modules/org'

// 组件引用
const searchFormRef = ref<FormInstance>()
const formRef = ref<FormInstance>()

// 响应式数据
const tableLoading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const isEditMode = ref(false)
const tableData = ref<SysUser[]>([])

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

// 表单数据
const formData = reactive<CreateUserDto & UpdateUserDto>({
  id: 0,
  name: '',
  mobile: '',
  gender: '男',
  idCard: '',
  orgId: 0,
  password: '',
  status: 1
})



// 表单验证规则
const formRules = computed((): FormRules => ({
  name: [
    { required: true, message: '请输入用户名称', trigger: 'blur' },
    { min: 2, max: 64, message: '长度在 2 到 64 个字符', trigger: 'blur' }
  ],
  mobile: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
  ],
  orgId: [
    { required: true, message: '请选择所属组织', trigger: 'change' }
  ],
  password: !isEditMode.value ? [
    { required: true, message: '请输入初始密码', trigger: 'blur' },
    { min: 6, max: 32, message: '长度在 6 到 32 个字符', trigger: 'blur' }
  ] : [],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}))

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
    tableData.value = data.rows
    pagination.total = data.total

    // 补充组织名称 - 现在通过单独的API调用获取
    for (const user of tableData.value) {
      if (user.orgId) {
        try {
          const orgResponse = await orgApi.getOrgById(user.orgId)
          user.orgName = orgResponse.data?.name || '未知组织'
        } catch {
          user.orgName = '未知组织'
        }
      } else {
        user.orgName = '未分配'
      }
    }
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
    localStorage.setItem('userManageColumns', JSON.stringify(columnConfig.value))
  }
}

// 处理表格操作下拉菜单命令
const handleCommand = (command: string, row: SysUser) => {
  switch (command) {
    case 'edit':
      handleEdit(row)
      break
    case 'resetPassword':
      handleResetPassword(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

// 编辑用户
const handleEdit = (row: SysUser) => {
  isEditMode.value = true
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    mobile: row.mobile,
    gender: row.gender,
    idCard: row.idCard,
    orgId: row.orgId,
    status: row.status
  })
  dialogVisible.value = true
}

// 删除用户
const handleDelete = async (row: SysUser) => {
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
const handleResetPassword = async (row: SysUser) => {
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

// 保存
const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true
    
    if (isEditMode.value) {
      // 编辑模式下排除 password 字段
      const { password, ...updateData } = formData
      await userApi.updateUser(updateData as UpdateUserDto)
      ElMessage.success('更新成功')
    } else {
      await userApi.createUser(formData as CreateUserDto)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    fetchUserList()
  } catch (error: any) {
    if (error !== 'validation-failed') {
      console.error('保存用户失败:', error)
      ElMessage.error(error.message || '保存用户失败，请重试')
    }
  } finally {
    saving.value = false
  }
}

// 重置表单数据
const resetFormData = () => {
  Object.assign(formData, {
    id: undefined,
    name: '',
    mobile: '',
    gender: '男',
    idCard: '',
    orgId: undefined,
    password: '',
    status: 1
  })
  formRef.value?.resetFields()
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

.dialog-footer {
  text-align: right;
}

:deep(.el-table .cell) {
  word-break: break-word;
}
</style>