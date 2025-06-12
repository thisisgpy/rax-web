import { get, post } from '../httpClient'

/** 用户管理API模块 */
export const userApi = {
  /**
   * 创建用户
   * @param data - 创建用户数据
   */
  createUser(data: CreateUserDto): Promise<ApiResponse<SysUser>> {
    return post('/v1/user/create', data)
  },

  /**
   * 更新用户信息
   * @param data - 更新用户数据
   */
  updateUser(data: UpdateUserDto): Promise<ApiResponse<SysUser>> {
    return post('/v1/user/edit', data)
  },

  /**
   * 删除用户
   * @param id - 用户ID
   */
  removeUser(id: number): Promise<ApiResponse<boolean>> {
    return get(`/v1/user/remove/${id}`)
  },

  /**
   * 获取用户详情
   * @param id - 用户ID
   */
  getUserById(id: number): Promise<ApiResponse<SysUser>> {
    return get(`/v1/user/get/${id}`)
  },

  /**
   * 分页查询用户列表
   * @param data - 查询参数
   */
  getUserList(data: QueryUserDto): Promise<ApiResponse<PageResult<SysUser>>> {
    return post('/v1/user/list', data)
  },

  /**
   * 重置用户密码
   * @param id - 用户ID
   */
  resetPassword(id: number): Promise<ApiResponse<boolean>> {
    return get(`/v1/user/reset-password/${id}`)
  },

  /**
   * 修改密码
   * @param data - 修改密码参数
   */
  changePassword(data: ChangePasswordDto): Promise<ApiResponse<boolean>> {
    return post('/v1/user/change-password', data)
  }
} 