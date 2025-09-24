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
  id: number; // 角色 ID
  name: string; // 角色名称
  code: string; // 角色编码
  comment?: string; // 角色说明
  isDeleted?: boolean;          // 是否删除
}

// 创建角色请求
export interface CreateRoleDto {
  code: string; // 角色编码
  name: string; // 角色名称
  comment?: string; // 角色说明
}

// 更新角色请求
export interface UpdateRoleDto {
  id: number; // 角色 ID
  code: string; // 角色编码
  name: string; // 角色名称
  comment?: string; // 角色说明
}

// 角色查询请求
export interface QueryRoleDto extends PageRequest {
  name?: string; // 角色名称
}

// ===== 资源管理类型 =====

// 系统资源信息
export interface SysResourceDto {
  id: number;
  code: string;           // 资源编码
  name: string;           // 资源名称
  type: number;           // 资源类型. 0:目录, 1:菜单, 2:按钮
  parentId: number;       // 父级资源ID. 0表示没有父级资源
  path?: string;          // 资源路径
  component?: string;     // 资源组件
  icon?: string;          // 资源图标
  sort: number;           // 资源排序
  isHidden: boolean;      // 是否隐藏
  isKeepAlive: boolean;   // 是否缓存
  isExternalLink: boolean; // 是否外部链接
  isDeleted?: boolean;    // 是否删除
  children?: SysResourceDto[]; // 子资源
}

// 创建资源请求
export interface CreateResourceDto {
  code: string;           // 资源编码
  name: string;           // 资源名称
  type: number;           // 资源类型. 0:目录, 1:菜单, 2:按钮
  parentId: number;       // 父级资源ID. 0表示没有父级资源
  path?: string;          // 资源路径
  component?: string;     // 资源组件
  icon?: string;          // 资源图标
  sort?: number;          // 资源排序
  isHidden?: boolean;     // 是否隐藏
  isKeepAlive?: boolean;  // 是否缓存
  isExternalLink?: boolean; // 是否外部链接
}

// 更新资源请求
export interface UpdateResourceDto {
  id: number;             // 资源ID
  code?: string;          // 资源编码
  name?: string;          // 资源名称
  type?: number;          // 资源类型. 0:目录, 1:菜单, 2:按钮
  parentId?: number;      // 父级资源ID. 0表示没有父级资源
  path?: string;          // 资源路径
  component?: string;     // 资源组件
  icon?: string;          // 资源图标
  sort?: number;          // 资源排序
  isHidden?: boolean;     // 是否隐藏
  isKeepAlive?: boolean;  // 是否缓存
  isExternalLink?: boolean; // 是否外部链接
}

// 资源查询请求
export interface QueryResourceDto extends PageRequest {
  name?: string;          // 资源名称
  code?: string;          // 资源编码
  type?: number;          // 资源类型
  parentId?: number;      // 父级资源ID
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
  name: string;             // 金融机构名称
  branchName?: string;      // 分支机构名称
  type: string;             // 金融机构类型. 1 - 银行, 2 - 非银行金融机构
  province: string;         // 省份
  city: string;             // 城市
  district: string;         // 区县
  createBy?: string;        // 创建人
  createTime?: string;      // 创建时间
}

// 创建金融机构请求
export interface CreateInstitutionDto {
  name: string;             // 金融机构名称 (必填)
  branchName?: string;      // 分支机构名称
  type: string;             // 金融机构类型. 1 - 银行, 2 - 非银行金融机构 (必填)
  province: string;         // 省份 (必填)
  city: string;             // 城市 (必填)
  district: string;         // 区县 (必填)
}

// 更新金融机构请求
export interface UpdateInstitutionDto extends CreateInstitutionDto {
  id: number;
}

