/** 组织管理相关类型定义 */

/** 系统组织实体 */
interface SysOrg {
  /** 组织ID */
  id: number
  /** 组织编码 */
  code: string
  /** 组织名称 */
  name: string
  /** 组织名称简称 */
  nameAbbr: string
  /** 组织备注 */
  comment?: string
  /** 父级组织ID */
  parentId: number
  /** 创建时间 */
  createTime: string
  /** 创建人 */
  createBy: string
  /** 更新时间 */
  updateTime: string
  /** 更新人 */
  updateBy?: string
}

/** 创建组织DTO */
interface CreateOrgDto {
  /** 组织名称 */
  name: string
  /** 组织简称 */
  nameAbbr: string
  /** 组织备注 */
  comment?: string
  /** 父级组织ID */
  parentId: number
}

/** 更新组织DTO */
interface UpdateOrgDto {
  /** 组织ID */
  id: number
  /** 组织名称 */
  name?: string
  /** 组织简称 */
  nameAbbr?: string
  /** 组织备注 */
  comment?: string
  /** 父级组织ID */
  parentId: number
}

/** 组织树形结构DTO */
interface OrgTreeDto {
  /** 组织ID */
  id: number
  /** 组织编码 */
  code: string
  /** 组织名称 */
  name: string
  /** 组织简称 */
  nameAbbr: string
  /** 组织备注 */
  comment?: string
  /** 父级组织ID */
  parentId: number
  /** 子组织列表 */
  children?: OrgTreeDto[]
} 