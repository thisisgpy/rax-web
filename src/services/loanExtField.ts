import { apiService } from './api';
import type {
  RaxResult,
  FinLoanExtFieldConfigDto,
  CreateFinLoanExtFieldConfigDto,
  UpdateFinLoanExtFieldConfigDto,
  FinLoanExtFieldDefDto,
  CreateFinLoanExtFieldDefDto,
  UpdateFinLoanExtFieldDefDto,
  FinLoanExtFieldValDto
} from '@/types/swagger-api';

export const loanExtFieldApi = {
  // ===== 扩展字段配置 =====

  // 创建扩展字段配置
  createConfig: async (data: CreateFinLoanExtFieldConfigDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/loan/extFieldConfig/create', data);
  },

  // 更新扩展字段配置
  updateConfig: async (data: UpdateFinLoanExtFieldConfigDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/loan/extFieldConfig/update', data);
  },

  // 查询扩展字段配置详情
  getConfig: async (id: number): Promise<RaxResult<FinLoanExtFieldConfigDto>> => {
    return apiService.get<FinLoanExtFieldConfigDto>(`/v1/fin/loan/extFieldConfig/get/${id}`);
  },

  // 查询扩展字段配置列表
  getConfigList: async (): Promise<RaxResult<FinLoanExtFieldConfigDto[]>> => {
    return apiService.get<FinLoanExtFieldConfigDto[]>('/v1/fin/loan/extFieldConfig/list');
  },

  // 删除扩展字段配置
  removeConfig: async (id: number): Promise<RaxResult<boolean>> => {
    return apiService.get<boolean>(`/v1/fin/loan/extFieldConfig/remove/${id}`);
  },

  // ===== 扩展字段定义 =====

  // 创建扩展字段定义
  createDef: async (data: CreateFinLoanExtFieldDefDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/loan/extFieldDef/create', data);
  },

  // 更新扩展字段定义
  updateDef: async (data: UpdateFinLoanExtFieldDefDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/loan/extFieldDef/update', data);
  },

  // 查询扩展字段定义详情
  getDef: async (id: number): Promise<RaxResult<FinLoanExtFieldDefDto>> => {
    return apiService.get<FinLoanExtFieldDefDto>(`/v1/fin/loan/extFieldDef/get/${id}`);
  },

  // 查询配置下的扩展字段定义列表
  getDefListByConfig: async (configId: number): Promise<RaxResult<FinLoanExtFieldDefDto[]>> => {
    return apiService.get<FinLoanExtFieldDefDto[]>(`/v1/fin/loan/extFieldConfig/${configId}/extFieldDefs`);
  },

  // 根据产品族和产品类型查询扩展字段定义列表（先返回通用字段，再返回特定字段）
  getDefListByProduct: async (productFamily: string, productType: string): Promise<RaxResult<FinLoanExtFieldDefDto[]>> => {
    return apiService.get<FinLoanExtFieldDefDto[]>('/v1/fin/loan/extFieldDef/list', {
      params: { productFamily, productType }
    });
  },

  // 删除扩展字段定义
  removeDef: async (id: number): Promise<RaxResult<boolean>> => {
    return apiService.get<boolean>(`/v1/fin/loan/extFieldDef/remove/${id}`);
  },

  // ===== 扩展字段值 =====

  // 查询扩展字段值列表
  getValList: async (loanId: number): Promise<RaxResult<FinLoanExtFieldValDto[]>> => {
    return apiService.get<FinLoanExtFieldValDto[]>(`/v1/fin/loan/extFieldVal/list/${loanId}`);
  },
};
