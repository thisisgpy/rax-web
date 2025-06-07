/** 用户认证相关类型定义 */

/** 登录请求参数 */
interface LoginDto {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
  /** 记住密码 */
  remember?: boolean
}

/** 登录响应数据 */
interface LoginResult {
  /** 访问令牌 */
  token: string
  /** 刷新令牌 */
  refreshToken?: string
  /** 用户信息 */
  userInfo: UserInfo
  /** 权限列表 */
  permissions?: string[]
}

/** 用户基础信息 */
interface UserInfo {
  /** 用户ID */
  id: number
  /** 用户名 */
  username: string
  /** 真实姓名 */
  realName?: string
  /** 邮箱 */
  email?: string
  /** 手机号 */
  phone?: string
  /** 头像URL */
  avatar?: string
  /** 用户状态 */
  status: 'active' | 'inactive' | 'locked'
  /** 最后登录时间 */
  lastLoginTime?: string
}

/** 忘记密码请求参数 */
interface ForgotPasswordDto {
  /** 邮箱或手机号 */
  account: string
}

/** 重置密码请求参数 */
interface ResetPasswordDto {
  /** 重置token */
  token: string
  /** 新密码 */
  newPassword: string
  /** 确认新密码 */
  confirmPassword: string
} 