// 重新导出 API 类型 - 避免重复导出
export * from './swagger-api';
// 导出 api.ts 中不重复的类型
export type { User, Organization, DictionaryItem, Dictionary } from './api';

// 前端特有类型
export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  children?: MenuItem[];
  path?: string;
}

export type PrecisionLevel = 2 | 4 | 6;

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;  // 使用 any 暂时避免循环依赖
  token: string | null;
}

// 前端状态类型
export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}

// 表格相关类型
export interface TableColumn {
  key: string;
  title: string;
  dataIndex: string;
  width?: number;
  fixed?: 'left' | 'right';
  sorter?: boolean;
  render?: (value: any, record: any, index: number) => React.ReactNode;
}

export interface TableProps {
  columns: TableColumn[];
  dataSource: any[];
  loading?: boolean;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    onChange?: (page: number, pageSize: number) => void;
  };
  rowKey?: string | ((record: any) => string);
  onSelectChange?: (selectedRowKeys: string[], selectedRows: any[]) => void;
}

// 表单相关类型
export interface FormField {
  name: string;
  label: string;
  type: 'input' | 'select' | 'date' | 'dateRange' | 'number' | 'textarea' | 'switch' | 'upload';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  rules?: any[];
  span?: number;
}

// 筛选器类型
export interface FilterItem {
  key: string;
  label: string;
  type: 'input' | 'select' | 'date' | 'dateRange';
  options?: { label: string; value: string | number }[];
  placeholder?: string;
}

// 统计图表类型
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface LineChartData {
  date: string;
  [key: string]: string | number;
}

// 面包屑类型
export interface BreadcrumbItem {
  title: string;
  path?: string;
  icon?: React.ReactNode;
}