// 金融机构查询请求
export interface QueryInstitutionDto extends PageRequest {
  name?: string;            // 金融机构名称
  branchName?: string;      // 分支机构名称
  type?: string;            // 金融机构类型. 1 - 银行, 2 - 非银行金融机构
  province?: string;        // 省份
  city?: string;            // 城市
  district?: string;        // 区县
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
  id: number;                    // 银行卡ID
  orgId: number;                 // 所属组织ID
  orgName?: string;              // 所属组织名称
  orgNameAbbr?: string;          // 所属组织简称
  institutionId: number;         // 金融机构ID
  institutionName?: string;      // 开户行名称
  cardName: string;              // 银行卡名称
  cardNumber: string;            // 银行卡号
  createTime?: string;           // 创建时间
  createBy?: string;             // 创建人
  updateTime?: string;           // 信息更新时间
  updateBy?: string;             // 信息更新人
}

// 创建银行卡请求
export interface CreateBankCardDto {
  orgId: number;                 // 所属组织ID (必填)
  institutionId: number;         // 金融机构ID (必填)
  cardName: string;              // 银行卡名称 (必填)
  cardNumber: string;            // 银行卡号 (必填)
}

// 更新银行卡请求
export interface UpdateBankCardDto {
  id: number;                    // 银行卡ID (必填)
  orgId?: number;                // 所属组织ID
  institutionId?: number;        // 金融机构ID
  cardName?: string;             // 银行卡名称
  cardNumber?: string;           // 银行卡号
}

// 银行卡查询请求
export interface QueryBankCardDto extends PageRequest {
  cardId?: number;               // 银行卡ID
  orgId?: number;                // 所属组织ID
  institutionName?: string;      // 金融机构名称
  cardName?: string;             // 银行卡名称
  cardNumber?: string;           // 银行卡号
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
  id: number;                    // 固定资产ID
  name: string;                  // 固定资产名称
  categoryCode: string;          // 固定资产分类编码
  categoryName: string;          // 固定资产分类名称
  code: string;                  // 固定资产编号
  address: string;               // 固定资产地址
  bookValue: number;             // 固定资产账面价值（以分计算）
  orgId: number;                 // 所属组织ID
  orgName?: string;              // 所属组织名称
  orgNameAbbr?: string;          // 所属组织简称
}

// 创建固定资产请求
export interface CreateFixedAssetDto {
  name: string;                  // 固定资产名称 (必填)
  categoryCode: string;          // 固定资产分类编码 (必填)
  categoryName: string;          // 固定资产分类名称 (必填)
  code: string;                  // 固定资产编号 (必填)
  address: string;               // 固定资产地址 (必填)
  bookValue: number;             // 固定资产账面价值 (必填, 最小值: 0)
  orgId: number;                 // 所属组织ID (必填, 最小值: 0)
}

// 更新固定资产请求
export interface UpdateFixedAssetDto {
  id: number;                    // 固定资产ID (必填)
  name: string;                  // 固定资产名称 (必填)
  categoryCode: string;          // 固定资产分类编码 (必填)
  categoryName: string;          // 固定资产分类名称 (必填)
  code: string;                  // 固定资产编号 (必填)
  address: string;               // 固定资产地址 (必填)
  bookValue: number;             // 固定资产账面价值 (必填, 最小值: 0)
  orgId: number;                 // 所属组织ID (必填, 最小值: 0)
}

// 固定资产查询请求
export interface QueryFixedAssetDto extends PageRequest {
  fixedAssetId?: number;         // 固定资产ID
  name?: string;                 // 固定资产名称
  categoryCode?: string;         // 固定资产分类编码
  categoryName?: string;         // 固定资产分类名称
  code?: string;                 // 固定资产编号
  address?: string;              // 固定资产地址
  orgId?: number;                // 所属组织ID
}

// 固定资产分类信息
export interface SysFixedAssetCategoryDto {
  id: number;                    // 固定资产分类ID
  parentId: number;              // 父级ID
  code: string;                  // 固定资产分类编码
  name: string;                  // 固定资产分类名称
}

// ===== 行政区域类型 =====

// 行政区域信息 - 基于最新API文档
export interface SysAreaDto {
  id: number;            // 区域ID
  parentId?: number;     // 父级ID
  name: string;          // 名称
  code: string;          // 行政区划代码
}