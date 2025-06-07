import { post } from '../httpClient'

/** 用户认证API模块 */
export const authApi = {
  /**
   * 用户登录
   * @param data - 登录参数
   */
  login(data: LoginDto): Promise<ApiResponse<LoginResult>> {
    return post('/v1/auth/login', data)
  },

  /**
   * 用户登出
   */
  logout(): Promise<ApiResponse<boolean>> {
    return post('/v1/auth/logout')
  },

  /**
   * 刷新token
   * @param refreshToken - 刷新令牌
   */
  refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string }>> {
    return post('/v1/auth/refresh', { refreshToken })
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser(): Promise<ApiResponse<UserInfo>> {
    return post('/v1/auth/me')
  },

  /**
   * 忘记密码
   * @param data - 忘记密码参数
   */
  forgotPassword(data: ForgotPasswordDto): Promise<ApiResponse<boolean>> {
    return post('/v1/auth/forgot-password', data)
  },

  /**
   * 重置密码
   * @param data - 重置密码参数
   */
  resetPassword(data: ResetPasswordDto): Promise<ApiResponse<boolean>> {
    return post('/v1/auth/reset-password', data)
  }
} 