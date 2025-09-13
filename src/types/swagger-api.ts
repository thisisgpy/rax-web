// 基于真实Swagger文档的完整类型定义

// 基础响应包装器
export interface RaxResult<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// 分页请求参数
export interface PageRequest {
  pageNo: number;    // 页码，从1开始
  pageSize: number;  // 每页大小，最小1
}

// 分页响应结果
export interface PageResult<T> {
  rows: T[];
  totalCount: number;
  pageSize: number;
  pageNo: number;
  totalPages: number;
}

// ===== 认证相关类型 =====

// 用户登录请求
export interface UserLoginDto {
  mobile: string;    // 手机号
  password: string;  // 密码
}

// 登录成功响应
export interface LoginUserDto {
  userInfo: SysUserDto;
  token: string;
  menus: SysResourceDto[];
}

// 分配用户角色请求
export interface AssignUserRoleDto {
  userId: number;
  roleIds: number[];
}

// 分配角色资源请求
export interface AssignRoleResourceDto {
  roleId: number;
  resourceIds: number[];
}

// ===== 用户管理类型 =====

// 系统用户信息
export interface SysUserDto {
  id: number;
  orgId?: number;              // 用户所属组织 ID
  orgName?: string;           // 用户所属组织名称
  orgNameAbbr?: string;       // 用户所属组织名称简称
  mobile?: string;              // 手机号
  name?: string;                // 用户名
  gender?: string;              // 性别
  idCard?: string;              // 身份证号
  isDefaultPassword?: boolean;  // 是否初始化密码
  status?: number;              // 状态
  isDeleted?: boolean;          // 是否删除
  createTime?: string;          // 创建时间
  createBy?: string;            // 创建人
  updateTime?: string;          // 信息更新时间
  updateBy?: string;            // 信息更新人
}

// 创建用户请求
export interface CreateUserDto {
  orgId: number;          // 用户所属组织 ID (必填)
  mobile: string;         // 手机号 (必填)
  name: string;           // 用户名 (必填)
  gender: string;         // 性别 (必填)
  idCard: string;         // 身份证号 (必填)
}

// 更新用户请求
export interface UpdateUserDto {
  id: number;             // 用户ID (必填)
  orgId?: number;         // 用户所属组织 ID
  mobile?: string;        // 手机号
  name?: string;          // 用户名
  gender?: string;        // 性别
  idCard?: string;        // 身份证号
  status?: number;        // 状态
}

// 用户查询请求
export interface QueryUserDto extends PageRequest {
  userId?: number;
  orgId?: number;
  mobile?: string;
  name?: string;
  status?: number;
}

// 修改密码请求
export interface ChangePasswordDto {
  userId: number;
  oldPassword: string;
  newPassword: string;
}

// ===== 角色管理类型 =====

// 系统角色信息
export interface SysRoleDto {
  id: number;
  roleName: string;
  roleCode: string;
  description?: string;
  status: number;      // 状态 0:禁用 1:启用
  createBy?: number;
  createTime?: string;
  updateBy?: number;
  updateTime?: string;
  remark?: string;
}

// 创建角色请求
export interface CreateRoleDto {
  roleName: string;
  roleCode: string;
  description?: string;
  status?: number;
  remark?: string;
}

// 更新角色请求
export interface UpdateRoleDto {
  id: number;
  roleName?: string;
  roleCode?: string;
  description?: string;
  status?: number;
  remark?: string;
}

// 角色查询请求
export interface QueryRoleDto extends PageRequest {
  roleName?: string;
  roleCode?: string;
  status?: number;
}

// ===== 资源管理类型 =====

// 系统资源信息
export interface SysResourceDto {
  id: number;
  parentId?: number;
  resourceName: string;
  resourceCode: string;
  resourceType: number;  // 资源类型 1:菜单 2:按钮
  resourceUrl?: string;
  resourceIcon?: string;
  sortOrder: number;
  status: number;        // 状态 0:禁用 1:启用
  createBy?: number;
  createTime?: string;
  updateBy?: number;
  updateTime?: string;
  remark?: string;
  children?: SysResourceDto[];
}

