import { apiService } from './api';
import type {
  RaxResult,
  FactoringArItemDto,
  CreateFactoringArItemDto,
  UpdateFactoringArItemDto,
  QueryFactoringArItemDto
} from '@/types/swagger-api';

export const factoringArItemApi = {
  // 创建单个保理应收明细
  create: async (loanId: number, data: CreateFactoringArItemDto): Promise<RaxResult<number>> => {
    return apiService.post<number>(`/v1/fin/loan/factoring-ar-item/create/${loanId}`, data);
  },

  // 批量创建保理应收明细
  createBatch: async (loanId: number, data: CreateFactoringArItemDto[]): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>(`/v1/fin/loan/factoring-ar-item/create-batch/${loanId}`, data);
  },

  // 更新保理应收明细
  update: async (data: UpdateFactoringArItemDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/loan/factoring-ar-item/update', data);
  },

  // 多条件查询保理应收明细列表
  list: async (query: QueryFactoringArItemDto): Promise<RaxResult<FactoringArItemDto[]>> => {
    return apiService.post<FactoringArItemDto[]>('/v1/fin/loan/factoring-ar-item/list', query);
  },

  // 根据融资ID查询保理应收明细列表
  listByLoan: async (loanId: number): Promise<RaxResult<FactoringArItemDto[]>> => {
    return apiService.get<FactoringArItemDto[]>(`/v1/fin/loan/factoring-ar-item/list-by-loan/${loanId}`);
  },

  // 查询单个保理应收明细
  get: async (id: number): Promise<RaxResult<FactoringArItemDto>> => {
    return apiService.get<FactoringArItemDto>(`/v1/fin/loan/factoring-ar-item/get/${id}`);
  },

  // 删除保理应收明细
  remove: async (id: number): Promise<RaxResult<boolean>> => {
    return apiService.get<boolean>(`/v1/fin/loan/factoring-ar-item/remove/${id}`);
  },
};
