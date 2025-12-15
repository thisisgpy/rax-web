import { apiService } from './api';
import type {
  RaxResult,
  FinLoanParticipantDto,
  CreateLoanParticipantDto,
  UpdateLoanParticipantDto
} from '@/types/swagger-api';

export const participantApi = {
  // 批量创建银团参与行
  createBatch: async (loanId: number, data: CreateLoanParticipantDto[]): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>(`/v1/fin/loan/participant/create-batch/${loanId}`, data);
  },

  // 更新银团参与行
  update: async (data: UpdateLoanParticipantDto): Promise<RaxResult<boolean>> => {
    return apiService.post<boolean>('/v1/fin/loan/participant/update', data);
  },

  // 根据融资ID查询银团参与行列表
  listByLoan: async (loanId: number): Promise<RaxResult<FinLoanParticipantDto[]>> => {
    return apiService.get<FinLoanParticipantDto[]>(`/v1/fin/loan/participant/list-by-loan/${loanId}`);
  },

  // 查询单个银团参与行
  get: async (id: number): Promise<RaxResult<FinLoanParticipantDto>> => {
    return apiService.get<FinLoanParticipantDto>(`/v1/fin/loan/participant/get/${id}`);
  },

  // 删除银团参与行
  remove: async (id: number): Promise<RaxResult<boolean>> => {
    return apiService.get<boolean>(`/v1/fin/loan/participant/remove/${id}`);
  },
};
