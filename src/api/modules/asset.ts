import { get, post } from '../httpClient'

/** 固定资产管理API模块 */
export const assetApi = {
  /**
   * 创建固定资产
   * @param data - 创建固定资产数据
   */
  createAssetFixed(data: CreateAssetFixedDto): Promise<ApiResponse<AssetFixed>> {
    return post('/v1/asset/fixed/create', data)
  },

  /**
   * 更新固定资产信息
   * @param data - 更新固定资产数据
   */
  updateAssetFixed(data: UpdateAssetFixedDto): Promise<ApiResponse<AssetFixed>> {
    return post('/v1/asset/fixed/edit', data)
  },

  /**
   * 删除固定资产
   * @param id - 固定资产ID
   */
  removeAssetFixed(id: number): Promise<ApiResponse<boolean>> {
    return get(`/v1/asset/fixed/remove/${id}`)
  },

  /**
   * 获取固定资产详情
   * @param id - 固定资产ID
   */
  getAssetFixedById(id: number): Promise<ApiResponse<AssetFixedResponseDto>> {
    return get(`/v1/asset/fixed/get/${id}`)
  },

  /**
   * 分页查询固定资产列表
   * @param data - 查询参数
   */
  searchAssetFixed(data: QueryAssetFixedDto): Promise<ApiResponse<PageResult<AssetFixedResponseDto>>> {
    return post('/v1/asset/fixed/search', data)
  }
} 