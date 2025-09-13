import { apiService } from './api';
import type { 
  RaxResult, 
  FinInstitutionDto, 
  CreateFinInstitutionDto, 
  QueryFinInstitutionDto,
  PageResult
} from '@/types/swagger-api';

export const institutionApi = {
  // 创建金融机构
  create: async (data: CreateFinInstitutionDto): Promise<RaxResult<FinInstitutionDto>> => {
    return apiService.post<FinInstitutionDto>('/v1/fin/institution/create', data);
  },

  // 分页查询金融机构
  page: async (data: QueryFinInstitutionDto): Promise<RaxResult<PageResult<FinInstitutionDto>>> => {
    return apiService.post<PageResult<FinInstitutionDto>>('/v1/fin/institution/page', data);
  },

  // 获取金融机构详情
  get: async (id: number): Promise<RaxResult<FinInstitutionDto>> => {
    return apiService.get<FinInstitutionDto>(`/v1/fin/institution/get/${id}`);
  },

  // 删除金融机构
  remove: async (id: number): Promise<RaxResult<void>> => {
    return apiService.get<void>(`/v1/fin/institution/remove/${id}`);
  },

  // 按地区筛选金融机构
  filter: async (province: string, city: string, district: string): Promise<RaxResult<FinInstitutionDto[]>> => {
    return apiService.get<FinInstitutionDto[]>(`/v1/fin/institution/filter/${province}/${city}/${district}`);
  },
};