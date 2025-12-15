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
  Space,
  App,
  Popconfirm
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type {
  CreateFactoringArItemDto,
  FactoringArItemDto,
  UpdateFactoringArItemDto
} from '@/types/swagger-api';
import { factoringArItemApi } from '@/services/factoringArItem';
import DictSelect from '@/components/DictSelect';
import RaxUpload from '@/components/RaxUpload';
import type { UploadedFile } from '@/components/RaxUpload';
import AmountDisplay from '@/components/AmountDisplay';

interface ArItem extends CreateFactoringArItemDto {
  _key: string;
  _files?: UploadedFile[];
  id?: number;
}

interface FactoringArItemFormProps {
  value?: CreateFactoringArItemDto[];
  onChange?: (value: CreateFactoringArItemDto[]) => void;
  isEdit?: boolean;
  loanId?: number;
}

const FactoringArItemForm: React.FC<FactoringArItemFormProps> = ({
  value = [],
  onChange,
  isEdit,
  loanId
}) => {
  const { message } = App.useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ArItem | null>(null);
  const [form] = Form.useForm();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<FactoringArItemDto[]>([]);

  useEffect(() => {
    if (isEdit && loanId) {
      loadData();
    }
  }, [isEdit, loanId]);

  const loadData = async () => {
    if (!loanId) return;
    setLoading(true);
    try {
      const result = await factoringArItemApi.listByLoan(loanId);
      if (result.success) {
        setApiData(result.data || []);
      }
    } catch (error) {
      message.error('加载应收款明细数据失败');
    } finally {
      setLoading(false);
    }
  };

  const dataSource: ArItem[] = (isEdit && loanId ? apiData : value).map((item: any, index) => ({
    ...item,
    _key: `ar-${item.id || index}`,
    id: item.id,
    _files: item.fileAttachments?.map((att: any) => ({
      attachmentId: att.attachmentId || att.id,
      filename: att.originalName || '',
      fileSize: att.fileSize
    }))
  }));

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setFiles([]);
    setModalVisible(true);
  };

  const handleEdit = (record: ArItem) => {
    setEditingItem(record);
    form.setFieldsValue({
      ...record,
      arFaceAmount: record.arFaceAmount ? record.arFaceAmount / 1000000 : undefined,
      assignedAmount: record.assignedAmount ? record.assignedAmount / 1000000 : undefined,
      issueDate: record.issueDate ? dayjs(record.issueDate) : undefined,
      dueDate: record.dueDate ? dayjs(record.dueDate) : undefined,
      paidDate: record.paidDate ? dayjs(record.paidDate) : undefined
    });
    setFiles(record._files || []);
    setModalVisible(true);
  };

  const handleDelete = async (record: ArItem) => {
    if (isEdit && loanId && record.id) {
      try {
        const result = await factoringArItemApi.remove(record.id);
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
      const newData = value.filter((_, index) => `ar-${index}` !== record._key);
      onChange?.(newData);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const fileAttachments = files.map(f => ({
        attachmentId: f.attachmentId,
        fileSize: f.fileSize,
        operation: 'ADD' as const
      }));

      if (isEdit && loanId) {
        if (editingItem?.id) {
          // UpdateFactoringArItemDto doesn't support fileAttachments
          const updateData: UpdateFactoringArItemDto = {
            id: editingItem.id,
            invoiceNo: values.invoiceNo,
            debtorName: values.debtorName,
            arFaceAmount: values.arFaceAmount ? Math.round(values.arFaceAmount * 1000000) : 0,
            assignedAmount: values.assignedAmount ? Math.round(values.assignedAmount * 1000000) : undefined,
            issueDate: values.issueDate?.format('YYYY-MM-DD'),
            dueDate: values.dueDate?.format('YYYY-MM-DD'),
            paidFlag: values.paidFlag,
            paidDate: values.paidDate?.format('YYYY-MM-DD'),
            status: values.status,
            remark: values.remark
          };
          const result = await factoringArItemApi.update(updateData);
          if (result.success) {
            message.success('更新成功');
            loadData();
          } else {
            message.error(result.message || '更新失败');
            return;
          }
        } else {
          const createData: CreateFactoringArItemDto = {
            invoiceNo: values.invoiceNo,
            debtorName: values.debtorName,
            arFaceAmount: values.arFaceAmount ? Math.round(values.arFaceAmount * 1000000) : 0,
            assignedAmount: values.assignedAmount ? Math.round(values.assignedAmount * 1000000) : undefined,
            issueDate: values.issueDate?.format('YYYY-MM-DD'),
            dueDate: values.dueDate?.format('YYYY-MM-DD'),
            paidFlag: values.paidFlag,
            paidDate: values.paidDate?.format('YYYY-MM-DD'),
            status: values.status,
            remark: values.remark,
            fileAttachments
          };
          const result = await factoringArItemApi.createBatch(loanId, [createData]);
          if (result.success) {
            message.success('添加成功');
            loadData();
          } else {
            message.error(result.message || '添加失败');
            return;
          }
        }
      } else {
        const newItem: CreateFactoringArItemDto = {
          invoiceNo: values.invoiceNo,
          debtorName: values.debtorName,
          arFaceAmount: values.arFaceAmount ? Math.round(values.arFaceAmount * 1000000) : 0,
          assignedAmount: values.assignedAmount ? Math.round(values.assignedAmount * 1000000) : undefined,
          issueDate: values.issueDate?.format('YYYY-MM-DD'),
          dueDate: values.dueDate?.format('YYYY-MM-DD'),
          paidFlag: values.paidFlag,
          paidDate: values.paidDate?.format('YYYY-MM-DD'),
          status: values.status,
          remark: values.remark,
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

  const columns: ColumnsType<ArItem> = [
    {
      title: '发票号',
      dataIndex: 'invoiceNo',
      key: 'invoiceNo'
    },
    {
      title: '债务人',
      dataIndex: 'debtorName',
      key: 'debtorName'
    },
    {
      title: '票面金额',
      dataIndex: 'arFaceAmount',
      key: 'arFaceAmount',
      width: 140,
      render: (val) => val ? <AmountDisplay value={val} /> : '-'
    },
    {
      title: '转让金额',
      dataIndex: 'assignedAmount',
      key: 'assignedAmount',
      width: 140,
      render: (val) => val ? <AmountDisplay value={val} /> : '-'
    },
    {
      title: '开具日期',
      dataIndex: 'issueDate',
      key: 'issueDate',
      width: 110
    },
    {
      title: '到期日',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 110
    },
    {
      title: '已回款',
      dataIndex: 'paidFlag',
      key: 'paidFlag',
      width: 80,
      render: (val) => val ? '是' : '否'
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button type="dashed" icon={<PlusOutlined />} onClick={handleAdd}>
          添加应收款明细
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="_key"
        pagination={false}
        size="small"
        loading={loading}
      />

      <Modal
        title={editingItem ? '编辑应收款明细' : '添加应收款明细'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setFiles([]);
          setEditingItem(null);
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="invoiceNo"
            label="发票号/应收编号"
            rules={[{ required: true, message: '请输入' }]}
          >
            <Input placeholder="请输入" />
          </Form.Item>

          <Form.Item
            name="debtorName"
            label="买方/债务人"
            rules={[{ required: true, message: '请输入' }]}
          >
            <Input placeholder="请输入" />
          </Form.Item>

          <Form.Item
            name="arFaceAmount"
            label="应收票面金额（万元）"
            rules={[{ required: true, message: '请输入' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} precision={6} placeholder="请输入" />
          </Form.Item>

          <Form.Item name="assignedAmount" label="转让/已融资金额（万元）">
            <InputNumber style={{ width: '100%' }} min={0} precision={6} placeholder="请输入" />
          </Form.Item>

          <Form.Item
            name="issueDate"
            label="开具/形成日期"
            rules={[{ required: true, message: '请选择' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="到期日"
            rules={[{ required: true, message: '请选择' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="paidFlag" label="是否已回款" valuePropName="checked">
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>

          <Form.Item name="paidDate" label="回款日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="status" label="状态">
            <DictSelect dictCode="factoring.ar.status" placeholder="请选择" allowClear />
          </Form.Item>

          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入" />
          </Form.Item>

          <Form.Item label="附件">
            <RaxUpload
              bizModule="FinLoanFactoringArItem"
              value={files}
              onChange={setFiles}
              maxCount={5}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default FactoringArItemForm;
