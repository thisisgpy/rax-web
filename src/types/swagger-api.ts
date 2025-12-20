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
  id: number;                            // 储备融资ID
  orgId: number;                         // 融资主体 ID
  orgName?: string;                      // 融资主体名称
  orgNameAbbr?: string;                  // 融资主体简称
  institutionType?: string;              // 金融机构类型. 1: 银行, 2: 非银行金融机构
  financialInstitutionId: number;        // 金融机构 ID
  financialInstitutionName?: string;     // 金融机构名称
  financialInstitutionBranchName?: string; // 金融机构分支名称
  fundingMode: string;                   // 融资方式
  fundingAmount: number;                 // 融资金额. 单位：分
  expectedDisbursementDate: string;      // 预计放款日期
  loanRenewalFromId?: number;            // 续贷来源 ID. 0 表示非续贷
  leaderName?: string;                   // 牵头领导名称
  handlerName?: string;                  // 经办人名称
  combinedRatio: number;                 // 综合成本率
  additionalCosts?: number;              // 额外成本. 单位：分
  status?: string;                       // 状态. 0:待放款, 1:已放款, 2:已取消
  createTime?: string;                   // 创建时间
  createBy?: string;                     // 创建人
  updateTime?: string;                   // 信息更新时间
  updateBy?: string;                     // 信息更新人
  costs?: FinReserveCostDto[];           // 储备融资成本列表
  progresses?: FinReserveProgressDto[];  // 储备融资进度列表
  reports?: FinReserveReportDto[];       // 储备融资报告列表
}

// 储备融资成本
export interface FinReserveCostDto {
  id?: number;              // 储备融资成本 ID
  reserveId?: number;       // 储备融资 ID
  costType?: string;        // 成本类型
  costDescription?: string; // 成本描述
  createTime?: string;      // 创建时间
  createBy?: string;        // 创建人
}

// 储备融资进度
export interface FinReserveProgressDto {
  id?: number;              // 储备融资进度 ID
  reserveId?: number;       // 储备融资 ID
  progressName?: string;    // 进度名称
  planDate?: string;        // 计划完成日期
  actualDate?: string;      // 实际完成日期
  createTime?: string;      // 创建时间
  createBy?: string;        // 创建人
  updateTime?: string;      // 信息更新时间
  updateBy?: string;        // 信息更新人
}

// 储备融资报告
export interface FinReserveReportDto {
  id?: number;              // 储备融资进度报告 ID
  reserveId?: number;       // 储备融资 ID
  reportContent?: string;   // 报告内容
  createTime?: string;      // 创建时间
  createBy?: string;        // 创建人
  attachments?: SysAttachmentDto[]; // 附件列表
}

// 创建储备融资请求
export interface CreateReserveDto {
  orgId?: number;                        // 融资主体 ID
  financialInstitutionId?: number;       // 金融机构 ID
  fundingMode: string;                   // 融资方式 (必填)
  fundingAmount: number;                 // 融资金额，以分计算 (必填)
  expectedDisbursementDate: string;      // 预计放款日期 (必填)
  loanRenewalFromId?: number;            // 续贷来源 ID. 0 表示非续贷
  leaderName?: string;                   // 牵头领导名称
  handlerName?: string;                  // 经办人名称
  combinedRatio: number;                 // 综合成本率 (必填)
  additionalCosts?: number;              // 额外成本，以分计算
  costs?: CreateReserveCostDto[];        // 储备融资成本列表
  progresses?: CreateReserveProgressDto[]; // 储备融资进度列表
}

// 更新储备融资请求
export interface UpdateReserveDto {
  id: number;                            // 储备融资ID (必填)
  orgId?: number;                        // 融资主体 ID
  financialInstitutionId?: number;       // 金融机构 ID
  fundingMode: string;                   // 融资方式 (必填)
  fundingAmount: number;                 // 融资金额，以分计算 (必填)
  expectedDisbursementDate: string;      // 预计放款日期 (必填)
  loanRenewalFromId?: number;            // 续贷来源 ID. 0 表示非续贷
  leaderName?: string;                   // 牵头领导名称
  handlerName?: string;                  // 经办人名称
  combinedRatio: number;                 // 综合成本率 (必填)
  additionalCosts?: number;              // 额外成本. 单位：分
  status: string;                        // 状态. 0:待放款, 1:已放款, 2:已取消 (必填)
  costs?: CreateReserveCostDto[];        // 储备融资成本列表
  progresses?: UpdateReserveProgressDto[]; // 储备融资进度列表
}

// 储备融资查询请求
export interface QueryReserveDto extends PageRequest {
  reserveId?: number;                    // 储备融资 ID
  reserveIds?: number[];                 // 储备融资 ID列表
  orgId?: number;                        // 融资主体 ID
  institutionType?: string;              // 金融机构类型. 1: 银行, 2: 非银行金融机构
  financialInstitutionName?: string;     // 金融机构名称
  financialInstitutionBranchName?: string; // 金融机构分支名称
  fundingMode?: string;                  // 融资方式
  expectedDisbursementDateStart?: string; // 起始预计放款日期
  expectedDisbursementDateEnd?: string;  // 截止预计放款日期
  isRenewal?: boolean;                   // 是否为续贷
  leaderName?: string;                   // 牵头领导名称
  handlerName?: string;                  // 经办人名称
  status?: string;                       // 状态. 0:待放款, 1:已放款, 2:已取消
}

// 创建储备融资报告请求
export interface CreateReserveReportDto {
  reserveId: number;                     // 储备融资 ID (必填)
  reportContent: string;                 // 报告内容 (必填)
  uploadedAttachments?: UploadedAttachmentDto[]; // 附件信息列表
}

