# 代理配置说明

## 概述

本项目已配置 Vite 开发服务器的反向代理功能，解决开发环境中的跨域问题。

## 配置文件

### 环境变量文件

- `.env` - 基础环境变量配置
- `.env.development` - 开发环境专用配置
- `.env.production` - 生产环境专用配置

### 关键配置项

- `VITE_API_BASE_URL`: API 基础地址
- `VITE_PROXY_TARGET`: 开发环境代理目标地址
- `VITE_PROXY_LOG`: 是否启用代理日志

## 工作原理

### 开发环境

1. 前端应用运行在 `http://localhost:5173`
2. 所有 `/api/*` 请求被代理到 `http://localhost:3000`
3. 不会出现跨域问题，因为请求是通过开发服务器代理转发的

### 请求流程

```
前端代码调用: authApi.login() → '/v1/auth/login'
    ↓
httpClient baseURL: '/api' + '/v1/auth/login' = '/api/v1/auth/login'
    ↓  
浏览器请求: http://localhost:5173/api/v1/auth/login
    ↓
Vite 代理服务器匹配 '/api' 规则
    ↓
后端服务器: http://localhost:3000/api/v1/auth/login
```

## 使用方法

### 1. 启动后端服务器

确保你的后端服务器运行在 `http://localhost:3000`

### 2. 启动前端开发服务器

```bash
pnpm dev
```

### 3. 验证代理是否工作

查看浏览器控制台或终端输出，应该能看到代理请求的日志信息。

## 常见问题

### 1. 跨域问题仍然存在

**可能原因**：
- 后端服务器没有运行
- 后端服务器地址不正确
- 代理配置没有生效

**解决方法**：
1. 检查后端服务器是否运行在正确端口
2. 更新 `.env.development` 中的 `VITE_PROXY_TARGET`
3. 重启开发服务器

### 2. 代理请求失败

**检查步骤**：
1. 查看控制台代理日志
2. 确认后端接口路径是否正确
3. 检查后端服务器响应

### 3. 修改后端地址

**开发环境**：
修改 `.env.development` 中的 `VITE_PROXY_TARGET`

**生产环境**：
修改 `.env.production` 中的 `VITE_API_BASE_URL`

## 代理配置详解

```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:3000',  // 后端服务器地址
    changeOrigin: true,               // 修改请求头中的 origin
    secure: false,                    // 接受自签名证书
    ws: true,                         // 代理 WebSocket
    configure: (proxy) => {           // 配置代理事件监听
      // 错误日志
      proxy.on('error', (err) => {
        console.log('proxy error', err);
      });
      // 请求日志
      proxy.on('proxyReq', (proxyReq, req) => {
        console.log('Sending Request:', req.method, req.url);
      });
      // 响应日志
      proxy.on('proxyRes', (proxyRes, req) => {
        console.log('Received Response:', proxyRes.statusCode, req.url);
      });
    }
  }
}
```

## 测试代理

你可以通过以下方式测试代理是否正常工作：

1. **浏览器网络面板**：查看请求是否成功发送到 `/api/*` 路径
2. **控制台日志**：查看代理日志输出
3. **后端日志**：确认后端收到请求

## 部署注意事项

- 开发环境使用代理，生产环境直接请求后端域名
- 生产环境需要配置正确的 `VITE_API_BASE_URL`
- 确保生产环境的后端支持 CORS（如果需要） 