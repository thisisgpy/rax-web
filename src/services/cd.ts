import { apiService } from './api';
import type {
  RaxResult,
  LoanCdDto,
  CreateLoanCdDto,
  UpdateLoanCdDto,
  QueryLoanCdDto,
  CreateLoanCdMapDto,
  UpdateLoanCdMapDto,
  LoanCdWithMapDto,
  PageResult
} from '@/types/swagger-api';

export const cdApi = {
  // 创建存单
  create: async (data: CreateLoanCdDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/bill/cd/create', data);
  },

  // 更新存单
  update: async (data: UpdateLoanCdDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/bill/cd/update', data);
  },

  // 分页查询存单
  page: async (data: QueryLoanCdDto): Promise<RaxResult<PageResult<LoanCdDto>>> => {
    return apiService.post<PageResult<LoanCdDto>>('/v1/fin/bill/cd/page', data);
  },

  // 查询存单详情
  get: async (id: number): Promise<RaxResult<LoanCdDto>> => {
    return apiService.get<LoanCdDto>(`/v1/fin/bill/cd/get/${id}`);
  },

  // 删除存单
  remove: async (id: number): Promise<RaxResult<boolean>> => {
    return apiService.get<boolean>(`/v1/fin/bill/cd/remove/${id}`);
  },

  // 为贷款添加存单关联
  addToLoan: async (loanId: number, data: CreateLoanCdMapDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>(`/v1/fin/bill/cd/loan/${loanId}/add`, data);
  },

  // 更新贷款-存单关联信息
  updateMap: async (data: UpdateLoanCdMapDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/bill/cd/map/update', data);
  },

  // 删除贷款的存单关联
  removeFromLoan: async (loanId: number, cdId: number): Promise<RaxResult<boolean>> => {
    return apiService.get<boolean>(`/v1/fin/bill/cd/loan/${loanId}/remove/${cdId}`);
  },

  // 查询贷款关联的所有存单
  listByLoanId: async (loanId: number): Promise<RaxResult<LoanCdWithMapDto[]>> => {
    return apiService.get<LoanCdWithMapDto[]>(`/v1/fin/bill/cd/loan/${loanId}/list`);
  },

  // 分页查询未被融资关联的存单
  pageUnlinked: async (data: QueryLoanCdDto): Promise<RaxResult<PageResult<LoanCdDto>>> => {
    return apiService.post<PageResult<LoanCdDto>>('/v1/fin/bill/cd/page/unlinked', data);
  },
};
