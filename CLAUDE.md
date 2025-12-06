# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

融安心 (Rax System) - Enterprise Financing Risk Management Platform. A React + TypeScript + Vite SPA with Ant Design UI.

## Development Commands

```bash
npm run dev        # Start dev server (http://localhost:5173, proxies /api to backend)
npm run build      # TypeScript check + Vite production build
npm run lint       # ESLint check on TS/TSX files
npm run preview    # Preview production build locally
```

## Architecture

### Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **UI**: Ant Design 5
- **State**: Redux Toolkit (auth) + React Query (server state)
- **HTTP**: Axios with interceptors
- **Routing**: React Router v6

### Directory Structure
```
src/
├── components/     # Reusable UI (RaxUpload, OrgSelect, DictSelect, etc.)
├── pages/          # Page components (Dashboard, Users, Reserve, etc.)
├── services/       # API layer (api.ts base + domain services)
├── store/          # Redux store (authSlice)
├── router/         # Route definitions + menu generation
├── layouts/        # MainLayout (header/sidebar/content)
├── types/          # TypeScript definitions (swagger-api.ts from backend)
└── utils/          # Utility functions
```

### API Integration
- Dev: `/api` proxied to `https://api.ganpengyu.com`
- Prod: Direct calls to `https://api.ganpengyu.com/api`
- All responses follow `RaxResult<T>` format: `{ success, message, data }`
- 401 responses trigger auto-logout

### Key Patterns

**Service calls**:
```typescript
// Services are objects with named methods
export const userApi = {
  create: async (data: CreateUserDto) => apiService.post(...),
  page: async (query: QueryUserDto) => apiService.post(...)
}
```

**React Query usage**:
```typescript
const { data } = useQuery({
  queryKey: ['users', params],
  queryFn: () => userApi.page(params)
})
```

**File uploads**: Use `RaxUpload` component with OSS presigned URLs (see `src/components/RaxUpload/README.md`)

### Special Considerations
- All UI text is in Chinese (Simplified)
- Path alias: `@/` maps to `src/`
- Types in `src/types/swagger-api.ts` are generated from backend API
