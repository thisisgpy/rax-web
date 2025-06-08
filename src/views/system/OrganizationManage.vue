<template>
  <div class="organization-manage">


    <!-- 主内容区 -->
    <el-row :gutter="20" class="main-content">
      <!-- 左侧：组织树 -->
      <el-col :span="10">
        <el-card class="tree-card">
          <template #header>
            <div class="card-header">
              <span>组织架构</span>
              <div class="header-buttons">
                <el-button 
                  type="primary" 
                  :icon="Plus" 
                  @click="handleCreate"
                  size="small"
                >
                  新增组织
                </el-button>
                <el-button 
                  text 
                  :icon="Refresh" 
                  @click="fetchOrgTrees"
                  :loading="treeLoading"
                  size="small"
                >
                  刷新
                </el-button>
              </div>
            </div>
          </template>
          
          <el-tree
            ref="treeRef"
            :data="orgTreeData"
            :props="treeProps"
            :default-expand-all="true"
            :expand-on-click-node="false"
            node-key="id"
            class="org-tree"
            @node-click="handleNodeClick"
          >
            <template #default="{ data }">
              <div class="tree-node">
                <span class="node-label">
                  {{ data.name }}
                  <span v-if="data.nameAbbr" class="node-abbr">（{{ data.nameAbbr }}）</span>
                </span>
              </div>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <!-- 右侧：详情/编辑表单 -->
      <el-col :span="14">
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <span>{{ isEditing ? '编辑组织' : '组织详情' }}</span>
              <div v-if="selectedOrg && !isEditing">
                <el-button :icon="Edit" @click="handleEdit(selectedOrg)">
                  编辑
                </el-button>
                <el-button 
                  type="danger" 
                  :icon="Delete" 
                  @click="handleDelete(selectedOrg)"
                  :disabled="selectedOrg.children && selectedOrg.children.length > 0"
                >
                  删除
                </el-button>
                <el-button 
                  type="primary" 
                  :icon="Plus" 
                  @click="handleCreateChild(selectedOrg)"
                >
                  添加子组织
                </el-button>
              </div>
            </div>
          </template>

          <!-- 详情显示 -->
          <div v-if="selectedOrg && !isEditing" class="org-detail">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="组织编码">
                {{ selectedOrg.code }}
              </el-descriptions-item>
              <el-descriptions-item label="组织名称">
                {{ selectedOrg.name }}
              </el-descriptions-item>
              <el-descriptions-item label="组织简称">
                {{ selectedOrg.nameAbbr }}
              </el-descriptions-item>
              <el-descriptions-item label="父级组织ID">
                {{ selectedOrg.parentId }}
              </el-descriptions-item>
              <el-descriptions-item label="组织备注" :span="2">
                {{ selectedOrg.comment || '无' }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 编辑表单 -->
          <el-form
            v-if="isEditing"
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="120px"
            class="org-form"
          >
            <el-form-item label="组织名称" prop="name">
              <el-input 
                v-model="formData.name" 
                placeholder="请输入组织名称"
                maxlength="64"
                show-word-limit
              />
            </el-form-item>
            
            <el-form-item label="组织简称" prop="nameAbbr">
              <el-input 
                v-model="formData.nameAbbr" 
                placeholder="请输入组织简称"
                maxlength="64"
                show-word-limit
              />
            </el-form-item>
            
            <el-form-item label="父级组织" prop="parentId">
              <el-tree-select
                v-model="formData.parentId"
                :data="orgTreeData"
                :props="treeSelectProps"
                placeholder="请选择父级组织"
                check-strictly
                :default-expand-all="true"
                style="width: 100%"
              />
            </el-form-item>
            
            <el-form-item label="组织备注" prop="comment">
              <el-input 
                v-model="formData.comment" 
                type="textarea"
                placeholder="请输入组织备注"
                :rows="3"
                maxlength="128"
                show-word-limit
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleSave" :loading="saving">
                保存
              </el-button>
              <el-button @click="handleCancel">
                取消
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 空状态 -->
          <div v-if="!selectedOrg && !isEditing" class="empty-state">
            <el-empty description="请选择一个组织查看详情" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, ElTree } from 'element-plus'
import { Plus, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { orgApi } from '@/api/modules/org'

// 组件引用
const treeRef = ref<InstanceType<typeof ElTree>>()
const formRef = ref<FormInstance>()

// 响应式数据
const treeLoading = ref(false)
const saving = ref(false)
const isEditing = ref(false)
const isCreating = ref(false)
const orgTreeData = ref<OrgTreeDto[]>([])
const selectedOrg = ref<OrgTreeDto | null>(null)

// 表单数据
const formData = reactive<CreateOrgDto & { id?: number }>({
  name: '',
  nameAbbr: '',
  comment: '',
  parentId: 0
})

// 树形组件配置
const treeProps = {
  children: 'children',
  label: 'name'
}

// 树选择器配置
const treeSelectProps = {
  children: 'children',
  label: 'name',
  value: 'id'
}

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入组织名称', trigger: 'blur' },
    { min: 1, max: 64, message: '组织名称长度为1-64个字符', trigger: 'blur' }
  ],
  nameAbbr: [
    { required: true, message: '请输入组织简称', trigger: 'blur' },
    { min: 1, max: 64, message: '组织简称长度为1-64个字符', trigger: 'blur' }
  ],
  parentId: [
    { required: true, message: '请选择父级组织', trigger: 'change' }
  ],
  comment: [
    { max: 128, message: '组织备注不能超过128个字符', trigger: 'blur' }
  ]
}

