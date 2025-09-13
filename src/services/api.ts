import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { 
  RaxResult, 
  SysOrgDto, 
  CreateOrgDto, 
  UpdateOrgDto,
  QueryUserDto,
  CreateUserDto,
  UpdateUserDto,
  SysUserDto,
  PageResult
} from '@/types/swagger-api';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  code: number;
}

class ApiService {
  private instance: AxiosInstance;
  private errorHandler?: (message: string) => void;

  constructor() {
    this.instance = axios.create({
      baseURL: '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  // 设置错误处理函数
  setErrorHandler(handler: (message: string) => void) {
    this.errorHandler = handler;
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse<RaxResult>) => {
        // 检查业务层面的错误（HTTP 200 但 success: false）
        const data = response.data;
        if (data && typeof data === 'object' && 'success' in data && !data.success) {
          // 显示错误消息
          if (this.errorHandler) {
            this.errorHandler(data.message || '操作失败');
          }
        }
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_info');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async request<T = any>(config: AxiosRequestConfig): Promise<RaxResult<T>> {
    try {
      const response = await this.instance.request<RaxResult<T>>(config);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<RaxResult<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<RaxResult<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<RaxResult<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<RaxResult<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }
}

export const apiService = new ApiService();

// 扩展 API 服务类，添加具体的业务接口
class BusinessApiService extends ApiService {
  // ===== 组织管理接口 =====
  
  async getOrganizations(): Promise<RaxResult<SysOrgDto>> {
    return this.get<SysOrgDto>('/v1/org/tree');
  }

  async createOrganization(data: CreateOrgDto): Promise<RaxResult<boolean>> {
    return this.post<boolean>('/v1/org/create', data);
  }

  async updateOrganization(data: UpdateOrgDto): Promise<RaxResult<boolean>> {
    return this.post<boolean>('/v1/org/update', data);
  }

  async deleteOrganization(id: number): Promise<RaxResult<boolean>> {
    return this.get<boolean>(`/v1/org/remove/${id}`);
  }

  // ===== 用户管理接口 =====
  
  async queryUsers(params: QueryUserDto): Promise<RaxResult<PageResult<SysUserDto>>> {
    return this.post<PageResult<SysUserDto>>('/v1/user/page', params);
  }

  async createUser(data: CreateUserDto): Promise<RaxResult<boolean>> {
    return this.post<boolean>('/v1/user/create', data);
  }

  async updateUser(data: UpdateUserDto): Promise<RaxResult<boolean>> {
    return this.post<boolean>('/v1/user/update', data);
  }

  async deleteUser(id: number): Promise<RaxResult<boolean>> {
    return this.get<boolean>(`/v1/user/remove/${id}`);
  }

  async getUserById(id: number): Promise<RaxResult<SysUserDto>> {
    return this.get<SysUserDto>(`/v1/user/get/${id}`);
  }

  async resetUserPassword(id: number): Promise<RaxResult<boolean>> {
    return this.get<boolean>(`/v1/user/resetPassword/${id}`);
  }
}

// 导出业务 API 服务实例
export const businessApiService = new BusinessApiService();