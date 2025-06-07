/** API相关类型定义 */

/** 统一API响应基础结构 */
interface ApiResponse<T = any> {
  /** 操作是否成功 */
  success: boolean
  /** 响应消息 */
  message: string
  /** 响应数据 */
  data: T
}

/** 分页查询基础参数 */
interface PaginationParams {
  /** 当前页码 */
  pageNo: number
  /** 每页显示条数 */
  pageSize: number
}

/** 分页响应数据结构 */
interface PageResult<T = any> {
  /** 当前页码 */
  pageNo: number
  /** 每页显示记录数 */
  pageSize: number
  /** 总记录数 */
  total: number
  /** 总页数 */
  pages: number
  /** 分页数据列表 */
  rows: T[]
} 