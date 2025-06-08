# Views 目录结构说明

本目录采用模块化组织方式，按照业务功能将视图组件分类管理。

## 📁 目录结构

```
src/views/
├── auth/           # 认证相关页面
│   └── Login.vue   # 登录页面
├── common/         # 通用页面和布局
│   ├── Layout.vue  # 主布局组件
│   └── CommonPage.vue # 通用页面模板
├── dashboard/      # 仪表板相关
│   └── Dashboard.vue # 首页仪表板
├── system/         # 系统管理相关
│   ├── OrganizationManage.vue # 组织架构管理
│   └── DictManage.vue # 数据字典管理
└── README.md       # 本说明文档
```

## 🎯 模块分类原则

### 1. auth/ - 认证模块
- **用途**: 用户认证相关的页面
- **包含**: 登录、注册、找回密码、重置密码等页面
- **特点**: 通常不需要认证即可访问，独立的页面布局

### 2. common/ - 通用模块
- **用途**: 全局通用的组件和页面模板
- **包含**: Layout布局、CommonPage通用页面、错误页面等
- **特点**: 被其他模块复用的基础组件

### 3. dashboard/ - 仪表板模块
- **用途**: 数据展示和概览相关页面
- **包含**: 首页仪表板、数据统计、图表展示等
- **特点**: 数据可视化，实时更新

### 4. system/ - 系统管理模块
- **用途**: 系统配置和管理相关页面
- **包含**: 组织管理、用户管理、角色权限、数据字典管理、银行管理等
- **特点**: 管理员功能，CRUD操作较多

## 📋 未来扩展建议

根据业务发展，可能需要添加的模块：

### 5. finance/ - 财务模块
```
finance/
├── Transaction.vue     # 交易管理
├── Account.vue        # 账户管理
└── Report.vue         # 财务报表
```

### 6. user/ - 用户模块
```
user/
├── Profile.vue        # 个人资料
├── Settings.vue       # 用户设置
└── Preferences.vue    # 偏好设置
```

### 7. workflow/ - 工作流模块
```
workflow/
├── Process.vue        # 流程管理
├── Approval.vue       # 审批管理
└── History.vue        # 历史记录
```

## 🔄 文件命名规范

1. **PascalCase**: 所有Vue组件文件使用大驼峰命名
   - ✅ `OrganizationManage.vue`
   - ✅ `UserProfile.vue`
   - ❌ `organization-manage.vue`

2. **描述性命名**: 文件名应清晰描述组件功能
   - ✅ `OrganizationManage.vue` (组织管理)
   - ✅ `UserProfile.vue` (用户资料)
   - ❌ `Page1.vue` (含义不明)

3. **避免缩写**: 除非是广泛认知的缩写
   - ✅ `Dashboard.vue`
   - ✅ `UserManagement.vue`
   - ❌ `UsrMgmt.vue`

## 🚀 路由配置

每个模块的路由应在 `src/router/index.ts` 中对应配置：

```typescript
// 认证路由
{
  path: '/login',
  component: () => import('../views/auth/Login.vue')
}

// 系统管理路由
{
  path: '/organization',
  component: () => import('../views/system/OrganizationManage.vue')
}
```

## 📝 开发注意事项

1. **模块独立**: 每个模块内的组件应尽量独立，减少跨模块依赖
2. **统一布局**: 除auth模块外，其他模块都应使用common/Layout.vue布局
3. **代码复用**: 通用组件应放在src/components目录，而非views
4. **类型定义**: 相关的类型定义应放在对应的模块或全局types目录

## 🔧 维护建议

- 定期review目录结构，确保分类合理
- 新增页面时优先考虑归属的模块
- 避免单个模块过于庞大，必要时进行拆分
- 保持目录结构文档的更新 