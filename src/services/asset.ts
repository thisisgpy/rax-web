import { apiService } from './api';
import type { 
  RaxResult, 
  FixedAssetDto, 
  CreateFixedAssetDto, 
  UpdateFixedAssetDto, 
  QueryFixedAssetDto,
  PageResult
} from '@/types/swagger-api';

export const assetApi = {
  // 创建固定资产
  create: async (data: CreateFixedAssetDto): Promise<RaxResult<FixedAssetDto>> => {
    return apiService.post<FixedAssetDto>('/v1/asset/fixed/create', data);
  },

  // 更新固定资产
  update: async (data: UpdateFixedAssetDto): Promise<RaxResult<FixedAssetDto>> => {
    return apiService.post<FixedAssetDto>('/v1/asset/fixed/update', data);
  },

  // 分页查询固定资产
  page: async (data: QueryFixedAssetDto): Promise<RaxResult<PageResult<FixedAssetDto>>> => {
    return apiService.post<PageResult<FixedAssetDto>>('/v1/asset/fixed/page', data);
  },

  // 获取固定资产详情
  get: async (id: number): Promise<RaxResult<FixedAssetDto>> => {
    return apiService.get<FixedAssetDto>(`/v1/asset/fixed/get/${id}`);
  },

  // 删除固定资产
  remove: async (id: number): Promise<RaxResult<void>> => {
    return apiService.get<void>(`/v1/asset/fixed/remove/${id}`);
  },
};