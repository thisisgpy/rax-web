import { apiService } from './api';
import type { 
  RaxResult, 
  AdminAreaDto, 
  AreaNameDto
} from '@/types/swagger-api';

export const areaApi = {
  // 获取子区域详情
  listSubArea: async (parentId: number): Promise<RaxResult<AdminAreaDto[]>> => {
    return apiService.get<AdminAreaDto[]>(`/v1/area/listSubArea/${parentId}`);
  },

  // 获取子区域名称
  listSubName: async (parentId: number): Promise<RaxResult<AreaNameDto[]>> => {
    return apiService.get<AreaNameDto[]>(`/v1/area/listSubName/${parentId}`);
  },
};