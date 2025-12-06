import { apiService } from './api';
import type {
  RaxResult,
  LoanDto,
  CreateLoanDto,
  UpdateLoanDto,
  QueryLoanDto,
  PageResult
} from '@/types/swagger-api';

export const loanApi = {
  // 创建融资
  create: async (data: CreateLoanDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/loan/create', data);
  },

  // 更新融资
  update: async (data: UpdateLoanDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/loan/update', data);
  },

  // 分页查询融资列表
  page: async (data: QueryLoanDto): Promise<RaxResult<PageResult<LoanDto>>> => {
    return apiService.post<PageResult<LoanDto>>('/v1/fin/loan/page', data);
  },

  // 查询融资详情（含关联数据）
  get: async (id: number): Promise<RaxResult<LoanDto>> => {
    return apiService.get<LoanDto>(`/v1/fin/loan/get/${id}`);
  },

  // 查询融资基础信息（不含关联数据）
  getBasic: async (id: number): Promise<RaxResult<LoanDto>> => {
    return apiService.get<LoanDto>(`/v1/fin/loan/get/basic/${id}`);
  },

  // 删除融资
  remove: async (id: number): Promise<RaxResult<boolean>> => {
    return apiService.get<boolean>(`/v1/fin/loan/remove/${id}`);
  },
};
