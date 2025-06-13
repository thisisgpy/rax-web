import { get, post } from '../httpClient'

/** 资源管理API模块 */
export const resourceApi = {
  /**
   * 创建资源
   * @param data - 创建资源数据
   */
  createResource(data: CreateResourceDto): Promise<ApiResponse<SysResource>> {
    return post('/v1/permission/resource/create', data)
  },

  /**
   * 更新资源信息
   * @param data - 更新资源数据
   */
  updateResource(data: UpdateResourceDto): Promise<ApiResponse<SysResource>> {
    return post('/v1/permission/resource/edit', data)
  },

  /**
   * 删除资源
   * @param id - 资源ID
   */
  removeResource(id: number): Promise<ApiResponse<boolean>> {
    return get(`/v1/permission/resource/remove/${id}`)
  },

  /**
   * 获取资源详情
   * @param id - 资源ID
   */
  getResourceById(id: number): Promise<ApiResponse<SysResource>> {
    return get(`/v1/permission/resource/get/${id}`)
  },

  /**
   * 根据父级资源ID查询下级资源列表
   * @param parentId - 父级资源ID，0表示查询顶级资源
   */
  getChildrenResources(parentId: number): Promise<ApiResponse<SysResource[]>> {
    return get(`/v1/permission/resource/children/${parentId}`)
  },

  /**
   * 获取所有资源树
   */
  getAllResourcesTree(): Promise<ApiResponse<SysResource[]>> {
    return get('/v1/permission/resource/tree')
  }
} 