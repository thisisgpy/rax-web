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
    // 在生产环境直接调用 API，开发环境使用代理
    const baseURL = import.meta.env.PROD ? 'https://api.ganpengyu.com/api' : '/api';
    
    this.instance = axios.create({
      baseURL,
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
        const data = response.data;

        // 检查业务层面的错误（HTTP 200 但 success: false）
        if (data && typeof data === 'object' && 'success' in data && data.success === false) {
          const errorMessage = data.message || '操作失败';

          // 显示错误消息
          if (this.errorHandler) {
            this.errorHandler(errorMessage);
          }

          // 抛出错误，让调用方也能感知到失败状态
          const error = new Error(errorMessage);
          (error as any).code = data.code;
          (error as any).data = data;
          return Promise.reject(error);
        }

        return response;
      },
      (error) => {
        // 处理网络错误和 HTTP 错误状态码
        let errorMessage = '网络请求失败';

        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;

          switch (status) {
            case 401:
              errorMessage = '登录已过期，请重新登录';
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_info');
              window.location.href = '/login';
              break;
            case 403:
              errorMessage = '权限不足';
              break;
            case 404:
              errorMessage = '请求的资源不存在';
              break;
            case 500:
              errorMessage = '服务器内部错误';
              break;
            default:
              // 尝试从响应数据中获取错误信息
              if (data?.message) {
                errorMessage = data.message;
              } else {
                errorMessage = `请求失败 (${status})`;
              }
          }
        } else if (error.request) {
          errorMessage = '网络连接失败，请检查网络';
        } else {
          errorMessage = error.message || '请求配置错误';
        }

        // 显示错误消息
        if (this.errorHandler) {
          this.errorHandler(errorMessage);
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

// 导出默认的 API 服务实例
export default apiService;