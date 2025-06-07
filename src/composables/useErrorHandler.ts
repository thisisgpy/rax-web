import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * 错误处理 composable
 * 提供统一的错误处理逻辑
 */
export const useErrorHandler = () => {
  /**
   * 处理API调用错误
   * @param error - 错误对象
   * @param context - 操作上下文描述
   * @param showMessage - 是否显示错误消息，默认true
   * @returns 错误消息
   */
  const handleError = (
    error: any, 
    context: string = '操作', 
    showMessage: boolean = true
  ): string => {
    let message = ''
    
    if (error?.message) {
      // 错误对象中有message字段，优先使用
      message = error.message
    } else if (typeof error === 'string') {
      // 错误本身是字符串
      message = error
    } else {
      // 使用默认错误消息
      message = `${context}失败，请重试`
    }
    
    // 记录错误日志
    console.error(`${context}失败:`, error)
    
    // 显示错误消息
    if (showMessage) {
      ElMessage.error(message)
    }
    
    return message
  }

  /**
   * 处理异步操作的错误
   * @param operation - 异步操作函数
   * @param context - 操作上下文描述
   * @param showMessage - 是否显示错误消息，默认true
   * @returns Promise<{success: boolean, error?: string}>
   */
  const handleAsyncOperation = async (
    operation: () => Promise<any>,
    context: string = '操作',
    showMessage: boolean = true
  ): Promise<{ success: boolean; error?: string; data?: any }> => {
    try {
      const result = await operation()
      return { success: true, data: result }
    } catch (error: any) {
      const errorMessage = handleError(error, context, showMessage)
      return { success: false, error: errorMessage }
    }
  }

  /**
   * 处理删除操作的确认和执行
   * @param itemName - 要删除的项目名称
   * @param deleteOperation - 删除操作函数
   * @param options - 配置选项
   * @returns Promise<boolean> - 是否删除成功
   */
  const handleDeleteOperation = async (
    itemName: string,
    deleteOperation: () => Promise<any>,
    options: {
      title?: string
      confirmText?: string
      cancelText?: string
      successMessage?: string
      errorContext?: string
    } = {}
  ): Promise<boolean> => {
    const {
      title = '删除确认',
      confirmText = '确定删除',
      cancelText = '取消',
      successMessage = '删除成功',
      errorContext = '删除'
    } = options

    try {
      await ElMessageBox.confirm(
        `确定要删除"${itemName}"吗？`,
        title,
        {
          confirmButtonText: confirmText,
          cancelButtonText: cancelText,
          type: 'warning'
        }
      )

      await deleteOperation()
      ElMessage.success(successMessage)
      return true
    } catch (error: any) {
      if (error !== 'cancel') {
        handleError(error, errorContext)
      }
      return false
    }
  }

  /**
   * 处理表单验证错误
   * @param formRef - 表单引用
   * @param context - 操作上下文
   * @returns Promise<boolean> - 验证是否通过
   */
  const handleFormValidation = async (
    formRef: any,
    context: string = '表单验证'
  ): Promise<boolean> => {
    if (!formRef) {
      ElMessage.error('表单引用不存在')
      return false
    }

    try {
      await formRef.validate()
      return true
    } catch (error: any) {
      console.error(`${context}失败:`, error)
      ElMessage.error('请检查表单输入是否正确')
      return false
    }
  }

  /**
   * 创建带错误处理的API调用包装器
   * @param apiCall - API调用函数
   * @param context - 操作上下文
   * @returns 包装后的API调用函数
   */
  const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
    apiCall: T,
    context: string
  ) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
      try {
        return await apiCall(...args)
      } catch (error: any) {
        handleError(error, context)
        return null
      }
    }
  }

  return {
    handleError,
    handleAsyncOperation,
    handleDeleteOperation,
    handleFormValidation,
    withErrorHandling
  }
} 