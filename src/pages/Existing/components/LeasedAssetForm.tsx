import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  App,
  Popconfirm
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type {
  CreateLeasedAssetDto,
  LeasedAssetDto,
  UpdateLeasedAssetDto
} from '@/types/swagger-api';
import { leasedAssetApi } from '@/services/leasedAsset';
import RaxUpload from '@/components/RaxUpload';
import type { UploadedFile } from '@/components/RaxUpload';
import AmountDisplay from '@/components/AmountDisplay';

interface AssetItem extends CreateLeasedAssetDto {
  _key: string;
  _files?: UploadedFile[];
  id?: number;
}

interface LeasedAssetFormProps {
  value?: CreateLeasedAssetDto[];
  onChange?: (value: CreateLeasedAssetDto[]) => void;
  isEdit?: boolean;
  loanId?: number;
}

const LeasedAssetForm: React.FC<LeasedAssetFormProps> = ({
  value = [],
  onChange,
  isEdit,
  loanId
}) => {
  const { message } = App.useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<AssetItem | null>(null);
  const [form] = Form.useForm();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<LeasedAssetDto[]>([]);

  useEffect(() => {
    if (isEdit && loanId) {
      loadData();
    }
  }, [isEdit, loanId]);

  const loadData = async () => {
    if (!loanId) return;
    setLoading(true);
    try {
      const result = await leasedAssetApi.listByLoan(loanId);
      if (result.success) {
        setApiData(result.data || []);
      }
    } catch (error) {
      message.error('加载租赁资产数据失败');
    } finally {
      setLoading(false);
    }
  };

  const dataSource: AssetItem[] = (isEdit && loanId ? apiData : value).map((item: any, index) => ({
    ...item,
    _key: `asset-${item.id || index}`,
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

  const handleDelete = async (record: AssetItem) => {
    if (isEdit && loanId && record.id) {
      try {
        const result = await leasedAssetApi.remove(record.id);
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
      const newData = value.filter((_, index) => `asset-${index}` !== record._key);
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
          // UpdateLeasedAssetDto doesn't support fileAttachments
          const updateData: UpdateLeasedAssetDto = {
            id: editingItem.id,
            assetId: values.assetId,
            assetCodeSnapshot: values.assetCodeSnapshot,
            assetNameSnapshot: values.assetNameSnapshot,
            quantity: values.quantity,
            unit: values.unit,
            bookValueAtLease: values.bookValueAtLease ? Math.round(values.bookValueAtLease * 1000000) : undefined,
            appraisedValueAtLease: values.appraisedValueAtLease ? Math.round(values.appraisedValueAtLease * 1000000) : undefined,
            serialNo: values.serialNo,
            remark: values.remark
          };
          const result = await leasedAssetApi.update(updateData);
          if (result.success) {
            message.success('更新成功');
            loadData();
          } else {
            message.error(result.message || '更新失败');
            return;
          }
        } else {
          const createData: CreateLeasedAssetDto = {
            assetId: values.assetId,
            assetCodeSnapshot: values.assetCodeSnapshot,
            assetNameSnapshot: values.assetNameSnapshot,
            quantity: values.quantity,
            unit: values.unit,
            bookValueAtLease: values.bookValueAtLease ? Math.round(values.bookValueAtLease * 1000000) : undefined,
            appraisedValueAtLease: values.appraisedValueAtLease ? Math.round(values.appraisedValueAtLease * 1000000) : undefined,
            serialNo: values.serialNo,
            remark: values.remark,
            fileAttachments
          };
          const result = await leasedAssetApi.createBatch(loanId, [createData]);
          if (result.success) {
            message.success('添加成功');
            loadData();
          } else {
            message.error(result.message || '添加失败');
            return;
          }
        }
      } else {
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
          添加租赁资产
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
