import axios from 'axios';
import { attachmentApi } from '@/services';
import { DEFAULT_ACCEPTED_TYPES, DEFAULT_MAX_SIZE, formatFileSize } from './constants';
import type { FileValidationResult, BizModule, UploadedFile } from './types';

/**
 * 验证文件
 */
export const validateFile = (
  file: File,
  acceptedTypes: string[] = DEFAULT_ACCEPTED_TYPES,
  maxSize: number = DEFAULT_MAX_SIZE,
  existingFiles: UploadedFile[] = [],
  maxCount?: number
): FileValidationResult => {
  // 检查文件类型
  if (!acceptedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `不支持的文件类型：${file.type}。请选择支持的文件格式。`
    };
  }

  // 检查文件大小
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `文件过大：${formatFileSize(file.size)}。最大允许 ${formatFileSize(maxSize)}。`
    };
  }

  // 检查文件数量限制
  if (maxCount && existingFiles.length >= maxCount) {
    return {
      valid: false,
      error: `最多只能上传 ${maxCount} 个文件。`
    };
  }

  // 检查重复文件
  const isDuplicate = existingFiles.some(existingFile => existingFile.filename === file.name);
  if (isDuplicate) {
    return {
      valid: false,
      error: `文件 "${file.name}" 已存在。`
    };
  }

  return { valid: true };
};

/**
 * 使用预签名链接上传文件到 OSS
 */
export const uploadFileToOSS = async (
  file: File,
  uploadUrl: string,
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
): Promise<void> => {
  try {
    const config: any = {
      headers: {
        'Content-Type': file.type,
      },
      // 监听上传进度
      onUploadProgress: (progressEvent: any) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress?.(percentCompleted);
        }
      },
      // 添加取消信号
      signal,
      // 超时设置
      timeout: 300000 // 5分钟超时
    };

    const response = await axios.put(uploadUrl, file, config);

    if (response.status !== 200) {
      throw new Error(`上传失败：HTTP ${response.status}`);
    }
  } catch (error: any) {
    console.error('文件上传失败:', error);

    // 如果是取消操作，直接抛出
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      throw error;
    }

    if (error.response) {
      throw new Error(`上传失败：${error.response.status} ${error.response.statusText}`);
    } else if (error.request) {
      throw new Error('网络错误，请检查网络连接');
    } else {
      throw new Error(`上传失败：${error.message}`);
    }
  }
};

/**
 * 执行完整的文件上传流程
 */
export const performFileUpload = async (
  file: File,
  bizModule: BizModule,
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
): Promise<UploadedFile> => {
  try {
    onProgress?.(0);

    // 检查是否已取消
    if (signal?.aborted) {
      throw new Error('上传已取消');
    }

    // 1. 获取预签名上传链接
    const presignedResult = await attachmentApi.getPresignedUrl(bizModule, file.name);

    if (!presignedResult.success || !presignedResult.data) {
      throw new Error(presignedResult.message || '获取上传链接失败');
    }

    // 再次检查是否已取消
    if (signal?.aborted) {
      throw new Error('上传已取消');
    }

    const { attachmentId, uploadUrl } = presignedResult.data;

    // 2. 上传文件到 OSS
    await uploadFileToOSS(file, uploadUrl, onProgress, signal);

    // 3. 返回上传成功的文件信息
    return {
      attachmentId,
      filename: file.name,
      fileSize: file.size
    };
  } catch (error: any) {
    console.error('文件上传流程失败:', error);
    throw error;
  }
};