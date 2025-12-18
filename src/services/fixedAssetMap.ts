import { apiService } from './api';
import type {
  RaxResult,
  FixedAssetMapDto,
  CreateFixedAssetMapDto,
  UpdateFixedAssetMapDto
} from '@/types/swagger-api';

export const fixedAssetMapApi = {
  // 创建单个融资-固定资产关联
  create: async (loanId: number, data: CreateFixedAssetMapDto): Promise<RaxResult<number>> => {
    return apiService.post<number>(`/v1/fin/loan/fixed-asset-map/create/${loanId}`, data);
  },

  // 批量创建融资-固定资产关联
  createBatch: async (loanId: number, data: CreateFixedAssetMapDto[]): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>(`/v1/fin/loan/fixed-asset-map/create-batch/${loanId}`, data);
  },

  // 更新融资-固定资产关联
  update: async (data: UpdateFixedAssetMapDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/loan/fixed-asset-map/update', data);
  },

  // 根据融资ID查询固定资产关联列表
  listByLoan: async (loanId: number): Promise<RaxResult<FixedAssetMapDto[]>> => {
    return apiService.get<FixedAssetMapDto[]>(`/v1/fin/loan/fixed-asset-map/list-by-loan/${loanId}`);
  },

  // 查询单个固定资产关联
  get: async (id: number): Promise<RaxResult<FixedAssetMapDto>> => {
    return apiService.get<FixedAssetMapDto>(`/v1/fin/loan/fixed-asset-map/get/${id}`);
  },

  // 删除固定资产关联
  remove: async (id: number): Promise<RaxResult<boolean>> => {
    return apiService.get<boolean>(`/v1/fin/loan/fixed-asset-map/remove/${id}`);
  },
};
