import React from 'react';
import type { RouteObject } from 'react-router-dom';
import {
  DashboardOutlined,
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
  NodeIndexOutlined,
  CloudUploadOutlined,
  FileProtectOutlined,
  ContainerOutlined
} from '@ant-design/icons';
import { Dashboard } from '@/pages/Dashboard';
import { Organization } from '@/pages/Organization';
import { Users } from '@/pages/Users';
import { Roles } from '@/pages/Roles';
import { Resources } from '@/pages/Resources';
import { Dictionary } from '@/pages/Dictionary';
import { Institution } from '@/pages/Institution';
import { BankCard } from '@/pages/BankCard';
import { FixedAsset } from '@/pages/FixedAsset';
import FileUploadDemo from '@/pages/FileUploadDemo';
import Reserve from '@/pages/Reserve';
import ReserveForm from '@/pages/Reserve/Form';
import ReserveDetail from '@/pages/Reserve/Detail';
import Existing from '@/pages/Existing';
import ExistingForm from '@/pages/Existing/Form';
import ExistingDetail from '@/pages/Existing/Detail';
import ExtFieldConfig from '@/pages/ExtFieldConfig';
import CD from '@/pages/CD';
import CDForm from '@/pages/CD/Form';
import CDDetail from '@/pages/CD/Detail';
import LC from '@/pages/LC';
import LCForm from '@/pages/LC/Form';
import LCDetail from '@/pages/LC/Detail';

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
        element: <Roles />,
        icon: <SafetyOutlined />,
      },
      {
        path: '/system/resources',
        title: '资源',
        element: <Resources />,
        icon: <FileTextOutlined />,
      },
      {
        path: '/system/dictionary',
        title: '数据字典',
        element: <Dictionary />,
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
        element: <Institution />,
        icon: <BankOutlined />,
      },
      {
        path: '/infrastructure/bank-card',
        title: '银行卡',
        element: <BankCard />,
        icon: <CreditCardOutlined />,
      },
      {
        path: '/infrastructure/ext-field-config',
        title: '扩展字段配置',
        element: <ExtFieldConfig />,
        icon: <SettingOutlined />,
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
        element: <FixedAsset />,
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
        element: <Reserve />,
        icon: <MoneyCollectOutlined />,
        hideInMenu: true,
      },
      {
        path: '/financing/reserve/create',
        element: <ReserveForm />,
        hideInMenu: true,
      },
      {
        path: '/financing/reserve/edit/:id',
        element: <ReserveForm />,
        hideInMenu: true,
      },
      {
        path: '/financing/reserve/detail/:id',
        element: <ReserveDetail />,
        hideInMenu: true,
      },
      {
        path: '/financing/existing',
        title: '存量融资',
        element: <Existing />,
        icon: <FundOutlined />,
      },
      {
        path: '/financing/existing/create',
        element: <ExistingForm />,
        hideInMenu: true,
      },
      {
        path: '/financing/existing/edit/:id',
        element: <ExistingForm />,
        hideInMenu: true,
      },
      {
        path: '/financing/existing/detail/:id',
        element: <ExistingDetail />,
        hideInMenu: true,
      },
    ],
  },

  // 票据管理（菜单）
  {
    path: '/bill',
    title: '票据管理',
    icon: <FileProtectOutlined />,
    order: 45,
    children: [
      {
        path: '/bill/cd',
        title: '存单管理',
        element: <CD />,
        icon: <ContainerOutlined />,
      },
      {
        path: '/bill/cd/create',
        element: <CDForm />,
        hideInMenu: true,
      },
      {
        path: '/bill/cd/edit/:id',
        element: <CDForm />,
        hideInMenu: true,
      },
      {
        path: '/bill/cd/detail/:id',
        element: <CDDetail />,
        hideInMenu: true,
      },
      {
        path: '/bill/lc',
        title: '信用证管理',
        element: <LC />,
        icon: <FileProtectOutlined />,
      },
      {
        path: '/bill/lc/create',
        element: <LCForm />,
        hideInMenu: true,
      },
      {
        path: '/bill/lc/edit/:id',
        element: <LCForm />,
        hideInMenu: true,
      },
      {
        path: '/bill/lc/detail/:id',
        element: <LCDetail />,
        hideInMenu: true,
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

  // 系统工具（菜单）
  {
    path: '/tools',
    title: '系统工具',
    icon: <CloudUploadOutlined />,
    order: 90,
    children: [
      {
        path: '/tools/file-upload',
        title: '文件上传功能',
        element: <FileUploadDemo />,
        icon: <CloudUploadOutlined />,
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