// 创建资源请求
export interface CreateResourceDto {
  parentId?: number;
  resourceName: string;
  resourceCode: string;
  resourceType: number;
  resourceUrl?: string;
  resourceIcon?: string;
  sortOrder: number;
  status?: number;
  remark?: string;
}

// 更新资源请求
export interface UpdateResourceDto {
  id: number;
  parentId?: number;
  resourceName?: string;
  resourceCode?: string;
  resourceType?: number;
  resourceUrl?: string;
  resourceIcon?: string;
  sortOrder?: number;
  status?: number;
  remark?: string;
}

// ===== 组织管理类型 =====

// 系统组织信息
export interface SysOrgDto {
  id: number;
  code?: string;          // 组织编码
  name: string;           // 组织名称
  nameAbbr?: string;      // 组织名称简称
  comment?: string;       // 组织备注
  parentId?: number;      // 组织父级ID
  children?: SysOrgDto[]; // 子组织
}

// 创建组织请求
export interface CreateOrgDto {
  name: string;           // 组织名称 (必填)
  nameAbbr: string;       // 组织简称 (必填)
  comment?: string;       // 组织描述
  parentId?: number;      // 组织父级ID (最小值: 0)
}

// 更新组织请求
export interface UpdateOrgDto {
  id: number;             // 组织ID (必填)
  name?: string;          // 组织名称
  nameAbbr?: string;      // 组织简称
  comment?: string;       // 组织描述
  parentId?: number;      // 组织父级ID (最小值: 0)
}

// ===== 储备融资类型 =====

// 储备融资信息
export interface FinReserveDto {
  id: number;
  orgId: number;
  financialInstitutionId: number;
  fundingMode: string;           // 融资方式
  fundingAmount: number;         // 融资金额（万元）
  expectedDisbursementDate: string; // 预期放款日期
  combinedRatio: number;         // 综合成本比率
  actualDisbursementDate?: string;  // 实际放款日期
  actualFundingAmount?: number;  // 实际融资金额
  actualCombinedRatio?: number;  // 实际综合成本比率
  status: number;                // 状态
  createBy?: number;
  createTime?: string;
  updateBy?: number;
  updateTime?: string;
  remark?: string;
  costs?: FinReserveCostDto[];
  progresses?: FinReserveProgressDto[];
  reports?: FinReserveReportDto[];
}

// 储备融资成本
export interface FinReserveCostDto {
  id?: number;
  reserveId?: number;
  costType: string;         // 成本类型
  costDescription: string;  // 成本描述
  costAmount?: number;      // 成本金额
  costRatio?: number;       // 成本比率
  createBy?: number;
  createTime?: string;
  updateBy?: number;
  updateTime?: string;
}

// 储备融资进度
export interface FinReserveProgressDto {
  id?: number;
  reserveId?: number;
  progressName: string;     // 进度名称
  planDate: string;         // 计划日期
  actualDate?: string;      // 实际日期
  status?: number;          // 状态
  createBy?: number;
  createTime?: string;
  updateBy?: number;
  updateTime?: string;
}

// 储备融资报告
export interface FinReserveReportDto {
  id?: number;
  reserveId?: number;
  reportName: string;       // 报告名称
  reportContent: string;    // 报告内容
  reportDate: string;       // 报告日期
  attachmentIds?: string;   // 附件ID列表
  createBy?: number;
  createTime?: string;
  updateBy?: number;
  updateTime?: string;
}

// 创建储备融资请求
export interface CreateFinReserveDto {
  orgId: number;
  financialInstitutionId: number;
  fundingMode: string;
  fundingAmount: number;
  expectedDisbursementDate: string;
  combinedRatio: number;
  remark?: string;
  costs?: FinReserveCostDto[];
  progresses?: FinReserveProgressDto[];
}

// 更新储备融资请求
export interface UpdateFinReserveDto {
  id: number;
  orgId?: number;
  financialInstitutionId?: number;
  fundingMode?: string;
  fundingAmount?: number;
  expectedDisbursementDate?: string;
  combinedRatio?: number;
  actualDisbursementDate?: string;
  actualFundingAmount?: number;
  actualCombinedRatio?: number;
  status?: number;
  remark?: string;
  costs?: FinReserveCostDto[];
  progresses?: FinReserveProgressDto[];
}

