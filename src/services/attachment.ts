import { apiService } from './api';
import type {
  RaxResult,
  SysAttachmentDto,
  UploadPresignedDto
} from '@/types/swagger-api';

export const attachmentApi = {
  // 获取附件详情
  get: async (attachmentId: number): Promise<RaxResult<SysAttachmentDto>> => {
    return apiService.get<SysAttachmentDto>(`/v1/attachment/get/${attachmentId}`);
  },

  // 获取业务相关的附件列表
  list: async (bizModule: string, bizId: number): Promise<RaxResult<SysAttachmentDto[]>> => {
    return apiService.get<SysAttachmentDto[]>(`/v1/attachment/list/${bizModule}/${bizId}`);
  },

  // 获取预签名上传URL
  getPresignedUrl: async (bizModule: string, filename: string): Promise<RaxResult<UploadPresignedDto>> => {
    return apiService.get<UploadPresignedDto>(`/v1/attachment/presigned/${bizModule}/${filename}`);
  },


  // 删除附件
  remove: async (attachmentId: number): Promise<RaxResult<boolean>> => {
    return apiService.get<boolean>(`/v1/attachment/remove/${attachmentId}`);
  },
};