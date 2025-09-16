import { apiService } from './api';
import type { 
  RaxResult, 
  SysDictDto, 
  SysDictItemDto,
  CreateDictDto, 
  UpdateDictDto, 
  QueryDictDto,
  CreateDictItemDto,
  UpdateDictItemDto,
  PageResult
} from '@/types/swagger-api';

export const dictApi = {
  // ===== 字典管理 =====
  
  // 创建字典
  create: async (data: CreateDictDto): Promise<RaxResult<SysDictDto>> => {
    return apiService.post<SysDictDto>('/v1/dict/create', data);
  },

  // 更新字典
  update: async (data: UpdateDictDto): Promise<RaxResult<SysDictDto>> => {
    return apiService.post<SysDictDto>('/v1/dict/update', data);
  },

  // 分页查询字典
  page: async (data: QueryDictDto): Promise<RaxResult<PageResult<SysDictDto>>> => {
    return apiService.post<PageResult<SysDictDto>>('/v1/dict/page', data);
  },

  // 获取字典详情
  get: async (id: number): Promise<RaxResult<SysDictDto>> => {
    return apiService.get<SysDictDto>(`/v1/dict/get/${id}`);
  },

  // 删除字典
  remove: async (id: number): Promise<RaxResult<void>> => {
    return apiService.get<void>(`/v1/dict/remove/${id}`);
  },

  // ===== 字典项管理 =====
  
  // 创建字典项
  createItem: async (data: CreateDictItemDto): Promise<RaxResult<SysDictItemDto>> => {
    return apiService.post<SysDictItemDto>('/v1/dict/item/create', data);
  },

  // 更新字典项
  updateItem: async (data: UpdateDictItemDto): Promise<RaxResult<SysDictItemDto>> => {
    return apiService.post<SysDictItemDto>('/v1/dict/item/update', data);
  },

  // 获取字典项详情
  getItem: async (id: number): Promise<RaxResult<SysDictItemDto>> => {
    return apiService.get<SysDictItemDto>(`/v1/dict/item/get/${id}`);
  },

  // 删除字典项
  removeItem: async (id: number): Promise<RaxResult<void>> => {
    return apiService.get<void>(`/v1/dict/item/remove/${id}`);
  },

  // 获取字典项树（通过字典ID）
  getItemTree: async (dictId: number): Promise<RaxResult<SysDictItemDto[]>> => {
    return apiService.get<SysDictItemDto[]>(`/v1/dict/item/tree/${dictId}`);
  },

  // 获取字典项树（通过字典编码）
  getItemTreeByCode: async (dictCode: string): Promise<RaxResult<SysDictItemDto[]>> => {
    return apiService.get<SysDictItemDto[]>(`/v1/dict/item/tree/code/${dictCode}`);
  },
};