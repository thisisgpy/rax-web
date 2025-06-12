/** 资源管理相关类型定义 */

/** 系统资源实体 */
interface SysResource {
  /** 资源ID */
  id: number
  /** 资源编码 */
  code: string
  /** 资源名称 */
  name: string
  /** 资源类型 0:目录 1:菜单 2:按钮 */
  type: 0 | 1 | 2
  /** 父级资源ID */
  parentId: number
  /** 资源路径 */
  path?: string
  /** 资源组件 */
  component?: string
  /** 资源图标 */
  icon?: string
  /** 资源排序 */
  sort: number
  /** 是否隐藏 */
  isHidden: boolean
  /** 是否缓存 */
  isKeepAlive: boolean
  /** 是否外部链接 */
  isExternalLink: boolean
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

/** 创建资源请求参数 */
interface CreateResourceDto {
  /** 资源编码 */
  code: string
  /** 资源名称 */
  name: string
  /** 资源类型 0:目录 1:菜单 2:按钮 */
  type: 0 | 1 | 2
  /** 父级资源ID 0表示没有父级资源 */
  parentId?: number
  /** 资源路径 */
  path?: string
  /** 资源组件 */
  component?: string
  /** 资源图标 */
  icon?: string
  /** 资源排序 */
  sort?: number
  /** 是否隐藏 */
  isHidden?: boolean
  /** 是否缓存 */
  isKeepAlive?: boolean
  /** 是否外部链接 */
  isExternalLink?: boolean
}

/** 更新资源请求参数 */
interface UpdateResourceDto {
  /** 资源ID */
  id: number
  /** 资源编码 */
  code: string
  /** 资源名称 */
  name: string
  /** 资源类型 0:目录 1:菜单 2:按钮 */
  type: 0 | 1 | 2
  /** 父级资源ID 0表示没有父级资源 */
  parentId?: number
  /** 资源路径 */
  path?: string
  /** 资源组件 */
  component?: string
  /** 资源图标 */
  icon?: string
  /** 资源排序 */
  sort?: number
  /** 是否隐藏 */
  isHidden?: boolean
  /** 是否缓存 */
  isKeepAlive?: boolean
  /** 是否外部链接 */
  isExternalLink?: boolean
}

/** 查询资源请求参数 */
interface QueryResourceDto extends PaginationParams {
  /** 资源编码 */
  code?: string
  /** 资源名称 */
  name?: string
  /** 资源类型 0:目录 1:菜单 2:按钮 */
  type?: 0 | 1 | 2
  /** 父级资源ID */
  parentId?: number
} 