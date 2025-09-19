import { apiService } from './api';
import type {
  RaxResult,
  FinInstitutionDto,
  CreateInstitutionDto,
  UpdateInstitutionDto,
  QueryInstitutionDto,
  PageResult
} from '@/types/swagger-api';

export const institutionApi = {
  // 创建金融机构
  create: async (data: CreateInstitutionDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/institution/create', data);
  },

  // 更新金融机构 (注意：API文档中没有update端点，但通常使用create实现)
  update: async (data: UpdateInstitutionDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/institution/create', data);
  },

  // 分页查询金融机构
  page: async (data: QueryInstitutionDto): Promise<RaxResult<PageResult<FinInstitutionDto>>> => {
    return apiService.post<PageResult<FinInstitutionDto>>('/v1/fin/institution/page', data);
  },

  // 获取金融机构详情
  get: async (id: number): Promise<RaxResult<FinInstitutionDto>> => {
    return apiService.get<FinInstitutionDto>(`/v1/fin/institution/get/${id}`);
  },

  // 删除金融机构
  remove: async (id: number): Promise<RaxResult<boolean>> => {
    return apiService.get<boolean>(`/v1/fin/institution/remove/${id}`);
  },

  // 按地区筛选金融机构名称
  filter: async (province: string, city: string, district: string): Promise<RaxResult<string[]>> => {
    return apiService.get<string[]>(`/v1/fin/institution/filter/${province}/${city}/${district}`);
  },
};