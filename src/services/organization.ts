import { apiService } from './api';
import type { 
  RaxResult, 
  SysOrgDto, 
  CreateOrgDto, 
  UpdateOrgDto
} from '@/types/swagger-api';

export const organizationApi = {
  // 创建组织
  create: async (data: CreateOrgDto): Promise<RaxResult<SysOrgDto>> => {
    return apiService.post<SysOrgDto>('/v1/org/create', data);
  },

  // 更新组织
  update: async (data: UpdateOrgDto): Promise<RaxResult<SysOrgDto>> => {
    return apiService.post<SysOrgDto>('/v1/org/update', data);
  },

  // 获取组织详情
  get: async (id: number): Promise<RaxResult<SysOrgDto>> => {
    return apiService.get<SysOrgDto>(`/v1/org/get/${id}`);
  },

  // 获取组织架构树
  getOrgTree: async (): Promise<RaxResult<SysOrgDto[]>> => {
    return apiService.get<SysOrgDto[]>('/v1/org/tree');
  },

  // 删除组织
  remove: async (id: number): Promise<RaxResult<void>> => {
    return apiService.get<void>(`/v1/org/remove/${id}`);
  },
};