/** 数据字典管理相关类型定义 */

/** 系统数据字典实体 */
interface SysDict {
  /** 字典ID */
  id: number
  /** 字典编码 */
  code: string
  /** 字典名称 */
  name: string
  /** 字典备注 */
  comment?: string
  /** 是否启用 */
  isEnabled: boolean
  /** 创建时间 */
  createTime: string
  /** 创建人 */
  createBy: string
  /** 更新时间 */
  updateTime: string
  /** 更新人 */
  updateBy?: string
}

/** 创建数据字典DTO */
interface CreateDictDto {
  /** 字典编码 */
  code: string
  /** 字典名称 */
  name: string
  /** 字典备注 */
  comment?: string
  /** 是否启用 */
  isEnabled: boolean
}

/** 更新数据字典DTO */
interface UpdateDictDto {
  /** 字典ID */
  id: number
  /** 字典名称 */
  name: string
  /** 字典备注 */
  comment?: string
  /** 是否启用 */
  isEnabled: boolean
}

/** 查询数据字典DTO */
interface QueryDictDto extends PaginationParams {
  /** 字典编码（模糊查询） */
  code?: string
  /** 字典名称（模糊查询） */
  name?: string
  /** 是否启用 */
  isEnabled?: boolean
}

/** 系统字典项实体 */
interface SysDictItem {
  /** 字典项ID */
  id: number
  /** 字典ID */
  dictId: number
  /** 字典编码 */
  dictCode: string
  /** 字典项标签 */
  label: string
  /** 字典项值 */
  value: string
  /** 字典项备注 */
  comment?: string
  /** 字典项排序 */
  sort: number
  /** 父级字典项ID */
  parentId: number
  /** 是否可被选择 */
  isEnabled: boolean
  /** 创建时间 */
  createTime: string
  /** 创建人 */
  createBy: string
  /** 更新时间 */
  updateTime: string
  /** 更新人 */
  updateBy?: string
}

/** 创建字典项DTO */
interface CreateDictItemDto {
  /** 字典ID */
  dictId: number
  /** 字典编码 */
  dictCode: string
  /** 字典项标签 */
  label: string
  /** 字典项值 */
  value: string
  /** 字典项备注 */
  comment?: string
  /** 排序号 */
  sort?: number
  /** 父级ID (0表示顶级) */
  parentId?: number
  /** 是否启用 */
  isEnabled?: boolean
}

/** 更新字典项DTO */
interface UpdateDictItemDto {
  /** 字典项ID */
  id: number
  /** 字典项标签 */
  label: string
  /** 字典项值 */
  value: string
  /** 字典项备注 */
  comment?: string
  /** 排序号 */
  sort?: number
  /** 父级ID (0表示顶级) */
  parentId?: number
  /** 是否启用 */
  isEnabled?: boolean
}

/** 字典项树形结构DTO */
interface DictItemTreeDto {
  /** 字典项ID */
  id: number
  /** 字典项标签 */
  label: string
  /** 字典项值 */
  value: string
  /** 字典项备注 */
  comment?: string
  /** 排序号 */
  sort: number
  /** 是否启用 */
  isEnabled: boolean
  /** 子节点列表 */
  children?: DictItemTreeDto[]
} 