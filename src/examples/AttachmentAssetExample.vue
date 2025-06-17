<template>
  <div class="attachment-asset-example">
    <h2>附件和固定资产管理示例</h2>
    
    <!-- 固定资产管理 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>固定资产管理</span>
          <el-button @click="showCreateAssetDialog = true" type="primary">新增资产</el-button>
        </div>
      </template>
      
      <!-- 资产列表 -->
      <el-table :data="assetList" v-loading="assetLoading">
        <el-table-column prop="name" label="资产名称" />
        <el-table-column prop="orgName" label="所属组织" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button @click="editAsset(scope.row)" type="primary" size="small">编辑</el-button>
            <el-button @click="deleteAsset(scope.row.id)" type="danger" size="small">删除</el-button>
            <el-button @click="viewAttachments(scope.row)" type="info" size="small">附件</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.pageNo"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="loadAssetList"
        @size-change="loadAssetList"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </el-card>

    <!-- 创建/编辑资产对话框 -->
    <el-dialog v-model="showCreateAssetDialog" :title="editingAsset ? '编辑资产' : '新增资产'">
      <el-form :model="assetForm" ref="assetFormRef" :rules="assetRules" label-width="100px">
        <el-form-item label="资产名称" prop="name">
          <el-input v-model="assetForm.name" />
        </el-form-item>
        <el-form-item label="所属组织" prop="orgId">
          <OrgSelect v-model="assetForm.orgId" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateAssetDialog = false">取消</el-button>
        <el-button @click="saveAsset" type="primary" :loading="saveLoading">保存</el-button>
      </template>
    </el-dialog>

    <!-- 附件管理对话框 -->
    <el-dialog v-model="showAttachmentDialog" title="附件管理" width="60%">
      <div class="attachment-section">
        <!-- 文件上传 -->
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          :limit="10"
          multiple
        >
          <template #trigger>
            <el-button type="primary">选择文件</el-button>
          </template>
          <el-button @click="uploadFiles" type="success" :loading="uploadLoading">上传文件</el-button>
        </el-upload>

        <!-- 附件列表 -->
        <el-table :data="attachmentList" class="attachment-table">
          <el-table-column prop="originalName" label="文件名" />
          <el-table-column prop="fileSize" label="文件大小" :formatter="formatFileSize" />
          <el-table-column prop="createTime" label="上传时间" />
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button @click="downloadAttachment(scope.row.id)" type="primary" size="small">下载</el-button>
              <el-button @click="deleteAttachment(scope.row.id)" type="danger" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { assetApi, attachmentApi } from '@/api'
import OrgSelect from '@/components/OrgSelect.vue'

// 资产相关状态
const assetList = ref<AssetFixedResponseDto[]>([])
const assetLoading = ref(false)
const showCreateAssetDialog = ref(false)
const editingAsset = ref<AssetFixedResponseDto | null>(null)
const saveLoading = ref(false)

// 分页状态
const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0
})

// 资产表单
const assetForm = reactive<CreateAssetFixedDto | UpdateAssetFixedDto>({
  name: '',
  orgId: 0
})
const assetFormRef = ref<FormInstance>()
const assetRules: FormRules = {
  name: [{ required: true, message: '请输入资产名称', trigger: 'blur' }],
  orgId: [{ required: true, message: '请选择所属组织', trigger: 'change' }]
}

// 附件相关状态
const showAttachmentDialog = ref(false)
const currentAsset = ref<AssetFixedResponseDto | null>(null)
const attachmentList = ref<SysAttachment[]>([])
const uploadLoading = ref(false)
const fileList = ref<UploadFile[]>([])

// 加载资产列表
const loadAssetList = async () => {
  try {
    assetLoading.value = true
    const response = await assetApi.searchAssetFixed({
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize
    })
    
    assetList.value = response.data.rows || []
    pagination.total = response.data.total || 0
  } catch (error) {
    ElMessage.error('加载资产列表失败')
  } finally {
    assetLoading.value = false
  }
}

// 编辑资产
const editAsset = (asset: AssetFixedResponseDto) => {
  editingAsset.value = asset
  Object.assign(assetForm, {
    id: asset.id,
    name: asset.name,
    orgId: asset.orgId
  })
  showCreateAssetDialog.value = true
}

// 保存资产
const saveAsset = async () => {
  if (!assetFormRef.value) return
  
  const valid = await assetFormRef.value.validate()
  if (!valid) return

  try {
    saveLoading.value = true
    
    if (editingAsset.value) {
      // 编辑
      await assetApi.updateAssetFixed(assetForm as UpdateAssetFixedDto)
      ElMessage.success('编辑资产成功')
    } else {
      // 新增
      await assetApi.createAssetFixed(assetForm as CreateAssetFixedDto)
      ElMessage.success('新增资产成功')
    }
    
    showCreateAssetDialog.value = false
    resetAssetForm()
    loadAssetList()
  } catch (error) {
    ElMessage.error(editingAsset.value ? '编辑资产失败' : '新增资产失败')
  } finally {
    saveLoading.value = false
  }
}

// 删除资产
const deleteAsset = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除此资产吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await assetApi.removeAssetFixed(id)
    ElMessage.success('删除成功')
    loadAssetList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 重置资产表单
const resetAssetForm = () => {
  Object.assign(assetForm, {
    name: '',
    orgId: 0
  })
  editingAsset.value = null
  assetFormRef.value?.resetFields()
}

// 查看附件
const viewAttachments = async (asset: AssetFixedResponseDto) => {
  currentAsset.value = asset
  showAttachmentDialog.value = true
  await loadAttachmentList()
}

// 加载附件列表
const loadAttachmentList = async () => {
  if (!currentAsset.value) return
  
  try {
    const response = await attachmentApi.getAttachmentList({
      bizModule: 'asset_fixed',
      bizId: currentAsset.value.id
    })
    attachmentList.value = response.data || []
  } catch (error) {
    ElMessage.error('加载附件列表失败')
  }
}

// 处理文件选择
const handleFileChange = (file: UploadFile) => {
  console.log('选择文件:', file.name)
}

// 上传文件
const uploadFiles = async () => {
  if (!currentAsset.value || fileList.value.length === 0) {
    ElMessage.warning('请先选择要上传的文件')
    return
  }

  try {
    uploadLoading.value = true
    
    for (const file of fileList.value) {
      if (file.raw) {
        await attachmentApi.uploadFile({
          bizModule: 'asset_fixed',
          bizId: currentAsset.value.id,
          file: file.raw
        })
      }
    }
    
    ElMessage.success('文件上传成功')
    fileList.value = []
    await loadAttachmentList()
  } catch (error) {
    ElMessage.error('文件上传失败')
  } finally {
    uploadLoading.value = false
  }
}

// 下载附件
const downloadAttachment = (id: number) => {
  attachmentApi.openDownloadAttachment(id)
}

// 删除附件
const deleteAttachment = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除此附件吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await attachmentApi.deleteAttachment(id)
    ElMessage.success('删除成功')
    await loadAttachmentList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 格式化文件大小
const formatFileSize = (row: SysAttachment) => {
  if (!row.fileSize) return '-'
  
  const size = row.fileSize
  if (size < 1024) return `${size}B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`
  return `${(size / (1024 * 1024)).toFixed(1)}MB`
}

onMounted(() => {
  loadAssetList()
})
</script>

<style scoped>
.attachment-asset-example {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.attachment-section {
  margin-top: 20px;
}

.attachment-table {
  margin-top: 20px;
}
</style> 