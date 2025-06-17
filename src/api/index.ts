/** API模块统一导出 */

// 导出HTTP客户端
export { default as httpClient, get, post, put, del, upload } from './httpClient'

// 导出各业务模块API
export { authApi } from './modules/auth'
export { authMockApi, mockApiInfo } from './modules/authMock'
export { orgApi } from './modules/org'
export { dictApi } from './modules/dict'
export { bankApi } from './modules/bank'
export { userApi } from './modules/user'
export { roleApi } from './modules/role'
export { resourceApi } from './modules/resource'
export { permissionApi } from './modules/permission'
export { attachmentApi } from './modules/attachment'
export { assetApi } from './modules/asset' 