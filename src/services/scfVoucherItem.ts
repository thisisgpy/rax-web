import { apiService } from './api';
import type {
  RaxResult,
  ScfVoucherItemDto,
  CreateScfVoucherItemDto,
  UpdateScfVoucherItemDto,
  QueryScfVoucherItemDto
} from '@/types/swagger-api';

export const scfVoucherItemApi = {
  // 创建单个供应链金融凭证明细
  create: async (loanId: number, data: CreateScfVoucherItemDto): Promise<RaxResult<number>> => {
    return apiService.post<number>(`/v1/fin/loan/scf-voucher-item/create/${loanId}`, data);
  },

  // 批量创建供应链金融凭证明细
  createBatch: async (loanId: number, data: CreateScfVoucherItemDto[]): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>(`/v1/fin/loan/scf-voucher-item/create-batch/${loanId}`, data);
  },

  // 更新供应链金融凭证明细
  update: async (data: UpdateScfVoucherItemDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/loan/scf-voucher-item/update', data);
  },

  // 多条件查询供应链金融凭证明细列表
  list: async (query: QueryScfVoucherItemDto): Promise<RaxResult<ScfVoucherItemDto[]>> => {
    return apiService.post<ScfVoucherItemDto[]>('/v1/fin/loan/scf-voucher-item/list', query);
  },

  // 根据融资ID查询供应链金融凭证明细列表
  listByLoan: async (loanId: number): Promise<RaxResult<ScfVoucherItemDto[]>> => {
    return apiService.get<ScfVoucherItemDto[]>(`/v1/fin/loan/scf-voucher-item/list-by-loan/${loanId}`);
  },

  // 查询单个供应链金融凭证明细
  get: async (id: number): Promise<RaxResult<ScfVoucherItemDto>> => {
    return apiService.get<ScfVoucherItemDto>(`/v1/fin/loan/scf-voucher-item/get/${id}`);
  },

  // 删除供应链金融凭证明细
  remove: async (id: number): Promise<RaxResult<boolean>> => {
    return apiService.get<boolean>(`/v1/fin/loan/scf-voucher-item/remove/${id}`);
  },
};