// 获取组织树数据
const fetchOrgTrees = async () => {
  treeLoading.value = true
  try {
    const response = await orgApi.getAllOrgTrees()
    orgTreeData.value = response.data
  } catch (error: any) {
    console.error('获取组织树失败:', error)
    ElMessage.error(error.message || '获取组织树失败，请重试')
  } finally {
    treeLoading.value = false
  }
}

// 获取组织详情
const fetchOrgDetail = async (id: number) => {
  try {
    const response = await orgApi.getOrgById(id)
    selectedOrg.value = { ...response.data, children: [] }
  } catch (error: any) {
    console.error('获取组织详情失败:', error)
    ElMessage.error(error.message || '获取组织详情失败，请重试')
  }
}

// 处理树节点点击
const handleNodeClick = (data: OrgTreeDto) => {
  if (isEditing.value) {
    ElMessageBox.confirm('当前正在编辑，是否放弃修改？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      selectedOrg.value = data
      isEditing.value = false
      resetForm()
    }).catch(() => {
      // 用户取消，恢复树选中状态
      nextTick(() => {
        if (selectedOrg.value) {
          treeRef.value?.setCurrentKey(selectedOrg.value.id)
        }
      })
    })
  } else {
    selectedOrg.value = data
    fetchOrgDetail(data.id)
  }
}

// 新增组织
const handleCreate = () => {
  selectedOrg.value = null
  isEditing.value = true
  isCreating.value = true
  resetForm()
}

// 新增子组织
const handleCreateChild = (parentOrg: OrgTreeDto) => {
  selectedOrg.value = null
  isEditing.value = true
  isCreating.value = true
  resetForm()
  formData.parentId = parentOrg.id
}

// 编辑组织
const handleEdit = (org: OrgTreeDto) => {
  selectedOrg.value = org
  isEditing.value = true
  isCreating.value = false
  
  // 填充表单数据
  formData.id = org.id
  formData.name = org.name
  formData.nameAbbr = org.nameAbbr
  formData.comment = org.comment || ''
  formData.parentId = org.parentId
}

// 删除组织
const handleDelete = async (org: OrgTreeDto) => {
  // 检查是否有子组织
  if (org.children && org.children.length > 0) {
    ElMessage.warning('该组织下有子组织，无法删除')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除组织"${org.name}"吗？`, '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await orgApi.removeOrg(org.id)
    ElMessage.success('删除成功')
    
    // 刷新树数据
    await fetchOrgTrees()
    
    // 如果删除的是当前选中的组织，清空选择
    if (selectedOrg.value?.id === org.id) {
      selectedOrg.value = null
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除组织失败:', error)
      ElMessage.error(error.message || '删除失败，请重试')
    }
  }
}

// 保存组织
const handleSave = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    saving.value = true

    if (isCreating.value) {
      // 创建组织
      const createData: CreateOrgDto = {
        name: formData.name,
        nameAbbr: formData.nameAbbr,
        comment: formData.comment,
        parentId: formData.parentId
      }
      
      const response = await orgApi.createOrg(createData)
      ElMessage.success('创建成功')
      
      // 刷新树数据
      await fetchOrgTrees()
      
      // 选中新创建的组织
      selectedOrg.value = { ...response.data, children: [] }
      isEditing.value = false
      isCreating.value = false
      resetForm()
    } else {
      // 更新组织
      const updateData: UpdateOrgDto = {
        id: formData.id!,
        name: formData.name,
        nameAbbr: formData.nameAbbr,
        comment: formData.comment,
        parentId: formData.parentId
      }
      
      await orgApi.updateOrg(updateData)
      ElMessage.success('更新成功')
      
      // 刷新树数据
      await fetchOrgTrees()
      
      // 更新选中的组织信息
      if (selectedOrg.value) {
        selectedOrg.value.name = formData.name
        selectedOrg.value.nameAbbr = formData.nameAbbr
        selectedOrg.value.comment = formData.comment
        selectedOrg.value.parentId = formData.parentId
      }
      
      isEditing.value = false
      resetForm()
    }
  } catch (error: any) {
    if (error !== 'validation-failed') {
      console.error('保存组织失败:', error)
      ElMessage.error(error.message || '保存失败，请重试')
    }
  } finally {
    saving.value = false
  }
}

// 取消编辑
const handleCancel = () => {
  isEditing.value = false
  isCreating.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  formData.id = undefined
  formData.name = ''
  formData.nameAbbr = ''
  formData.comment = ''
  formData.parentId = 0
  
  formRef.value?.clearValidate()
}

// 页面初始化
onMounted(() => {
  fetchOrgTrees()
})
</script>

<style scoped>
.organization-manage {
  padding: 20px;
}

.main-content {
  min-height: 600px;
}

.tree-card,
.detail-card {
  height: 600px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.tree-card :deep(.el-card__body) {
  padding: 0;
  height: calc(100% - 60px);
  overflow: auto;
}

.org-tree {
  padding: 16px;
}

.tree-node {
  display: flex;
  align-items: center;
  width: 100%;
  padding-right: 8px;
}

.node-label {
  flex: 1;
  line-height: 1.5;
  word-break: break-all;
}

.node-abbr {
  color: #909399;
  font-size: 0.9em;
  margin-left: 2px;
}

.detail-card :deep(.el-card__body) {
  height: calc(100% - 60px);
  overflow: auto;
}

.org-detail {
  padding: 20px 0;
}

.org-form {
  padding: 20px 0;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .tree-card,
  .detail-card {
    height: auto;
    min-height: 400px;
  }
  
  .header-buttons {
    flex-direction: column;
    gap: 6px;
  }
  
  .node-label {
    font-size: 0.9em;
  }
  
  .node-abbr {
    font-size: 0.8em;
  }
}
</style> 