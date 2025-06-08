<template>
  <div class="bank-manage">
    <!-- 主内容区 -->
    <el-card class="bank-list-card">
      <template #header>
        <div class="card-header">
          <span>银行信息列表</span>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-section">
        <el-form :model="searchForm" class="search-form" label-width="80px" inline>
          <div class="search-row">
            <el-form-item label="联行号">
              <el-input 
                v-model="searchForm.code" 
                placeholder="请输入联行号"
                clearable
                style="width: 200px"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="银行名称">
              <el-input 
                v-model="searchForm.name" 
                placeholder="请输入银行名称"
                clearable
                style="width: 200px"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="省份">
              <el-input 
                v-model="searchForm.province" 
                placeholder="请输入省份"
                clearable
                style="width: 150px"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="城市">
              <el-input 
                v-model="searchForm.city" 
                placeholder="请输入城市"
                clearable
                style="width: 150px"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
          </div>
          <div class="search-row">
            <el-form-item label="支行名称">
              <el-input 
                v-model="searchForm.branchName" 
                placeholder="请输入支行名称"
                clearable
                style="width: 300px"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="handleSearch" :loading="loading">
                搜索
              </el-button>
              <el-button :icon="Refresh" @click="handleResetSearch">
                重置
              </el-button>
            </el-form-item>
          </div>
        </el-form>
      </div>

      <!-- 银行信息表格 -->
      <el-table 
        :data="bankList" 
        :loading="loading"
        height="600"
        empty-text="暂无银行数据"
        stripe
        border
      >
        <el-table-column prop="code" label="联行号" width="150" show-overflow-tooltip />
        <el-table-column prop="name" label="银行名称" width="200" show-overflow-tooltip />
        <el-table-column prop="province" label="省份" width="120" show-overflow-tooltip />
        <el-table-column prop="city" label="城市" width="120" show-overflow-tooltip />
        <el-table-column prop="branchName" label="支行名称" min-width="180" show-overflow-tooltip />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section">
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.pageNo"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { bankApi } from '@/api/modules/bank'
import { useErrorHandler } from '@/composables/useErrorHandler'

// 错误处理
const { handleAsyncOperation } = useErrorHandler()

// 响应式数据
const loading = ref(false)

// 银行列表
const bankList = ref<SysBank[]>([])

// 搜索表单
const searchForm = reactive({
  code: '',
  name: '',
  province: '',
  city: '',
  branchName: ''
})

// 分页信息
const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0
})

// 获取银行列表
const fetchBankList = async () => {
  loading.value = true
  
  const result = await handleAsyncOperation(
    () => bankApi.searchBanks({
      ...searchForm,
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize
    }),
    '获取银行列表'
  )

  if (result.success) {
    const responseData = result.data.data
    bankList.value = responseData.rows || []
    pagination.total = responseData.total || 0
  }
  
  loading.value = false
}

// 搜索
const handleSearch = () => {
  pagination.pageNo = 1  // 搜索时重置到第一页
  fetchBankList()
}

// 重置搜索
const handleResetSearch = () => {
  Object.assign(searchForm, {
    code: '',
    name: '',
    province: '',
    city: '',
    branchName: ''
  })
  pagination.pageNo = 1
  pagination.pageSize = 10
  fetchBankList()
}

// 处理分页大小变化
const handleSizeChange = (newSize: number) => {
  pagination.pageSize = newSize
  pagination.pageNo = 1 // 改变页面大小时重置到第一页
  fetchBankList()
}

// 处理当前页变化
const handleCurrentChange = (newPage: number) => {
  pagination.pageNo = newPage
  fetchBankList()
}



// 页面初始化
onMounted(() => {
  fetchBankList()
})
</script>

<style scoped>
.bank-manage {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.page-description {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.bank-list-card {
  min-height: 800px;
}

.bank-list-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  height: calc(100% - 60px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-section {
  flex-shrink: 0;
  margin-bottom: 20px;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.search-form {
  margin: 0;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search-row:last-child {
  margin-bottom: 0;
}

.search-row .el-form-item {
  margin-bottom: 0;
  margin-right: 0;
}

.search-row .el-button {
  margin-left: 8px;
}

.el-table {
  flex: 1;
}

.pagination-section {
  flex-shrink: 0;
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

/* 响应式设计 */
@media (max-width: 1200px) {
  .search-row {
    justify-content: flex-start;
  }
  
  .search-row .el-form-item .el-input {
    width: 180px !important;
  }
}

@media (max-width: 768px) {
  .bank-manage {
    padding: 10px;
  }
  
  .search-section {
    padding: 12px;
  }
  
  .search-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .search-row .el-form-item {
    width: 100%;
  }
  
  .search-row .el-form-item .el-input {
    width: 100% !important;
  }
  
  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .bank-list-card {
    min-height: 600px;
  }
  
  .el-table {
    font-size: 12px;
  }
}
</style> 