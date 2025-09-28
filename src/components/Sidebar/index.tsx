import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { routes, generateMenuItems } from '@/router/routes';
import type { MenuItem } from '@/types';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  darkMode: boolean;
  menuItems?: MenuItem[];
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  darkMode, 
  menuItems = [],
  onToggleCollapse
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 从路由配置生成菜单项
  const routeMenuItems = generateMenuItems(routes, navigate);

  // 转换动态菜单项（如果有的话，比如基于用户权限的菜单）
  const convertMenuItem = (item: MenuItem): any => ({
    key: item.path || item.key,
    icon: item.icon,
    label: item.label,
    children: item.children?.map(convertMenuItem),
    onClick: item.path ? () => navigate(item.path) : undefined,
  });

  const dynamicMenuItems = menuItems.map(convertMenuItem);
  const allMenuItems = [...routeMenuItems, ...dynamicMenuItems];

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    const pathname = location.pathname;
    return pathname === '/' ? ['/dashboard'] : [pathname];
  };

  // 获取展开的菜单项
  const getOpenKeys = (): string[] => {
    const pathname = location.pathname;
    const keys: string[] = [];
    
    const findParentKeys = (items: any[], path: string, parentKey?: string): void => {
      items.forEach(item => {
        if (item.children) {
          const hasChildSelected = item.children.some((child: any) => 
            child.key === path || (child.children && findChildMatch(child.children, path))
          );
          if (hasChildSelected) {
            if (parentKey) keys.push(parentKey);
            keys.push(item.key);
          }
          findParentKeys(item.children, path, item.key);
        }
      });
    };

    const findChildMatch = (children: any[], path: string): boolean => {
      return children.some(child => 
        child.key === path || (child.children && findChildMatch(child.children, path))
      );
    };

    findParentKeys(allMenuItems, pathname);
    return keys;
  };

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      theme={darkMode ? 'dark' : 'light'}
      style={{
        height: '100%',
        position: 'relative',
      }}
    >
      {/* 菜单区域 */}
      <div style={{ 
        height: '100%', 
        paddingBottom: '64px', // 为底部按钮留出空间
        overflow: 'auto' 
      }}>
        <Menu
          theme={darkMode ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={allMenuItems}
          style={{ borderRight: 0 }}
        />
      </div>
      
      {/* 折叠按钮 - 绝对定位固定在最底部 */}
      <div style={{ 
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px', 
        textAlign: 'center',
        borderTop: `1px solid ${darkMode ? '#303030' : '#f0f0f0'}`,
        background: darkMode ? '#001529' : '#fff',
        zIndex: 10
      }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleCollapse}
          style={{
            color: darkMode ? '#fff' : '#000',
            fontSize: '16px',
            width: '32px',
            height: '32px'
          }}
        />
      </div>
    </Sider>
  );
};

export default Sidebar;