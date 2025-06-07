<template>
  <div class="organization-example">
    <h2>组织架构管理示例</h2>
    
    <el-alert
      title="功能说明"
      type="info"
      :closable="false"
      style="margin-bottom: 20px"
    >
      <p>这是一个完整的组织架构管理页面示例，包含以下功能：</p>
      <ul>
        <li>📊 左侧树形组件展示组织架构，默认展开所有节点</li>
        <li>📝 右侧详情面板显示选中组织的详细信息</li>
        <li>➕ 支持新增顶级组织和子组织</li>
        <li>✏️ 支持编辑组织信息（名称、简称、备注）</li>
        <li>🗑️ 支持删除组织（有子组织的不能删除）</li>
        <li>🔄 支持刷新组织树数据</li>
        <li>📱 响应式设计，适配移动端</li>
      </ul>
    </el-alert>

    <el-card>
      <template #header>
        <h3>API接口使用示例</h3>
      </template>
      
      <el-tabs>
        <el-tab-pane label="获取组织树" name="getTree">
          <el-code-block language="typescript">
// 获取所有组织树
const fetchOrgTrees = async () => {
  treeLoading.value = true
  try {
    const response = await orgApi.getAllOrgTrees()
    if (response.success) {
      orgTreeData.value = response.data
    } else {
      ElMessage.error(response.message || '获取组织树失败')
    }
  } catch (error) {
    console.error('获取组织树失败:', error)
    ElMessage.error('获取组织树失败，请重试')
  } finally {
    treeLoading.value = false
  }
}
          </el-code-block>
        </el-tab-pane>

        <el-tab-pane label="创建组织" name="create">
          <el-code-block language="typescript">
// 创建新组织
const createOrg = async (orgData: CreateOrgDto) => {
  try {
    const response = await orgApi.createOrg(orgData)
    if (response.success) {
      ElMessage.success('创建成功')
      await fetchOrgTrees() // 刷新树数据
      selectedOrg.value = { ...response.data, children: [] }
    } else {
      ElMessage.error(response.message || '创建失败')
    }
  } catch (error) {
    console.error('创建组织失败:', error)
    ElMessage.error('创建失败，请重试')
  }
}
          </el-code-block>
        </el-tab-pane>

        <el-tab-pane label="更新组织" name="update">
          <el-code-block language="typescript">
// 更新组织信息
const updateOrg = async (updateData: UpdateOrgDto) => {
  try {
    const response = await orgApi.updateOrg(updateData)
    if (response.success) {
      ElMessage.success('更新成功')
      await fetchOrgTrees() // 刷新树数据
    } else {
      ElMessage.error(response.message || '更新失败')
    }
  } catch (error) {
    console.error('更新组织失败:', error)
    ElMessage.error('更新失败，请重试')
  }
}
          </el-code-block>
        </el-tab-pane>

        <el-tab-pane label="删除组织" name="delete">
          <el-code-block language="typescript">
// 删除组织（需要先确认）
const handleDelete = async (org: OrgTreeDto) => {
  if (org.children && org.children.length > 0) {
    ElMessage.warning('该组织下有子组织，不能删除')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除组织"${org.name}"吗？`, '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await orgApi.removeOrg(org.id)
    if (response.success) {
      ElMessage.success('删除成功')
      await fetchOrgTrees()
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除组织失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  }
}
          </el-code-block>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header>
        <h3>类型定义说明</h3>
      </template>
      
      <el-tabs>
        <el-tab-pane label="组织实体" name="entity">
          <el-code-block language="typescript">
/** 系统组织实体 */
interface SysOrg {
  /** 组织ID */
  id: number
  /** 组织编码 */
  code: string
  /** 组织名称 */
  name: string
  /** 组织名称简称 */
  nameAbbr: string
  /** 组织备注 */
  comment?: string
  /** 父级组织ID */
  parentId: number
  /** 创建时间 */
  createTime: string
  /** 创建人 */
  createBy: string
  /** 更新时间 */
  updateTime: string
  /** 更新人 */
  updateBy?: string
}
          </el-code-block>
        </el-tab-pane>

        <el-tab-pane label="树形结构" name="tree">
          <el-code-block language="typescript">
/** 组织树形结构DTO */
interface OrgTreeDto {
  /** 组织ID */
  id: number
  /** 组织编码 */
  code: string
  /** 组织名称 */
  name: string
  /** 组织简称 */
  nameAbbr: string
  /** 组织备注 */
  comment?: string
  /** 父级组织ID */
  parentId: number
  /** 子组织列表 */
  children?: OrgTreeDto[]
}
          </el-code-block>
        </el-tab-pane>

        <el-tab-pane label="创建DTO" name="create">
          <el-code-block language="typescript">
/** 创建组织DTO */
interface CreateOrgDto {
  /** 组织名称 */
  name: string
  /** 组织简称 */
  nameAbbr: string
  /** 组织备注 */
  comment?: string
  /** 父级组织ID */
  parentId: number
}
          </el-code-block>
        </el-tab-pane>

        <el-tab-pane label="更新DTO" name="updateDto">
          <el-code-block language="typescript">
/** 更新组织DTO */
interface UpdateOrgDto {
  /** 组织ID */
  id: number
  /** 组织名称 */
  name?: string
  /** 组织简称 */
  nameAbbr?: string
  /** 组织备注 */
  comment?: string
  /** 父级组织ID */
  parentId: number
}
          </el-code-block>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header>
        <h3>路由配置</h3>
      </template>
      
      <p>要使用组织架构管理页面，需要在路由中配置：</p>
      
      <el-code-block language="typescript">
{
  path: 'organization',
  name: 'Organization',
  component: () => import('../views/OrganizationManage.vue'),
  meta: {
    title: '组织架构',
    requiresAuth: true,
    icon: Setting,
    menuOrder: 2
  }
}
      </el-code-block>
      
      <p style="margin-top: 16px">
        访问路径：<code>/organization</code>
      </p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 这个组件只是展示示例代码，不包含实际逻辑
</script>

<style scoped>
.organization-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.organization-example h2 {
  color: #303133;
  margin-bottom: 20px;
}

.organization-example h3 {
  color: #606266;
  margin: 0;
}

.organization-example ul {
  margin: 10px 0;
  padding-left: 20px;
}

.organization-example li {
  margin: 8px 0;
  line-height: 1.5;
}

.organization-example code {
  background-color: #f5f7fa;
  color: #e6a23c;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.organization-example p {
  line-height: 1.6;
  margin: 12px 0;
}
</style> 