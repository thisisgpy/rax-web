/** 用户管理相关类型定义 */

/** 系统用户实体 */
interface SysUser {
  /** 用户ID */
  id: number
  /** 组织ID */
  orgId: number
  /** 手机号 */
  mobile: string
  /** 用户名称 */
  name: string
  /** 性别 */
  gender: '男' | '女'
  /** 身份证号 */
  idCard?: string
  /** 密码 */
  password: string
  /** 是否已修改了初始密码 */
  isInitPassword: boolean
  /** 状态 */
  status: 0 | 1
  /** 是否删除 */
  isDeleted: boolean
  /** 创建时间 */
  createTime: string
  /** 创建人 */
  createBy: string
  /** 更新时间 */
  updateTime: string
  /** 更新人 */
  updateBy?: string
}

/** 创建用户请求参数 */
interface CreateUserDto {
  /** 组织ID */
  orgId: number
  /** 手机号 */
  mobile: string
  /** 用户名称 */
  name: string
  /** 性别 */
  gender: '男' | '女'
  /** 身份证号 */
  idCard?: string
  /** 密码 */
  password: string
  /** 状态 */
  status: 0 | 1
}

/** 更新用户请求参数 */
interface UpdateUserDto {
  /** 用户ID */
  id: number
  /** 组织ID */
  orgId?: number
  /** 手机号 */
  mobile?: string
  /** 用户名称 */
  name?: string
  /** 性别 */
  gender?: '男' | '女'
  /** 身份证号 */
  idCard?: string
  /** 状态 */
  status?: 0 | 1
}

/** 查询用户请求参数 */
interface QueryUserDto extends PaginationParams {
  /** 组织ID */
  orgId?: number
  /** 手机号 */
  mobile?: string
  /** 用户名称 */
  name?: string
  /** 状态 */
  status?: 0 | 1
}

/** 修改密码请求参数 */
interface ChangePasswordDto {
  /** 用户ID */
  id: number
  /** 旧密码 */
  oldPassword: string
  /** 新密码 */
  newPassword: string
} 