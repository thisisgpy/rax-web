import { apiService } from './api';
import type {
  RaxResult,
  LoanLcDto,
  CreateLoanLcDto,
  UpdateLoanLcDto,
  QueryLoanLcDto,
  CreateLoanLcMapDto,
  UpdateLoanLcMapDto,
  LoanLcWithMapDto,
  PageResult
} from '@/types/swagger-api';

export const lcApi = {
  // 创建信用证
  create: async (data: CreateLoanLcDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/bill/lc/create', data);
  },

  // 更新信用证
  update: async (data: UpdateLoanLcDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/bill/lc/update', data);
  },

  // 分页查询信用证
  page: async (data: QueryLoanLcDto): Promise<RaxResult<PageResult<LoanLcDto>>> => {
    return apiService.post<PageResult<LoanLcDto>>('/v1/fin/bill/lc/page', data);
  },

  // 查询信用证详情
  get: async (id: number): Promise<RaxResult<LoanLcDto>> => {
    return apiService.get<LoanLcDto>(`/v1/fin/bill/lc/get/${id}`);
  },

  // 删除信用证
  remove: async (id: number): Promise<RaxResult<boolean>> => {
    return apiService.get<boolean>(`/v1/fin/bill/lc/remove/${id}`);
  },

  // 为贷款添加信用证关联
  addToLoan: async (loanId: number, data: CreateLoanLcMapDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>(`/v1/fin/bill/lc/loan/${loanId}/add`, data);
  },

  // 更新贷款-信用证关联信息
  updateMap: async (data: UpdateLoanLcMapDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/bill/lc/map/update', data);
  },

  // 删除贷款的信用证关联
  removeFromLoan: async (loanId: number, lcId: number): Promise<RaxResult<boolean>> => {
    return apiService.get<boolean>(`/v1/fin/bill/lc/loan/${loanId}/remove/${lcId}`);
  },

  // 查询贷款关联的所有信用证
  listByLoanId: async (loanId: number): Promise<RaxResult<LoanLcWithMapDto[]>> => {
    return apiService.get<LoanLcWithMapDto[]>(`/v1/fin/bill/lc/loan/${loanId}/list`);
  },

  // 分页查询未被融资关联的信用证
  pageUnlinked: async (data: QueryLoanLcDto): Promise<RaxResult<PageResult<LoanLcDto>>> => {
    return apiService.post<PageResult<LoanLcDto>>('/v1/fin/bill/lc/page/unlinked', data);
  },
};
