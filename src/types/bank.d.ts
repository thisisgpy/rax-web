/** 银行管理相关类型定义 */

/** 查询银行信息DTO */
interface SearchBankDto extends PaginationParams {
  /** 联行号（精确匹配） */
  code?: string
  /** 银行名称（模糊查询） */
  name?: string
  /** 省份（精确匹配） */
  province?: string
  /** 城市（精确匹配） */
  city?: string
  /** 支行名称（模糊查询） */
  branchName?: string
}

/** 银行信息实体（根据业务推断） */
interface SysBank {
  /** 银行ID */
  id: number
  /** 联行号 */
  code: string
  /** 银行名称 */
  name: string
  /** 省份 */
  province: string
  /** 城市 */
  city: string
  /** 支行名称 */
  branchName: string
  /** 创建时间 */
  createTime?: string
  /** 更新时间 */
  updateTime?: string
} 