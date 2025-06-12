/** 权限管理相关类型定义 */

/** 分配用户角色请求参数 */
interface AssignUserRoleDto {
  /** 用户ID */
  userId: number
  /** 角色ID列表 */
  roleIds: number[]
}

/** 分配角色资源请求参数 */
interface AssignRoleResourceDto {
  /** 角色ID */
  roleId: number
  /** 资源ID列表 */
  resourceIds: number[]
}

/** 检查用户权限请求参数 */
interface CheckPermissionDto {
  /** 用户ID */
  userId: number
  /** 资源编码 */
  resourceCode: string
}

/** 菜单元信息 */
interface MenuMetaDto {
  /** 菜单名称 */
  title: string
  /** 菜单图标 */
  icon?: string
  /** 是否在菜单中隐藏 */
  isHide?: boolean
  /** 是否缓存 */
  keepAlive: boolean
  /** 可操作权限 */
  authList?: string[]
}

/** 菜单列表数据传输对象 */
interface MenuListDto {
  /** 菜单ID */
  id: number
  /** 路由路径 */
  path: string
  /** 组件名称 */
  name: string
  /** 组件加载路径 */
  component?: string
  /** 菜单元信息 */
  meta: MenuMetaDto
  /** 子菜单 */
  children?: MenuListDto[]
} 