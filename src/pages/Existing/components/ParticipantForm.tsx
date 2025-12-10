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
import type { CreateLoanParticipantDto, FinInstitutionDto } from '@/types/swagger-api';
import InstitutionSelect from '@/components/InstitutionSelect';
import DictSelect from '@/components/DictSelect';
import RaxUpload from '@/components/RaxUpload';
import type { UploadedFile } from '@/components/RaxUpload';
import AmountDisplay from '@/components/AmountDisplay';

interface ParticipantItem extends CreateLoanParticipantDto {
  _key: string;
  _files?: UploadedFile[];
}

interface ParticipantFormProps {
  value?: CreateLoanParticipantDto[];
  onChange?: (value: CreateLoanParticipantDto[]) => void;
  isEdit?: boolean;
}

const ParticipantForm: React.FC<ParticipantFormProps> = ({
  value = [],
  onChange,
  isEdit
}) => {
  const { message } = App.useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ParticipantItem | null>(null);
  const [form] = Form.useForm();
  const [files, setFiles] = useState<UploadedFile[]>([]);

  // 转换数据为带 _key 的格式
  const dataSource: ParticipantItem[] = value.map((item, index) => ({
    ...item,
    _key: `participant-${index}`,
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
  const handleEdit = (record: ParticipantItem) => {
    setEditingItem(record);
    form.setFieldsValue({
      ...record,
      // 承诺额度从分转万元
      commitAmount: record.commitAmount ? record.commitAmount / 1000000 : undefined,
      // 份额比例从小数转百分比
      sharePct: record.sharePct ? record.sharePct * 100 : undefined
    });
    setFiles(record._files || []);
    setModalVisible(true);
  };

  // 删除
  const handleDelete = (record: ParticipantItem) => {
    const newData = value.filter((_, index) => `participant-${index}` !== record._key);
    onChange?.(newData);
  };

  // 处理机构选择
  const handleInstitutionChange = (institutionId?: number, institution?: FinInstitutionDto) => {
    if (institution) {
      form.setFieldsValue({
        institutionId: institution.id,
        institutionName: institution.name + (institution.branchName ? ` - ${institution.branchName}` : '')
      });
    }
  };

  // 提交弹窗
  const handleModalOk = () => {
    form.validateFields().then(values => {
      const newItem: CreateLoanParticipantDto = {
        role: values.role,
        institutionId: values.institutionId,
        institutionName: values.institutionName,
        // 承诺额度从万元转分
        commitAmount: values.commitAmount ? Math.round(values.commitAmount * 1000000) : undefined,
        // 份额比例从百分比转小数
        sharePct: values.sharePct ? values.sharePct / 100 : undefined,
        remark: values.remark,
        fileAttachments: files.map(f => ({
          attachmentId: f.attachmentId,
          fileSize: f.fileSize
        }))
      };

      if (editingItem) {
        // 编辑模式
        const index = dataSource.findIndex(d => d._key === editingItem._key);
        const newData = [...value];
        newData[index] = newItem;
        onChange?.(newData);
      } else {
        // 新增模式
        onChange?.([...value, newItem]);
      }

      setModalVisible(false);
      form.resetFields();
      setFiles([]);
      setEditingItem(null);
    });
  };

  const columns: ColumnsType<ParticipantItem> = [
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120
    },
    {
      title: '机构名称',
      dataIndex: 'institutionName',
      key: 'institutionName'
    },
    {
      title: '承诺额度',
      dataIndex: 'commitAmount',
      key: 'commitAmount',
      width: 150,
      render: (val) => val ? <AmountDisplay value={val} /> : '-'
    },
    {
      title: '份额比例',
      dataIndex: 'sharePct',
      key: 'sharePct',
      width: 100,
      render: (val) => val ? `${(val * 100).toFixed(2)}%` : '-'
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
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
          添加银团参与行
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
        title={editingItem ? '编辑银团参与行' : '添加银团参与行'}
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
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <DictSelect
              dictCode="participant.role"
              placeholder="请选择角色"
            />
          </Form.Item>

          <Form.Item
            name="institutionId"
            label="金融机构"
            rules={[{ required: true, message: '请选择金融机构' }]}
          >
            <InstitutionSelect
              placeholder="请选择金融机构"
              onChange={handleInstitutionChange}
            />
          </Form.Item>
          <Form.Item name="institutionName" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="commitAmount"
            label="承诺额度（万元）"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入承诺额度"
              min={0}
              precision={6}
            />
          </Form.Item>

          <Form.Item
            name="sharePct"
            label="份额比例（%）"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入份额比例"
              min={0}
              max={100}
              precision={2}
            />
          </Form.Item>

          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>

          <Form.Item label="附件">
            <RaxUpload
              bizModule="FinLoanParticipant"
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

export default ParticipantForm;
