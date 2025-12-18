// 导出 API 服务实例
export { apiService, businessApiService } from './api';

// 导出所有基于真实Swagger文档的 API 模块
export { authApi } from './auth';
export { userApi } from './user';
export { roleApi } from './role';
export { resourceApi } from './resource';
export { organizationApi } from './organization';
export { reserveApi } from './reserve';
export { institutionApi } from './institution';
export { dictionaryApi } from './dictionary';
export { bankCardApi } from './bankCard';
export { bankApi } from './bank';
export { attachmentApi } from './attachment';
export { assetApi } from './asset';
export { areaApi } from './area';
export { fixedAssetMapApi } from './fixedAssetMap';

// 导出所有类型
export * from '@/types/swagger-api';