import { apiService } from './api';
import type { 
  RaxResult, 
  SysBankCardDto, 
  CreateBankCardDto, 
  UpdateBankCardDto, 
  QueryBankCardDto,
  PageResult
} from '@/types/swagger-api';

export const bankCardApi = {
  // 创建银行卡
  create: async (data: CreateBankCardDto): Promise<RaxResult<SysBankCardDto>> => {
    return apiService.post<SysBankCardDto>('/v1/card/create', data);
  },

  // 更新银行卡
  update: async (data: UpdateBankCardDto): Promise<RaxResult<SysBankCardDto>> => {
    return apiService.post<SysBankCardDto>('/v1/card/update', data);
  },

  // 分页查询银行卡
  page: async (data: QueryBankCardDto): Promise<RaxResult<PageResult<SysBankCardDto>>> => {
    return apiService.post<PageResult<SysBankCardDto>>('/v1/card/page', data);
  },

  // 获取银行卡详情
  get: async (id: number): Promise<RaxResult<SysBankCardDto>> => {
    return apiService.get<SysBankCardDto>(`/v1/card/get/${id}`);
  },

  // 删除银行卡
  remove: async (id: number): Promise<RaxResult<void>> => {
    return apiService.get<void>(`/v1/card/remove/${id}`);
  },
};