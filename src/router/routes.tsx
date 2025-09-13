import React from 'react';
import type { RouteObject } from 'react-router-dom';
import { 
  DashboardOutlined, 
  ApiOutlined,
  SettingOutlined,
  UserOutlined,
  SafetyOutlined,
  FileTextOutlined,
  BookOutlined,
  ApartmentOutlined,
  BankOutlined,
  CreditCardOutlined,
  GoldOutlined,
  MoneyCollectOutlined,
  FundOutlined,
  ShoppingOutlined,
  SafetyCertificateOutlined,
  NodeIndexOutlined
} from '@ant-design/icons';
import { Dashboard } from '@/pages/Dashboard';
import { Organization } from '@/pages/Organization';
import { Users } from '@/pages/Users';

// 扩展路由对象类型以包含菜单相关信息
export interface AppRouteObject extends Omit<RouteObject, 'children'> {
  // 菜单相关属性
  title?: string;           // 菜单标题
  icon?: React.ReactNode;   // 菜单图标
  hideInMenu?: boolean;     // 是否在菜单中隐藏
  order?: number;           // 菜单排序
  children?: AppRouteObject[];
}

// 路由配置 - 根据 menu.txt 定义
export const routes: AppRouteObject[] = [
  // 控制台（页面）
  {
    path: '/dashboard',
    element: <Dashboard />,
    title: '控制台',
    icon: <DashboardOutlined />,
    order: 1,
  },

  // 系统配置（菜单）
  {
    path: '/system',
    title: '系统配置',
    icon: <SettingOutlined />,
    order: 10,
    children: [
      {
        path: '/system/users',
        title: '用户',
        element: <Users />,
        icon: <UserOutlined />,
      },
      {
        path: '/system/roles',
        title: '角色',
        element: <div>角色管理页面 - 待开发</div>,
        icon: <SafetyOutlined />,
      },
      {
        path: '/system/resources',
        title: '资源',
        element: <div>资源管理页面 - 待开发</div>,
        icon: <FileTextOutlined />,
      },
      {
        path: '/system/dictionary',
        title: '数据字典',
        element: <div>数据字典管理页面 - 待开发</div>,
        icon: <BookOutlined />,
      },
    ],
  },

  // 基础设施（菜单）
  {
    path: '/infrastructure',
    title: '基础设施',
    icon: <ApartmentOutlined />,
    order: 20,
    children: [
      {
        path: '/infrastructure/organization',
        title: '组织架构',
        element: <Organization />,
        icon: <ApartmentOutlined />,
      },
      {
        path: '/infrastructure/institution',
        title: '金融机构',
        element: <div>金融机构管理页面 - 待开发</div>,
        icon: <BankOutlined />,
      },
      {
        path: '/infrastructure/bank-card',
        title: '银行卡',
        element: <div>银行卡管理页面 - 待开发</div>,
        icon: <CreditCardOutlined />,
      },
    ],
  },

  // 资产管理（菜单）
  {
    path: '/asset',
    title: '资产管理',
    icon: <GoldOutlined />,
    order: 30,
    children: [
      {
        path: '/asset/fixed-assets',
        title: '固定资产',
        element: <div>固定资产管理页面 - 待开发</div>,
        icon: <GoldOutlined />,
      },
    ],
  },

  // 融资管理（菜单）
  {
    path: '/financing',
    title: '融资管理',
    icon: <MoneyCollectOutlined />,
    order: 40,
    children: [
      {
        path: '/financing/reserve',
        title: '储备融资',
        element: <div>储备融资管理页面 - 待开发</div>,
        icon: <MoneyCollectOutlined />,
      },
      {
        path: '/financing/existing',
        title: '存量融资',
        element: <div>存量融资管理页面 - 待开发</div>,
        icon: <FundOutlined />,
      },
    ],
  },

  // 担保管理（菜单）
  {
    path: '/guarantee',
    title: '担保管理',
    icon: <SafetyCertificateOutlined />,
    order: 50,
    children: [
      {
        path: '/guarantee/list',
        title: '担保列表',
        element: <div>担保列表页面 - 待开发</div>,
        icon: <ShoppingOutlined />,
      },
      {
        path: '/guarantee/graph',
        title: '担保图谱',
        element: <div>担保图谱页面 - 待开发</div>,
        icon: <NodeIndexOutlined />,
      },
    ],
  },
];

// 生成 React Router 使用的路由配置
export const generateRouteObjects = (routes: AppRouteObject[]): RouteObject[] => {
  return routes.map(route => ({
    path: route.path,
    element: route.element,
    children: route.children ? generateRouteObjects(route.children) : undefined,
  }));
};

// 生成菜单项
export interface MenuItemType {
  key: string;
  label: string;
  icon?: React.ReactNode;
  children?: MenuItemType[];
  onClick?: () => void;
}

export const generateMenuItems = (
  routes: AppRouteObject[], 
  navigate: (path: string) => void
): MenuItemType[] => {
  return routes
    .filter(route => !route.hideInMenu) // 过滤掉隐藏的菜单项
    .sort((a, b) => (a.order || 999) - (b.order || 999)) // 按order排序
    .map(route => ({
      key: route.path || '',
      label: route.title || '',
      icon: route.icon,
      children: route.children && route.children.length > 0 
        ? generateMenuItems(route.children, navigate)
        : undefined,
      onClick: route.path && !route.children ? () => navigate(route.path!) : undefined,
    }));
};