/** 角色管理相关类型定义 */

/** 系统角色实体 */
interface SysRole {
  /** 角色ID */
  id: number
  /** 角色编码 */
  code: string
  /** 角色名称 */
  name: string
  /** 角色备注 */
  comment?: string
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

/** 创建角色请求参数 */
interface CreateRoleDto {
  /** 角色编码 */
  code: string
  /** 角色名称 */
  name: string
  /** 角色备注 */
  comment?: string
}

/** 更新角色请求参数 */
interface UpdateRoleDto {
  /** 角色ID */
  id: number
  /** 角色编码 */
  code: string
  /** 角色名称 */
  name: string
  /** 角色备注 */
  comment?: string
}

/** 查询角色请求参数 */
interface QueryRoleDto extends PaginationParams {
  /** 角色名称 */
  name?: string
} 