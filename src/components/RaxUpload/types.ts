/**
 * 上传文件信息
 */
export interface UploadedFile {
  attachmentId: number;  // 附件ID
  filename: string;      // 源文件名
  fileSize: number;      // 文件大小（字节）
}

/**
 * 业务模块类型
 */
export type BizModule = 'ReserveReport' | 'FinExisting';

/**
 * 上传状态
 */
export interface UploadState {
  uploading: boolean;    // 是否正在上传
  progress: number;      // 上传进度 0-100
  error?: string;        // 错误信息
}

/**
 * RaxUpload 组件属性
 */
export interface RaxUploadProps {
  /** 业务模块 */
  bizModule: BizModule;
  /** 受控模式的值 */
  value?: UploadedFile[];
  /** 值变化回调 */
  onChange?: (files: UploadedFile[]) => void;
  /** 最大文件大小（字节），默认 50MB */
  maxSize?: number;
  /** 允许的文件类型，默认支持常见文档和图片格式 */
  acceptedTypes?: string[];
  /** 是否禁用 */
  disabled?: boolean;
  /** 最大文件数量，默认不限制 */
  maxCount?: number;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 文件验证结果
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}