import { get, post, put, del, upload } from '../httpClient'

/** 附件管理API模块 */
export const attachmentApi = {
  /**
   * 预上传文件（不绑定业务数据）
   * @param file - 要上传的文件
   */
  preUploadFile(file: File): Promise<ApiResponse<PreUploadResponse>> {
    const formData = new FormData()
    formData.append('file', file)
    return upload('/v1/attachment/pre-upload', formData)
  },

  /**
   * 上传文件并绑定业务数据
   * @param data - 上传文件数据
   */
  uploadFile(data: UploadFileDto): Promise<ApiResponse<SysAttachment>> {
    const formData = new FormData()
    formData.append('bizModule', data.bizModule)
    formData.append('bizId', data.bizId.toString())
    formData.append('file', data.file)
    return upload('/v1/attachment/upload', formData)
  },

  /**
   * 批量更新附件业务信息（将预上传的附件关联到具体业务数据）
   * @param data - 批量更新数据
   */
  batchUpdateAttachmentsBizInfo(data: BatchUpdateAttachmentsBizInfoDto): Promise<ApiResponse<any>> {
    return put('/v1/attachment/batch-update-biz-info', data)
  },

  /**
   * 删除附件
   * @param id - 附件ID
   */
  deleteAttachment(id: number): Promise<ApiResponse<any>> {
    return del(`/v1/attachment/${id}`)
  },

  /**
   * 获取附件列表
   * @param params - 查询参数
   */
  getAttachmentList(params: GetAttachmentListParams): Promise<ApiResponse<SysAttachment[]>> {
    return get('/v1/attachment/list', params)
  },

  /**
   * 下载附件
   * @param id - 附件ID
   * @returns 返回文件流的URL
   */
  downloadAttachment(id: number): string {
    // 构建下载URL
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
    const token = localStorage.getItem('token')
    const url = `${baseURL}/v1/attachment/download/${id}`
    
    if (token) {
      return `${url}?Authorization=${encodeURIComponent(`Bearer ${token}`)}`
    }
    return url
  },

  /**
   * 在新窗口打开下载链接
   * @param id - 附件ID
   */
  openDownloadAttachment(id: number): void {
    const url = this.downloadAttachment(id)
    window.open(url, '_blank')
  }
} 