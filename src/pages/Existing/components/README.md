# 融资类型特定字段组件开发规范

本文档定义了融资类型特定字段表单组件的统一开发模式，确保所有组件遵循一致的架构和实现方式。

## 一、组件分类

### 1. 标准子表单组件（简单模式）
- **ParticipantForm** - 银团参与行
- **TrustTrancheForm** - 信托分层
- **FactoringArItemForm** - 保理应收款明细
- **ScfVoucherItemForm** - 供应链凭证明细
- **LeasedAssetForm** - 租赁资产

### 2. 关联选择组件（复杂模式）
- **CdForm** - 存单关联（选择已有/创建新的）
- **LcForm** - 信用证关联（选择已有/创建新的）
- **FixedAssetMapForm** - 固定资产关联（单选模式）

---

## 二、Props 接口定义

### 标准接口
```typescript
interface XxxFormProps {
  /** 数据数组，用于 Form.Item 受控模式 */
  value?: CreateXxxDto[];
  /** 数据变化回调 */
  onChange?: (value: CreateXxxDto[]) => void;
  /** 是否为编辑模式（Detail 页面传入） */
  isEdit?: boolean;
  /** 编辑模式下的业务 ID */
  loanId?: number;
  /** 是否只读模式 */
  readOnly?: boolean;
}
```

### 工作模式说明
| 场景 | isEdit | loanId | 数据来源 | 保存方式 |
|------|--------|--------|----------|----------|
| 创建页面 | false | undefined | value (父组件状态) | onChange 回调 |
| 编辑页面 | true | 有值 | API 加载 | 直接调用 API |
| 详情页面 | true | 有值 | API 加载 | 只读，无保存 |

---

## 三、状态管理

### 必需状态
```typescript
const { message } = App.useApp();
const [modalVisible, setModalVisible] = useState(false);
const [editingItem, setEditingItem] = useState<XxxItem | null>(null);
const [form] = Form.useForm();
const [files, setFiles] = useState<UploadedFile[]>([]);
const [loading, setLoading] = useState(false);
const [apiData, setApiData] = useState<XxxDto[]>([]);

// 附件查看状态
const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
const [viewingAttachments, setViewingAttachments] = useState<SysAttachmentDto[]>([]);
```

### 复杂组件额外状态（CdForm/LcForm 模式）
```typescript
const [activeTab, setActiveTab] = useState<'select' | 'create'>('select');
const [unlinkedList, setUnlinkedList] = useState<XxxDto[]>([]);
const [selectedIds, setSelectedIds] = useState<number[]>([]);
const [unlinkedPagination, setUnlinkedPagination] = useState({
  current: 1,
  pageSize: 5,
  total: 0
});
```

---

## 四、内部数据类型定义

```typescript
interface XxxItem extends CreateXxxDto {
  _key: string;                    // 用作 Table rowKey
  _files?: UploadedFile[];         // 转换后的文件列表
  _attachments?: SysAttachmentDto[]; // 原始附件数据
  id?: number;                     // 编辑模式下的记录 ID
}
```

---

## 五、数据加载模式

### useEffect 加载
```typescript
useEffect(() => {
  if (isEdit && loanId) {
    loadData();
  }
}, [isEdit, loanId]);

const loadData = async () => {
  if (!loanId) return;
  setLoading(true);
  try {
    const result = await xxxApi.listByLoan(loanId);
    if (result.success) {
      setApiData(result.data || []);
    }
  } catch (error) {
    message.error('加载数据失败');
  } finally {
    setLoading(false);
  }
};
```

### 数据源转换
```typescript
const dataSource: XxxItem[] = (isEdit && loanId ? apiData : value).map(
  (item: any, index) => ({
    ...item,
    _key: `xxx-${item.id || index}`,
    id: item.id,
    _files: item.fileAttachments?.map((att: any) => ({
      attachmentId: att.attachmentId || att.id,
      filename: att.originalName || '',
      fileSize: att.fileSize
    })),
    _attachments: item.fileAttachments || []
  })
);
```

---

## 六、CRUD 操作实现

### 1. 新增（handleAdd）
```typescript
const handleAdd = () => {
  setEditingItem(null);
  form.resetFields();
  setFiles([]);
  setModalVisible(true);
};
```

