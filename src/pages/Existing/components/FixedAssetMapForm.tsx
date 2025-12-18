import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Space,
  Row,
  Col,
  Divider,
  App,
  Dropdown,
  Descriptions
} from 'antd';
import { PlusOutlined, SearchOutlined, SettingOutlined, EditOutlined, DeleteOutlined, PaperClipOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type {
  CreateFixedAssetMapDto,
  FixedAssetMapDto,
  UpdateFixedAssetMapDto,
  FixedAssetDto,
  SysAttachmentDto,
  AttachmentOperationDto
} from '@/types/swagger-api';
import { fixedAssetMapApi } from '@/services/fixedAssetMap';
import { assetApi } from '@/services/asset';
import OrgSelect from '@/components/OrgSelect';
import AmountDisplay from '@/components/AmountDisplay';
import RaxUpload from '@/components/RaxUpload';
import type { UploadedFile } from '@/components/RaxUpload';
import AttachmentViewModal from '@/components/AttachmentViewModal';

interface FixedAssetMapItem extends CreateFixedAssetMapDto {
  _key: string;
  id?: number;
  // 快照信息（来自API或选择的资产）
  assetCodeSnapshot?: string;
  assetNameSnapshot?: string;
  // 当前资产信息
  assetCode?: string;
  assetName?: string;
  assetCategoryName?: string;
  assetAddress?: string;
  assetBookValue?: number;
  assetOrgName?: string;
  assetOrgNameAbbr?: string;
  // 附件
  _files?: UploadedFile[];
  _attachments?: SysAttachmentDto[];
}

interface FixedAssetMapFormProps {
  value?: CreateFixedAssetMapDto[];
  onChange?: (value: CreateFixedAssetMapDto[]) => void;
  isEdit?: boolean;
  loanId?: number;
  readOnly?: boolean;
}

const FixedAssetMapForm: React.FC<FixedAssetMapFormProps> = ({
  value = [],
  onChange,
  isEdit,
  loanId,
  readOnly = false
}) => {
  const { message } = App.useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<FixedAssetMapItem | null>(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<FixedAssetMapDto[]>([]);
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
  const [viewingAttachments, setViewingAttachments] = useState<SysAttachmentDto[]>([]);

  // 未关联资产相关状态
  const [unlinkedAssets, setUnlinkedAssets] = useState<FixedAssetDto[]>([]);
  const [unlinkedLoading, setUnlinkedLoading] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number | undefined>(undefined);
  const [unlinkedPagination, setUnlinkedPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // 原始附件（用于编辑时计算差异）
  const [originalFiles, setOriginalFiles] = useState<UploadedFile[]>([]);

  useEffect(() => {
    if (isEdit && loanId) {
      loadData();
    }
  }, [isEdit, loanId]);

  const loadData = async () => {
    if (!loanId) return;
    setLoading(true);
    try {
      const result = await fixedAssetMapApi.listByLoan(loanId);
      if (result.success) {
        setApiData(result.data || []);
      }
    } catch (error) {
      message.error('加载固定资产关联数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载未关联的固定资产列表
  const loadUnlinkedAssets = async (page = 1, pageSize = 10, searchValues?: any) => {
    setUnlinkedLoading(true);
    try {
      const result = await assetApi.pageUnlinked({
        pageNo: page,
        pageSize,
        ...searchValues
      });
      if (result.success && result.data) {
        setUnlinkedAssets(result.data.rows || []);
        setUnlinkedPagination({
          current: result.data.pageNo || page,
          pageSize: result.data.pageSize || pageSize,
          total: result.data.totalCount || 0
        });
      }
    } catch (error) {
      message.error('加载可用固定资产失败');
    } finally {
      setUnlinkedLoading(false);
    }
  };

  // 转换数据为表格数据源
  const dataSource: FixedAssetMapItem[] = (isEdit && loanId ? apiData : value).map((item: any, index) => {
    if (isEdit && loanId) {
      // API 数据
      return {
        _key: `asset-${item.id || index}`,
        id: item.id,
        fixedAssetId: item.fixedAssetId,
        bookValueAtPledge: item.bookValueAtPledge,
        appraisedValue: item.appraisedValue,
        pledgeRate: item.pledgeRate,
        pledgeRegNo: item.pledgeRegNo,
        pledgeRegDate: item.pledgeRegDate,
        pledgee: item.pledgee,
        remark: item.remark,
        assetCodeSnapshot: item.assetCodeSnapshot,
        assetNameSnapshot: item.assetNameSnapshot,
        assetCode: item.assetCode,
        assetName: item.assetName,
        assetCategoryName: item.assetCategoryName,
        assetAddress: item.assetAddress,
        assetBookValue: item.assetBookValue,
        assetOrgName: item.assetOrgName,
        assetOrgNameAbbr: item.assetOrgNameAbbr,
        _files: item.fileAttachments?.map((att: any) => ({
          attachmentId: att.id || att.attachmentId,
          filename: att.originalName || att.filename,
          fileSize: att.fileSize
        })),
        _attachments: item.fileAttachments || []
      };
    } else {
      // 本地数据
      return {
        ...item,
        _key: `asset-${index}`,
        _attachments: item.fileAttachments || []
      };
    }
  });

  const handleViewAttachments = (record: FixedAssetMapItem) => {
    setViewingAttachments(record._attachments || []);
    setAttachmentModalVisible(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    searchForm.resetFields();
    setFiles([]);
    setOriginalFiles([]);
    setSelectedAssetId(undefined);
    setModalVisible(true);
    // 打开弹窗时加载未关联的固定资产
    loadUnlinkedAssets(1, 10);
  };

  const handleEdit = (record: FixedAssetMapItem) => {
    setEditingItem(record);
    const recordFiles = record._files || [];
    setFiles(recordFiles);
    setOriginalFiles(recordFiles);
    setModalVisible(true);
    // 延迟设置表单值，等待 Modal 渲染完成
    setTimeout(() => {
      form.setFieldsValue({
        bookValueAtPledge: record.bookValueAtPledge ? record.bookValueAtPledge / 1000000 : undefined,
        appraisedValue: record.appraisedValue ? record.appraisedValue / 1000000 : undefined,
        pledgeRate: record.pledgeRate,
        pledgeRegNo: record.pledgeRegNo,
        pledgeRegDate: record.pledgeRegDate ? dayjs(record.pledgeRegDate) : undefined,
        pledgee: record.pledgee,
        remark: record.remark
      });
    }, 0);
  };

  const handleDelete = async (record: FixedAssetMapItem) => {
    if (isEdit && loanId && record.id) {
      try {
        const result = await fixedAssetMapApi.remove(record.id);
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

  // 搜索未关联资产
  const handleSearch = () => {
    const searchValues = searchForm.getFieldsValue();
    loadUnlinkedAssets(1, unlinkedPagination.pageSize, searchValues);
  };

  // 重置搜索
  const handleResetSearch = () => {
    searchForm.resetFields();
    loadUnlinkedAssets(1, unlinkedPagination.pageSize);
  };

  // 处理选择已有资产的确认
  const handleSelectExistingOk = async () => {
    if (!selectedAssetId) {
      message.warning('请选择一个固定资产');
      return;
    }

    try {
      const mapValues = await form.validateFields([
        'bookValueAtPledge', 'appraisedValue', 'pledgeRate',
        'pledgeRegNo', 'pledgeRegDate', 'pledgee', 'remark'
      ]);

      const fileAttachments = files.map(f => ({
        attachmentId: f.attachmentId,
        fileSize: f.fileSize,
        operation: 'ADD' as const
      }));

      const mapData = {
        bookValueAtPledge: mapValues.bookValueAtPledge ? Math.round(mapValues.bookValueAtPledge * 1000000) : undefined,
        appraisedValue: mapValues.appraisedValue ? Math.round(mapValues.appraisedValue * 1000000) : undefined,
        pledgeRate: mapValues.pledgeRate,
        pledgeRegNo: mapValues.pledgeRegNo,
        pledgeRegDate: mapValues.pledgeRegDate?.format('YYYY-MM-DD'),
        pledgee: mapValues.pledgee,
        remark: mapValues.remark,
        fileAttachments
      };

      if (isEdit && loanId) {
        // 编辑模式：调用 API 添加
        const createData: CreateFixedAssetMapDto = {
          fixedAssetId: selectedAssetId,
          ...mapData
        };
        const result = await fixedAssetMapApi.create(loanId, createData);
        if (result.success) {
          message.success('添加成功');
          loadData();
        } else {
          message.error(result.message || '添加失败');
          return;
        }
      } else {
        // 新增模式：添加到本地状态
        const selectedAsset = unlinkedAssets.find(asset => asset.id === selectedAssetId);
        if (selectedAsset) {
          const newItem: CreateFixedAssetMapDto = {
            fixedAssetId: selectedAsset.id!,
            // 保存选中的资产信息用于显示
            _selectedAsset: selectedAsset,
            ...mapData
          } as any;
          onChange?.([...value, newItem]);
        }
      }

      setModalVisible(false);
      form.resetFields();
      setFiles([]);
      setOriginalFiles([]);
      setSelectedAssetId(undefined);
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error('操作失败');
      }
    }
  };

  // 处理编辑确认
  const handleEditOk = async () => {
    try {
      const values = await form.validateFields();

      const mapData = {
        bookValueAtPledge: values.bookValueAtPledge ? Math.round(values.bookValueAtPledge * 1000000) : undefined,
        appraisedValue: values.appraisedValue ? Math.round(values.appraisedValue * 1000000) : undefined,
        pledgeRate: values.pledgeRate,
        pledgeRegNo: values.pledgeRegNo,
        pledgeRegDate: values.pledgeRegDate?.format('YYYY-MM-DD'),
        pledgee: values.pledgee,
        remark: values.remark
      };

      if (isEdit && loanId && editingItem?.id) {
        // 编辑模式：更新关联（包含附件操作）
        const originalFileIds = new Set(originalFiles.map(f => f.attachmentId));
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
        originalFiles.forEach(f => {
          if (!currentFileIds.has(f.attachmentId)) {
            attachmentOperations.push({
              attachmentId: f.attachmentId,
              fileSize: f.fileSize,
              operation: 'DELETE'
            });
          }
        });

        const updateData: UpdateFixedAssetMapDto = {
          id: editingItem.id,
          ...mapData,
          attachmentOperations
        };
        const result = await fixedAssetMapApi.update(updateData);
        if (result.success) {
          message.success('更新成功');
          loadData();
        } else {
          message.error(result.message || '更新失败');
          return;
        }
      } else if (editingItem) {
        // 本地模式：更新本地数据
        const fileAttachments = files.map(f => ({
          attachmentId: f.attachmentId,
          fileSize: f.fileSize,
          operation: 'ADD' as const
        }));

        const index = dataSource.findIndex(d => d._key === editingItem._key);
        const newData = [...value];
        newData[index] = {
          ...newData[index],
          ...mapData,
          fileAttachments
        };
        onChange?.(newData);
      }

      setModalVisible(false);
      form.resetFields();
      setFiles([]);
      setOriginalFiles([]);
      setEditingItem(null);
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error('操作失败');
      }
    }
  };

  const handleModalOk = () => {
    if (editingItem) {
      handleEditOk();
    } else {
      handleSelectExistingOk();
    }
  };

  // 未关联资产表格列
  const unlinkedColumns: ColumnsType<FixedAssetDto> = [
    { title: '资产编码', dataIndex: 'code', key: 'code', width: 120 },
    { title: '资产名称', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: '资产分类', dataIndex: 'categoryName', key: 'categoryName', width: 100 },
    { title: '所属组织', dataIndex: 'orgNameAbbr', key: 'orgNameAbbr', width: 100 },
    {
      title: '账面价值',
      dataIndex: 'bookValue',
      key: 'bookValue',
      width: 120,
      render: (val) => val ? <AmountDisplay value={val} /> : '-'
    },
    { title: '地址', dataIndex: 'address', key: 'address', ellipsis: true }
  ];

  // 主表格列定义
  const columns: ColumnsType<FixedAssetMapItem> = [
    {
      title: '资产编码',
      key: 'assetCode',
      width: 120,
      render: (_, record) => record.assetCodeSnapshot || record.assetCode || (record as any)._selectedAsset?.code || '-'
    },
    {
      title: '资产名称',
      key: 'assetName',
      ellipsis: true,
      render: (_, record) => record.assetNameSnapshot || record.assetName || (record as any)._selectedAsset?.name || '-'
    },
    {
      title: '所属组织',
      key: 'assetOrgNameAbbr',
      width: 100,
      render: (_, record) => record.assetOrgNameAbbr || (record as any)._selectedAsset?.orgNameAbbr || '-'
    },
    {
      title: '质押时账面价值',
      dataIndex: 'bookValueAtPledge',
      key: 'bookValueAtPledge',
      width: 140,
      render: (value: number) => value ? <AmountDisplay value={value} /> : '-'
    },
    {
      title: '评估价值',
      dataIndex: 'appraisedValue',
      key: 'appraisedValue',
      width: 120,
      render: (value: number) => value ? <AmountDisplay value={value} /> : '-'
    },
    {
      title: '质押率',
      dataIndex: 'pledgeRate',
      key: 'pledgeRate',
      width: 80,
      render: (value: number) => value ? `${value}%` : '-'
    },
    {
      title: '质押登记号',
      dataIndex: 'pledgeRegNo',
      key: 'pledgeRegNo',
      width: 120,
      render: (value) => value || '-'
    },
    {
      title: '质权人',
      dataIndex: 'pledgee',
      key: 'pledgee',
      width: 100,
      render: (value) => value || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
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

  // 渲染选择资产的内容
  const renderSelectAssetContent = () => (
    <>
      {/* 搜索表单 */}
      <Form form={searchForm} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="name" label="资产名称">
          <Input placeholder="请输入" style={{ width: 140 }} allowClear />
        </Form.Item>
        <Form.Item name="code" label="资产编码">
          <Input placeholder="请输入" style={{ width: 120 }} allowClear />
        </Form.Item>
        <Form.Item name="orgId" label="所属组织">
          <OrgSelect placeholder="请选择" style={{ width: 160 }} allowClear />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button onClick={handleResetSearch}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 资产列表 */}
      <Table
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectedAssetId ? [selectedAssetId] : [],
          onChange: (selectedRowKeys) => {
            const assetId = selectedRowKeys[0] as number | undefined;
            setSelectedAssetId(assetId);
            // 选中时自动填充质押时账面价值
            if (assetId) {
              const selectedAsset = unlinkedAssets.find(asset => asset.id === assetId);
              if (selectedAsset?.bookValue) {
                form.setFieldsValue({
                  bookValueAtPledge: selectedAsset.bookValue / 1000000
                });
              }
            }
          }
        }}
        columns={unlinkedColumns}
        dataSource={unlinkedAssets}
        rowKey="id"
        size="small"
        loading={unlinkedLoading}
        pagination={{
          ...unlinkedPagination,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => {
            const searchValues = searchForm.getFieldsValue();
            loadUnlinkedAssets(page, pageSize, searchValues);
          }
        }}
        scroll={{ y: 300 }}
      />

      {/* 选中后显示质押关联信息表单 */}
      {selectedAssetId && (
        <>
          <Divider orientation="left" style={{ fontSize: 14 }}>
            质押关联信息
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="bookValueAtPledge" label="质押时账面价值（万元）">
                <InputNumber style={{ width: '100%' }} min={0} precision={6} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="appraisedValue" label="评估/认可价值（万元）">
                <InputNumber style={{ width: '100%' }} min={0} precision={6} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="pledgeRate" label="质押率(%)">
                <InputNumber style={{ width: '100%' }} min={0} max={100} precision={2} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="pledgeRegNo" label="质押登记号">
                <Input placeholder="请输入" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="pledgeRegDate" label="质押登记日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="pledgee" label="质权人">
                <Input placeholder="请输入" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="remark" label="备注">
                <Input.TextArea rows={2} placeholder="请输入" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="附件">
                <RaxUpload
                  bizModule="FinLoanFixedAssetMap"
                  value={files}
                  onChange={setFiles}
                  maxCount={5}
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}
    </>
  );

  // 渲染编辑关联的内容
  const renderEditContent = () => (
    <>
      {/* 资产信息只读展示 */}
      <Divider orientation="left" style={{ fontSize: 14, marginTop: 0 }}>资产信息</Divider>
      <Descriptions
        bordered
        size="small"
        column={3}
        style={{ marginBottom: 16 }}
        styles={{ label: { background: '#fafafa', width: 120 } }}
      >
        <Descriptions.Item label="资产编码">
          {editingItem?.assetCodeSnapshot || editingItem?.assetCode || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="资产名称">
          {editingItem?.assetNameSnapshot || editingItem?.assetName || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="资产分类">
          {editingItem?.assetCategoryName || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="所属组织">
          {editingItem?.assetOrgName || editingItem?.assetOrgNameAbbr || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="当前账面价值">
          {editingItem?.assetBookValue ? <AmountDisplay value={editingItem.assetBookValue} /> : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="地址">
          {editingItem?.assetAddress || '-'}
        </Descriptions.Item>
      </Descriptions>

      {/* 关联信息可编辑 */}
      <Divider orientation="left" style={{ fontSize: 14 }}>质押关联信息</Divider>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="bookValueAtPledge" label="质押时账面价值（万元）">
            <InputNumber style={{ width: '100%' }} min={0} precision={6} disabled />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="appraisedValue" label="评估/认可价值（万元）">
            <InputNumber style={{ width: '100%' }} min={0} precision={6} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="pledgeRate" label="质押率(%)">
            <InputNumber style={{ width: '100%' }} min={0} max={100} precision={2} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="pledgeRegNo" label="质押登记号">
            <Input placeholder="请输入" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="pledgeRegDate" label="质押登记日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="pledgee" label="质权人">
            <Input placeholder="请输入" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={16}>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item label="附件" style={{ marginBottom: 0 }}>
            <RaxUpload
              bizModule="FinLoanFixedAssetMap"
              value={files}
              onChange={setFiles}
              maxCount={10}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  return (
    <>
      {!readOnly && (
        <div style={{ marginBottom: 16 }}>
          <Button type="dashed" icon={<PlusOutlined />} onClick={handleAdd}>
            添加固定资产
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
        scroll={{ x: 1200 }}
        locale={{ emptyText: '暂无固定资产关联数据' }}
      />

      {!readOnly && (
        <Modal
          title={editingItem ? '编辑固定资产关联' : '添加固定资产'}
          open={modalVisible}
          onOk={handleModalOk}
          okText="确定"
          onCancel={() => {
            setModalVisible(false);
            setFiles([]);
            setOriginalFiles([]);
            setEditingItem(null);
            setSelectedAssetId(undefined);
          }}
          width={960}
          destroyOnHidden
        >
          <Form form={form} layout="vertical">
            {editingItem ? renderEditContent() : renderSelectAssetContent()}
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

export default FixedAssetMapForm;
