# 数据字典使用指南

本指南介绍了如何在Rax-Web项目中使用数据字典功能，包括管理、API调用和组件使用。

## 📖 功能概述

数据字典功能提供了统一的数据标准化管理方案，支持：

- ✅ 字典和字典项的完整CRUD操作
- ✅ 树形结构的字典项管理
- ✅ 字典数据缓存机制
- ✅ 表单组件集成
- ✅ 表格显示组件集成
- ✅ 响应式的用户界面

## 🗂️ 文件结构

```
src/
├── api/modules/dict.ts           # 字典API模块
├── types/dict.d.ts               # 字典类型定义
├── views/system/DictManage.vue   # 字典管理页面
├── composables/useDict.ts        # 字典功能composable
├── components/
│   ├── DictSelect.vue           # 字典下拉选择组件
│   └── DictLabel.vue            # 字典标签显示组件
└── views/examples/DictExample.vue # 使用示例页面
```

## 🎯 页面功能

### 数据字典管理页面 (`/dict`)

**左侧 - 字典列表**：
- 字典的分页查询和搜索
- 支持按编码、名称、状态筛选
- 字典的新增、编辑、删除操作
- 字典编码验证（必须以大写字母开头）

**右侧 - 字典项管理**：
- 树形结构显示字典项
- 支持多级嵌套的字典项
- 字典项的增删改操作
- 禁用状态的可视化标识

## 🔧 API 使用

### 基础 API 调用

```typescript
import { dictApi } from '@/api/modules/dict'

// 获取字典列表
const response = await dictApi.getDictList({
  pageNo: 1,
  pageSize: 20,
  code: 'USER', // 可选：按编码搜索
  name: '用户', // 可选：按名称搜索
  isEnabled: true // 可选：按状态搜索
})

// 创建字典
const dict = await dictApi.createDict({
  code: 'GENDER',
  name: '性别',
  comment: '用户性别选项',
  isEnabled: true
})

// 获取字典项树
const tree = await dictApi.getDictItemTreeByCode('GENDER', true)
```

### 使用 Composable

推荐使用 `useDict` composable 来简化操作：

```typescript
import { useDict } from '@/composables/useDict'

const { getDictItems, getDictLabel, getFlatDictItems } = useDict()

// 获取字典项（带缓存）
const items = await getDictItems('GENDER')

// 获取字典标签
const label = await getDictLabel('GENDER', 'M') // 返回 "男"

// 获取扁平化选项（用于下拉框）
const options = await getFlatDictItems('EDUCATION')
// 返回: [{ label: '本科', value: 'BACHELOR' }, ...]
```

## 🎨 组件使用

### DictSelect - 字典下拉选择

字典下拉选择组件，支持树形数据扁平化显示、禁用项处理等功能。

```vue
<template>
  <!-- 基础用法 -->
  <DictSelect
    v-model="form.interestRateType"
    dict-code="INTEREST_RATE_TYPE"
    placeholder="请选择利率类型"
  />

  <!-- 自定义宽度 -->
  <DictSelect
    v-model="form.customerType"
    dict-code="CUSTOMER_TYPE"
    placeholder="请选择客户类型"
    width="300px"
  />

  <!-- 禁用状态 -->
  <DictSelect
    v-model="form.businessStatus"
    dict-code="BUSINESS_STATUS"
    placeholder="请选择业务状态"
    :disabled="true"
  />

  <!-- 包含禁用项 -->
  <DictSelect
    v-model="form.withDisabledItems"
    dict-code="MIXED_STATUS_DICT"
    placeholder="包含禁用项的选择"
    :only-enabled="false"
  />

  <!-- 监听变化 -->
  <DictSelect
    v-model="form.status"
    dict-code="USER_STATUS"
    @change="handleStatusChange"
  />

  <!-- 支持搜索 -->
  <DictSelect
    v-model="form.searchableOption"
    dict-code="COMPLEX_CATEGORY"
    placeholder="请输入关键词搜索"
    filterable
  />

  <!-- 禁用搜索 -->
  <DictSelect
    v-model="form.nonSearchableOption"
    dict-code="SIMPLE_CATEGORY"
    placeholder="不支持搜索"
    :filterable="false"
  />
</template>

<script setup>
import { reactive } from 'vue'

const form = reactive({
  interestRateType: '',
  customerType: '',
  businessStatus: '',
  withDisabledItems: '',
  status: '',
  searchableOption: '',
  nonSearchableOption: ''
})

const handleStatusChange = (value) => {
  console.log('状态变化:', value)
}
</script>
```

#### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|-----|-----|-----|-------|-------|
| dictCode | 字典编码 | string | — | — |
| modelValue | 绑定值 | string/number/null | — | — |
| placeholder | 占位符 | string | — | '请选择' |
| clearable | 是否可清空 | boolean | — | true |
| disabled | 是否禁用 | boolean | — | false |
| width | 组件宽度 | string | — | '100%' |
| onlyEnabled | 是否只显示启用的项 | boolean | — | true |
| filterable | 是否支持搜索 | boolean | — | true |

#### Events

| 事件名 | 说明 | 回调参数 |
|-------|-----|---------|
| change | 选中值发生变化时触发 | function(value) |

#### 数据格式

- 组件会自动调用 `getDictItemTreeByCode` API
- 读取 `result.data.data.children` 作为选项数据
- 树形数据会自动扁平化显示，使用缩进表示层级关系
- `isEnabled: false` 的字典项会显示为禁用状态，不可选中
- 支持无限层级的树形结构