// 储备融资查询请求
export interface QueryFinReserveDto extends PageRequest {
  orgId?: number;
  financialInstitutionId?: number;
  fundingMode?: string;
  status?: number;
  startDate?: string;
  endDate?: string;
}

// 更新储备融资进度请求
export interface UpdateFinReserveProgressDto {
  id: number;
  actualDate?: string;
  status?: number;
  remark?: string;
}

// ===== 金融机构类型 =====

// 金融机构信息
export interface FinInstitutionDto {
  id: number;
  institutionName: string;  // 机构名称
  institutionType: string;  // 机构类型
  province: string;         // 省份
  city: string;             // 城市
  district: string;         // 区县
  address?: string;         // 详细地址
  contactPerson?: string;   // 联系人
  contactPhone?: string;    // 联系电话
  contactEmail?: string;    // 联系邮箱
  status: number;           // 状态
  createBy?: number;
  createTime?: string;
  updateBy?: number;
  updateTime?: string;
  remark?: string;
}

// 创建金融机构请求
export interface CreateFinInstitutionDto {
  institutionName: string;
  institutionType: string;
  province: string;
  city: string;
  district: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  status?: number;
  remark?: string;
}

// 金融机构查询请求
export interface QueryFinInstitutionDto extends PageRequest {
  institutionName?: string;
  institutionType?: string;
  province?: string;
  city?: string;
  district?: string;
  status?: number;
}

// ===== 字典管理类型 =====

// 字典信息
export interface SysDictDto {
  id: number;
  code?: string;        // 字典编码
  name?: string;        // 字典名称
  comment?: string;     // 字典备注
  isEnabled?: boolean;  // 字典是否启用
}

// 字典项信息
export interface SysDictItemDto {
  id: number;
  dictId?: number;      // 字典ID
  dictCode?: string;    // 字典编码
  label?: string;       // 字典项标签
  value?: string;       // 字典项值
  comment?: string;     // 字典项备注
  sort?: number;        // 字典项排序
  parentId?: number;    // 父级字典项ID
  isEnabled?: boolean;  // 是否启用
  children?: SysDictItemDto[]; // 子级字典项
}

// 创建字典请求
export interface CreateDictDto {
  code: string;         // 字典编码 (必填)
  name: string;         // 字典名称 (必填)
  comment?: string;     // 字典备注
  isEnabled?: boolean;  // 字典是否启用
}

// 更新字典请求
export interface UpdateDictDto {
  id: number;           // 字典ID (必填)
  code: string;         // 字典编码 (必填)
  name: string;         // 字典名称 (必填)
  comment?: string;     // 字典备注
  isEnabled?: boolean;  // 字典是否启用
}

// 字典查询请求
export interface QueryDictDto extends PageRequest {
  name?: string;        // 字典名称
  code?: string;        // 字典编码
  enabled?: boolean;    // 是否启用
}

// 创建字典项请求
export interface CreateDictItemDto {
  dictId: number;       // 字典ID (必填)
  dictCode: string;     // 字典编码 (必填)
  label: string;        // 字典项标签 (必填)
  value?: string;       // 字典项值
  comment?: string;     // 字典项备注
  sort?: number;        // 字典项排序 (最小值: 0)
  parentId?: number;    // 父级字典项ID (最小值: 0)
  isEnabled?: boolean;  // 是否启用
}

// 更新字典项请求
export interface UpdateDictItemDto {
  id: number;           // 字典项ID (必填)
  label: string;        // 字典项标签 (必填)
  value?: string;       // 字典项值
  comment?: string;     // 字典项备注
  sort?: number;        // 字典项排序 (最小值: 0)
  parentId?: number;    // 父级字典项ID (最小值: 0)
  isEnabled?: boolean;  // 是否启用
}

// ===== 银行卡类型 =====

