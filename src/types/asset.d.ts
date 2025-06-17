/** 固定资产管理相关类型定义 */

/** 固定资产实体 */
interface AssetFixed {
  /** 固定资产ID */
  id: number
  /** 固定资产名称 */
  name: string
  /** 所属组织ID */
  orgId: number
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

/** 固定资产响应数据（包含组织信息） */
interface AssetFixedResponseDto {
  /** 固定资产ID */
  id: number
  /** 固定资产名称 */
  name: string
  /** 所属组织ID */
  orgId: number
  /** 所属组织名称 */
  orgName: string
  /** 所属组织简称 */
  orgNameAbbr: string
  /** 是否删除 */
  isDeleted: boolean
  /** 创建时间 */
  createTime: string
  /** 创建人 */
  createBy: string
  /** 更新时间 */
  updateTime: string
  /** 更新人 */
  updateBy: string
}

/** 创建固定资产请求参数 */
interface CreateAssetFixedDto {
  /** 固定资产名称 */
  name: string
  /** 所属组织ID */
  orgId: number
}

/** 更新固定资产请求参数 */
interface UpdateAssetFixedDto {
  /** 固定资产ID */
  id: number
  /** 固定资产名称 */
  name?: string
  /** 所属组织ID */
  orgId?: number
}

/** 查询固定资产请求参数 */
interface QueryAssetFixedDto extends PaginationParams {
  /** 固定资产名称关键字 */
  name?: string
  /** 所属组织ID */
  orgId?: number
} 