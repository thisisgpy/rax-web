import React, { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Space,
  App
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { CreateScfVoucherItemDto } from '@/types/swagger-api';
import DictSelect from '@/components/DictSelect';
import RaxUpload from '@/components/RaxUpload';
import type { UploadedFile } from '@/components/RaxUpload';
import AmountDisplay from '@/components/AmountDisplay';

interface VoucherItem extends CreateScfVoucherItemDto {
  _key: string;
  _files?: UploadedFile[];
}

interface ScfVoucherItemFormProps {
  value?: CreateScfVoucherItemDto[];
  onChange?: (value: CreateScfVoucherItemDto[]) => void;
  isEdit?: boolean;
}

const ScfVoucherItemForm: React.FC<ScfVoucherItemFormProps> = ({
  value = [],
  onChange,
  isEdit
}) => {
  const { message } = App.useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<VoucherItem | null>(null);
  const [form] = Form.useForm();
  const [files, setFiles] = useState<UploadedFile[]>([]);

  // 转换数据为带 _key 的格式
  const dataSource: VoucherItem[] = value.map((item, index) => ({
    ...item,
    _key: `voucher-${index}`,
    _files: item.fileAttachments?.map(att => ({
      attachmentId: att.attachmentId,
      filename: '',
      fileSize: att.fileSize
    }))
  }));

  // 打开新增弹窗
  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setFiles([]);
    setModalVisible(true);
  };

  // 打开编辑弹窗
  const handleEdit = (record: VoucherItem) => {
    setEditingItem(record);
    form.setFieldsValue({
      ...record,
      underlyingAmount: record.underlyingAmount ? record.underlyingAmount / 1000000 : undefined,
      issueDate: record.issueDate ? dayjs(record.issueDate) : undefined,
      dueDate: record.dueDate ? dayjs(record.dueDate) : undefined
    });
    setFiles(record._files || []);
    setModalVisible(true);
  };

  // 删除
  const handleDelete = (record: VoucherItem) => {
    const newData = value.filter((_, index) => `voucher-${index}` !== record._key);
    onChange?.(newData);
  };

  // 提交弹窗
  const handleModalOk = () => {
    form.validateFields().then(values => {
      const newItem: CreateScfVoucherItemDto = {
        voucherNo: values.voucherNo,
        voucherType: values.voucherType,
        coreCorpName: values.coreCorpName,
        debtorName: values.debtorName,
        underlyingAmount: values.underlyingAmount ? Math.round(values.underlyingAmount * 1000000) : undefined,
        issueDate: values.issueDate?.format('YYYY-MM-DD'),
        dueDate: values.dueDate?.format('YYYY-MM-DD'),
        status: values.status,
        remark: values.remark,
        fileAttachments: files.map(f => ({
          attachmentId: f.attachmentId,
          fileSize: f.fileSize
        }))
      };

      if (editingItem) {
        const index = dataSource.findIndex(d => d._key === editingItem._key);
        const newData = [...value];
        newData[index] = newItem;
        onChange?.(newData);
      } else {
        onChange?.([...value, newItem]);
      }

      setModalVisible(false);
      form.resetFields();
      setFiles([]);
      setEditingItem(null);
    });
  };

  const columns: ColumnsType<VoucherItem> = [
    {
      title: '凭证编号',
      dataIndex: 'voucherNo',
      key: 'voucherNo'
    },
    {
      title: '凭证类型',
      dataIndex: 'voucherType',
      key: 'voucherType',
      width: 100
    },
    {
      title: '核心企业',
      dataIndex: 'coreCorpName',
      key: 'coreCorpName'
    },
    {
      title: '债务人',
      dataIndex: 'debtorName',
      key: 'debtorName'
    },
    {
      title: '底层金额',
      dataIndex: 'underlyingAmount',
      key: 'underlyingAmount',
      width: 140,
      render: (val) => val ? <AmountDisplay value={val} /> : '-'
    },
    {
      title: '到期日',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 110
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
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button type="dashed" icon={<PlusOutlined />} onClick={handleAdd}>
          添加凭证明细
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="_key"
        pagination={false}
        size="small"
      />

      <Modal
        title={editingItem ? '编辑凭证明细' : '添加凭证明细'}
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
          <Form.Item name="voucherNo" label="凭证编号">
            <Input placeholder="请输入" />
          </Form.Item>

          <Form.Item name="voucherType" label="凭证类型">
            <DictSelect dictCode="scf.voucher.type" placeholder="请选择" allowClear />
          </Form.Item>

          <Form.Item name="coreCorpName" label="核心企业名称">
            <Input placeholder="请输入" />
          </Form.Item>

          <Form.Item name="debtorName" label="债务人/付款方">
            <Input placeholder="请输入" />
          </Form.Item>

          <Form.Item name="underlyingAmount" label="底层金额（万元）">
            <InputNumber style={{ width: '100%' }} min={0} precision={6} placeholder="请输入" />
          </Form.Item>

          <Form.Item name="issueDate" label="凭证生成日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="dueDate" label="到期日">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="status" label="状态">
            <DictSelect dictCode="scf.voucher.status" placeholder="请选择" allowClear />
          </Form.Item>

          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入" />
          </Form.Item>

          <Form.Item label="附件">
            <RaxUpload
              bizModule="FinLoanScfVoucherItem"
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

export default ScfVoucherItemForm;