// 创建储备融资成本请求
export interface CreateReserveCostDto {
  costType: string;                      // 成本类型 (必填)
  costDescription: string;               // 成本描述 (必填)
}

// 创建储备融资进度请求
export interface CreateReserveProgressDto {
  progressName: string;                  // 进度名称 (必填)
  planDate: string;                      // 计划完成日期 (必填)
}

// 更新储备融资进度请求
export interface UpdateReserveProgressDto {
  id: number;                            // 储备融资进度 ID (必填)
  planDate?: string;                     // 计划完成日期
  actualDate: string;                    // 实际完成日期 (必填)
}

// 取消储备融资请求
export interface CancelReserveDto {
  id: number;                            // 储备融资 ID (必填)
  cancelReport: CreateReserveReportDto;  // 取消原因（作为进度报告）
}

// 储备融资进度步骤
export interface FinReserveProgressStep {
  name?: string;                         // 进度名称
  gap?: number;                          // 计划完成日期和预期放款日期相差的月份
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
  id: number;                    // 附件ID
  bizModule: string;             // 业务模块名称
  bizId: number;                 // 业务数据 ID
  originalName: string;          // 原文件名
  savedName: string;             // 存储文件名
  extension: string;             // 文件扩展名
  fileSize: number;              // 文件大小. 以byte为单位
  isDeleted: boolean;            // 是否删除. 0:否, 1:是
  createTime: string;            // 创建时间
  createBy: string;              // 创建人
}

// 预签名URL响应
export interface UploadPresignedDto {
  attachmentId: number;          // 附件ID
  uploadUrl: string;             // 预签名上传链接
  objectKey: string;             // 对象存储中的对象Key
  fullUrl: string;               // 最终访问路径
}

// 上传完成响应
export interface UploadedAttachmentDto {
  attachmentId: number;          // 附件ID
  fileSize: number;              // 文件大小. 单位：byte
}

