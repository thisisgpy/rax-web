import React, { useState } from 'react';
import { Layout, ConfigProvider, theme } from 'antd';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import type { User, MenuItem } from '@/types';

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
  user?: User | null;
  menuItems?: MenuItem[];
  onLogout: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  user, 
  menuItems = [], 
  onLogout 
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          // 移除所有组件的 outline
          controlOutline: 'none',
          controlOutlineWidth: 0,
        },
        components: {
          Button: {
            controlOutline: 'none',
            controlOutlineWidth: 0,
          },
          Input: {
            controlOutline: 'none',
            controlOutlineWidth: 0,
            activeBorderColor: darkMode ? '#177ddc' : '#1890ff',
            hoverBorderColor: darkMode ? '#177ddc' : '#40a9ff',
          },
          Select: {
            controlOutline: 'none',
            controlOutlineWidth: 0,
            optionActiveBg: darkMode ? '#1f1f1f' : '#f5f5f5',
          },
          TreeSelect: {
            controlOutline: 'none',
            controlOutlineWidth: 0,
          },
          Menu: {
            itemActiveBg: darkMode ? '#1f1f1f' : '#f5f5f5',
            itemSelectedBg: darkMode ? '#177ddc' : '#e6f7ff',
          },
          DatePicker: {
            controlOutline: 'none',
            controlOutlineWidth: 0,
          },
          Switch: {
            controlOutline: 'none',
            controlOutlineWidth: 0,
          },
          Checkbox: {
            controlOutline: 'none',
            controlOutlineWidth: 0,
          },
          Radio: {
            controlOutline: 'none',
            controlOutlineWidth: 0,
          },
        }
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Header
          user={user}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onLogout={onLogout}
        />
        
        <Layout style={{ height: 'calc(100vh - 64px)' }}>
          <Sidebar
            collapsed={collapsed}
            darkMode={darkMode}
            menuItems={menuItems}
            onToggleCollapse={toggleCollapse}
          />
          
          <Content
            style={{
              margin: '16px',
              padding: '24px',
              background: darkMode ? '#141414' : '#fff',
              borderRadius: '6px',
              overflow: 'auto',
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};