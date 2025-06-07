<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { orgApi, dictApi, bankApi } from '../api'

/** 组件Props */
interface Props {
  /** 是否显示示例 */
  showExample?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showExample: true
})

// 响应式数据
const loading = ref(false)
const orgList = ref<OrgTreeDto[]>([])
const dictList = ref<SysDict[]>([])
const bankList = ref<SysBank[]>([])

/** 显示成功消息 */
const showSuccessMessage = (message: string) => {
  if (typeof window !== 'undefined' && (window as any).ElMessage) {
    (window as any).ElMessage.success(message)
  } else {
    console.log('成功:', message)
  }
}

/** 显示错误消息 */
const showErrorMessage = (message: string) => {
  if (typeof window !== 'undefined' && (window as any).ElMessage) {
    (window as any).ElMessage.error(message)
  } else {
    console.error('错误:', message)
  }
}

/** 显示确认对话框 */
const showConfirm = (message: string, title: string = '提示'): Promise<void> => {
  if (typeof window !== 'undefined' && (window as any).ElMessageBox) {
    return (window as any).ElMessageBox.confirm(message, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } else {
    return Promise.resolve()
  }
}

/** 获取组织树列表 */
const fetchOrgTrees = async () => {
  loading.value = true
  try {
    const response = await orgApi.getAllOrgTrees()
    orgList.value = response.data
    showSuccessMessage('组织数据加载成功')
  } catch (error) {
    console.error('获取组织树失败:', error)
    showErrorMessage('组织数据加载失败，请重试')
  } finally {
    loading.value = false
  }
}

/** 查询数据字典列表 */
const fetchDictList = async () => {
  loading.value = true
  try {
    const response = await dictApi.getDictList({
      pageNo: 1,
      pageSize: 10,
      isEnabled: true
    })
    dictList.value = response.data.rows
    showSuccessMessage('字典数据加载成功')
  } catch (error) {
    console.error('获取字典列表失败:', error)
    showErrorMessage('字典数据加载失败，请重试')
  } finally {
    loading.value = false
  }
}

/** 查询银行列表 */
const fetchBankList = async () => {
  loading.value = true
  try {
    const response = await bankApi.searchBanks({
      pageNo: 1,
      pageSize: 10,
      name: '中国银行'
    })
    bankList.value = response.data.rows
    showSuccessMessage('银行数据加载成功')
  } catch (error) {
    console.error('获取银行列表失败:', error)
    showErrorMessage('银行数据加载失败，请重试')
  } finally {
    loading.value = false
  }
}

/** 创建组织示例 */
const createOrgExample = async () => {
  try {
    const createData: CreateOrgDto = {
      name: '示例组织',
      nameAbbr: '示例',
      comment: '这是一个API使用示例',
      parentId: 0
    }
    
    const response = await orgApi.createOrg(createData)
    console.log('创建组织成功:', response.data)
    showSuccessMessage('组织创建成功')
    
    // 重新加载列表
    await fetchOrgTrees()
  } catch (error) {
    console.error('创建组织失败:', error)
    showErrorMessage('组织创建失败，请重试')
  }
}

/** 删除组织示例 */
const deleteOrgExample = async (orgId: number) => {
  try {
    await showConfirm('确定要删除该组织吗？')
    
    await orgApi.removeOrg(orgId)
    showSuccessMessage('组织删除成功')
    
    // 重新加载列表
    await fetchOrgTrees()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除组织失败:', error)
      showErrorMessage('组织删除失败，请重试')
    }
  }
}

// 组件挂载时加载数据
onMounted(() => {
  if (props.showExample) {
    fetchOrgTrees()
    fetchDictList()
    fetchBankList()
  }
})
</script>

<template>
  <div v-if="showExample" class="api-example">
    <el-card header="API使用示例">
      <el-row :gutter="20">
        <!-- 组织管理示例 -->
        <el-col :span="8">
          <h3>组织管理</h3>
          <el-button type="primary" @click="fetchOrgTrees" :loading="loading">
            获取组织树
          </el-button>
          <el-button type="success" @click="createOrgExample">
            创建示例组织
          </el-button>
          
          <el-tree
            :data="orgList"
            :props="{ children: 'children', label: 'name' }"
            node-key="id"
            default-expand-all
          >
            <template #default="{ data }">
              <span class="tree-node">
                <span>{{ data.name }} ({{ data.code }})</span>
                <el-button
                  type="danger"
                  size="small"
                  @click="deleteOrgExample(data.id)"
                >
                  删除
                </el-button>
              </span>
            </template>
          </el-tree>
        </el-col>
        
        <!-- 数据字典示例 -->
        <el-col :span="8">
          <h3>数据字典</h3>
          <el-button type="primary" @click="fetchDictList" :loading="loading">
            获取字典列表
          </el-button>
          
          <el-table :data="dictList" style="width: 100%; margin-top: 10px;">
            <el-table-column prop="code" label="字典编码" />
            <el-table-column prop="name" label="字典名称" />
            <el-table-column prop="isEnabled" label="状态">
              <template #default="{ row }">
                <el-tag :type="row.isEnabled ? 'success' : 'danger'">
                  {{ row.isEnabled ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
        
        <!-- 银行管理示例 -->
        <el-col :span="8">
          <h3>银行管理</h3>
          <el-button type="primary" @click="fetchBankList" :loading="loading">
            搜索银行
          </el-button>
          
          <el-table :data="bankList" style="width: 100%; margin-top: 10px;">
            <el-table-column prop="code" label="联行号" />
            <el-table-column prop="name" label="银行名称" />
            <el-table-column prop="city" label="城市" />
            <el-table-column prop="branchName" label="支行名称" />
          </el-table>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<style scoped>
.api-example {
  padding: 20px;
}

.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

h3 {
  color: var(--el-color-primary);
  margin-bottom: 10px;
}
</style> 