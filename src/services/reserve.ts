import { apiService } from './api';
import type {
  RaxResult,
  FinReserveDto,
  CreateReserveDto,
  UpdateReserveDto,
  QueryReserveDto,
  FinReserveReportDto,
  CreateReserveReportDto,
  UpdateReserveProgressDto,
  FinReserveProgressDto,
  FinReserveProgressStep,
  PageResult,
  CancelReserveDto
} from '@/types/swagger-api';

export const reserveApi = {
  // 创建储备融资
  create: async (data: CreateReserveDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/reserve/create', data);
  },

  // 更新储备融资
  update: async (data: UpdateReserveDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/reserve/update', data);
  },

  // 分页查询储备融资
  page: async (data: QueryReserveDto): Promise<RaxResult<PageResult<FinReserveDto>>> => {
    return apiService.post<PageResult<FinReserveDto>>('/v1/fin/reserve/page', data);
  },

  // 创建储备融资报告
  createReport: async (data: CreateReserveReportDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/reserve/report/create', data);
  },

  // 更新储备融资进度
  updateProgress: async (data: UpdateReserveProgressDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/reserve/progress/update', data);
  },

  // 获取储备融资进度步骤
  getProgressSteps: async (): Promise<RaxResult<FinReserveProgressStep[]>> => {
    return apiService.get<FinReserveProgressStep[]>('/v1/fin/reserve/progress/steps');
  },

  // 获取储备融资详情
  get: async (id: number): Promise<RaxResult<FinReserveDto>> => {
    return apiService.get<FinReserveDto>(`/v1/fin/reserve/get/${id}`);
  },

  // 删除储备融资
  remove: async (id: number): Promise<RaxResult<boolean>> => {
    return apiService.get<boolean>(`/v1/fin/reserve/remove/${id}`);
  },

  // 获取储备融资报告列表
  getReportList: async (reserveId: number): Promise<RaxResult<FinReserveReportDto[]>> => {
    return apiService.get<FinReserveReportDto[]>(`/v1/fin/reserve/report/list/${reserveId}`);
  },

  // 删除储备融资报告
  removeReport: async (reportId: number): Promise<RaxResult<boolean>> => {
    return apiService.get<boolean>(`/v1/fin/reserve/report/remove/${reportId}`);
  },

  // 获取储备融资进度列表
  getProgressList: async (reserveId: number): Promise<RaxResult<FinReserveProgressDto[]>> => {
    return apiService.get<FinReserveProgressDto[]>(`/v1/fin/reserve/progress/list/${reserveId}`);
  },

  // 取消储备融资
  cancel: async (data: CancelReserveDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/reserve/cancel', data);
  },
};