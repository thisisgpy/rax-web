import { apiService } from './api';
import type {
  RaxResult,
  LeasedAssetDto,
  CreateLeasedAssetDto,
  UpdateLeasedAssetDto,
  QueryLeasedAssetDto
} from '@/types/swagger-api';

export const leasedAssetApi = {
  // 创建单个租赁物
  create: async (loanId: number, data: CreateLeasedAssetDto): Promise<RaxResult<number>> => {
    return apiService.post<number>(`/v1/fin/loan/leased-asset/create/${loanId}`, data);
  },

  // 批量创建租赁物
  createBatch: async (loanId: number, data: CreateLeasedAssetDto[]): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>(`/v1/fin/loan/leased-asset/create-batch/${loanId}`, data);
  },

  // 更新租赁物
  update: async (data: UpdateLeasedAssetDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/loan/leased-asset/update', data);
  },

  // 多条件查询租赁物列表
  list: async (query: QueryLeasedAssetDto): Promise<RaxResult<LeasedAssetDto[]>> => {
    return apiService.post<LeasedAssetDto[]>('/v1/fin/loan/leased-asset/list', query);
  },

  // 根据融资ID查询租赁物列表
  listByLoan: async (loanId: number): Promise<RaxResult<LeasedAssetDto[]>> => {
    return apiService.get<LeasedAssetDto[]>(`/v1/fin/loan/leased-asset/list-by-loan/${loanId}`);
  },

  // 查询单个租赁物
  get: async (id: number): Promise<RaxResult<LeasedAssetDto>> => {
    return apiService.get<LeasedAssetDto>(`/v1/fin/loan/leased-asset/get/${id}`);
  },

  // 删除租赁物
  remove: async (id: number): Promise<RaxResult<boolean>> => {
    return apiService.get<boolean>(`/v1/fin/loan/leased-asset/remove/${id}`);
  },
};
