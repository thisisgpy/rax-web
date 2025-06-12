import { get, post } from '../httpClient'

/** 权限管理API模块 */
export const permissionApi = {
  /**
   * 分配用户角色
   * @param data - 分配用户角色参数
   */
  assignUserRoles(data: AssignUserRoleDto): Promise<ApiResponse<boolean>> {
    return post('/v1/permission/assign-user-roles', data)
  },

  /**
   * 分配角色资源
   * @param data - 分配角色资源参数
   */
  assignRoleResources(data: AssignRoleResourceDto): Promise<ApiResponse<boolean>> {
    return post('/v1/permission/assign-role-resources', data)
  },

  /**
   * 获取用户权限编码列表
   * @param id - 用户ID
   */
  getUserPermissions(id: number): Promise<ApiResponse<string[]>> {
    return get(`/v1/permission/user-permissions/${id}`)
  },

  /**
   * 获取用户菜单权限
   * @param id - 用户ID
   */
  getUserMenus(id: number): Promise<ApiResponse<MenuListDto[]>> {
    return get(`/v1/permission/user-menus/${id}`)
  },

  /**
   * 检查用户权限
   * @param data - 检查权限参数
   */
  checkPermission(data: CheckPermissionDto): Promise<ApiResponse<boolean>> {
    return post('/v1/permission/check-permission', data)
  },

  /**
   * 获取用户角色列表
   * @param id - 用户ID
   */
  getUserRoles(id: number): Promise<ApiResponse<SysRole[]>> {
    return get(`/v1/permission/user-roles/${id}`)
  },

  /**
   * 获取角色资源权限ID列表
   * @param id - 角色ID
   */
  getRoleResources(id: number): Promise<ApiResponse<number[]>> {
    return get(`/v1/permission/role-resources/${id}`)
  }
} 