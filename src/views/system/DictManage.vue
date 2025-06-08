<template>
  <div class="dict-manage">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>数据字典管理</h2>
    </div>

    <!-- 主内容区 -->
    <el-row :gutter="20" class="main-content">
      <!-- 左侧：字典列表 -->
      <el-col :span="16">
        <el-card class="dict-list-card">
          <template #header>
            <div class="card-header">
              <span>字典列表</span>
              <el-button type="primary" :icon="Plus" @click="handleCreateDict">
                新增字典
              </el-button>
            </div>
          </template>

          <!-- 搜索区域 -->
          <div class="search-section">
            <el-form :model="searchForm" class="search-form">
              <el-row :gutter="16">
                <el-col :xl="8" :lg="8" :md="12" :sm="24" :xs="24">
                  <el-form-item label="字典编码">
                    <el-input 
                      v-model="searchForm.code" 
                      placeholder="请输入字典编码"
                      clearable
                      @keyup.enter="handleSearch"
                    />
                  </el-form-item>
                </el-col>
                <el-col :xl="8" :lg="8" :md="12" :sm="24" :xs="24">
                  <el-form-item label="字典名称">
                    <el-input 
                      v-model="searchForm.name" 
                      placeholder="请输入字典名称"
                      clearable
                      @keyup.enter="handleSearch"
                    />
                  </el-form-item>
                </el-col>
                <el-col :xl="8" :lg="8" :md="24" :sm="24" :xs="24">
                  <el-form-item label="状态">
                    <el-select 
                      v-model="searchForm.isEnabled" 
                      placeholder="请选择状态" 
                      clearable
                      style="width: 100%"
                    >
                      <el-option label="启用" :value="true" />
                      <el-option label="禁用" :value="false" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item class="search-buttons">
                    <el-button type="primary" :icon="Search" @click="handleSearch">
                      搜索
                    </el-button>
                    <el-button :icon="Refresh" @click="handleResetSearch">
                      重置
                    </el-button>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>

          <!-- 字典表格 -->
          <el-table 
            :data="dictList" 
            :loading="dictLoading"
            @current-change="handleDictSelect"
            highlight-current-row
            height="500"
            empty-text="暂无字典数据"
          >
            <el-table-column prop="code" label="字典编码" width="150" show-overflow-tooltip />
            <el-table-column prop="name" label="字典名称" width="120" show-overflow-tooltip />
            <el-table-column prop="comment" label="备注" min-width="100" show-overflow-tooltip />
            <el-table-column prop="isEnabled" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.isEnabled ? 'success' : 'danger'">
                  {{ row.isEnabled ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="160" />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button 
                  text 
                  type="primary" 
                  :icon="Edit"
                  @click="handleEditDict(row)"
                >
                  编辑
                </el-button>
                <el-button 
                  text 
                  type="danger" 
                  :icon="Delete"
                  @click="handleDeleteDict(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>



          <!-- 分页 -->
          <div class="pagination-section">
            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="pagination.pageNo"
                v-model:page-size="pagination.pageSize"
                :total="Math.max(pagination.total, 0)"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                background
                @size-change="handleSearch"
                @current-change="handleSearch"
              />
            </div>

          </div>
        </el-card>
      </el-col>

      <!-- 右侧：字典项管理 -->
      <el-col :span="8">
        <el-card class="dict-item-card">
          <template #header>
            <div class="card-header">
              <span>
                字典项管理
                <span v-if="selectedDict" class="selected-dict">
                  - {{ selectedDict.name }}（{{ selectedDict.code }}）
                </span>
              </span>
              <el-button 
                v-if="selectedDict"
                type="primary" 
                :icon="Plus" 
                @click="handleCreateItem"
              >
                新增字典项
              </el-button>
            </div>
          </template>



          <!-- 字典项内容 -->
          <div v-if="selectedDict" class="dict-item-content">
            <!-- 字典项树 -->
            <el-tree
              ref="itemTreeRef"
              :data="dictItemTree"
              :props="itemTreeProps"
              :loading="itemLoading"
              :default-expand-all="true"
              node-key="id"
              class="dict-item-tree"
            >
              <template #default="{ data }">
                <div class="tree-node">
                  <span class="node-label">
                    {{ data.label }}
                    <span class="node-value">（{{ data.value }}）</span>
                    <el-tag 
                      v-if="!data.isEnabled" 
                      type="danger" 
                      size="small" 
                      class="disabled-tag"
                    >
                      禁用
                    </el-tag>
                  </span>
                  <span class="node-actions">
                    <el-button 
                      text 
                      size="small" 
                      :icon="Plus"
                      @click.stop="handleCreateChildItem(data)"
                      title="添加子项"
                    />
                    <el-button 
                      text 
                      size="small" 
                      :icon="Edit"
                      @click.stop="handleEditItem(data)"
                      title="编辑"
                    />
                    <el-button 
                      text 
                      size="small" 
                      :icon="Delete"
                      @click.stop="handleDeleteItem(data)"
                      title="删除"
                    />
                  </span>
                </div>
              </template>
            </el-tree>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <el-empty description="请先在左侧字典列表中点击选择一个字典，然后就可以管理字典项了" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 字典编辑弹窗 -->
    <el-dialog
      v-model="dictDialogVisible"
      :title="dictDialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="dictFormRef"
        :model="dictForm"
        :rules="dictRules"
        label-width="100px"
      >
        <el-form-item label="字典编码" prop="code">
          <el-input 
            v-model="dictForm.code" 
            placeholder="请输入字典编码"
            :disabled="!isCreatingDict"
            maxlength="64"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="字典名称" prop="name">
          <el-input 
            v-model="dictForm.name" 
            placeholder="请输入字典名称"
            maxlength="64"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="字典备注" prop="comment">
          <el-input 
            v-model="dictForm.comment" 
            type="textarea"
            placeholder="请输入字典备注"
            :rows="3"
            maxlength="128"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="是否启用" prop="isEnabled">
          <el-switch v-model="dictForm.isEnabled" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dictDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="dictSaving" @click="handleSaveDict">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 字典项编辑弹窗 -->
    <el-dialog
      v-model="itemDialogVisible"
      :title="itemDialogTitle"
      width="600px"
      :close-on-click-modal="false"
      :z-index="3000"
    >
      <el-form
        ref="itemFormRef"
        :model="itemForm"
        :rules="itemRules"
        label-width="100px"
      >
        <el-form-item label="字典项标签" prop="label">
          <el-input 
            v-model="itemForm.label" 
            placeholder="请输入字典项标签"
            maxlength="64"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="字典项值" prop="value">
          <el-input 
            v-model="itemForm.value" 
            placeholder="请输入字典项值"
            maxlength="64"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="父级字典项" prop="parentId">
          <el-select
            v-model="itemForm.parentId"
            placeholder="请选择父级字典项（空表示顶级）"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="item in flattenDictItems"
              :key="item.id"
              :label="item.label"
              :value="item.id"
              :disabled="item.id === itemForm.id"
            >
              <span>{{ item.indentLabel }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序号" prop="sort">
          <el-input-number 
            v-model="itemForm.sort" 
            :min="0"
            :max="9999"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="字典项备注" prop="comment">
          <el-input 
            v-model="itemForm.comment" 
            type="textarea"
            placeholder="请输入字典项备注"
            :rows="3"
            maxlength="128"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="是否启用" prop="isEnabled">
          <el-switch v-model="itemForm.isEnabled" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="itemDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="itemSaving" @click="handleSaveItem">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElTree } from 'element-plus'
import { Plus, Edit, Delete, Search, Refresh } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { dictApi } from '@/api/modules/dict'
import { useErrorHandler } from '@/composables/useErrorHandler'

// 错误处理
const { handleAsyncOperation, handleDeleteOperation } = useErrorHandler()

// 组件引用
const dictFormRef = ref<FormInstance>()
const itemFormRef = ref<FormInstance>()
const itemTreeRef = ref<InstanceType<typeof ElTree>>()

// 响应式数据
const dictLoading = ref(false)
const itemLoading = ref(false)
const dictSaving = ref(false)
const itemSaving = ref(false)

// 字典相关
const dictList = ref<SysDict[]>([])
const selectedDict = ref<SysDict | null>(null)
const dictDialogVisible = ref(false)
const isCreatingDict = ref(false)

// 字典项相关
const dictItemTree = ref<DictItemTreeDto[]>([])
const itemDialogVisible = ref(false)
const isCreatingItem = ref(false)

// 搜索表单
const searchForm = reactive<QueryDictDto>({
  pageNo: 1,
  pageSize: 20,
  code: '',
  name: '',
  isEnabled: undefined
})

// 分页信息
const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0
})

// 字典表单
const dictForm = reactive<CreateDictDto & { id?: number }>({
  code: '',
  name: '',
  comment: '',
  isEnabled: true
})

// 字典项表单
const itemForm = reactive<CreateDictItemDto & { id?: number }>({
  dictId: 0,
  dictCode: '',
  label: '',
  value: '',
  comment: '',
  sort: 0,
  parentId: 0,
  isEnabled: true
})

// 计算属性
const dictDialogTitle = computed(() => isCreatingDict.value ? '新增字典' : '编辑字典')
const itemDialogTitle = computed(() => isCreatingItem.value ? '新增字典项' : '编辑字典项')

// 扁平化字典项数据，用于父级选择下拉框
const flattenDictItems = computed(() => {
  const flatten = (items: DictItemTreeDto[], level = 0): Array<{
    id: number
    label: string
    indentLabel: string
  }> => {
    const result: Array<{
      id: number
      label: string
      indentLabel: string
    }> = []
    
    items.forEach(item => {
      const indent = '　'.repeat(level) // 使用全角空格进行缩进
      result.push({
        id: item.id,
        label: item.label,
        indentLabel: `${indent}${item.label}`
      })
      
      if (item.children && item.children.length > 0) {
        result.push(...flatten(item.children, level + 1))
      }
    })
    
    return result
  }
  
  return flatten(dictItemTree.value)
})

// 树组件配置
const itemTreeProps = {
  children: 'children',
  label: 'label'
}



// 表单验证规则
const dictRules: FormRules = {
  code: [
    { required: true, message: '请输入字典编码', trigger: 'blur' },
    { min: 1, max: 64, message: '字典编码长度为1-64个字符', trigger: 'blur' },
    { pattern: /^[A-Z][A-Z0-9_]*$/, message: '字典编码必须以大写字母开头，只能包含大写字母、数字和下划线', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入字典名称', trigger: 'blur' },
    { min: 1, max: 64, message: '字典名称长度为1-64个字符', trigger: 'blur' }
  ],
  comment: [
    { max: 128, message: '字典备注不能超过128个字符', trigger: 'blur' }
  ]
}

const itemRules: FormRules = {
  label: [
    { required: true, message: '请输入字典项标签', trigger: 'blur' },
    { min: 1, max: 64, message: '字典项标签长度为1-64个字符', trigger: 'blur' }
  ],
  value: [
    { required: true, message: '请输入字典项值', trigger: 'blur' },
    { min: 1, max: 64, message: '字典项值长度为1-64个字符', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序号', trigger: 'blur' },
    { type: 'number', min: 0, max: 9999, message: '排序号必须在0-9999之间', trigger: 'blur' }
  ],
  comment: [
    { max: 128, message: '字典项备注不能超过128个字符', trigger: 'blur' }
  ]
}

// 获取字典列表
const fetchDictList = async () => {
  dictLoading.value = true
  const result = await handleAsyncOperation(
    () => dictApi.getDictList({
      ...searchForm,
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize
    }),
    '获取字典列表'
  )

  if (result.success) {
    // 兼容不同的数据结构
    const responseData = result.data.data
    if (responseData.rows) {
      // 标准分页格式
      dictList.value = responseData.rows || []
      pagination.total = responseData.total || 0
    } else if (responseData.list) {
      // 备选分页格式
      dictList.value = responseData.list || []
      pagination.total = responseData.total || 0
    } else if (Array.isArray(responseData)) {
      // 直接数组格式
      dictList.value = responseData
      pagination.total = responseData.length
    } else {
      dictList.value = []
      pagination.total = 0
    }
    

  }
  dictLoading.value = false
}

// 获取字典项树
const fetchDictItemTree = async (dictCode: string) => {
  if (!dictCode) return
  
  itemLoading.value = true
  const result = await handleAsyncOperation(
    () => dictApi.getDictItemTreeByCode(dictCode, false),
    '获取字典项树'
  )

  if (result.success) {
    dictItemTree.value = result.data.data.children || []
  } else {
    dictItemTree.value = []
  }
  itemLoading.value = false
}

// 搜索
const handleSearch = () => {
  pagination.pageNo = searchForm.pageNo
  pagination.pageSize = searchForm.pageSize
  fetchDictList()
}

// 重置搜索
const handleResetSearch = () => {
  Object.assign(searchForm, {
    pageNo: 1,
    pageSize: 20,
    code: '',
    name: '',
    isEnabled: undefined
  })
  pagination.pageNo = 1
  pagination.pageSize = 20
  fetchDictList()
}

// 选择字典
const handleDictSelect = (dict: SysDict | null) => {
  selectedDict.value = dict
  if (dict) {
    fetchDictItemTree(dict.code)
  } else {
    dictItemTree.value = []
  }
}

// 新增字典
const handleCreateDict = () => {
  isCreatingDict.value = true
  dictDialogVisible.value = true
  resetDictForm()
}

// 编辑字典
const handleEditDict = (dict: SysDict) => {
  isCreatingDict.value = false
  dictDialogVisible.value = true
  Object.assign(dictForm, {
    id: dict.id,
    code: dict.code,
    name: dict.name,
    comment: dict.comment || '',
    isEnabled: dict.isEnabled
  })
}

// 删除字典
const handleDeleteDict = async (dict: SysDict) => {
  const success = await handleDeleteOperation(
    dict.name,
    () => dictApi.removeDict(dict.id),
    {
      title: '删除字典确认',
      successMessage: '字典删除成功'
    }
  )

  if (success) {
    // 如果删除的是当前选中的字典，清空选择
    if (selectedDict.value?.id === dict.id) {
      selectedDict.value = null
      dictItemTree.value = []
    }
    await fetchDictList()
  }
}

// 保存字典
const handleSaveDict = async () => {
  if (!dictFormRef.value) return

  try {
    await dictFormRef.value.validate()
    dictSaving.value = true

    if (isCreatingDict.value) {
      const result = await handleAsyncOperation(
        () => dictApi.createDict({
          code: dictForm.code,
          name: dictForm.name,
          comment: dictForm.comment,
          isEnabled: dictForm.isEnabled
        }),
        '创建字典'
      )

      if (result.success) {
        ElMessage.success('字典创建成功')
        dictDialogVisible.value = false
        await fetchDictList()
      }
    } else {
      const result = await handleAsyncOperation(
        () => dictApi.updateDict({
          id: dictForm.id!,
          name: dictForm.name,
          comment: dictForm.comment,
          isEnabled: dictForm.isEnabled
        }),
        '更新字典'
      )

      if (result.success) {
        ElMessage.success('字典更新成功')
        dictDialogVisible.value = false
        await fetchDictList()
        
        // 更新选中的字典信息
        if (selectedDict.value && selectedDict.value.id === dictForm.id) {
          selectedDict.value.name = dictForm.name
          selectedDict.value.comment = dictForm.comment
          selectedDict.value.isEnabled = dictForm.isEnabled
        }
      }
    }
  } catch (error) {
    // 表单验证失败
  } finally {
    dictSaving.value = false
  }
}

// 新增字典项
const handleCreateItem = () => {
  if (!selectedDict.value) {
    ElMessage.warning('请先选择一个字典')
    return
  }
  
  isCreatingItem.value = true
  itemDialogVisible.value = true
  
  resetItemForm()
  itemForm.dictId = selectedDict.value.id
  itemForm.dictCode = selectedDict.value.code
}

// 新增子字典项
const handleCreateChildItem = (parentItem: DictItemTreeDto) => {
  if (!selectedDict.value) return
  
  isCreatingItem.value = true
  itemDialogVisible.value = true
  resetItemForm()
  itemForm.dictId = selectedDict.value.id
  itemForm.dictCode = selectedDict.value.code
  itemForm.parentId = parentItem.id
}

// 编辑字典项
const handleEditItem = async (item: DictItemTreeDto) => {
  if (!selectedDict.value) return

  const result = await handleAsyncOperation(
    () => dictApi.getDictItemById(item.id),
    '获取字典项详情'
  )

  if (result.success) {
    const itemDetail = result.data.data
    isCreatingItem.value = false
    itemDialogVisible.value = true
    Object.assign(itemForm, {
      id: itemDetail.id,
      dictId: itemDetail.dictId,
      dictCode: itemDetail.dictCode,
      label: itemDetail.label,
      value: itemDetail.value,
      comment: itemDetail.comment || '',
      sort: itemDetail.sort,
      parentId: itemDetail.parentId,
      isEnabled: itemDetail.isEnabled
    })
  }
}

// 删除字典项
const handleDeleteItem = async (item: DictItemTreeDto) => {
  const success = await handleDeleteOperation(
    item.label,
    () => dictApi.removeDictItem(item.id),
    {
      title: '删除字典项确认',
      successMessage: '字典项删除成功'
    }
  )

  if (success && selectedDict.value) {
    await fetchDictItemTree(selectedDict.value.code)
  }
}

// 保存字典项
const handleSaveItem = async () => {
  if (!itemFormRef.value || !selectedDict.value) return

  try {
    await itemFormRef.value.validate()
    itemSaving.value = true

    if (isCreatingItem.value) {
      const result = await handleAsyncOperation(
        () => dictApi.createDictItem({
          dictId: itemForm.dictId,
          dictCode: itemForm.dictCode,
          label: itemForm.label,
          value: itemForm.value,
          comment: itemForm.comment,
          sort: itemForm.sort,
          parentId: itemForm.parentId || 0,
          isEnabled: itemForm.isEnabled
        }),
        '创建字典项'
      )

      if (result.success) {
        ElMessage.success('字典项创建成功')
        itemDialogVisible.value = false
        await fetchDictItemTree(selectedDict.value.code)
      }
    } else {
      const result = await handleAsyncOperation(
        () => dictApi.updateDictItem({
          id: itemForm.id!,
          label: itemForm.label,
          value: itemForm.value,
          comment: itemForm.comment,
          sort: itemForm.sort,
          parentId: itemForm.parentId || 0,
          isEnabled: itemForm.isEnabled
        }),
        '更新字典项'
      )

      if (result.success) {
        ElMessage.success('字典项更新成功')
        itemDialogVisible.value = false
        await fetchDictItemTree(selectedDict.value.code)
      }
    }
  } catch (error) {
    // 表单验证失败
  } finally {
    itemSaving.value = false
  }
}

// 重置字典表单
const resetDictForm = () => {
  Object.assign(dictForm, {
    id: undefined,
    code: '',
    name: '',
    comment: '',
    isEnabled: true
  })
  dictFormRef.value?.clearValidate()
}

// 重置字典项表单
const resetItemForm = () => {
  Object.assign(itemForm, {
    id: undefined,
    dictId: 0,
    dictCode: '',
    label: '',
    value: '',
    comment: '',
    sort: 0,
    parentId: 0,
    isEnabled: true
  })
  itemFormRef.value?.clearValidate()
}

// 页面初始化
onMounted(() => {
  fetchDictList()
})
</script>

<style scoped>
.dict-manage {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.main-content {
  min-height: 800px;
}

.dict-list-card,
.dict-item-card {
  height: 800px;
}

.dict-list-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  height: calc(100% - 60px);
}

.dict-list-card .search-section {
  flex-shrink: 0;
}

.dict-list-card .el-table {
  flex: 1;
  overflow: auto;
}

.dict-list-card .pagination-section {
  flex-shrink: 0;
  padding-top: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-dict {
  color: #909399;
  font-size: 14px;
  font-weight: normal;
}

.search-section {
  margin-bottom: 20px;
}

.search-form .el-form-item {
  margin-bottom: 18px;
}

.search-buttons {
  text-align: left;
  margin-top: 8px;
}

.search-buttons .el-button {
  margin-right: 12px;
}

.pagination-section {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 50px;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}

.dict-item-content {
  height: calc(100% - 60px);
  overflow: auto;
}

.dict-item-tree {
  padding: 16px;
}

.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-right: 8px;
}

.node-label {
  flex: 1;
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-value {
  color: #909399;
  font-size: 0.9em;
}

.disabled-tag {
  margin-left: 4px;
}

.node-actions {
  display: none;
  gap: 4px;
}

.tree-node:hover .node-actions {
  display: flex;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 400px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content .el-col {
    margin-bottom: 20px;
  }
  
  .dict-list-card,
  .dict-item-card {
    height: auto;
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .search-section .el-col {
    margin-bottom: 10px;
  }
  
  .search-buttons {
    text-align: center;
  }
  
  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .main-content .el-col {
    margin-bottom: 20px;
  }
}

/* 响应式布局已通过 Element Plus 的 col 组件实现 */
</style> 