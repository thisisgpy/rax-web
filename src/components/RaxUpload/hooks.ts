import { useState, useCallback, useRef } from 'react';
import { validateFile, performFileUpload, showError, showSuccess } from './utils';
import type { UploadedFile, UploadState, BizModule } from './types';

/**
 * RaxUpload 的核心业务逻辑 Hook
 */
export const useRaxUpload = (
  bizModule: BizModule,
  value: UploadedFile[],
  onChange?: (files: UploadedFile[]) => void,
  options?: {
    maxSize?: number;
    acceptedTypes?: string[];
    maxCount?: number;
  }
) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0
  });

  // 用于取消上传的 AbortController
  const abortControllerRef = useRef<AbortController | null>(null);

  // 更新文件列表
  const updateFiles = useCallback((newFiles: UploadedFile[]) => {
    onChange?.(newFiles);
  }, [onChange]);

  // 处理上传进度
  const handleProgress = useCallback((progress: number) => {
    setUploadState(prev => ({ ...prev, progress }));
  }, []);

  // 取消上传
  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setUploadState({
      uploading: false,
      progress: 0
    });
  }, []);

  // 处理文件上传
  const handleFileUpload = useCallback(async (file: File) => {
    // 验证文件
    const validation = validateFile(
      file,
      options?.acceptedTypes,
      options?.maxSize,
      value,
      options?.maxCount
    );

    if (!validation.valid) {
      showError(validation.error!);
      return false;
    }

    // 创建 AbortController 用于取消上传
    abortControllerRef.current = new AbortController();

    try {
      // 设置上传状态
      setUploadState({
        uploading: true,
        progress: 0,
        error: undefined
      });

      // 执行上传
      const uploadedFile = await performFileUpload(
        file,
        bizModule,
        handleProgress,
        abortControllerRef.current.signal
      );

      // 更新文件列表
      const newFiles = [...value, uploadedFile];
      updateFiles(newFiles);

      // 重置上传状态
      setUploadState({
        uploading: false,
        progress: 100
      });

      showSuccess(`文件 "${file.name}" 上传成功`);
    } catch (error: any) {
      // 如果是用户取消，不显示错误
      if (error.name === 'AbortError') {
        console.log('上传已取消');
        return false;
      }

      // 设置错误状态
      setUploadState({
        uploading: false,
        progress: 0,
        error: error.message || '上传失败'
      });

      showError(error);
    } finally {
      abortControllerRef.current = null;
    }

    return false; // 阻止 Upload 组件的默认上传行为
  }, [bizModule, value, options, updateFiles, handleProgress]);

  // 删除文件
  const handleRemoveFile = useCallback((index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    updateFiles(newFiles);
    showSuccess('文件删除成功');
  }, [value, updateFiles]);

  // 清除错误状态
  const clearError = useCallback(() => {
    setUploadState(prev => ({ ...prev, error: undefined }));
  }, []);

  return {
    uploadState,
    handleFileUpload,
    handleRemoveFile,
    cancelUpload,
    clearError
  };
};