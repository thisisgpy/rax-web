import axios from 'axios'
import type { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios'

/** HTTP客户端配置 */
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/** 请求拦截器 */
httpClient.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加请求时间戳（避免缓存）
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    
    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

/** 响应拦截器 */
httpClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response
    
    // 检查业务状态码
    if (!data.success) {
      console.error('业务错误:', data.message || '操作失败')
      const error = new Error(data.message || '操作失败')
      error.name = 'BusinessError'
      return Promise.reject(error)
    }
    
    return data as any // 返回解包后的数据
  },
  (error: AxiosError) => {
    console.error('HTTP请求错误:', error)
    
    // 处理HTTP状态码错误
    if (error.response) {
      const { status, data } = error.response as AxiosResponse<ApiResponse>
      
      // 优先使用响应中的 message 字段
      let errorMessage = '请求失败'
      
      // 检查响应数据中是否有 message 字段
      if (data && typeof data === 'object' && 'message' in data && data.message) {
        errorMessage = data.message
      } else {
        // 如果没有 message 字段，使用状态码对应的默认消息
        switch (status) {
          case 401:
            errorMessage = '登录已过期，请重新登录'
            localStorage.removeItem('token')
            // 这里可以添加跳转到登录页的逻辑
            break
          case 403:
            errorMessage = '没有访问权限'
            break
          case 404:
            errorMessage = '请求的资源不存在'
            break
          case 500:
            errorMessage = '服务器内部错误'
            break
          default:
            errorMessage = `请求失败: ${status}`
        }
      }
      
      // 对于401错误，即使有自定义message，也要执行登出逻辑
      if (status === 401) {
        localStorage.removeItem('token')
        // 这里可以添加跳转到登录页的逻辑
      }
      
      const httpError = new Error(errorMessage)
      httpError.name = 'HttpError'
      return Promise.reject(httpError)
    } else if (error.request) {
      const networkError = new Error('网络请求失败，请检查网络连接')
      networkError.name = 'NetworkError'
      return Promise.reject(networkError)
    } else {
      const configError = new Error('请求配置错误')
      configError.name = 'ConfigError'
      return Promise.reject(configError)
    }
  }
)

/** GET请求方法 */
export const get = <T = any>(
  url: string,
  params?: Record<string, any>,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return httpClient.get(url, { params, ...config })
}

/** POST请求方法 */
export const post = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return httpClient.post(url, data, config)
}

/** PUT请求方法 */
export const put = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return httpClient.put(url, data, config)
}

/** DELETE请求方法 */
export const del = <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return httpClient.delete(url, config)
}

export default httpClient 