import { apiService } from './api';
import type { 
  RaxResult, 
  SysResourceDto, 
  CreateResourceDto, 
  UpdateResourceDto
} from '@/types/swagger-api';

export const resourceApi = {
  // 创建资源
  create: async (data: CreateResourceDto): Promise<RaxResult<SysResourceDto>> => {
    return apiService.post<SysResourceDto>('/v1/resource/create', data);
  },

  // 更新资源
  update: async (data: UpdateResourceDto): Promise<RaxResult<SysResourceDto>> => {
    return apiService.post<SysResourceDto>('/v1/resource/update', data);
  },

  // 获取资源详情
  get: async (id: number): Promise<RaxResult<SysResourceDto>> => {
    return apiService.get<SysResourceDto>(`/v1/resource/get/${id}`);
  },

  // 获取资源树
  trees: async (): Promise<RaxResult<SysResourceDto[]>> => {
    return apiService.get<SysResourceDto[]>('/v1/resource/trees');
  },

  // 获取角色资源
  getResource: async (roleId: number): Promise<RaxResult<SysResourceDto[]>> => {
    return apiService.get<SysResourceDto[]>(`/v1/resource/getResource/${roleId}`);
  },

  // 获取用户菜单
  getMenu: async (userId: number): Promise<RaxResult<SysResourceDto[]>> => {
    return apiService.get<SysResourceDto[]>(`/v1/resource/getMenu/${userId}`);
  },

  // 查询子资源
  children: async (parentId: number): Promise<RaxResult<SysResourceDto[]>> => {
    return apiService.get<SysResourceDto[]>(`/v1/resource/children/${parentId}`);
  },

  // 删除资源
  remove: async (id: number): Promise<RaxResult<void>> => {
    return apiService.get<void>(`/v1/resource/remove/${id}`);
  },
};