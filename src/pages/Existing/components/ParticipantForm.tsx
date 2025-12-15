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
  CreateLoanParticipantDto,
  FinLoanParticipantDto,
  UpdateLoanParticipantDto,
  FinInstitutionDto,
  AttachmentOperationDto
} from '@/types/swagger-api';
import { participantApi } from '@/services/participant';
import InstitutionSelect from '@/components/InstitutionSelect';
import DictSelect from '@/components/DictSelect';
import RaxUpload from '@/components/RaxUpload';
import type { UploadedFile } from '@/components/RaxUpload';
import AmountDisplay from '@/components/AmountDisplay';

interface ParticipantItem extends CreateLoanParticipantDto {
  _key: string;
  _files?: UploadedFile[];
  id?: number;  // 编辑模式下的数据库ID
}

interface ParticipantFormProps {
  value?: CreateLoanParticipantDto[];
  onChange?: (value: CreateLoanParticipantDto[]) => void;
  isEdit?: boolean;
  loanId?: number;  // 编辑模式下传入loanId，用于独立CRUD
}

const ParticipantForm: React.FC<ParticipantFormProps> = ({
  value = [],
  onChange,
  isEdit,
  loanId
}) => {
  const { message } = App.useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ParticipantItem | null>(null);
  const [form] = Form.useForm();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<FinLoanParticipantDto[]>([]);

  // 编辑模式下，从API加载数据
  useEffect(() => {
    if (isEdit && loanId) {
      loadData();
    }
  }, [isEdit, loanId]);

  const loadData = async () => {
    if (!loanId) return;
    setLoading(true);
    try {
      const result = await participantApi.listByLoan(loanId);
      if (result.success) {
        setApiData(result.data || []);
      }
    } catch (error) {
      message.error('加载银团参与行数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 转换数据为带 _key 的格式
  // 编辑模式使用API数据，创建模式使用本地value
  const dataSource: ParticipantItem[] = (isEdit && loanId ? apiData : value).map((item: any, index) => ({
    ...item,
    _key: `participant-${item.id || index}`,
    id: item.id,
    _files: item.fileAttachments?.map((att: any) => ({
      attachmentId: att.attachmentId || att.id,
      filename: att.originalName || '',
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
  const handleDelete = async (record: ParticipantItem) => {
    if (isEdit && loanId && record.id) {
      // 编辑模式：调用API删除
      try {
        const result = await participantApi.remove(record.id);
        if (result.success) {
          message.success('删除成功');
          loadData(); // 重新加载数据
        } else {
          message.error(result.message || '删除失败');
        }
      } catch (error) {
        message.error('删除失败');
      }
    } else {
      // 创建模式：更新本地状态
      const newData = value.filter((_, index) => `participant-${index}` !== record._key);
      onChange?.(newData);
    }
  };

  // 处理机构选择
  const handleInstitutionChange = (_institutionId?: number, institution?: FinInstitutionDto) => {
    if (institution) {
      form.setFieldsValue({
        institutionId: institution.id,
        institutionName: institution.branchName || institution.name
      });
    }
  };

  // 提交弹窗
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (isEdit && loanId) {
        // 编辑模式：调用API
        if (editingItem?.id) {
          // 更新已有记录 - 计算附件操作
          const originalFileIds = new Set((editingItem._files || []).map(f => f.attachmentId));
          const currentFileIds = new Set(files.map(f => f.attachmentId));
          const attachmentOperations: AttachmentOperationDto[] = [];

          // 新增和保留的附件
          files.forEach(f => {
            attachmentOperations.push({
              attachmentId: f.attachmentId,
              fileSize: f.fileSize,
              operation: originalFileIds.has(f.attachmentId) ? 'KEEP' : 'ADD'
            });
          });
          // 删除的附件
          (editingItem._files || []).forEach(f => {
            if (!currentFileIds.has(f.attachmentId)) {
              attachmentOperations.push({ attachmentId: f.attachmentId, fileSize: f.fileSize, operation: 'DELETE' });
            }
          });

          const updateData: UpdateLoanParticipantDto = {
            id: editingItem.id,
            role: values.role,
            institutionId: values.institutionId,
            institutionName: values.institutionName,
            commitAmount: values.commitAmount ? Math.round(values.commitAmount * 1000000) : undefined,
            sharePct: values.sharePct ? values.sharePct / 100 : undefined,
            remark: values.remark,
            attachmentOperations
          };
          const result = await participantApi.update(updateData);
          if (result.success) {
            message.success('更新成功');
            loadData();
          } else {
            message.error(result.message || '更新失败');
            return;
          }
        } else {
          // 新增记录
          const createData: CreateLoanParticipantDto = {
            role: values.role,
            institutionId: values.institutionId,
            institutionName: values.institutionName,
            commitAmount: values.commitAmount ? Math.round(values.commitAmount * 1000000) : undefined,
            sharePct: values.sharePct ? values.sharePct / 100 : undefined,
            remark: values.remark,
            fileAttachments: files.map(f => ({ attachmentId: f.attachmentId, fileSize: f.fileSize, operation: 'ADD' as const }))
          };
          const result = await participantApi.createBatch(loanId, [createData]);
          if (result.success) {
            message.success('添加成功');
            loadData();
          } else {
            message.error(result.message || '添加失败');
            return;
          }
        }
      } else {
        // 创建模式：更新本地状态
        const newItem: CreateLoanParticipantDto = {
          role: values.role,
          institutionId: values.institutionId,
          institutionName: values.institutionName,
          commitAmount: values.commitAmount ? Math.round(values.commitAmount * 1000000) : undefined,
          sharePct: values.sharePct ? values.sharePct / 100 : undefined,
          remark: values.remark,
          fileAttachments: files.map(f => ({ attachmentId: f.attachmentId, fileSize: f.fileSize, operation: 'ADD' as const }))
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
          添加银团参与行
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
