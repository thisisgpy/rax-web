import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntdApp } from 'antd';
import './App.css';
import { store } from '@/store';
import { MainLayout } from '@/layouts/MainLayout';
import { PrecisionProvider } from '@/components/GlobalPrecision';
import { routes, generateRouteObjects } from '@/router/routes';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import { logoutAsync } from '@/store/authSlice';
import { apiService } from '@/services';

// 创建 React Query 客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// 初始化错误处理的组件
const ErrorHandlerInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { message } = AntdApp.useApp();
  
  React.useEffect(() => {
    // 设置 API 服务的错误处理函数
    apiService.setErrorHandler((msg: string) => {
      message.error(msg);
    });
  }, [message]);

  return <>{children}</>;
};

// 主应用组件
const AppContent: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    if (user?.id) {
      dispatch(logoutAsync(user.id) as any);
    }
  };

  // 如果未登录，这里应该重定向到登录页
  // 目前为了演示，我们直接显示主布局
  const mockUser = {
    id: 'mock-user-id',
    username: 'demo',
    name: '演示用户'
  };

  // 生成动态路由配置
  const routeElements = generateRouteObjects(routes);

  return (
    <AntdApp>
      <ErrorHandlerInitializer>
        <PrecisionProvider defaultPrecision={4}>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <MainLayout 
              user={isAuthenticated ? user : mockUser} 
              onLogout={handleLogout}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                {routeElements.map((route, index) => (
                  <Route 
                    key={route.path || index} 
                    path={route.path} 
                    element={route.element}
                  >
                    {route.children?.map((childRoute, childIndex) => (
                      <Route 
                        key={childRoute.path || childIndex}
                        path={childRoute.path} 
                        element={childRoute.element} 
                      />
                    ))}
                  </Route>
                ))}
              </Routes>
            </MainLayout>
          </Router>
        </PrecisionProvider>
      </ErrorHandlerInitializer>
    </AntdApp>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
