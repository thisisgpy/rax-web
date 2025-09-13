import { apiService } from './api';
import type { 
  RaxResult, 
  SysBankDto, 
  QueryBankDto,
  PageResult
} from '@/types/swagger-api';

export const bankApi = {
  // 分页查询银行
  page: async (data: QueryBankDto): Promise<RaxResult<PageResult<SysBankDto>>> => {
    return apiService.post<PageResult<SysBankDto>>('/v1/bank/page', data);
  },
};