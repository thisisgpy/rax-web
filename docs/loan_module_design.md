# 存量融资模块

1. 各个页面或接口所需要的具体字段请你从 swagger-api.ts 定义的实体中进行推断，对于需要进行选择的字段，在字段注释中我已经备注了需要使用的数据字典编码；
2. 如果我已经明确指定了字段，则采纳我的方案；
3. 每种融资类型的特定字段都通过 CreateLoanDto.relatedData 字段统一提交；
4. 在创建融资时直接创建信用证/存单，现有的单独创建信用证/存单的接口为冗余设计，留待以后使用；
5. 所有数据字典编码在后端都已配置；
6. 融资编号由后端生成，前端在创建和编辑时，表单不包含这个字段；
7. 附件 bizModule 映射关系有：融资主体附件（FinLoan）、银团参与行附件（FinLoanParticipant）、保理应收款明细附件（FinLoanFactoringArItem）、融资租赁资产附件（FinLoanLeasedAsset）、供应链金融凭证附件（FinLoanScfVoucherItem）、信托分层信息附件（FinLoanTrustTranche）；
8. 前端金额展示使用AmountDisplay组件，直接将接口返回的数字传入即可，这个组件会自行处理转换，请你先学习这个组件的使用方式。另外，用户在前端填写金额时，单位统一使用万元（小数部分最大允许 6 位），在接口提交时需要转换为分；
9. 每种融资类型的特定字段都创建为独立的表单组件，在新增/编辑页面，根据用户选择的融资类型，动态加载渲染对应的表单组件；
10. 金融机构选择，使用InstitutionSelect组件；
11. 组织选择，使用OrgSelect组件。

## 列表页面

列表页每页显示 10 条数据，支持翻页。

在表格右上方设置“登记融资“按钮用于新增存量融资。

表格列包括：

1. loanCode，融资编号
2. orgNameAbbr，组织（鼠标 Hover 状态时使用 ToolTip 组件展示 orgName）
3. loanName，融资名称
4. productType，融资类型
5. institutionName，机构
6. contractAmount，合同金额
7. termMonths，期限
8. maturityDate，到期日
9. status，状态
10. 下拉形式操作列：编辑、详情、删除

表格上方设置多条件查询区块，查询条件包括：

1. loanCode，融资编号
2. orgId，组织
3. loanName，融资名称
4. productFamily 和 productType，融资类型（使用 DictSelect 组件，dictCode 是 fin.product）
5. institutionName，机构名称
6. rateMode，利率模式（dictCode = rate.mode）
7. repayMethod，还款方式（dictCode = repay.method）
8. status，状态（dictCode = loan.status）
9. maturityDateStart，合同到期日开始
10. maturityDateEnd，合同到期日结束
11. contractAmountMin，合同金额下限（单位：万元）
12. contractAmountMax，合同金额上限（单位：万元）

## 新增页面

新增页面分为两个部分，第一部分为基础字段，第二部分为通用扩展字段，第三部分为融资类型特定字段。

基础字段从 CreateLoanDto 实体中推断。

通用扩展字段，根据用户选择的productFamily 和 productType，调用接口获取扩展字段列表，当前暂不处理扩展字段的渲染，等整体完成后再来补充。

融资类型特定字段，具体字段从实体定义中推断，下面是映射关系。注意：还有其他没有列出的融资类型，是当前还不涉及到开发任务，你在处理时当做无特定字段处理即可。

1. 流动资金融资：无特定字段
2. 固定资产融资：无特定字段
3. 银团融资：CreateLoanParticipantDto
4. 贸易融资：无特定字段
5. 票据贴现：无特定字段
6. 信用证：CreateLoanLcDto
7. 存单质押：CreateLoanCdDto
8. 信托公司融资：CreateTrustTrancheDto
9. 保理公司融资：CreateFactoringArItemDto
10. 供应链金融平台融资：CreateScfVoucherItemDto
11. 融资租赁公司融资：CreateLeasedAssetDto
12. 小贷公司融资：无特定字段

注意，融资信息本身和融资类型都可能涉及到附件上传，你需要使用现有的文件上传组件来处理，注意先学习组件的正确使用方式。

## 编辑页面

页面结构和新增融资页面一致，支持数据的编辑。

## 详情页面

展示融资详细信息，注意要使用附件组件展示用户上传的文件。
