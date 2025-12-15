import { apiService } from './api';
import type {
  RaxResult,
  TrustTrancheDto,
  CreateTrustTrancheDto,
  UpdateTrustTrancheDto,
  QueryTrustTrancheDto
} from '@/types/swagger-api';

export const trustTrancheApi = {
  // 创建单个信托分层明细
  create: async (loanId: number, data: CreateTrustTrancheDto): Promise<RaxResult<number>> => {
    return apiService.post<number>(`/v1/fin/loan/trust-tranche/create/${loanId}`, data);
  },

  // 批量创建信托分层明细
  createBatch: async (loanId: number, data: CreateTrustTrancheDto[]): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>(`/v1/fin/loan/trust-tranche/create-batch/${loanId}`, data);
  },

  // 更新信托分层明细
  update: async (data: UpdateTrustTrancheDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/loan/trust-tranche/update', data);
  },

  // 多条件查询信托分层明细列表
  list: async (query: QueryTrustTrancheDto): Promise<RaxResult<TrustTrancheDto[]>> => {
    return apiService.post<TrustTrancheDto[]>('/v1/fin/loan/trust-tranche/list', query);
  },

  // 根据融资ID查询信托分层明细列表
  listByLoan: async (loanId: number): Promise<RaxResult<TrustTrancheDto[]>> => {
    return apiService.get<TrustTrancheDto[]>(`/v1/fin/loan/trust-tranche/list-by-loan/${loanId}`);
  },

  // 查询单个信托分层明细
  get: async (id: number): Promise<RaxResult<TrustTrancheDto>> => {
    return apiService.get<TrustTrancheDto>(`/v1/fin/loan/trust-tranche/get/${id}`);
  },

  // 删除信托分层明细
  remove: async (id: number): Promise<RaxResult<boolean>> => {
    return apiService.get<boolean>(`/v1/fin/loan/trust-tranche/remove/${id}`);
  },
};
