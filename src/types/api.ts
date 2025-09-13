// 基础响应类型 - 基于真实API的RaxResult模式
export interface RaxResult<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// 兼容旧的ApiResponse接口
export type ApiResponse<T = any> = RaxResult<T>;

// 分页相关类型
export interface PageRequest {
  page: number;
  size: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// 认证相关类型
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  permissions: string[];
  roles: string[];
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  lastLoginTime?: string;
  createTime: string;
  updateTime: string;
  organizationId: string;
  organizationName: string;
  roles: UserRole[];
}

export interface UserRole {
  id: string;
  code: string;
  name: string;
  description?: string;
}

// 组织架构相关类型
export interface Organization {
  id: string;
  code: string;
  name: string;
  parentId?: string;
  level: number;
  sort: number;
  status: 'ACTIVE' | 'INACTIVE';
  description?: string;
  createTime: string;
  updateTime: string;
  children?: Organization[];
}

export interface CreateOrganizationRequest {
  code: string;
  name: string;
  parentId?: string;
  sort?: number;
  description?: string;
}

export interface UpdateOrganizationRequest {
  id: string;
  code: string;
  name: string;
  parentId?: string;
  sort?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  description?: string;
}

// 字典相关类型
export interface DictionaryItem {
  id: string;
  dictCode: string;
  itemCode: string;
  itemValue: string;
  itemName: string;
  parentId?: string;
  level: number;
  sort: number;
  isEnabled: boolean;
  description?: string;
  createTime: string;
  updateTime: string;
  children?: DictionaryItem[];
}

export interface Dictionary {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createTime: string;
  updateTime: string;
  items?: DictionaryItem[];
}

// 财务相关类型
export interface Account {
  id: string;
  code: string;
  name: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  parentId?: string;
  level: number;
  isLeaf: boolean;
  balance: number; // 以分为单位
  status: 'ACTIVE' | 'INACTIVE';
  createTime: string;
  updateTime: string;
  children?: Account[];
}

export interface Transaction {
  id: string;
  transactionNo: string;
  title: string;
  description?: string;
  transactionDate: string;
  amount: number; // 以分为单位
  transactionType: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  organizationId: string;
  organizationName: string;
  createBy: string;
  createByName: string;
  createTime: string;
  updateTime: string;
  approveBy?: string;
  approveByName?: string;
  approveTime?: string;
  entries: TransactionEntry[];
}

export interface TransactionEntry {
  id: string;
  transactionId: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debitAmount: number; // 借方金额，以分为单位
  creditAmount: number; // 贷方金额，以分为单位
  description?: string;
}

export interface CreateTransactionRequest {
  title: string;
  description?: string;
  transactionDate: string;
  transactionType: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  organizationId: string;
  entries: CreateTransactionEntryRequest[];
}

export interface CreateTransactionEntryRequest {
  accountId: string;
  debitAmount: number;
  creditAmount: number;
  description?: string;
}

export interface UpdateTransactionRequest {
  id: string;
  title: string;
  description?: string;
  transactionDate: string;
  entries: UpdateTransactionEntryRequest[];
}

export interface UpdateTransactionEntryRequest {
  id?: string;
  accountId: string;
  debitAmount: number;
  creditAmount: number;
  description?: string;
}

// 报表相关类型
export interface FinancialReportRequest {
  startDate: string;
  endDate: string;
  organizationId?: string;
  accountIds?: string[];
  reportType: 'BALANCE_SHEET' | 'INCOME_STATEMENT' | 'CASH_FLOW';
}

export interface BalanceSheetItem {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY';
  currentAmount: number;
  previousAmount: number;
  level: number;
  children?: BalanceSheetItem[];
}

export interface BalanceSheet {
  reportDate: string;
  organizationId: string;
  organizationName: string;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  items: BalanceSheetItem[];
}

export interface IncomeStatementItem {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: 'REVENUE' | 'EXPENSE';
  currentAmount: number;
  previousAmount: number;
  level: number;
  children?: IncomeStatementItem[];
}

export interface IncomeStatement {
  startDate: string;
  endDate: string;
  organizationId: string;
  organizationName: string;
  totalRevenue: number;
  totalExpense: number;
  netIncome: number;
  items: IncomeStatementItem[];
}

// 仪表盘统计类型
export interface DashboardStats {
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netIncome: number;
  pendingTransactions: number;
  organizationId: string;
  statisticDate: string;
}

export interface TrendData {
  date: string;
  income: number;
  expense: number;
  netIncome: number;
}

export interface CategoryData {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
}

// 审批相关类型
export interface ApprovalRequest {
  id: string;
  businessId: string;
  businessType: 'TRANSACTION' | 'ACCOUNT' | 'USER' | 'ORGANIZATION';
  title: string;
  content: string;
  applicantId: string;
  applicantName: string;
  applicationTime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  approverIds: string[];
  currentApproverId?: string;
  currentApproverName?: string;
  approveTime?: string;
  approveComment?: string;
  rejectReason?: string;
}

export interface CreateApprovalRequest {
  businessId: string;
  businessType: 'TRANSACTION' | 'ACCOUNT' | 'USER' | 'ORGANIZATION';
  title: string;
  content: string;
  approverIds: string[];
}

export interface ProcessApprovalRequest {
  id: string;
  action: 'APPROVE' | 'REJECT';
  comment?: string;
}

// 系统配置类型
export interface SystemConfig {
  id: string;
  configKey: string;
  configValue: string;
  configName: string;
  description?: string;
  configType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  isSystem: boolean;
}

// 操作日志类型
export interface OperationLog {
  id: string;
  userId: string;
  userName: string;
  operation: string;
  module: string;
  content: string;
  ip: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAIL';
  executeTime: number; // 执行时间，毫秒
  createTime: string;
}

// 搜索和过滤类型
export interface TransactionSearchRequest extends PageRequest {
  transactionNo?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  transactionType?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  organizationId?: string;
  accountId?: string;
  createBy?: string;
}

export interface AccountSearchRequest extends PageRequest {
  code?: string;
  name?: string;
  accountType?: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  status?: 'ACTIVE' | 'INACTIVE';
  parentId?: string;
}

export interface UserSearchRequest extends PageRequest {
  username?: string;
  name?: string;
  email?: string;
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  organizationId?: string;
  roleId?: string;
}

// 导入导出类型
export interface ImportResult {
  totalRows: number;
  successRows: number;
  failRows: number;
  errorMessages: string[];
}

export interface ExportRequest {
  format: 'EXCEL' | 'CSV' | 'PDF';
  columns?: string[];
  filters?: Record<string, any>;
}