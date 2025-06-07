import { get, post } from '../httpClient'

/** 组织管理API模块 */
export const orgApi = {
  /**
   * 生成组织编码
   * @param parentId - 父级组织ID
   */
  generateOrgCode(parentId: number): Promise<ApiResponse<string>> {
    return get('/api/v1/org/codegen', { parentId })
  },

  /**
   * 创建组织
   * @param data - 创建组织数据
   */
  createOrg(data: CreateOrgDto): Promise<ApiResponse<SysOrg>> {
    return post('/api/v1/org/create', data)
  },

  /**
   * 更新组织信息
   * @param data - 更新组织数据
   */
  updateOrg(data: UpdateOrgDto): Promise<ApiResponse<boolean>> {
    return post('/api/v1/org/edit', data)
  },

  /**
   * 删除组织
   * @param id - 组织ID
   */
  removeOrg(id: number): Promise<ApiResponse<boolean>> {
    return get(`/api/v1/org/remove/${id}`)
  },

  /**
   * 获取组织树结构
   * @param id - 组织ID
   */
  getOrgTree(id: number): Promise<ApiResponse<OrgTreeDto>> {
    return get(`/api/v1/org/tree/${id}`)
  },

  /**
   * 获取组织详情
   * @param id - 组织ID
   */
  getOrgById(id: number): Promise<ApiResponse<SysOrg>> {
    return get(`/api/v1/org/get/${id}`)
  },

  /**
   * 获取所有组织树
   */
  getAllOrgTrees(): Promise<ApiResponse<OrgTreeDto[]>> {
    return get('/api/v1/org/trees')
  }
} 