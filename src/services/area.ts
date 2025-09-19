import { apiService } from './api';
import type {
  RaxResult,
  SysAreaDto
} from '@/types/swagger-api';

export const areaApi = {
  // 获取子级区域详情列表 - 基于最新API文档
  listSubArea: async (parentId: number): Promise<RaxResult<SysAreaDto[]>> => {
    return apiService.get<SysAreaDto[]>(`/v1/area/listSubArea/${parentId}`);
  },

  // 获取子级区域名称列表 - 返回string数组
  listSubName: async (parentId: number): Promise<RaxResult<string[]>> => {
    return apiService.get<string[]>(`/v1/area/listSubName/${parentId}`);
  },
};