#### 搜索功能

- 默认启用搜索功能（`filterable: true`）
- 支持按字典项标签（label）进行模糊搜索
- 搜索时会过滤所有层级的选项，保持层级缩进显示
- 搜索不区分大小写
- 可通过设置 `:filterable="false"` 禁用搜索功能

### DictLabel - 字典标签显示

```vue
<template>
  <!-- 基础显示 -->
  <DictLabel dict-code="GENDER" :value="user.gender" />

  <!-- 标签模式 -->
  <DictLabel 
    dict-code="USER_STATUS" 
    :value="user.status"
    show-tag
    tag-type="success"
  />

  <!-- 在表格中使用 -->
  <el-table :data="userList">
    <el-table-column label="性别">
      <template #default="{ row }">
        <DictLabel dict-code="GENDER" :value="row.gender" />
      </template>
    </el-table-column>
    <el-table-column label="状态">
      <template #default="{ row }">
        <DictLabel 
          dict-code="USER_STATUS" 
          :value="row.status"
          show-tag
        />
      </template>
    </el-table-column>
  </el-table>
</template>
```

## 🎪 示例数据

为了便于测试，建议创建以下示例字典：

### 1. 性别字典 (GENDER)
```
- 字典编码: GENDER
- 字典名称: 性别
- 字典项:
  - M: 男
  - F: 女
  - OTHER: 其他
```

### 2. 学历字典 (EDUCATION)
```
- 字典编码: EDUCATION
- 字典名称: 学历
- 字典项:
  - HIGH_SCHOOL: 高中
  - COLLEGE: 大专
  - BACHELOR: 本科
  - MASTER: 硕士
  - DOCTOR: 博士
```

### 3. 用户状态字典 (USER_STATUS)
```
- 字典编码: USER_STATUS
- 字典名称: 用户状态
- 字典项:
  - ACTIVE: 活跃
  - INACTIVE: 非活跃
  - PENDING: 待审核
  - SUSPENDED: 已暂停
```

### 4. 兴趣爱好字典 (HOBBIES)
```
- 字典编码: HOBBIES
- 字典名称: 兴趣爱好
- 字典项:
  - SPORTS: 运动
    - FOOTBALL: 足球
    - BASKETBALL: 篮球
    - SWIMMING: 游泳
  - MUSIC: 音乐
    - POP: 流行音乐
    - CLASSICAL: 古典音乐
    - ROCK: 摇滚音乐
  - READING: 阅读
  - TRAVEL: 旅行
```

## ⚙️ 配置和最佳实践

### 字典编码规范

1. **命名规则**：使用大写字母、数字和下划线，必须以大写字母开头
   - ✅ `USER_STATUS`
   - ✅ `GENDER`
   - ✅ `ORDER_TYPE_2023`
   - ❌ `user_status` (小写)
   - ❌ `_STATUS` (不能以下划线开头)

2. **语义化**：编码应该能直接反映业务含义
   - ✅ `PAYMENT_METHOD` (支付方式)
   - ✅ `ORDER_STATUS` (订单状态)
   - ❌ `TYPE_A` (含义不明)

### 性能优化

1. **缓存机制**：`useDict` 自动缓存字典数据，减少重复请求
2. **预加载**：在页面初始化时预加载常用字典
```typescript
onMounted(() => {
  preloadDicts(['GENDER', 'EDUCATION', 'USER_STATUS'])
})
```

3. **条件加载**：只在需要时加载字典数据
```typescript
// 只有当用户选择某个选项时才加载子字典
watch(() => form.category, (newCategory) => {
  if (newCategory) {
    loadSubCategoryDict(newCategory)
  }
})
```

### 错误处理

所有字典相关的API调用都集成了统一的错误处理：

```typescript
// 自动显示用户友好的错误信息
const result = await handleAsyncOperation(
  () => dictApi.createDict(dictData),
  '创建字典'
)

if (result.success) {
  // 处理成功逻辑
}
// 错误会自动显示，无需手动处理
```

## 🚀 扩展功能

### 1. 国际化支持

可以扩展字典项来支持多语言：

```typescript
interface DictItemWithI18n extends SysDictItem {
  labelEn?: string // 英文标签
  labelZhTw?: string // 繁体中文标签
}
```

### 2. 字典项图标

为字典项添加图标支持：

```typescript
interface DictItemWithIcon extends SysDictItem {
  icon?: string // 图标名称或URL
  color?: string // 显示颜色
}
```

### 3. 动态字典

支持根据上下文动态生成的字典：

```typescript
// 根据当前用户权限动态获取可操作的状态
const getStatusDictByRole = (userRole: string) => {
  return dictApi.getDynamicDict('STATUS', { role: userRole })
}
```

## 📝 开发注意事项

1. **类型安全**：所有字典相关的类型都已在 `dict.d.ts` 中定义
2. **组件复用**：优先使用提供的 `DictSelect` 和 `DictLabel` 组件
3. **缓存更新**：在字典数据变更后，记得清除相关缓存
4. **响应式设计**：所有组件都支持响应式布局
5. **无障碍访问**：组件遵循 WCAG 标准，支持键盘导航

---

更多详细信息，请参考源码中的注释和类型定义。如有问题，请查看示例页面 (`/examples/dict`) 或联系开发团队。 