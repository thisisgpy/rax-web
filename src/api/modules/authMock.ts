/** 模拟用户认证API模块 */

/** 模拟延迟函数 */
const delay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** 模拟用户数据 */
const mockUsers = [
  {
    id: 1,
    username: 'super',
    password: 'super', // 在真实环境中绝不能明文存储密码
    realName: '超级管理员',
    email: 'super@raxweb.com',
    phone: '13888888888',
    avatar: '',
    status: 'active' as const,
    lastLoginTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    username: 'admin',
    password: 'admin123',
    realName: '系统管理员',
    email: 'admin@raxweb.com',
    phone: '13999999999',
    avatar: '',
    status: 'active' as const,
    lastLoginTime: '2024-01-14 16:20:00'
  }
]

/** 模拟认证API */
export const authMockApi = {
  /**
   * 用户登录
   * @param data - 登录参数
   */
  async login(data: LoginDto): Promise<ApiResponse<LoginResult>> {
    await delay(800) // 模拟网络延迟

    // 查找用户
    const user = mockUsers.find(u => u.username === data.username)
    
    if (!user) {
      return {
        success: false,
        message: '用户名不存在',
        data: null as any
      }
    }

    if (user.password !== data.password) {
      return {
        success: false,
        message: '密码错误',
        data: null as any
      }
    }

    if (user.status !== 'active') {
      return {
        success: false,
        message: '账户已被禁用',
        data: null as any
      }
    }

    // 生成模拟token
    const token = `mock_token_${user.id}_${Date.now()}`
    const refreshToken = `mock_refresh_${user.id}_${Date.now()}`

    // 更新最后登录时间
    user.lastLoginTime = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-')

    const userInfo: UserInfo = {
      id: user.id,
      username: user.username,
      realName: user.realName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      status: user.status,
      lastLoginTime: user.lastLoginTime
    }

    return {
      success: true,
      message: '登录成功',
      data: {
        token,
        refreshToken,
        userInfo,
        permissions: user.id === 1 ? ['*'] : ['read', 'write']
      }
    }
  },

  /**
   * 用户登出
   */
  async logout(): Promise<ApiResponse<boolean>> {
    await delay(300)
    
    return {
      success: true,
      message: '登出成功',
      data: true
    }
  },

  /**
   * 刷新token
   * @param refreshToken - 刷新令牌
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string }>> {
    await delay(500)
    
    if (!refreshToken || !refreshToken.startsWith('mock_refresh_')) {
      return {
        success: false,
        message: '刷新令牌无效',
        data: null as any
      }
    }

    const newToken = `mock_token_refreshed_${Date.now()}`
    
    return {
      success: true,
      message: 'Token刷新成功',
      data: {
        token: newToken
      }
    }
  },

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<ApiResponse<UserInfo>> {
    await delay(400)
    
    // 从localStorage获取用户信息（模拟从token解析用户信息）
    const userInfoStr = localStorage.getItem('userInfo')
    if (!userInfoStr) {
      return {
        success: false,
        message: '用户未登录',
        data: null as any
      }
    }

    try {
      const userInfo: UserInfo = JSON.parse(userInfoStr)
      return {
        success: true,
        message: '获取用户信息成功',
        data: userInfo
      }
    } catch (error) {
      return {
        success: false,
        message: '用户信息解析失败',
        data: null as any
      }
    }
  },

  /**
   * 忘记密码
   * @param data - 忘记密码参数
   */
  async forgotPassword(data: ForgotPasswordDto): Promise<ApiResponse<boolean>> {
    await delay(1200)
    
    // 模拟检查账户是否存在
    const user = mockUsers.find(u => u.email === data.account || u.phone === data.account)
    
    if (!user) {
      return {
        success: false,
        message: '账户不存在',
        data: false
      }
    }

    // 模拟发送重置邮件/短信
    console.log(`模拟发送密码重置邮件到: ${user.email}`)
    
    return {
      success: true,
      message: '密码重置邮件已发送，请查收',
      data: true
    }
  },

  /**
   * 重置密码
   * @param data - 重置密码参数
   */
  async resetPassword(data: ResetPasswordDto): Promise<ApiResponse<boolean>> {
    await delay(800)
    
    if (data.newPassword !== data.confirmPassword) {
      return {
        success: false,
        message: '两次输入的密码不一致',
        data: false
      }
    }

    if (data.newPassword.length < 6) {
      return {
        success: false,
        message: '密码长度不能少于6位',
        data: false
      }
    }

    // 模拟验证重置token
    if (!data.token || !data.token.startsWith('reset_token_')) {
      return {
        success: false,
        message: '重置令牌无效或已过期',
        data: false
      }
    }

    // 在真实环境中，这里会更新数据库中的密码
    console.log('模拟更新用户密码')
    
    return {
      success: true,
      message: '密码重置成功，请使用新密码登录',
      data: true
    }
  }
}

/** 模拟API的使用说明 */
export const mockApiInfo = {
  description: '这是一个模拟的认证API，用于开发和演示',
  testAccounts: [
    {
      username: 'super',
      password: 'super',
      description: '超级管理员账户'
    },
    {
      username: 'admin',
      password: 'admin123',
      description: '系统管理员账户'
    }
  ],
  features: [
    '模拟网络延迟',
    '完整的登录流程',
    '用户信息管理',
    'Token刷新机制',
    '密码重置功能'
  ]
} 