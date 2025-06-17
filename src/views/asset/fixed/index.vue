<template>
  <div class="asset-manage">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        :inline="true"
        class="search-form"
      >
        <el-form-item label="资产名称" prop="name">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入资产名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="所属组织" prop="orgId">
          <OrgSelect
            v-model="searchForm.orgId"
            placeholder="请选择组织"
            width="200px"
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
          <span>固定资产列表</span>
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
              新增资产
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
          label="资产ID" 
          width="80" 
        />
        <el-table-column 
          v-if="getColumnVisible('name')" 
          prop="name" 
          label="资产名称" 
          min-width="200" 
          show-overflow-tooltip
        />
        <el-table-column 
          v-if="getColumnVisible('orgName')" 
          prop="orgNameAbbr" 
          label="所属组织" 
          min-width="150" 
        />
        <el-table-column 
          v-if="getColumnVisible('createBy')" 
          prop="createBy" 
          label="创建人" 
          width="100" 
        />
        <el-table-column 
          v-if="getColumnVisible('createTime')" 
          prop="createTime" 
          label="创建时间" 
          width="160" 
        />
        <el-table-column 
          v-if="getColumnVisible('updateBy')" 
          prop="updateBy" 
          label="更新人" 
          width="100" 
        />
        <el-table-column 
          v-if="getColumnVisible('updateTime')" 
          prop="updateTime" 
          label="更新时间" 
          width="160" 
        />
        <el-table-column label="操作" width="120" fixed="right">
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

    <!-- 新增资产对话框 -->
    <CreateAssetDialog
      v-model:visible="createDialogVisible"
      @success="handleCreateSuccess"
    />

    <!-- 编辑资产对话框 -->
    <EditAssetDialog
      v-model:visible="editDialogVisible"
      :asset-data="selectedAsset"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
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
import type { FormInstance } from 'element-plus'
import { assetApi } from '@/api/modules/asset'
import OrgSelect from '@/components/OrgSelect.vue'
import CreateAssetDialog from './components/CreateAssetDialog.vue'
import EditAssetDialog from './components/EditAssetDialog.vue'

// 组件引用
const searchFormRef = ref<FormInstance>()

// 响应式数据
const tableLoading = ref(false)
const tableData = ref<AssetFixedResponseDto[]>([])
const createDialogVisible = ref(false)
const editDialogVisible = ref(false)
const selectedAsset = ref<AssetFixedResponseDto | null>(null)

// 搜索表单
const searchForm = reactive<Partial<QueryAssetFixedDto>>({
  name: '',
  orgId: null
})

// 分页配置
const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0
})

// 列配置
const columnConfig = ref([
  { key: 'id', label: 'ID', visible: false },
  { key: 'name', label: '资产名称', visible: true },
  { key: 'orgName', label: '所属组织', visible: true },
  { key: 'createBy', label: '创建人', visible: true },
  { key: 'createTime', label: '创建时间', visible: true },
  { key: 'updateBy', label: '更新人', visible: false },
  { key: 'updateTime', label: '更新时间', visible: false }
])

// 获取列是否可见
const getColumnVisible = (key: string) => {
  const column = columnConfig.value.find(col => col.key === key)
  return column ? column.visible : true
}

// 切换列显示
const toggleColumn = (key: string, visible: boolean) => {
  const column = columnConfig.value.find(col => col.key === key)
  if (column) {
    column.visible = visible
  }
}

// 加载表格数据
const loadTableData = async () => {
  try {
    tableLoading.value = true
    
    const params: QueryAssetFixedDto = {
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    
    const response = await assetApi.searchAssetFixed(params)
    
    tableData.value = response.data.rows || []
    pagination.total = response.data.total || 0
  } catch (error) {
    console.error('加载资产数据失败:', error)
    ElMessage.error('加载数据失败，请重试')
  } finally {
    tableLoading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNo = 1
  loadTableData()
}

// 重置搜索
const handleReset = () => {
  searchFormRef.value?.resetFields()
  Object.assign(searchForm, {
    name: '',
    orgId: null
  })
  pagination.pageNo = 1
  loadTableData()
}

// 新增资产
const handleCreate = () => {
  createDialogVisible.value = true
}

// 新增成功回调
const handleCreateSuccess = () => {
  loadTableData()
}

// 编辑成功回调
const handleEditSuccess = () => {
  loadTableData()
}

// 命令处理
const handleCommand = (command: string, row: AssetFixedResponseDto) => {
  switch (command) {
    case 'edit':
      handleEdit(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

// 编辑资产
const handleEdit = (row: AssetFixedResponseDto) => {
  selectedAsset.value = row
  editDialogVisible.value = true
}

// 删除资产
const handleDelete = async (row: AssetFixedResponseDto) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除资产 "${row.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await assetApi.removeAssetFixed(row.id)
    ElMessage.success('删除成功')
    loadTableData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除资产失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  }
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.pageNo = 1
  loadTableData()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
  pagination.pageNo = page
  loadTableData()
}

// 组件挂载时加载数据
onMounted(() => {
  loadTableData()
})
</script>

<style scoped>
.asset-manage {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: -18px;
}

.table-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.column-item {
  padding: 8px 12px;
}

.column-item:hover {
  background-color: var(--el-fill-color-light);
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-table__header) {
  font-weight: 600;
}

/* 启用表格内容的文本选择 */
:deep(.el-table__body) {
  user-select: text;
}

:deep(.el-table__body td) {
  user-select: text;
}

:deep(.el-table__body .cell) {
  user-select: text;
}
</style> 