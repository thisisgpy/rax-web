### 储备融资列表

调用接口：reserveApi.page

展示字段：

1. 融资主体（orgNameAbbr），鼠标悬停时使用 Tooltip 展示全称（orgName）
2. 金融机构（financialInstitutionBranchName）
3. 融资方式（fundingMode）
4. 融资金额（fundingAmount），使用 AmountDisplay 组件
5. 预计放款日期（expectedDisbursementDate）
6. 续贷（loanRenewalFromId），当 loanRenewalFromId = 0 显示“非续贷”，否则显示“查看”
7. 经办人（handlerName）
8. 综合成本率（combinedRatio），转换为百分数展示，保留 2 位小数
9. 状态（status），0:待放款, 1:已放款, 2:已取消
10. 创建时间（createTime）
11. 创建人（createBy）
12. 操作栏（编辑/查看详情/更新进度/删除）

### 新增/编辑储备融资页面

新增/编辑储备融资时需要新开页面，不能使用弹窗。

新增时调用接口reserveApi.create，编辑时调用接口reserveApi.update，使用接口reserveApi.get 获取储备融资详情。

页面分为三部分：基础信息、成本信息、进度信息。

基本信息区域字段：

1. 融资主体（orgId）
2. 金融机构 ID（financialInstitutionId），使用 InstitutionSelect 组件选择
3. 融资方式（fundingMode），使用数据字典 funding.mode
4. 融资金额（fundingAmount），用户以万元作为单位进行输入，输入框不要限制精度，提交服务端时转换为分（百分之一元）
5. 预计放款日期（expectedDisbursementDate）
6. 续贷来源（loanRenewalFromId），非必填，用户可以通过弹窗选择一笔存量债务作为续贷来源。当前存量债务功能还没有开发，这个交互暂不开发。
7. 牵头领导（leaderName）
8. 经办人（handlerName）

成本信息区域字段：

1. 综合成本率（combinedRatio），用户以百分数输入，提交服务端时转换为小数
2. 额外成本（additionalCosts），用户以万元作为单位进行输入，输入框不要限制精度，提交服务端时转换为分（百分之一元）
3. 储备融资成本明细（costs），用户可以自由添加多条成本明细，每条成本明细包含字段：
   1. 成本类型（costType），用户可以从数据字典cost.type 中选择任一成本类型，当用户选择“其他”时，应允许用户自由输入成本类型
   2. 成本描述（costDescription），允许用户输入任何内容，如字符串、数字、百分数等，提交服务端时全部以字符串形式提交

进度信息区域字段：

1. 使用 reserveApi.XXX 接口获取到所有的进度信息，包含进度名称（name）、计划完成日期和预期放款日期相差的月份（gap）两个字段，gap 可能是负数或者 0。用户需要为每个进度填写一个计划完成日期。
2. 当用户在基本信息区域填写了预计放款日期字段时，系统自动为用户计算所有进度的计划完成日期。计划完成日期（planDate） = 预计放款日期（expectedDisbursementDate） + 计划完成日期和预期放款日期相差的月份（gap）。
3. 虽然系统会自动计算各个进度的计划完成日期，但用户依然可以手动选择具体的日期。

特殊字段说明：

1. 在编辑状态下，对于进度信息，只有当实际完成日期为空时，才允许修改计划完成日期。并且在编辑状态下，不允许填写各个进度的实际完成日期。

### 储备融资详情页

详情页需要新开页面，不能使用弹窗。

页面分为四部分：基础信息、成本信息、进度信息、进度报告。

基础信息、成本信息、进度信息的展示方式和新增/编辑页面类似，但需要注意排版，使信息可读性更高。

进度报告部分，以时间线形式进行展示（调用接口：reserveApi.getReportList），包括报告内容（reportContent）、创建时间（createTime）、创建人（createBy）和附件列表。

用户只能在详情页新增进度报告，并且不能编辑已有的进度报告，但允许删除进度报告。

### 更新进度信息的实际完成日期

用户通过点击储备融资列表页的每行数据最后的操作栏中的“更新进度”按钮打开进度信息弹窗。

弹窗展示当前这笔储备融资的所有进度信息（调用接口：reserveApi.getProgressList），包括进度名称（progressName）、计划完成日期（planDate）、实际完成日期（actualDate）、状态。状态分为提前、按期、延期三种，提前和延期需要显示具体天数，比如“提前 5 天”、“延期 10 天”，具体天数 = 实际完成日期 - 计划完成日期，负数表示提前，正数表示延后，0 表示按期完成。

实际完成日期由用户填写并保存（调用接口：reserveApi.updateProgress），已填写过实际完成日期的进度不能再次填写该字段。

