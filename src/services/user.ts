import { apiService } from './api';
import type { 
  RaxResult, 
  SysUserDto, 
  CreateUserDto, 
  UpdateUserDto, 
  QueryUserDto,
  ChangePasswordDto,
  PageResult
} from '@/types/swagger-api';

export const userApi = {
  // 创建用户
  create: async (data: CreateUserDto): Promise<RaxResult<SysUserDto>> => {
    return apiService.post<SysUserDto>('/v1/user/create', data);
  },

  // 更新用户
  update: async (data: UpdateUserDto): Promise<RaxResult<SysUserDto>> => {
    return apiService.post<SysUserDto>('/v1/user/update', data);
  },

  // 分页查询用户
  page: async (data: QueryUserDto): Promise<RaxResult<PageResult<SysUserDto>>> => {
    return apiService.post<PageResult<SysUserDto>>('/v1/user/page', data);
  },

  // 修改用户密码
  changePassword: async (data: ChangePasswordDto): Promise<RaxResult<void>> => {
    return apiService.post<void>('/v1/user/changePassword', data);
  },

  // 获取用户详情
  get: async (id: number): Promise<RaxResult<SysUserDto>> => {
    return apiService.get<SysUserDto>(`/v1/user/get/${id}`);
  },

  // 删除用户
  remove: async (id: number): Promise<RaxResult<void>> => {
    return apiService.get<void>(`/v1/user/remove/${id}`);
  },

  // 重置用户密码
  resetPassword: async (id: number): Promise<RaxResult<void>> => {
    return apiService.get<void>(`/v1/user/resetPassword/${id}`);
  },
};