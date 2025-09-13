import { apiService } from './api';
import type { 
  RaxResult, 
  SysRoleDto, 
  CreateRoleDto, 
  UpdateRoleDto, 
  QueryRoleDto,
  PageResult
} from '@/types/swagger-api';

export const roleApi = {
  // 创建角色
  create: async (data: CreateRoleDto): Promise<RaxResult<SysRoleDto>> => {
    return apiService.post<SysRoleDto>('/v1/role/create', data);
  },

  // 更新角色
  update: async (data: UpdateRoleDto): Promise<RaxResult<SysRoleDto>> => {
    return apiService.post<SysRoleDto>('/v1/role/update', data);
  },

  // 分页查询角色
  page: async (data: QueryRoleDto): Promise<RaxResult<PageResult<SysRoleDto>>> => {
    return apiService.post<PageResult<SysRoleDto>>('/v1/role/page', data);
  },

  // 获取角色详情
  get: async (id: number): Promise<RaxResult<SysRoleDto>> => {
    return apiService.get<SysRoleDto>(`/v1/role/get/${id}`);
  },

  // 获取角色列表
  list: async (): Promise<RaxResult<SysRoleDto[]>> => {
    return apiService.get<SysRoleDto[]>('/v1/role/list');
  },

  // 获取用户角色
  getRole: async (userId: number): Promise<RaxResult<SysRoleDto[]>> => {
    return apiService.get<SysRoleDto[]>(`/v1/role/getRole/${userId}`);
  },

  // 删除角色
  remove: async (id: number): Promise<RaxResult<void>> => {
    return apiService.get<void>(`/v1/role/remove/${id}`);
  },
};