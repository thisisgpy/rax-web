/**
 * 默认支持的文件类型
 */
export const DEFAULT_ACCEPTED_TYPES = [
  // 图片格式
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
  // PDF
  'application/pdf',
  // Word 文档
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Excel 文档
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // CSV
  'text/csv'
];

/**
 * 默认最大文件大小：50MB
 */
export const DEFAULT_MAX_SIZE = 50 * 1024 * 1024;

/**
 * 文件类型扩展名映射
 */
export const FILE_TYPE_MAP: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/bmp': ['.bmp'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/csv': ['.csv']
};

/**
 * 获取文件类型的友好名称
 */
export const getFileTypeName = (mimeType: string): string => {
  const typeMap: Record<string, string> = {
    'image/jpeg': 'JPEG图片',
    'image/jpg': 'JPG图片',
    'image/png': 'PNG图片',
    'image/gif': 'GIF图片',
    'image/bmp': 'BMP图片',
    'image/webp': 'WebP图片',
    'application/pdf': 'PDF文档',
    'application/msword': 'Word文档',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word文档',
    'application/vnd.ms-excel': 'Excel文档',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel文档',
    'text/csv': 'CSV文件'
  };

  return typeMap[mimeType] || '未知格式';
};

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};