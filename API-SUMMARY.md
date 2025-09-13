# API 接口汇总

根据 target.md 文档，以下是**已确认存在**的 API 接口：

## 认证模块 (auth.ts)

### 1. 用户登录
- **接口**: `POST /api/v1/auth/login`
- **请求参数**: 
  ```typescript
  {
    username: string;
    password: string;
  }
  ```
- **响应**: 用户信息、token、动态菜单

### 2. 用户登出
- **接口**: `POST /api/v1/auth/logout/{userId}`
- **功能**: 退出登录，清除服务端 token

## 组织架构模块 (organization.ts)

### 1. 获取组织架构树
- **接口**: `GET /api/v1/org/tree`
- **功能**: 获取完整的组织架构树形数据
- **用途**: OrgSelect 组件数据源

## 字典管理模块 (dictionary.ts)

### 1. 获取字典项树
- **接口**: `GET /api/v1/dict/item/tree/code/{dictCode}`
- **参数**: dictCode - 字典编码
- **功能**: 根据字典编码获取字典项树形数据
- **用途**: DictSelect 组件数据源
- **特殊说明**: `isEnabled = false` 的字典项不可选

---

## 已删除的接口文件

以下文件因为没有在文档中明确说明而被删除：

- ❌ `user.ts` - 用户管理相关接口
- ❌ `account.ts` - 账户管理相关接口  
- ❌ `transaction.ts` - 交易管理相关接口
- ❌ `report.ts` - 报表统计相关接口
- ❌ `approval.ts` - 审批系统相关接口
- ❌ `system.ts` - 系统管理相关接口

## 数据格式约定

### 时间格式
- **DateTime**: `yyyy-MM-dd HH:mm:ss`
- **Date**: `yyyy-MM-dd`

### 金额处理
- **后端存储**: 分（整数）
- **前端显示**: 万元
- **精度控制**: 2位（百元）、4位（元）、6位（分）

### 认证方式
- **Token存储**: localStorage 中的 `auth_token`
- **请求头**: `Authorization: Bearer {token}`

## 重要说明

⚠️ **严格按照文档执行**
- 只能使用文档中明确定义的接口
- 不能自行创建或假设接口存在
- 如需新接口，必须先与产品确认
- 接口不可用时必须报告错误，不得模拟数据

🔧 **当前状态**
- ✅ 基础项目架构完成
- ✅ 核心组件实现完成
- ✅ 已确认接口封装完成
- ✅ 类型定义完善
- ⏳ 等待实际 Swagger 文档以补充更多接口