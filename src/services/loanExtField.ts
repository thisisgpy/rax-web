import { apiService } from './api';
import type {
  RaxResult,
  FinLoanExtFieldDefDto,
  CreateFinLoanExtFieldDefDto,
  UpdateFinLoanExtFieldDefDto,
  FinLoanExtFieldValDto
} from '@/types/swagger-api';

export const loanExtFieldApi = {
  // 创建扩展字段定义
  createDef: async (data: CreateFinLoanExtFieldDefDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/loan/support/extFieldDef/create', data);
  },

  // 更新扩展字段定义
  updateDef: async (data: UpdateFinLoanExtFieldDefDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/loan/support/extFieldDef/update', data);
  },

  // 查询扩展字段定义
  getDef: async (id: number): Promise<RaxResult<FinLoanExtFieldDefDto>> => {
    return apiService.get<FinLoanExtFieldDefDto>(`/v1/fin/loan/support/extFieldDef/get/${id}`);
  },

  // 查询扩展字段定义列表
  getDefList: async (productFamily: string, productType: string): Promise<RaxResult<FinLoanExtFieldDefDto[]>> => {
    return apiService.get<FinLoanExtFieldDefDto[]>(`/v1/fin/loan/support/extFieldDef/list/${productFamily}/${productType}`);
  },

  // 删除扩展字段定义
  removeDef: async (id: number): Promise<RaxResult<boolean>> => {
    return apiService.get<boolean>(`/v1/fin/loan/support/extFieldDef/remove/${id}`);
  },

  // 查询扩展字段值列表
  getValList: async (loanId: number): Promise<RaxResult<FinLoanExtFieldValDto[]>> => {
    return apiService.get<FinLoanExtFieldValDto[]>(`/v1/fin/loan/support/extFieldVal/list/${loanId}`);
  },
};
