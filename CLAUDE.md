# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**融安心 (Rax)** - A Chinese financial management backend system built with Vite + React + Ant Design v5.

**Technology Stack:**
- Frontend: Vite + React + TypeScript + Ant Design v5
- State Management: Redux Toolkit + React Query
- Routing: React Router
- API: RESTful API at `http://api.ganpengyu.com`

## Development Commands

**Package Manager:** pnpm

*Note: This project hasn't been initialized yet. When implementing, use these commands:*

```bash
# Project initialization
pnpm create vite@latest rax-web -- --template react-ts
pnpm install antd @reduxjs/toolkit react-query react-router-dom

# Development
pnpm dev

# Build
pnpm build

# Testing
pnpm test

# Linting (when configured)
pnpm lint
pnpm lint:fix
```

## Work Process

**TodoList Requirement:** When working on tasks, always use the TodoWrite tool to create and maintain a todo list. This helps track progress and provides visibility into current tasks being executed.

## Architecture

### Layout Structure
- **Header**: System name (left) + user info & theme toggle (right)
- **Sidebar**: Collapsible menu with fixed routes + dynamic API-driven menus
- **Main Content**: Breadcrumbs + page content with vertical scrolling
- **Default Page**: Dashboard with todos, charts, and quick access

### Key Directories (to be created)
```
src/
├── components/          # Reusable components
│   ├── OrgSelect/      # Organization tree selector
│   ├── DictSelect/     # Dictionary tree selector
│   ├── AmountDisplay/  # Currency amount formatter
│   └── GlobalPrecision/ # Precision control component
├── pages/              # Page components
├── services/           # API service layer
├── store/              # Redux store configuration
├── utils/              # Utility functions
└── types/              # TypeScript definitions
```

### Component Development Standards

**🚨 CRITICAL: 组件导入导出规范**

所有组件必须同时提供**命名导出**和**默认导出**以保证兼容性：

```typescript
// ✅ 正确的组件导出方式
const ComponentName: React.FC<ComponentNameProps> = ({ ... }) => {
  // 组件实现
};

// 同时提供命名导出和默认导出
export { ComponentName };           // 命名导出 - 兼容现有代码
export default ComponentName;       // 默认导出 - 支持统一管理
export type { ComponentNameProps }; // 类型导出
```

**组件导入方式：**
- 直接导入：`import ComponentName from '@/components/ComponentName'`
- 通过索引导入：`import { ComponentName } from '@/components'`
- 类型导入：`import type { ComponentNameProps } from '@/components'`

**重要说明：**
- `src/components/index.ts` 文件统一管理所有组件导出
- 添加新组件时必须在 index.ts 中注册：`export { default as NewComponent } from './NewComponent'`
- 所有组件必须有默认导出，否则会导致导入错误

### Core Components

**OrgSelect Component:**
- Tree dropdown for organization selection
- Single/multi-select support
- ID-based values with name display

**DictSelect Component:**
- Dictionary tree dropdown
- Filters disabled items (`isEnabled = false`)
- Uses `itemValue` for display

**AmountDisplay Component:**
- Input: cents (integer from backend)
- Display: 万元 (ten thousands of yuan)
- Respects global precision settings (2, 4, or 6 decimal places)

**GlobalPrecision Component:**
- Header-mounted precision control
- Affects all currency displays globally
- Options: 2 digits (百元), 4 digits (元), 6 digits (分)

**RaxUpload Component:**
- Unified file upload component based on Ant Design Upload
- OSS presigned URL upload workflow
- Supports progress tracking and cancellation
- File validation (type, size, count limits)

**AttachmentDisplay Component:**
- Table-based attachment information display
- Delete functionality with confirmation
- Configurable display options

## API Integration

**Base URL:** `http://api.ganpengyu.com` (requires local proxy for CORS)
**Documentation:** `http://api.ganpengyu.com/api-docs` (Swagger)
**Authentication:** Token-based via `Authorization` header

### 🚨 CRITICAL: API 路径规则
**前端配置:**
- Axios baseURL: `/api`
- Vite 代理配置: `/api` → `http://api.ganpengyu.com`
- 接口路径必须以 `/v1/` 开头（不要加 `/api`）

**正确示例:**
```typescript
// ✅ 正确 - 最终请求: http://api.ganpengyu.com/api/v1/user/page  
this.post('/v1/user/page', data)

// ❌ 错误 - 会变成: http://api.ganpengyu.com/api/api/v1/user/page
this.post('/api/v1/user/page', data)
```

**API 方法规则:**
- 查询分页: `POST /v1/{module}/page`
- 获取单个: `GET /v1/{module}/get/{id}`
- 创建: `POST /v1/{module}/create`
- 更新: `POST /v1/{module}/update`
- 删除: `GET /v1/{module}/remove/{id}`
- 获取树形: `GET /v1/{module}/tree`

**Key Endpoints:**
- Login: `POST /v1/auth/login`
- Logout: `GET /v1/auth/logout/{userId}`
- User Page: `POST /v1/user/page`
- User Create: `POST /v1/user/create`
- User Update: `POST /v1/user/update` 
- User Delete: `GET /v1/user/remove/{id}`
- Org Tree: `GET /v1/org/tree`
- Org Create: `POST /v1/org/create`
- Org Update: `POST /v1/org/update`
- Org Delete: `GET /v1/org/remove/{id}`
- Dictionary: `GET /v1/dict/item/tree/code/{dictCode}`

## Data Formats

**Dates:**
- DateTime: `yyyy-MM-dd HH:mm:ss`
- Date: `yyyy-MM-dd`

**Currency:**
- Backend stores amounts in cents (integer)
- Frontend displays in 万元 with configurable precision
- Conversion: cents ÷ 1,000,000 = 万元

## Page Patterns

**List Pages:** Title → Search → Table → Pagination
**Add/Edit Pages:** 
- Few fields: Dialog popup
- Many fields: Separate page
**Detail Pages:** Read-only, aesthetically focused layout

## UI Standards

- All operations require feedback messages
- Sensitive operations need confirmation dialogs
- Chinese-only interface (no i18n needed)
- Support light/dark themes
- Responsive design with Ant Design components

## 开发经验教训

### 导入导出兼容性问题 (2024-09-28)

**问题描述：**
在开发文件上传组件时创建了 `src/components/index.ts` 统一导出文件，但由于原有组件只有命名导出（`export const`）而没有默认导出（`export default`），导致大量导入错误。

**根本原因：**
1. `components/index.ts` 期望所有组件都有默认导出：`export { default as ComponentName }`
2. 原有组件只有命名导出：`export const ComponentName`
3. 导入导出不匹配导致编译错误

**解决方案：**
1. 为所有组件添加默认导出，保持命名导出兼容性
2. 更新所有导入语句使用默认导入语法
3. 建立标准化的组件导出规范

**预防措施：**
- 新组件必须同时提供命名导出和默认导出
- 使用统一的组件模板和导出格式
- 在 `components/index.ts` 中注册新组件时确保导出正确

**标准化模板：**
```typescript
// 组件实现
const ComponentName: React.FC<ComponentNameProps> = ({ ... }) => {
  // 实现内容
};

// 导出
export { ComponentName };           // 命名导出
export default ComponentName;       // 默认导出
export type { ComponentNameProps }; // 类型导出
```