// 附件操作DTO (用于创建/更新时的附件管理)
export interface AttachmentOperationDto {
  attachmentId: number;          // 附件ID (必填)
  fileSize?: number;             // 文件大小(字节)，新上传时必填
  operation: 'ADD' | 'KEEP' | 'DELETE';  // 操作类型: ADD-新增, KEEP-保留, DELETE-删除
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

// ===== 融资管理类型 =====

// 融资查询响应DTO
export interface LoanDto {
  id: number;                              // 融资ID
  loanCode?: string;                       // 融资编号
  orgId: number;                           // 融资主体ID
  orgNameAbbr: string;                     // 融资主体简称
  orgName: string;                         // 融资主体全称
  loanName: string;                        // 融资名称
  productFamily: string;                   // 产品族
  productType: string;                     // 产品类型
  institutionId: number;                   // 资金方ID
  institutionName: string;                 // 资金方名称
  contractAmount: number;                  // 合同金额(分)
  currency?: string;                       // 币种 sys.currency
  isMultiDisb?: boolean;                   // 是否多次放款
  termMonths: number;                      // 期限(月)
  maturityDate: string;                    // 合同到期日
  rateMode: string;                        // 利率方式 rate.mode
  fixedRate?: number;                      // 固定利率
  baseRate?: number;                       // 基准利率/票面利率
  spreadBp?: number;                       // 加点(BP)
  rateResetCycle?: string;                 // 重定价周期 rate.reset.cycle
  rateResetAnchorDate?: string;            // 重定价锚定日
  dayCountConvention?: string;             // 计息日规则 day.count.convention
  repayMethod: string;                     // 还款方式 repay.method
  status: string;                          // 状态 loan.status
  remark?: string;                         // 备注
  createTime?: string;                     // 创建时间
  createBy?: string;                       // 创建人
  updateTime?: string;                     // 修改时间
  updateBy?: string;                       // 修改人
  extFieldValList?: FinLoanExtFieldValDto[];        // 扩展字段值列表
  participantList?: FinLoanParticipantDto[];        // 银团参与行列表
  cdList?: LoanCdWithMapDto[];                      // 存单关联列表
  lcList?: LoanLcWithMapDto[];                      // 信用证关联列表
  arItemList?: FactoringArItemDto[];                // 保理应收款明细列表
  leasedAssetList?: LeasedAssetDto[];               // 融资租赁资产列表
  voucherItemList?: ScfVoucherItemDto[];            // 供应链金融凭证列表
  trancheList?: TrustTrancheDto[];                  // 信托分层信息列表
  fixedAssetMapList?: FixedAssetMapDto[];           // 固定资产关联列表
  fileAttachments?: SysAttachmentDto[];             // 文件附件列表
}

// 创建融资请求
export interface CreateLoanDto {
  orgId: number;                           // 融资主体ID (必填)
  loanName: string;                        // 融资名称 (必填)
  productFamily: string;                   // 产品族 (必填)
  productType: string;                     // 产品类型 (必填)
  institutionId: number;                   // 资金方ID (必填)
  institutionName: string;                 // 资金方名称 (必填)
  contractAmount: number;                  // 合同金额 (必填)
  currency?: string;                       // 币种 sys.currency
  isMultiDisb?: boolean;                   // 是否多次放款
  termMonths: number;                      // 期限 (必填)
  maturityDate: string;                    // 合同到期日 (必填)
  rateMode: string;                        // 利率方式 (必填) rate.mode
  fixedRate?: number;                      // 固定利率
  baseRate?: number;                       // 基准利率/票面利率
  spreadBp?: number;                       // 加点
  rateResetCycle?: string;                 // 重定价周期 rate.reset.cycle
  rateResetAnchorDate?: string;            // 重定价锚定日
  dayCountConvention?: string;             // 计息日规则 day.count.convention
  repayMethod: string;                     // 还款方式 (必填)
  status: string;                          // 状态 (必填) loan.status
  remark?: string;                         // 备注
  extFieldValList?: CreateFinLoanExtFieldValDto[];  // 扩展字段值列表
  relatedData?: LoanRelatedData;                    // 关联数据包装器
  fileAttachments?: AttachmentOperationDto[];       // 文件附件列表
}

// 更新融资请求 (仅更新基本信息、扩展字段、附件，关联数据通过独立接口管理)
export interface UpdateLoanDto {
  id: number;                              // 融资ID (必填)
  orgId: number;                           // 融资主体ID (必填)
  loanName: string;                        // 融资名称 (必填)
  productFamily: string;                   // 产品族 (必填)
  productType: string;                     // 产品类型 (必填)
  institutionId: number;                   // 资金方ID (必填)
  institutionName: string;                 // 资金方名称 (必填)
  contractAmount: number;                  // 合同金额 (必填)
  currency?: string;                       // 币种 sys.currency
  isMultiDisb?: boolean;                   // 是否多次放款
  termMonths: number;                      // 期限 (必填)
  maturityDate: string;                    // 合同到期日 (必填)
  rateMode: string;                        // 利率方式 (必填) rate.mode
  fixedRate?: number;                      // 固定利率
  baseRate?: number;                       // 基准利率/票面利率
  spreadBp?: number;                       // 加点
  rateResetCycle?: string;                 // 重定价周期 rate.reset.cycle
  rateResetAnchorDate?: string;            // 重定价锚定日
  dayCountConvention?: string;             // 计息日规则 day.count.convention
  repayMethod: string;                     // 还款方式 (必填)
  status: string;                          // 状态 (必填) loan.status
  remark?: string;                         // 备注
  extFieldValList?: CreateFinLoanExtFieldValDto[];  // 扩展字段值列表
  attachmentOperations?: AttachmentOperationDto[];  // 附件操作列表 (ADD/KEEP/DELETE)
}

// 融资分页查询请求
export interface QueryLoanDto extends PageRequest {
  loanCode?: string;                       // 融资编号
  orgId?: number;                          // 融资主体ID
  loanName?: string;                       // 融资名称
  productFamily?: string;                  // 产品族
  productType?: string;                    // 产品类型
  institutionName?: string;                // 资金方名称
  rateMode?: string;                       // 利率方式 rate.mode
  repayMethod?: string;                    // 还款方式 repay.method
  status?: string;                         // 状态 loan.status
  maturityDateStart?: string;              // 合同到期日开始
  maturityDateEnd?: string;                // 合同到期日结束
  contractAmountMin?: number;              // 合同金额下限（分）
  contractAmountMax?: number;              // 合同金额上限（分）
}

// 融资关联数据包装器
export interface LoanRelatedData {
  participantList?: CreateLoanParticipantDto[];     // 银团参与行列表（银团贷款）
  cdMapList?: CreateLoanCdMapDto[];                 // 存单关联列表（存单质押）
  lcMapList?: CreateLoanLcMapDto[];                 // 信用证关联列表
  arItemList?: CreateFactoringArItemDto[];          // 应收款明细列表（保理）
  leasedAssetList?: CreateLeasedAssetDto[];         // 租赁资产列表（融资租赁）
  voucherItemList?: CreateScfVoucherItemDto[];      // 凭证明细列表（供应链金融）
  trancheList?: CreateTrustTrancheDto[];            // 分层信息列表（信托/ABS）
  fixedAssetMapList?: CreateFixedAssetMapDto[];     // 固定资产关联列表（固定资产融资）
}

// ===== 融资扩展字段类型 =====

// 扩展字段配置DTO
export interface FinLoanExtFieldConfigDto {
  id: number;                              // 配置ID
  productFamily: string;                   // 产品族
  productType: string;                     // 产品类型
  description?: string;                    // 类型描述
  orderNo?: number;                        // 排序号
  isEnabled?: boolean;                     // 是否启用
}

// 创建扩展字段配置请求
export interface CreateFinLoanExtFieldConfigDto {
  productFamily: string;                   // 产品族 (必填)
  productType: string;                     // 产品类型 (必填)
  description?: string;                    // 类型描述
  orderNo?: number;                        // 排序号
  isEnabled?: boolean;                     // 是否启用
}

// 更新扩展字段配置请求
export interface UpdateFinLoanExtFieldConfigDto {
  id: number;                              // 配置ID (必填)
  description?: string;                    // 类型描述
  orderNo?: number;                        // 排序号
  isEnabled?: boolean;                     // 是否启用
}

// 扩展字段定义DTO
export interface FinLoanExtFieldDefDto {
  id: number;                              // 字段定义ID
  configId: number;                        // 融资类型配置ID
  productFamily?: string;                  // 产品族
  productType?: string;                    // 产品类型
  fieldKey: string;                        // 字段唯一键
  fieldLabel: string;                      // 字段显示名
  dataType: string;                        // 字段数据类型 loan.ext.field.datatype
  isRequired?: boolean;                    // 是否必填
  isVisible?: boolean;                     // 是否可见
  dictCode?: string;                       // 数据字典编码
  remark?: string;                         // 备注
  isDeleted?: boolean;                     // 是否已删除
  createTime?: string;                     // 创建时间
  createBy?: string;                       // 创建人
  updateTime?: string;                     // 更新时间
  updateBy?: string;                       // 更新人
}

// 创建扩展字段定义请求
export interface CreateFinLoanExtFieldDefDto {
  configId: number;                        // 融资类型配置ID (必填)
  fieldKey: string;                        // 字段唯一键 (必填)
  fieldLabel: string;                      // 字段显示名 (必填)
  dataType: string;                        // 字段数据类型 (必填) loan.ext.field.datatype
  isRequired?: boolean;                    // 是否必填
  isVisible?: boolean;                     // 是否可见
  dictCode?: string;                       // 数据字典编码
  remark?: string;                         // 备注
}

// 更新扩展字段定义请求
export interface UpdateFinLoanExtFieldDefDto {
  id: number;                              // 字段定义ID (必填)
  fieldKey: string;                        // 字段唯一键 (必填)
  fieldLabel: string;                      // 字段显示名 (必填)
  dataType: string;                        // 字段数据类型 (必填) loan.ext.field.datatype
  isRequired?: boolean;                    // 是否必填
  isVisible?: boolean;                     // 是否可见
  dictCode?: string;                       // 数据字典编码
  remark?: string;                         // 备注
}

// 扩展字段值DTO
export interface FinLoanExtFieldValDto {
  id: number;                              // 字段值ID
  loanId: number;                          // 融资ID
  defId?: number;                          // 字段定义ID
  fieldKey: string;                        // 字段键
  fieldLabel?: string;                     // 字段显示名
  dataType: string;                        // 字段数据类型 loan.ext.field.datatype
  isRequired?: boolean;                    // 是否必填
  isVisible?: boolean;                     // 是否可见
  dictCode?: string;                       // 数据字典编码
  fieldProductFamily?: string;             // 字段所属产品族
  fieldProductType?: string;               // 字段所属产品类型
  valueStr?: string;                       // 字段值-字符串
  valueNum?: number;                       // 字段值-数字
  valueDate?: string;                      // 字段值-日期
  valueDt?: string;                        // 字段值-日期时间
  valueBool?: boolean;                     // 字段值-布尔
  remark?: string;                         // 备注
  createTime?: string;                     // 创建时间
  createBy?: string;                       // 创建人
}

// 创建扩展字段值请求
export interface CreateFinLoanExtFieldValDto {
  loanId?: number;                         // 融资ID
  fieldKey?: string;                       // 字段键
  dataType?: string;                       // 字段数据类型 loan.ext.field.datatype
  valueStr?: string;                       // 字段值-字符串
  valueNum?: number;                       // 字段值-数字
  valueDate?: string;                      // 字段值-日期
  valueDt?: string;                        // 字段值-日期时间
  valueBool?: boolean;                     // 字段值-布尔
  remark?: string;                         // 备注
}

// ===== 银团参与行类型 =====

// 银团参与行DTO
export interface FinLoanParticipantDto {
  id: number;                              // 参与行ID
  loanId: number;                          // 融资ID
  role: string;                            // 角色. participant.role
  institutionId: number;                   // 金融机构ID
  institutionName: string;                 // 机构名称
  commitAmount?: number;                   // 承诺额度(分)
  sharePct?: number;                       // 份额比例(0~1)
  remark?: string;                         // 备注
  createTime?: string;                     // 创建时间
  createBy?: string;                       // 创建人
  updateTime?: string;                     // 更新时间
  updateBy?: string;                       // 更新人
  fileAttachments?: SysAttachmentDto[];    // 文件附件列表
}

// 创建银团参与行请求
export interface CreateLoanParticipantDto {
  role: string;                            // 角色 (必填) participant.role
  institutionId: number;                   // 金融机构ID (必填)
  institutionName: string;                 // 机构名称 (必填)
  commitAmount?: number;                   // 承诺额度(分)
  sharePct?: number;                       // 份额比例(0~1)
  remark?: string;                         // 备注
  fileAttachments?: AttachmentOperationDto[]; // 文件附件列表
}

// 更新银团参与行请求
export interface UpdateLoanParticipantDto {
  id: number;                              // 参与行ID (必填)
  role?: string;                           // 角色 participant.role
  institutionId?: number;                  // 金融机构ID
  institutionName?: string;                // 机构名称
  commitAmount?: number;                   // 承诺额度(分)
  sharePct?: number;                       // 份额比例(0~1)
  remark?: string;                         // 备注
  attachmentOperations?: AttachmentOperationDto[]; // 附件操作列表
}

// ===== 信用证类型 =====

// 信用证DTO
export interface LoanLcDto {
  id: number;                              // 主键ID
  lcNo: string;                            // 信用证编号
  lcType?: string;                         // 信用证类型 lc.type
  issuingBank?: string;                    // 开证行名称
  issuingBankId: number;                   // 开证行ID
  beneficiary?: string;                    // 受益人
  currency: string;                        // 币种 sys.currency
  lcAmount: number;                        // 信用证金额(分)
  issueDate: string;                       // 开证日期
  expiryDate: string;                      // 到期日/有效期止
  marginRatio?: number;                    // 保证金比例(%)
  marginAmount?: number;                   // 保证金金额(分)
  status?: string;                         // 状态 lc.status
  remark?: string;                         // 备注
  createTime?: string;                     // 创建时间
  createBy?: string;                       // 创建人
  updateTime?: string;                     // 更新时间
  updateBy?: string;                       // 更新人
  attachments?: SysAttachmentDto[];        // 附件列表
}

// 创建信用证请求
export interface CreateLoanLcDto {
  lcNo: string;                            // 信用证编号 (必填)
  lcType?: string;                         // 信用证类型 lc.type
  issuingBankId: number;                   // 开证行ID (必填)
  beneficiary?: string;                    // 受益人
  currency: string;                        // 币种 (必填) sys.currency
  lcAmount: number;                        // 信用证金额(分) (必填)
  issueDate: string;                       // 开证日期 (必填)
  expiryDate: string;                      // 到期日/有效期止 (必填)
  marginRatio?: number;                    // 保证金比例(%)
  marginAmount?: number;                   // 保证金金额(分)
  status?: string;                         // 状态 lc.status
  remark?: string;                         // 备注
  uploadedAttachments?: AttachmentOperationDto[]; // 上传的附件
}

// 更新信用证请求
export interface UpdateLoanLcDto {
  id: number;                              // 主键ID (必填)
  lcNo?: string;                           // 信用证编号
  lcType?: string;                         // 信用证类型 lc.type
  issuingBankId?: number;                  // 开证行ID
  beneficiary?: string;                    // 受益人
  currency?: string;                       // 币种 sys.currency
  lcAmount?: number;                       // 信用证金额(分)
  issueDate?: string;                      // 开证日期
  expiryDate?: string;                     // 到期日/有效期止
  marginRatio?: number;                    // 保证金比例(%)
  marginAmount?: number;                   // 保证金金额(分)
  status?: string;                         // 状态 lc.status
  remark?: string;                         // 备注
  attachmentOperations?: AttachmentOperationDto[]; // 附件操作
}

// 信用证查询请求
export interface QueryLoanLcDto extends PageRequest {
  lcNo?: string;                           // 信用证编号
  lcType?: string;                         // 信用证类型 lc.type
  issuingBankId?: number;                  // 开证行ID
  issuingBank?: string;                    // 开证行名称
  beneficiary?: string;                    // 受益人
  currency?: string;                       // 币种 sys.currency
  issueDateStart?: string;                 // 开证日期开始
  issueDateEnd?: string;                   // 开证日期结束
  expiryDateStart?: string;                // 到期日开始
  expiryDateEnd?: string;                  // 到期日结束
  status?: string;                         // 状态 lc.status
}

// 信用证及关联信息DTO
export interface LoanLcWithMapDto {
  mapId: number;                           // 关联映射ID
  securedValue?: number;                   // 本贷款下的认可金额(分)
  marginLockedAmount?: number;             // 本贷款下实际冻结/占用的保证金金额(分)
  allocationNote?: string;                 // 本贷款下的用途/分配说明
  mapStatus?: string;                      // 关联状态
  mapRemark?: string;                      // 关联备注
  lcId: number;                            // 信用证ID
  lcNo: string;                            // 信用证编号
  lcType?: string;                         // 信用证类型 lc.type
  issuingBank?: string;                    // 开证行名称
  issuingBankId?: number;                  // 开证行ID
  beneficiary?: string;                    // 受益人
  currency?: string;                       // 币种 sys.currency
  lcAmount?: number;                       // 信用证金额(分)
  issueDate?: string;                      // 开证日期
  expiryDate?: string;                     // 到期日/有效期止
  marginRatio?: number;                    // 保证金比例(%)
  marginAmount?: number;                   // 保证金金额(分)
  lcStatus?: string;                       // 信用证状态 lc.status
  lcRemark?: string;                       // 信用证备注
  attachments?: SysAttachmentDto[];        // 信用证附件列表
}

// 创建贷款-信用证关联请求
export interface CreateLoanLcMapDto {
  lcId?: number;                           // 信用证ID（引用已有信用证时填写，与newLc二选一）
  newLc?: CreateLoanLcDto;                 // 新建信用证信息（创建新信用证时填写，与lcId二选一）
  securedValue?: number;                   // 本贷款下的认可金额(分)
  marginLockedAmount?: number;             // 本贷款下实际冻结/占用的保证金金额(分)
  allocationNote?: string;                 // 本贷款下的用途/分配说明
  status?: string;                         // 关联状态
  remark?: string;                         // 备注
}

// 更新贷款-信用证关联请求
export interface UpdateLoanLcMapDto {
  id: number;                              // 主键ID (必填)
  securedValue?: number;                   // 本贷款下的认可金额(分)
  marginLockedAmount?: number;             // 本贷款下实际冻结/占用的保证金金额(分)
  allocationNote?: string;                 // 本贷款下的用途/分配说明
  status?: string;                         // 关联状态
  remark?: string;                         // 备注
}

// ===== 存单类型 =====

// 存单DTO
export interface LoanCdDto {
  id: number;                              // 主键ID
  cdNo: string;                            // 存单编号/凭证号
  bankId: number;                          // 开立银行id
  bankName?: string;                       // 开立银行名称
  cardId?: number;                         // 关联银行账户id
  cardNumber?: string;                     // 关联银行账户卡号
  currency: string;                        // 币种 sys.currency
  principalAmount: number;                 // 本金(分)
  interestRate?: number;                   // 名义利率(%)
  issueDate: string;                       // 起息日
  maturityDate: string;                    // 到期日
  termMonths?: number;                     // 期限(月)
  remark?: string;                         // 备注
  createTime?: string;                     // 创建时间
  createBy?: string;                       // 创建人
  updateTime?: string;                     // 更新时间
  updateBy?: string;                       // 更新人
  attachments?: SysAttachmentDto[];        // 附件列表
}

// 创建存单请求
export interface CreateLoanCdDto {
  cdNo: string;                            // 存单编号/凭证号 (必填)
  bankId: number;                          // 开立银行id (必填)
  cardId?: number;                         // 关联银行账户id
  currency: string;                        // 币种 (必填) sys.currency
  principalAmount: number;                 // 本金(分) (必填)
  interestRate?: number;                   // 名义利率(%)
  issueDate: string;                       // 起息日 (必填)
  maturityDate: string;                    // 到期日 (必填)
  termMonths?: number;                     // 期限(月)
  remark?: string;                         // 备注
  uploadedAttachments?: AttachmentOperationDto[]; // 上传的附件
}

// 更新存单请求
export interface UpdateLoanCdDto {
  id: number;                              // 主键ID (必填)
  cdNo: string;                            // 存单编号/凭证号 (必填)
  bankId: number;                          // 开立银行id (必填)
  cardId?: number;                         // 关联银行账户id
  currency: string;                        // 币种 (必填) sys.currency
  principalAmount: number;                 // 本金(分) (必填)
  interestRate?: number;                   // 名义利率(%)
  issueDate: string;                       // 起息日 (必填)
  maturityDate: string;                    // 到期日 (必填)
  termMonths?: number;                     // 期限(月)
  remark?: string;                         // 备注
  attachmentOperations?: AttachmentOperationDto[]; // 附件操作
}

// 存单查询请求
export interface QueryLoanCdDto extends PageRequest {
  cdNo?: string;                           // 存单编号/凭证号
  bankId?: number;                         // 开立银行id
  bankName?: string;                       // 开立银行名称
  cardId?: number;                         // 关联银行账户id
  currency?: string;                       // 币种 sys.currency
  issueDateStart?: string;                 // 起息日开始
  issueDateEnd?: string;                   // 起息日结束
  maturityDateStart?: string;              // 到期日开始
  maturityDateEnd?: string;                // 到期日结束
}

// 存单及关联信息DTO
export interface LoanCdWithMapDto {
  mapId: number;                           // 关联映射ID
  pledgeRatio?: number;                    // 质押比例(%)
  securedValue?: number;                   // 本贷款下的认可/计价价值(分)
  registrationNo?: string;                 // 抵/质押登记号
  registrationDate?: string;               // 抵/质押登记日期
  releaseDate?: string;                    // 解押日期
  mapStatus?: string;                      // 关联状态
  voucherNo?: string;                      // 记账凭证编号
  mapRemark?: string;                      // 关联备注
  cdId: number;                            // 存单ID
  cdNo: string;                            // 存单编号/凭证号
  bankId?: number;                         // 开立银行id
  bankName?: string;                       // 开立银行名称
  cardId?: number;                         // 关联银行账户id
  cardNumber?: string;                     // 关联银行账户卡号
  currency?: string;                       // 币种 sys.currency
  principalAmount?: number;                // 本金(分)
  interestRate?: number;                   // 名义利率(%)
  issueDate?: string;                      // 起息日
  maturityDate?: string;                   // 到期日
  termMonths?: number;                     // 期限(月)
  attachments?: SysAttachmentDto[];        // 存单附件列表
}

// 创建贷款-存单关联请求
export interface CreateLoanCdMapDto {
  cdId?: number;                           // 存单ID（引用已有存单时填写，与newCd二选一）
  newCd?: CreateLoanCdDto;                 // 新建存单信息（创建新存单时填写，与cdId二选一）
  pledgeRatio?: number;                    // 质押比例(%)
  securedValue?: number;                   // 本贷款下的认可/计价价值(分)
  registrationNo?: string;                 // 抵/质押登记号
  registrationDate?: string;               // 抵/质押登记日期
  releaseDate?: string;                    // 解押日期
  status?: string;                         // 关联状态
  voucherNo?: string;                      // 记账凭证编号
  remark?: string;                         // 备注
}

// 更新贷款-存单关联请求
export interface UpdateLoanCdMapDto {
  id: number;                              // 主键ID (必填)
  pledgeRatio?: number;                    // 质押比例(%)
  securedValue?: number;                   // 本贷款下的认可/计价价值(分)
  registrationNo?: string;                 // 抵/质押登记号
  registrationDate?: string;               // 抵/质押登记日期
  releaseDate?: string;                    // 解押日期
  status?: string;                         // 关联状态
  voucherNo?: string;                      // 记账凭证编号
  remark?: string;                         // 备注
}

// ===== 保理应收款类型 =====

// 保理应收明细DTO
export interface FactoringArItemDto {
  id: number;                              // 主键ID
  loanId: number;                          // 关联贷款ID
  invoiceNo: string;                       // 发票号/应收编号
  debtorName: string;                      // 买方/债务人名称
  arFaceAmount: number;                    // 应收票面金额(分)
  assignedAmount?: number;                 // 转让/已融资金额(分)
  issueDate: string;                       // 开具/应收形成日期
  dueDate: string;                         // 到期日
  remark?: string;                         // 备注
  createTime?: string;                     // 创建时间
  createBy?: string;                       // 创建人
  updateTime?: string;                     // 更新时间
  updateBy?: string;                       // 更新人
  fileAttachments?: SysAttachmentDto[];    // 文件附件列表
}

// 创建保理应收明细请求
export interface CreateFactoringArItemDto {
  invoiceNo?: string;                       // 发票号/应收编号 (必填)
  debtorName?: string;                      // 买方/债务人名称 (必填)
  arFaceAmount?: number;                    // 应收票面金额(分) (必填)
  assignedAmount?: number;                 // 转让/已融资金额(分)
  issueDate?: string;                       // 开具/应收形成日期 (必填)
  dueDate?: string;                         // 到期日 (必填)
  remark?: string;                         // 备注
  fileAttachments?: AttachmentOperationDto[]; // 文件附件列表
}

// 更新保理应收明细请求
export interface UpdateFactoringArItemDto {
  id: number;                              // 主键ID (必填)
  invoiceNo?: string;                       // 发票号/应收编号 (必填)
  debtorName?: string;                      // 买方/债务人名称 (必填)
  arFaceAmount?: number;                    // 应收票面金额(分) (必填)
  assignedAmount?: number;                 // 转让/已融资金额(分)
  issueDate?: string;                       // 开具/应收形成日期 (必填)
  dueDate?: string;                         // 到期日 (必填)
  remark?: string;                         // 备注
  attachmentOperations?: AttachmentOperationDto[]; // 附件操作列表
}

// 保理应收明细查询条件
export interface QueryFactoringArItemDto {
  loanId?: number;                         // 关联贷款ID
  invoiceNo?: string;                      // 发票号/应收编号
  debtorName?: string;                     // 买方/债务人名称
  issueDateStart?: string;                 // 开具日期开始
  issueDateEnd?: string;                   // 开具日期结束
  dueDateStart?: string;                   // 到期日开始
  dueDateEnd?: string;                     // 到期日结束
}

// ===== 融资租赁资产类型 =====

// 融资租赁租赁物DTO
export interface LeasedAssetDto {
  id: number;                              // 主键ID
  loanId: number;                          // 关联贷款ID
  assetId?: number;                        // 固定资产ID
  assetCodeSnapshot?: string;              // 资产编码快照
  assetNameSnapshot?: string;              // 资产名称快照
  quantity?: number;                       // 数量
  unit?: string;                           // 计量单位
  bookValueAtLease?: number;               // 签约时账面价值(分)
  appraisedValueAtLease?: number;          // 签约时评估/认可价值(分)
  serialNo?: string;                       // 序列号/车架号等
  remark?: string;                         // 备注
  createTime?: string;                     // 创建时间
  createBy?: string;                       // 创建人
  updateTime?: string;                     // 更新时间
  updateBy?: string;                       // 更新人
  fileAttachments?: SysAttachmentDto[];    // 文件附件列表
}

// 创建融资租赁租赁物请求
export interface CreateLeasedAssetDto {
  assetId?: number;                        // 固定资产ID
  assetCodeSnapshot?: string;              // 资产编码快照
  assetNameSnapshot?: string;              // 资产名称快照
  quantity?: number;                       // 数量
  unit?: string;                           // 计量单位
  bookValueAtLease?: number;               // 签约时账面价值(分)
  appraisedValueAtLease?: number;          // 签约时评估/认可价值(分)
  serialNo?: string;                       // 序列号/车架号等
  remark?: string;                         // 备注
  fileAttachments?: AttachmentOperationDto[]; // 文件附件列表
}

// 更新融资租赁租赁物请求
export interface UpdateLeasedAssetDto {
  id: number;                              // 主键ID (必填)
  assetId?: number;                        // 固定资产ID
  assetCodeSnapshot?: string;              // 资产编码快照
  assetNameSnapshot?: string;              // 资产名称快照
  quantity?: number;                       // 数量
  unit?: string;                           // 计量单位
  bookValueAtLease?: number;               // 签约时账面价值(分)
  appraisedValueAtLease?: number;          // 签约时评估/认可价值(分)
  serialNo?: string;                       // 序列号/车架号等
  remark?: string;                         // 备注
  attachmentOperations?: AttachmentOperationDto[]; // 附件操作列表
}

// 融资租赁租赁物查询条件
export interface QueryLeasedAssetDto {
  loanId?: number;                         // 关联贷款ID
  assetId?: number;                        // 固定资产ID
  assetCodeSnapshot?: string;              // 资产编码
  assetNameSnapshot?: string;              // 资产名称
  serialNo?: string;                       // 序列号/车架号
  unit?: string;                           // 计量单位
  bookValueAtLeaseMin?: number;            // 账面价值下限(分)
  bookValueAtLeaseMax?: number;            // 账面价值上限(分)
}

// ===== 供应链金融凭证类型 =====

// 供应链金融凭证明细DTO
export interface ScfVoucherItemDto {
  id: number;                              // 主键ID
  loanId: number;                          // 关联贷款ID
  voucherNo?: string;                      // 凭证/订单/应收确认编号
  voucherType?: string;                    // 凭证类型 scf.voucher.type
  coreCorpName?: string;                   // 核心企业名称
  debtorName?: string;                     // 债务人/付款方
  underlyingAmount?: number;               // 底层金额(分)
  dueDate?: string;                        // 到期日/预计回款日
  remark?: string;                         // 备注
  createTime?: string;                     // 创建时间
  createBy?: string;                       // 创建人
  updateTime?: string;                     // 更新时间
  updateBy?: string;                       // 更新人
  fileAttachments?: SysAttachmentDto[];    // 文件附件列表
}

// 创建供应链金融凭证明细请求
export interface CreateScfVoucherItemDto {
  voucherNo?: string;                      // 凭证/订单/应收确认编号
  voucherType?: string;                    // 凭证类型 scf.voucher.type
  coreCorpName?: string;                   // 核心企业名称
  debtorName?: string;                     // 债务人/付款方
  underlyingAmount?: number;               // 底层金额(分)
  dueDate?: string;                        // 到期日/预计回款日
  remark?: string;                         // 备注
  fileAttachments?: AttachmentOperationDto[]; // 文件附件列表
}

// 更新供应链金融凭证明细请求
export interface UpdateScfVoucherItemDto {
  id: number;                              // 主键ID (必填)
  voucherNo?: string;                      // 凭证/订单/应收确认编号
  voucherType?: string;                    // 凭证类型 scf.voucher.type
  coreCorpName?: string;                   // 核心企业名称
  debtorName?: string;                     // 债务人/付款方
  underlyingAmount?: number;               // 底层金额(分)
  dueDate?: string;                        // 到期日/预计回款日
  remark?: string;                         // 备注
  attachmentOperations?: AttachmentOperationDto[]; // 附件操作列表
}

// 供应链金融凭证明细查询条件
export interface QueryScfVoucherItemDto {
  loanId?: number;                         // 关联贷款ID
  voucherNo?: string;                      // 凭证/订单/应收确认编号
  voucherType?: string;                    // 凭证类型 scf.voucher.type
  coreCorpName?: string;                   // 核心企业名称
  debtorName?: string;                     // 债务人/付款方
  dueDateStart?: string;                   // 到期日开始
  dueDateEnd?: string;                     // 到期日结束
  underlyingAmountMin?: number;             // 底层金额下限
  underlyingAmountMax?: number;             // 底层金额上限
}

// ===== 信托分层类型 =====

// 信托分层明细DTO
export interface TrustTrancheDto {
  id: number;                              // 主键ID
  loanId: number;                          // 关联贷款ID
  trancheName?: string;                    // 分层名称
  subscribeAmount?: number;                // 认购金额(分)
  expectedYieldRate?: number;              // 预期收益率(%)
  remark?: string;                         // 备注
  createTime?: string;                     // 创建时间
  createBy?: string;                       // 创建人
  updateTime?: string;                     // 更新时间
  updateBy?: string;                       // 更新人
  fileAttachments?: SysAttachmentDto[];    // 文件附件列表
}

// 创建信托分层明细请求
export interface CreateTrustTrancheDto {
  trancheName?: string;                    // 分层名称
  subscribeAmount?: number;                // 认购金额(分)
  expectedYieldRate?: number;              // 预期收益率(%)
  remark?: string;                         // 备注
  fileAttachments?: AttachmentOperationDto[]; // 文件附件列表
}

// 更新信托分层明细请求
export interface UpdateTrustTrancheDto {
  id: number;                              // 主键ID (必填)
  trancheName?: string;                    // 分层名称
  subscribeAmount?: number;                // 认购金额(分)
  expectedYieldRate?: number;              // 预期收益率(%)
  remark?: string;                         // 备注
  attachmentOperations?: AttachmentOperationDto[]; // 附件操作列表
}

// 信托分层明细查询条件
export interface QueryTrustTrancheDto {
  loanId?: number;                         // 关联贷款ID
  trancheName?: string;                    // 分层名称
}

// ===== 固定资产融资关联类型 =====

// 融资-固定资产关联DTO
export interface FixedAssetMapDto {
  id: number;                              // 关联映射ID
  loanId: number;                          // 融资ID
  fixedAssetId: number;                    // 固定资产ID
  assetCodeSnapshot?: string;              // 资产编码快照
  assetNameSnapshot?: string;              // 资产名称快照
  bookValueAtPledge?: number;              // 质押时账面价值(分)
  appraisedValue?: number;                 // 评估/认可价值(分)
  pledgeRate?: number;                     // 质押率(%)
  pledgeRegNo?: string;                    // 质押登记号
  pledgeRegDate?: string;                  // 质押登记日期
  pledgee?: string;                        // 质权人
  remark?: string;                         // 关联备注
  createTime?: string;                     // 创建时间
  createBy?: string;                       // 创建人
  updateTime?: string;                     // 更新时间
  updateBy?: string;                       // 更新人
  fileAttachments?: SysAttachmentDto[];    // 文件附件列表
  // 当前资产信息
  assetName?: string;                      // 当前资产名称
  assetCode?: string;                      // 当前资产编码
  assetCategoryCode?: string;              // 当前资产分类编码
  assetCategoryName?: string;              // 当前资产分类名称
  assetAddress?: string;                   // 当前资产地址
  assetBookValue?: number;                 // 当前资产账面价值(分)
  assetOrgId?: number;                     // 当前资产所属组织ID
  assetOrgName?: string;                   // 当前资产所属组织名称
  assetOrgNameAbbr?: string;               // 当前资产所属组织简称
}

// 创建融资-固定资产关联请求
export interface CreateFixedAssetMapDto {
  fixedAssetId: number;                    // 固定资产ID (必填)
  bookValueAtPledge?: number;              // 质押时账面价值(分)
  appraisedValue?: number;                 // 评估/认可价值(分)
  pledgeRate?: number;                     // 质押率(%)
  pledgeRegNo?: string;                    // 质押登记号
  pledgeRegDate?: string;                  // 质押登记日期
  pledgee?: string;                        // 质权人
  remark?: string;                         // 关联备注
  fileAttachments?: AttachmentOperationDto[]; // 文件附件列表
}

// 更新融资-固定资产关联请求
export interface UpdateFixedAssetMapDto {
  id: number;                              // 主键ID (必填)
  bookValueAtPledge?: number;              // 质押时账面价值(分)
  appraisedValue?: number;                 // 评估/认可价值(分)
  pledgeRate?: number;                     // 质押率(%)
  pledgeRegNo?: string;                    // 质押登记号
  pledgeRegDate?: string;                  // 质押登记日期
  pledgee?: string;                        // 质权人
  remark?: string;                         // 关联备注
  attachmentOperations?: AttachmentOperationDto[]; // 附件操作列表
}