### 2. 编辑（handleEdit）
```typescript
const handleEdit = (record: XxxItem) => {
  setEditingItem(record);
  setFiles(record._files || []);
  setModalVisible(true);
  // 延迟设置表单值，等待 Modal 渲染完成
  setTimeout(() => {
    form.setFieldsValue({
      ...record,
      // 金额转换：分 → 万元
      amount: record.amount ? record.amount / 1000000 : undefined,
      // 日期转换：字符串 → dayjs
      date: record.date ? dayjs(record.date) : undefined
    });
  }, 0);
};
```

### 3. 删除（handleDelete）
```typescript
const handleDelete = async (record: XxxItem) => {
  if (isEdit && loanId && record.id) {
    // API 模式
    try {
      const result = await xxxApi.remove(record.id);
      if (result.success) {
        message.success('删除成功');
        loadData();
      } else {
        message.error(result.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  } else {
    // 本地模式
    const newData = value.filter((_, index) => `xxx-${index}` !== record._key);
    onChange?.(newData);
  }
};
```

### 4. 保存（handleModalOk）
```typescript
const handleModalOk = async () => {
  try {
    const values = await form.validateFields();

    // 附件处理
    const fileAttachments = files.map(f => ({
      attachmentId: f.attachmentId,
      fileSize: f.fileSize,
      operation: 'ADD' as const
    }));

    if (isEdit && loanId) {
      if (editingItem?.id) {
        // 更新现有记录
        const updateData: UpdateXxxDto = {
          id: editingItem.id,
          field1: values.field1,
          amount: values.amount ? Math.round(values.amount * 1000000) : 0,
          date: values.date?.format('YYYY-MM-DD')
          // 注意：部分 Update API 不支持 fileAttachments
        };
        const result = await xxxApi.update(updateData);
        if (result.success) {
          message.success('更新成功');
          loadData();
        } else {
          message.error(result.message || '更新失败');
          return;
        }
      } else {
        // 创建新记录
        const createData: CreateXxxDto = {
          field1: values.field1,
          amount: values.amount ? Math.round(values.amount * 1000000) : 0,
          date: values.date?.format('YYYY-MM-DD'),
          fileAttachments
        };
        const result = await xxxApi.createBatch(loanId, [createData]);
        if (result.success) {
          message.success('添加成功');
          loadData();
        } else {
          message.error(result.message || '添加失败');
          return;
        }
      }
    } else {
      // 本地模式
      const newItem: CreateXxxDto = {
        field1: values.field1,
        amount: values.amount ? Math.round(values.amount * 1000000) : 0,
        date: values.date?.format('YYYY-MM-DD'),
        fileAttachments
      };

      if (editingItem) {
        const index = dataSource.findIndex(d => d._key === editingItem._key);
        const newData = [...value];
        newData[index] = newItem;
        onChange?.(newData);
      } else {
        onChange?.([...value, newItem]);
      }
    }

    setModalVisible(false);
    form.resetFields();
    setFiles([]);
    setEditingItem(null);
  } catch (error: any) {
    if (!error?.errorFields) {
      message.error('操作失败');
    }
  }
};
```

---

## 七、表格配置

### 表格组件
```typescript
<Table
  columns={columns}
  dataSource={dataSource}
  rowKey="_key"
  pagination={false}
  size="small"
  loading={loading}
  locale={{ emptyText: '暂无数据' }}
/>
```

### 列定义
```typescript
const columns: ColumnsType<XxxItem> = [
  {
    title: '文本字段',
    dataIndex: 'textField',
    key: 'textField'
  },
  {
    title: '金额字段',
    dataIndex: 'amount',
    key: 'amount',
    width: 140,
    render: (val) => val ? <AmountDisplay value={val} /> : '-'
  },
  {
    title: '百分比字段',
    dataIndex: 'rate',
    key: 'rate',
    width: 100,
    render: (val) => val ? `${val}%` : '-'
  },
  {
    title: '日期字段',
    dataIndex: 'date',
    key: 'date',
    width: 110
  },
  {
    title: '布尔字段',
    dataIndex: 'flag',
    key: 'flag',
    width: 80,
    render: (val) => val ? '是' : '否'
  },
  {
    title: '操作',
    key: 'action',
    width: 80,
    align: 'center',
    render: (_, record) => renderActionColumn(record)
  }
];
```