// 银行卡信息
export interface SysBankCardDto {
  id: number;
  cardNumber: string;    // 卡号
  cardType: string;      // 卡类型
  bankName: string;      // 银行名称
  cardHolder: string;    // 持卡人
  expiryDate?: string;   // 有效期
  status: number;        // 状态
  createBy?: number;
  createTime?: string;
  updateBy?: number;
  updateTime?: string;
  remark?: string;
}

// 创建银行卡请求
export interface CreateBankCardDto {
  cardNumber: string;
  cardType: string;
  bankName: string;
  cardHolder: string;
  expiryDate?: string;
  status?: number;
  remark?: string;
}

// 更新银行卡请求
export interface UpdateBankCardDto {
  id: number;
  cardNumber?: string;
  cardType?: string;
  bankName?: string;
  cardHolder?: string;
  expiryDate?: string;
  status?: number;
  remark?: string;
}

// 银行卡查询请求
export interface QueryBankCardDto extends PageRequest {
  cardNumber?: string;
  cardType?: string;
  bankName?: string;
  cardHolder?: string;
  status?: number;
}

// ===== 银行类型 =====

// 银行信息
export interface SysBankDto {
  id: number;
  bankName: string;      // 银行名称
  bankCode: string;      // 银行编码
  status: number;        // 状态
  createBy?: number;
  createTime?: string;
  updateBy?: number;
  updateTime?: string;
  remark?: string;
}

// 银行查询请求
export interface QueryBankDto extends PageRequest {
  bankName?: string;
  bankCode?: string;
  status?: number;
}

// ===== 附件类型 =====

// 附件信息
export interface SysAttachmentDto {
  id: string;
  bizModule: string;     // 业务模块
  bizId: string;         // 业务ID
  fileName: string;      // 文件名
  fileUrl: string;       // 文件URL
  fileSize: number;      // 文件大小
  fileType: string;      // 文件类型
  uploadBy?: number;
  uploadTime?: string;
  remark?: string;
}

// 预签名URL响应
export interface PresignedUrlDto {
  uploadUrl: string;     // 上传地址
  fileUrl: string;       // 文件访问地址
  expiration: string;    // 过期时间
}

// ===== 固定资产类型 =====

// 固定资产信息
export interface FixedAssetDto {
  id: number;
  assetName: string;     // 资产名称
  assetCode: string;     // 资产编码
  assetCategory: string; // 资产类别
  purchaseDate: string;  // 购买日期
  originalValue: number; // 原值
  currentValue: number;  // 现值
  depreciationMethod: string; // 折旧方法
  usefulLife: number;    // 使用年限
  location?: string;     // 存放地点
  status: number;        // 状态
  createBy?: number;
  createTime?: string;
  updateBy?: number;
  updateTime?: string;
  remark?: string;
}

// 创建固定资产请求
export interface CreateFixedAssetDto {
  assetName: string;
  assetCode: string;
  assetCategory: string;
  purchaseDate: string;
  originalValue: number;
  currentValue: number;
  depreciationMethod: string;
  usefulLife: number;
  location?: string;
  status?: number;
  remark?: string;
}

// 更新固定资产请求
export interface UpdateFixedAssetDto {
  id: number;
  assetName?: string;
  assetCode?: string;
  assetCategory?: string;
  purchaseDate?: string;
  originalValue?: number;
  currentValue?: number;
  depreciationMethod?: string;
  usefulLife?: number;
  location?: string;
  status?: number;
  remark?: string;
}

// 固定资产查询请求
export interface QueryFixedAssetDto extends PageRequest {
  assetName?: string;
  assetCode?: string;
  assetCategory?: string;
  status?: number;
}

// ===== 行政区域类型 =====

// 行政区域信息
export interface AdminAreaDto {
  id: number;
  parentId?: number;
  areaName: string;      // 区域名称
  areaCode: string;      // 区域编码
  level: number;         // 级别 1:省 2:市 3:区/县
  sortOrder: number;     // 排序
  status: number;        // 状态
  children?: AdminAreaDto[];
}

// 区域名称信息
export interface AreaNameDto {
  id: number;
  name: string;
}