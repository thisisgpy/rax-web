import { get, post } from '../httpClient'

/** 角色管理API模块 */
export const roleApi = {
  /**
   * 创建角色
   * @param data - 创建角色数据
   */
  createRole(data: CreateRoleDto): Promise<ApiResponse<SysRole>> {
    return post('/v1/role/create', data)
  },

  /**
   * 更新角色信息
   * @param data - 更新角色数据
   */
  updateRole(data: UpdateRoleDto): Promise<ApiResponse<SysRole>> {
    return post('/v1/role/edit', data)
  },

  /**
   * 删除角色
   * @param id - 角色ID
   */
  removeRole(id: number): Promise<ApiResponse<boolean>> {
    return get(`/v1/role/remove/${id}`)
  },

  /**
   * 获取角色详情
   * @param id - 角色ID
   */
  getRoleById(id: number): Promise<ApiResponse<SysRole>> {
    return get(`/v1/role/get/${id}`)
  },

  /**
   * 分页查询角色列表
   * @param data - 查询参数
   */
  getRoleList(data: QueryRoleDto): Promise<ApiResponse<PageResult<SysRole>>> {
    return post('/v1/role/list', data)
  },

  /**
   * 获取所有角色（不分页）
   */
  getAllRoles(): Promise<ApiResponse<SysRole[]>> {
    return get('/v1/role/all')
  }
} 