### 操作列（统一下拉菜单样式）
```typescript
const renderActionColumn = (record: XxxItem) => {
  const menuItems: MenuProps['items'] = [];

  // 查看附件（有附件时显示）
  if (record._attachments && record._attachments.length > 0) {
    menuItems.push({
      key: 'attachment',
      icon: <PaperClipOutlined />,
      label: '查看附件',
      onClick: () => handleViewAttachments(record)
    });
  }

  // 编辑和删除（非只读时显示）
  if (!readOnly) {
    if (menuItems.length > 0) {
      menuItems.push({ type: 'divider' });
    }
    menuItems.push({
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑',
      onClick: () => handleEdit(record)
    });
    menuItems.push({
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: '确认删除',
          content: '确定要删除这条记录吗？',
          okText: '确定',
          cancelText: '取消',
          onOk: () => handleDelete(record)
        });
      }
    });
  }

  if (menuItems.length === 0) return null;

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
      <Button type="text" icon={<SettingOutlined />} />
    </Dropdown>
  );
};
```

---

## 八、弹窗表单配置

### Modal 配置
```typescript
{!readOnly && (
  <Modal
    title={editingItem ? '编辑Xxx' : '添加Xxx'}
    open={modalVisible}
    onOk={handleModalOk}
    onCancel={() => {
      setModalVisible(false);
      form.resetFields();
      setFiles([]);
      setEditingItem(null);
    }}
    width={720}
    maskClosable={false}
  >
    <Form form={form} layout="vertical">
      {/* 表单内容 */}
    </Form>
  </Modal>
)}
```

### 表单布局（Row + Col）
```typescript
<Form form={form} layout="vertical">
  <Row gutter={16}>
    <Col span={12}>
      <Form.Item
        name="field1"
        label="字段1"
        rules={[{ required: true, message: '请输入' }]}
      >
        <Input placeholder="请输入" />
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item name="field2" label="字段2">
        <Input placeholder="请输入" />
      </Form.Item>
    </Col>
  </Row>

  <Row gutter={16}>
    <Col span={12}>
      <Form.Item
        name="amount"
        label="金额（万元）"
        rules={[{ required: true, message: '请输入' }]}
      >
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          precision={6}
          placeholder="请输入"
        />
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item name="date" label="日期">
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
    </Col>
  </Row>

  <Form.Item label="附件">
    <RaxUpload
      bizModule="FinLoanXxx"
      value={files}
      onChange={setFiles}
      maxCount={5}
    />
  </Form.Item>
</Form>
```

---

## 九、附件处理

### 查看附件
```typescript
const handleViewAttachments = (record: XxxItem) => {
  setViewingAttachments(record._attachments || []);
  setAttachmentModalVisible(true);
};

// JSX
<AttachmentViewModal
  open={attachmentModalVisible}
  onClose={() => {
    setAttachmentModalVisible(false);
    setViewingAttachments([]);
  }}
  attachments={viewingAttachments}
  title="附件列表"
/>
```

### 编辑时计算附件差异（高级用法）
```typescript
// 当 Update API 支持 attachmentOperations 时使用
const [originalFiles, setOriginalFiles] = useState<UploadedFile[]>([]);

const handleEdit = (record: XxxItem) => {
  const recordFiles = record._files || [];
  setFiles(recordFiles);
  setOriginalFiles(recordFiles);  // 保存原始文件列表
  // ...
};

const handleModalOk = async () => {
  // 计算差异
  const originalFileIds = new Set(originalFiles.map(f => f.attachmentId));
  const currentFileIds = new Set(files.map(f => f.attachmentId));
  const attachmentOperations: AttachmentOperationDto[] = [];

  // 当前文件：新增或保留
  files.forEach(f => {
    attachmentOperations.push({
      attachmentId: f.attachmentId,
      fileSize: f.fileSize,
      operation: originalFileIds.has(f.attachmentId) ? 'KEEP' : 'ADD'
    });
  });

  // 已删除文件
  originalFiles.forEach(f => {
    if (!currentFileIds.has(f.attachmentId)) {
      attachmentOperations.push({
        attachmentId: f.attachmentId,
        fileSize: f.fileSize,
        operation: 'DELETE'
      });
    }
  });

  // 使用 attachmentOperations 提交
};
```

---

## 十、金额处理规范

### 单位转换
```
存储单位：分（数据库最小单位）
显示单位：万元（金融业务单位）
转换系数：1,000,000 (10^6)
```

