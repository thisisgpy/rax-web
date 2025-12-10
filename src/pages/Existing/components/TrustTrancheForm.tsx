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
import type { CreateTrustTrancheDto } from '@/types/swagger-api';
import DictSelect from '@/components/DictSelect';
import RaxUpload from '@/components/RaxUpload';
import type { UploadedFile } from '@/components/RaxUpload';
import AmountDisplay from '@/components/AmountDisplay';

interface TrancheItem extends CreateTrustTrancheDto {
  _key: string;
  _files?: UploadedFile[];
}

interface TrustTrancheFormProps {
  value?: CreateTrustTrancheDto[];
  onChange?: (value: CreateTrustTrancheDto[]) => void;
  isEdit?: boolean;
}

const TrustTrancheForm: React.FC<TrustTrancheFormProps> = ({
  value = [],
  onChange,
  isEdit
}) => {
  const { message } = App.useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<TrancheItem | null>(null);
  const [form] = Form.useForm();
  const [files, setFiles] = useState<UploadedFile[]>([]);

  // 转换数据为带 _key 的格式
  const dataSource: TrancheItem[] = value.map((item, index) => ({
    ...item,
    _key: `tranche-${index}`,
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
  const handleEdit = (record: TrancheItem) => {
    setEditingItem(record);
    form.setFieldsValue({
      ...record,
      subscribeAmount: record.subscribeAmount ? record.subscribeAmount / 1000000 : undefined
    });
    setFiles(record._files || []);
    setModalVisible(true);
  };

  // 删除
  const handleDelete = (record: TrancheItem) => {
    const newData = value.filter((_, index) => `tranche-${index}` !== record._key);
    onChange?.(newData);
  };

  // 提交弹窗
  const handleModalOk = () => {
    form.validateFields().then(values => {
      const newItem: CreateTrustTrancheDto = {
        trancheName: values.trancheName,
        trancheLevel: values.trancheLevel,
        paymentRank: values.paymentRank,
        subscribeAmount: values.subscribeAmount ? Math.round(values.subscribeAmount * 1000000) : undefined,
        sharePct: values.sharePct,
        expectedYieldRate: values.expectedYieldRate,
        distributionRule: values.distributionRule,
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

  const columns: ColumnsType<TrancheItem> = [
    {
      title: '分层名称',
      dataIndex: 'trancheName',
      key: 'trancheName'
    },
    {
      title: '分层级别',
      dataIndex: 'trancheLevel',
      key: 'trancheLevel',
      width: 100
    },
    {
      title: '清偿顺序',
      dataIndex: 'paymentRank',
      key: 'paymentRank',
      width: 80
    },
    {
      title: '认购金额',
      dataIndex: 'subscribeAmount',
      key: 'subscribeAmount',
      width: 140,
      render: (val) => val ? <AmountDisplay value={val} /> : '-'
    },
    {
      title: '份额占比',
      dataIndex: 'sharePct',
      key: 'sharePct',
      width: 100,
      render: (val) => val ? `${val}%` : '-'
    },
    {
      title: '预期收益率',
      dataIndex: 'expectedYieldRate',
      key: 'expectedYieldRate',
      width: 100,
      render: (val) => val ? `${val}%` : '-'
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
          添加信托分层
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
        title={editingItem ? '编辑信托分层' : '添加信托分层'}
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
          <Form.Item name="trancheName" label="分层名称">
            <Input placeholder="请输入" />
          </Form.Item>

          <Form.Item name="trancheLevel" label="分层级别">
            <DictSelect dictCode="trust.tranche.level" placeholder="请选择" allowClear />
          </Form.Item>

          <Form.Item name="paymentRank" label="清偿顺序">
            <InputNumber style={{ width: '100%' }} min={1} precision={0} placeholder="请输入" />
          </Form.Item>

          <Form.Item name="subscribeAmount" label="认购金额（万元）">
            <InputNumber style={{ width: '100%' }} min={0} precision={6} placeholder="请输入" />
          </Form.Item>

          <Form.Item name="sharePct" label="份额占比(%)">
            <InputNumber style={{ width: '100%' }} min={0} max={100} precision={2} placeholder="请输入" />
          </Form.Item>

          <Form.Item name="expectedYieldRate" label="预期收益率(%)">
            <InputNumber style={{ width: '100%' }} min={0} precision={4} placeholder="请输入" />
          </Form.Item>

          <Form.Item name="distributionRule" label="收益分配规则">
            <Input.TextArea rows={2} placeholder="请输入" />
          </Form.Item>

          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入" />
          </Form.Item>

          <Form.Item label="附件">
            <RaxUpload
              bizModule="FinLoanTrustTranche"
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

export default TrustTrancheForm;
