import React, { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  App
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { CreateLeasedAssetDto } from '@/types/swagger-api';
import RaxUpload from '@/components/RaxUpload';
import type { UploadedFile } from '@/components/RaxUpload';
import AmountDisplay from '@/components/AmountDisplay';

interface AssetItem extends CreateLeasedAssetDto {
  _key: string;
  _files?: UploadedFile[];
}

interface LeasedAssetFormProps {
  value?: CreateLeasedAssetDto[];
  onChange?: (value: CreateLeasedAssetDto[]) => void;
  isEdit?: boolean;
}

const LeasedAssetForm: React.FC<LeasedAssetFormProps> = ({
  value = [],
  onChange,
  isEdit
}) => {
  const { message } = App.useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<AssetItem | null>(null);
  const [form] = Form.useForm();
  const [files, setFiles] = useState<UploadedFile[]>([]);

  // 转换数据为带 _key 的格式
  const dataSource: AssetItem[] = value.map((item, index) => ({
    ...item,
    _key: `asset-${index}`,
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
  const handleEdit = (record: AssetItem) => {
    setEditingItem(record);
    form.setFieldsValue({
      ...record,
      bookValueAtLease: record.bookValueAtLease ? record.bookValueAtLease / 1000000 : undefined,
      appraisedValueAtLease: record.appraisedValueAtLease ? record.appraisedValueAtLease / 1000000 : undefined
    });
    setFiles(record._files || []);
    setModalVisible(true);
  };

  // 删除
  const handleDelete = (record: AssetItem) => {
    const newData = value.filter((_, index) => `asset-${index}` !== record._key);
    onChange?.(newData);
  };

  // 提交弹窗
  const handleModalOk = () => {
    form.validateFields().then(values => {
      const newItem: CreateLeasedAssetDto = {
        assetId: values.assetId,
        assetCodeSnapshot: values.assetCodeSnapshot,
        assetNameSnapshot: values.assetNameSnapshot,
        quantity: values.quantity,
        unit: values.unit,
        bookValueAtLease: values.bookValueAtLease ? Math.round(values.bookValueAtLease * 1000000) : undefined,
        appraisedValueAtLease: values.appraisedValueAtLease ? Math.round(values.appraisedValueAtLease * 1000000) : undefined,
        serialNo: values.serialNo,
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

  const columns: ColumnsType<AssetItem> = [
    {
      title: '资产编码',
      dataIndex: 'assetCodeSnapshot',
      key: 'assetCodeSnapshot',
      width: 120
    },
    {
      title: '资产名称',
      dataIndex: 'assetNameSnapshot',
      key: 'assetNameSnapshot'
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 60
    },
    {
      title: '账面价值',
      dataIndex: 'bookValueAtLease',
      key: 'bookValueAtLease',
      width: 140,
      render: (val) => val ? <AmountDisplay value={val} /> : '-'
    },
    {
      title: '评估价值',
      dataIndex: 'appraisedValueAtLease',
      key: 'appraisedValueAtLease',
      width: 140,
      render: (val) => val ? <AmountDisplay value={val} /> : '-'
    },
    {
      title: '序列号',
      dataIndex: 'serialNo',
      key: 'serialNo',
      ellipsis: true
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
          添加租赁资产
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
        title={editingItem ? '编辑租赁资产' : '添加租赁资产'}
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
          <Form.Item name="assetCodeSnapshot" label="资产编码">
            <Input placeholder="请输入" />
          </Form.Item>

          <Form.Item name="assetNameSnapshot" label="资产名称">
            <Input placeholder="请输入" />
          </Form.Item>

          <Form.Item name="quantity" label="数量">
            <InputNumber style={{ width: '100%' }} min={0} precision={0} placeholder="请输入" />
          </Form.Item>

          <Form.Item name="unit" label="计量单位">
            <Input placeholder="请输入" />
          </Form.Item>

          <Form.Item name="bookValueAtLease" label="签约时账面价值（万元）">
            <InputNumber style={{ width: '100%' }} min={0} precision={6} placeholder="请输入" />
          </Form.Item>

          <Form.Item name="appraisedValueAtLease" label="签约时评估价值（万元）">
            <InputNumber style={{ width: '100%' }} min={0} precision={6} placeholder="请输入" />
          </Form.Item>

          <Form.Item name="serialNo" label="序列号/车架号">
            <Input placeholder="请输入" />
          </Form.Item>

          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入" />
          </Form.Item>

          <Form.Item label="附件">
            <RaxUpload
              bizModule="FinLoanLeasedAsset"
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

export default LeasedAssetForm;
