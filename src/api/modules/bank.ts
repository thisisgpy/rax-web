import { post } from '../httpClient'

/** 银行管理API模块 */
export const bankApi = {
  /**
   * 分页查询银行信息
   * @param params - 查询参数
   */
  searchBanks(params: SearchBankDto): Promise<ApiResponse<PageResult<SysBank>>> {
    return post('/v1/bank/search', params)
  }
} 