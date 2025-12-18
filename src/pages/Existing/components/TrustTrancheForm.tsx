import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  App,
  Dropdown,
  Row,
  Col
} from 'antd';
import { PlusOutlined, SettingOutlined, EditOutlined, DeleteOutlined, PaperClipOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type {
  CreateTrustTrancheDto,
  TrustTrancheDto,
  UpdateTrustTrancheDto,
  SysAttachmentDto
} from '@/types/swagger-api';
import { trustTrancheApi } from '@/services/trustTranche';
import DictSelect from '@/components/DictSelect';
import RaxUpload from '@/components/RaxUpload';
import type { UploadedFile } from '@/components/RaxUpload';
import AmountDisplay from '@/components/AmountDisplay';
import AttachmentViewModal from '@/components/AttachmentViewModal';

interface TrancheItem extends CreateTrustTrancheDto {
  _key: string;
  _files?: UploadedFile[];
  _attachments?: SysAttachmentDto[];
  id?: number;
}

interface TrustTrancheFormProps {
  value?: CreateTrustTrancheDto[];
  onChange?: (value: CreateTrustTrancheDto[]) => void;
  isEdit?: boolean;
  loanId?: number;
  readOnly?: boolean;
}

const TrustTrancheForm: React.FC<TrustTrancheFormProps> = ({
  value = [],
  onChange,
  isEdit,
  loanId,
  readOnly = false
}) => {
  const { message } = App.useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<TrancheItem | null>(null);
  const [form] = Form.useForm();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<TrustTrancheDto[]>([]);
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
  const [viewingAttachments, setViewingAttachments] = useState<SysAttachmentDto[]>([]);

  useEffect(() => {
    if (isEdit && loanId) {
      loadData();
    }
  }, [isEdit, loanId]);

  const loadData = async () => {
    if (!loanId) return;
    setLoading(true);
    try {
      const result = await trustTrancheApi.listByLoan(loanId);
      if (result.success) {
        setApiData(result.data || []);
      }
    } catch (error) {
      message.error('加载信托分层数据失败');
    } finally {
      setLoading(false);
    }
  };

  const dataSource: TrancheItem[] = (isEdit && loanId ? apiData : value).map((item: any, index) => ({
    ...item,
    _key: `tranche-${item.id || index}`,
    id: item.id,
    _files: item.fileAttachments?.map((att: any) => ({
      attachmentId: att.attachmentId || att.id,
      filename: att.originalName || '',
      fileSize: att.fileSize
    })),
    _attachments: item.fileAttachments || []
  }));

  const handleViewAttachments = (record: TrancheItem) => {
    setViewingAttachments(record._attachments || []);
    setAttachmentModalVisible(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setFiles([]);
    setModalVisible(true);
  };

  const handleEdit = (record: TrancheItem) => {
    setEditingItem(record);
    setFiles(record._files || []);
    setModalVisible(true);
    // 延迟设置表单值，等待 Modal 渲染完成
    setTimeout(() => {
      form.setFieldsValue({
        ...record,
        subscribeAmount: record.subscribeAmount ? record.subscribeAmount / 1000000 : undefined
      });
    }, 0);
  };

  const handleDelete = async (record: TrancheItem) => {
    if (isEdit && loanId && record.id) {
      try {
        const result = await trustTrancheApi.remove(record.id);
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
      const newData = value.filter((_, index) => `tranche-${index}` !== record._key);
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
          // UpdateTrustTrancheDto doesn't support fileAttachments
          const updateData: UpdateTrustTrancheDto = {
            id: editingItem.id,
            trancheName: values.trancheName,
            trancheLevel: values.trancheLevel,
            paymentRank: values.paymentRank,
            subscribeAmount: values.subscribeAmount ? Math.round(values.subscribeAmount * 1000000) : undefined,
            sharePct: values.sharePct,
            expectedYieldRate: values.expectedYieldRate,
            distributionRule: values.distributionRule,
            remark: values.remark
          };
          const result = await trustTrancheApi.update(updateData);
          if (result.success) {
            message.success('更新成功');
            loadData();
          } else {
            message.error(result.message || '更新失败');
            return;
          }
        } else {
          const createData: CreateTrustTrancheDto = {
            trancheName: values.trancheName,
            trancheLevel: values.trancheLevel,
            paymentRank: values.paymentRank,
            subscribeAmount: values.subscribeAmount ? Math.round(values.subscribeAmount * 1000000) : undefined,
            sharePct: values.sharePct,
            expectedYieldRate: values.expectedYieldRate,
            distributionRule: values.distributionRule,
            remark: values.remark,
            fileAttachments
          };
          const result = await trustTrancheApi.createBatch(loanId, [createData]);
          if (result.success) {
            message.success('添加成功');
            loadData();
          } else {
            message.error(result.message || '添加失败');
            return;
          }
        }
      } else {
        const newItem: CreateTrustTrancheDto = {
          trancheName: values.trancheName,
          trancheLevel: values.trancheLevel,
          paymentRank: values.paymentRank,
          subscribeAmount: values.subscribeAmount ? Math.round(values.subscribeAmount * 1000000) : undefined,
          sharePct: values.sharePct,
          expectedYieldRate: values.expectedYieldRate,
          distributionRule: values.distributionRule,
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
      width: 80,
      align: 'center',
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [];

        if (record._attachments && record._attachments.length > 0) {
          menuItems.push({
            key: 'attachment',
            icon: <PaperClipOutlined />,
            label: '查看附件',
            onClick: () => handleViewAttachments(record)
          });
        }

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
      }
    }
  ];

  return (
    <>
      {!readOnly && (
        <div style={{ marginBottom: 16 }}>
          <Button type="dashed" icon={<PlusOutlined />} onClick={handleAdd}>
            添加信托分层
          </Button>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="_key"
        pagination={false}
        size="small"
        loading={loading}
        locale={{ emptyText: '暂无信托分层数据' }}
      />

      {!readOnly && (
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
          width={720}
        >
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="trancheName" label="分层名称">
                  <Input placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="trancheLevel" label="分层级别">
                  <DictSelect dictCode="trust.tranche.level" placeholder="请选择" allowClear />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="paymentRank" label="清偿顺序">
                  <InputNumber style={{ width: '100%' }} min={1} precision={0} placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="subscribeAmount" label="认购金额（万元）">
                  <InputNumber style={{ width: '100%' }} min={0} precision={6} placeholder="请输入" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="sharePct" label="份额占比(%)">
                  <InputNumber style={{ width: '100%' }} min={0} max={100} precision={2} placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="expectedYieldRate" label="预期收益率(%)">
                  <InputNumber style={{ width: '100%' }} min={0} precision={4} placeholder="请输入" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="distributionRule" label="收益分配规则">
                  <Input.TextArea rows={2} placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="remark" label="备注">
                  <Input.TextArea rows={2} placeholder="请输入" />
                </Form.Item>
              </Col>
            </Row>

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
      )}

      <AttachmentViewModal
        open={attachmentModalVisible}
        onClose={() => {
          setAttachmentModalVisible(false);
          setViewingAttachments([]);
        }}
        attachments={viewingAttachments}
        title="附件列表"
      />
    </>
  );
};

export default TrustTrancheForm;
