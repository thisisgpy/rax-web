/** API模块统一导出 */

// 导出HTTP客户端
export { default as httpClient, get, post, put, del } from './httpClient'

// 导出各业务模块API
export { authApi } from './modules/auth'
export { authMockApi, mockApiInfo } from './modules/authMock'
export { orgApi } from './modules/org'
export { dictApi } from './modules/dict'
export { bankApi } from './modules/bank' 