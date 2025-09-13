import { apiService } from './api';
import type { 
  RaxResult, 
  SysAttachmentDto, 
  PresignedUrlDto
} from '@/types/swagger-api';

export const attachmentApi = {
  // 获取附件详情
  get: async (attachmentId: string): Promise<RaxResult<SysAttachmentDto>> => {
    return apiService.get<SysAttachmentDto>(`/v1/attachment/get/${attachmentId}`);
  },

  // 获取业务相关的附件列表
  list: async (bizModule: string, bizId: string): Promise<RaxResult<SysAttachmentDto[]>> => {
    return apiService.get<SysAttachmentDto[]>(`/v1/attachment/list/${bizModule}/${bizId}`);
  },

  // 获取预签名上传URL
  getPresignedUrl: async (bizModule: string, filename: string): Promise<RaxResult<PresignedUrlDto>> => {
    return apiService.get<PresignedUrlDto>(`/v1/attachment/presigned/${bizModule}/${filename}`);
  },

  // 删除附件
  remove: async (attachmentId: string): Promise<RaxResult<void>> => {
    return apiService.get<void>(`/v1/attachment/remove/${attachmentId}`);
  },
};