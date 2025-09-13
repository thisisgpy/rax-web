import { apiService } from './api';
import type { 
  RaxResult, 
  UserLoginDto, 
  LoginUserDto, 
  AssignUserRoleDto, 
  AssignRoleResourceDto,
  SysUserDto 
} from '@/types/swagger-api';

export const authApi = {
  // 用户登录
  login: async (data: UserLoginDto): Promise<RaxResult<LoginUserDto>> => {
    const response = await apiService.post<LoginUserDto>('/v1/auth/login', data);
    
    // 登录成功后保存 token 和用户信息
    if (response.success && response.data) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_info', JSON.stringify(response.data.userInfo));
      localStorage.setItem('user_menus', JSON.stringify(response.data.menus));
    }
    
    return response;
  },

  // 用户登出
  logout: async (userId: number): Promise<RaxResult<void>> => {
    try {
      const response = await apiService.get<void>(`/v1/auth/logout/${userId}`);
      
      // 清除本地存储
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('user_menus');
      
      return response;
    } catch (error) {
      // 即使登出接口失败，也要清除本地存储
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('user_menus');
      throw error;
    }
  },

  // 分配用户角色
  assignUserRole: async (data: AssignUserRoleDto): Promise<RaxResult<void>> => {
    return apiService.post<void>('/v1/auth/assignUserRole', data);
  },

  // 分配角色资源
  assignRoleResource: async (data: AssignRoleResourceDto): Promise<RaxResult<void>> => {
    return apiService.post<void>('/v1/auth/assignRoleResource', data);
  },

  // 检查用户权限
  hasPermission: async (userId: number, resourceCode: string): Promise<RaxResult<boolean>> => {
    return apiService.get<boolean>(`/v1/auth/hasPermission/${userId}/${resourceCode}`);
  },

  // 获取当前用户信息
  getCurrentUser: (): SysUserDto | null => {
    const userStr = localStorage.getItem('user_info');
    return userStr ? JSON.parse(userStr) : null;
  },

  // 获取用户菜单
  getUserMenus: (): any[] => {
    const menusStr = localStorage.getItem('user_menus');
    return menusStr ? JSON.parse(menusStr) : [];
  },

  // 获取 token
  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  // 检查是否已登录
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user_info');
    return !!(token && user);
  },

  // 清除认证信息
  clearAuth: (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('user_menus');
  },
};