### 转换公式
```typescript
// 表单输入 → API 提交
apiValue = Math.round(formValue * 1000000)

// API 返回 → 表单显示
formValue = apiValue / 1000000

// 表格展示
<AmountDisplay value={apiValue} />  // 自动格式化
```

### InputNumber 配置
```typescript
<InputNumber
  style={{ width: '100%' }}
  min={0}
  precision={6}      // 保留6位小数（对应分的精度）
  placeholder="请输入"
/>
```

---

## 十一、日期处理规范

```typescript
// 编辑时设置表单值
date: record.date ? dayjs(record.date) : undefined

// 提交时格式化
date: values.date?.format('YYYY-MM-DD')

// 表单字段
<DatePicker style={{ width: '100%' }} />
```

---

## 十二、导入声明模板

```typescript
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Switch,
  App,
  Dropdown,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  SettingOutlined,
  EditOutlined,
  DeleteOutlined,
  PaperClipOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type {
  CreateXxxDto,
  UpdateXxxDto,
  XxxDto,
  SysAttachmentDto
} from '@/types/swagger-api';
import { xxxApi } from '@/services/xxx';
import DictSelect from '@/components/DictSelect';
import RaxUpload from '@/components/RaxUpload';
import type { UploadedFile } from '@/components/RaxUpload';
import AmountDisplay from '@/components/AmountDisplay';
import AttachmentViewModal from '@/components/AttachmentViewModal';
```

---

## 十三、完整组件结构模板

```typescript
const XxxForm: React.FC<XxxFormProps> = ({
  value = [],
  onChange,
  isEdit,
  loanId,
  readOnly = false
}) => {
  // 1. 状态定义
  const { message } = App.useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<XxxItem | null>(null);
  const [form] = Form.useForm();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<XxxDto[]>([]);
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
  const [viewingAttachments, setViewingAttachments] = useState<SysAttachmentDto[]>([]);

  // 2. 数据加载
  useEffect(() => { /* ... */ }, [isEdit, loanId]);
  const loadData = async () => { /* ... */ };

  // 3. 数据转换
  const dataSource: XxxItem[] = /* ... */;

  // 4. 事件处理
  const handleViewAttachments = (record: XxxItem) => { /* ... */ };
  const handleAdd = () => { /* ... */ };
  const handleEdit = (record: XxxItem) => { /* ... */ };
  const handleDelete = async (record: XxxItem) => { /* ... */ };
  const handleModalOk = async () => { /* ... */ };

  // 5. 列定义
  const columns: ColumnsType<XxxItem> = [ /* ... */ ];

  // 6. 渲染
  return (
    <>
      {/* 添加按钮 */}
      {!readOnly && (
        <div style={{ marginBottom: 16 }}>
          <Button type="dashed" icon={<PlusOutlined />} onClick={handleAdd}>
            添加Xxx
          </Button>
        </div>
      )}

      {/* 数据表格 */}
      <Table /* ... */ />

      {/* 编辑弹窗 */}
      {!readOnly && <Modal /* ... */ />}

      {/* 附件查看弹窗 */}
      <AttachmentViewModal /* ... */ />
    </>
  );
};

export default XxxForm;
```

---

## 十四、CdForm/LcForm 复杂模式说明

当需要支持"选择已有"和"创建新的"两种模式时，参考 CdForm/LcForm 的实现：

1. **Tab 切换**：activeTab 控制 'select' | 'create'
2. **选择已有**：加载未关联列表，多选后批量关联
3. **创建新的**：同时创建主记录和关联记录
4. **编辑模式**：只显示编辑表单，不显示 Tab

---

## 十五、检查清单

开发新组件时，确保以下项目：

- [ ] Props 接口包含 value/onChange/isEdit/loanId/readOnly
- [ ] 内部类型包含 _key/_files/_attachments/id
- [ ] useEffect 监听 isEdit 和 loanId 加载数据
- [ ] dataSource 正确转换添加 _key 等字段
- [ ] handleAdd/handleEdit/handleDelete/handleModalOk 四个核心方法
- [ ] 表格使用 rowKey="_key"
- [ ] 操作列使用 Dropdown + SettingOutlined 样式
- [ ] Modal 设置 maskClosable={false}
- [ ] 金额字段正确进行单位转换（×/÷ 1000000）
- [ ] 日期字段使用 dayjs 转换
- [ ] 附件使用 RaxUpload 和 AttachmentViewModal
- [ ] 只读模式正确隐藏添加/编辑/删除按钮
