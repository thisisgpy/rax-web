/** 附件管理相关类型定义 */

/** 系统附件实体 */
interface SysAttachment {
  /** 附件ID */
  id: number
  /** 业务模块名称 */
  bizModule?: string
  /** 业务数据ID */
  bizId?: number
  /** 原文件名 */
  originalName?: string
  /** 存储文件名 */
  savedName?: string
  /** 文件扩展名 */
  extension?: string
  /** 文件大小(字节) */
  fileSize?: number
  /** 是否删除 */
  isDeleted?: boolean
  /** 创建时间 */
  createTime: string
  /** 创建人 */
  createBy: string
}

/** 预上传文件响应数据 */
interface PreUploadResponse {
  /** 附件ID */
  id: number
  /** 文件访问URL */
  url?: string
}

/** 上传文件请求参数 */
interface UploadFileDto {
  /** 业务模块名称 */
  bizModule: string
  /** 业务数据ID */
  bizId: number
  /** 文件对象 */
  file: File
}

/** 批量更新附件业务信息请求参数 */
interface BatchUpdateAttachmentsBizInfoDto {
  /** 附件ID数组 */
  attachmentIds: number[]
  /** 业务模块名称 */
  bizModule: string
  /** 业务数据ID */
  bizId: number
}

/** 获取附件列表请求参数 */
interface GetAttachmentListParams {
  /** 业务模块名称 */
  bizModule: string
  /** 业务数据ID */
  bizId: number
} 