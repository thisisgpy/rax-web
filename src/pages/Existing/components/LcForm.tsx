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
  Row,
  Col,
  Divider,
  App,
  Dropdown,
  Descriptions,
  Tag,
  Tabs
} from 'antd';
import { PlusOutlined, SettingOutlined, EditOutlined, DeleteOutlined, SearchOutlined, PaperClipOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type {
  CreateLoanLcMapDto,
  CreateLoanLcDto,
  LoanLcWithMapDto,
  UpdateLoanLcMapDto,
  LoanLcDto,
  SysAttachmentDto
} from '@/types/swagger-api';
import AttachmentViewModal from '@/components/AttachmentViewModal';
import { lcApi } from '@/services/lc';
import InstitutionSelect from '@/components/InstitutionSelect';
import DictSelect from '@/components/DictSelect';
import AmountDisplay from '@/components/AmountDisplay';
import RaxUpload from '@/components/RaxUpload';
import type { UploadedFile } from '@/components/RaxUpload';

// 扩展 CreateLoanLcDto 添加从 API 返回的额外字段
interface LcInfo extends CreateLoanLcDto {
  issuingBankName?: string;  // 开证行名称（从API返回时有值）
}

interface LcMapItem extends Omit<CreateLoanLcMapDto, 'newLc'> {
  _key: string;
  mapId?: number;
  lcId?: number;
  newLc?: LcInfo;
  _attachments?: SysAttachmentDto[];
}

interface LcFormProps {
  value?: CreateLoanLcMapDto[];
  onChange?: (value: CreateLoanLcMapDto[]) => void;
  isEdit?: boolean;
  loanId?: number;
  readOnly?: boolean;
}

const LcForm: React.FC<LcFormProps> = ({
  value = [],
  onChange,
  isEdit,
  loanId,
  readOnly = false
}) => {
  const { message } = App.useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<LcMapItem | null>(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<LoanLcWithMapDto[]>([]);

  // Tab 切换相关状态
  const [activeTab, setActiveTab] = useState<string>('select');
  const [unlinkedLcs, setUnlinkedLcs] = useState<LoanLcDto[]>([]);
  const [unlinkedLoading, setUnlinkedLoading] = useState(false);
  const [selectedLcIds, setSelectedLcIds] = useState<number[]>([]);
  const [unlinkedPagination, setUnlinkedPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // 附件状态（用于创建新信用证时）
  const [lcAttachments, setLcAttachments] = useState<UploadedFile[]>([]);

  // 附件查看相关状态
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
      const result = await lcApi.listByLoanId(loanId);
      if (result.success) {
        setApiData(result.data || []);
      }
    } catch (error) {
      message.error('加载信用证数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载未关联的信用证列表
  const loadUnlinkedLcs = async (page = 1, pageSize = 10, searchValues?: any) => {
    setUnlinkedLoading(true);
    try {
      const result = await lcApi.pageUnlinked({
        pageNo: page,
        pageSize,
        ...searchValues
      });
      if (result.success && result.data) {
        setUnlinkedLcs(result.data.rows || []);
        setUnlinkedPagination({
          current: result.data.pageNo || page,
          pageSize: result.data.pageSize || pageSize,
          total: result.data.totalCount || 0
        });
      }
    } catch (error) {
      message.error('加载可用信用证失败');
    } finally {
      setUnlinkedLoading(false);
    }
  };

  // 查看附件
  const handleViewAttachments = (record: LcMapItem) => {
    setViewingAttachments(record._attachments || []);
    setAttachmentModalVisible(true);
  };

  // Convert API data or local value to table data source
  const dataSource: LcMapItem[] = (isEdit && loanId ? apiData : value).map((item: any, index) => {
    // 判断是否是 API 返回的 LoanLcWithMapDto 格式（lcNo 在顶层）
    const isApiFormat = 'lcNo' in item && !('newLc' in item);

    if (isEdit && loanId || isApiFormat) {
      // API data from LoanLcWithMapDto (编辑模式或 readOnly 模式下传入的详情数据)
      return {
        _key: `lc-${item.mapId || index}`,
        mapId: item.mapId,
        lcId: item.lcId,
        securedValue: item.securedValue,
        marginLockedAmount: item.marginLockedAmount,
        allocationNote: item.allocationNote,
        status: item.mapStatus,
        remark: item.mapRemark,
        _attachments: item.attachments || [],
        newLc: {
          lcNo: item.lcNo,
          lcType: item.lcType,
          issuingBankId: item.issuingBankId,
          issuingBankName: item.issuingBankName,
          advisingBankId: item.advisingBankId,
          confirmFlag: item.confirmFlag,
          applicant: item.applicant,
          beneficiary: item.beneficiary,
          currency: item.currency,
          lcAmount: item.lcAmount,
          tolerancePct: item.tolerancePct,
          issueDate: item.issueDate,
          expiryDate: item.expiryDate,
          placeOfExpiry: item.placeOfExpiry,
          availableBy: item.availableBy,
          presentationDays: item.presentationDays,
          shipmentFrom: item.shipmentFrom,
          shipmentTo: item.shipmentTo,
          latestShipment: item.latestShipment,
          partialShipmentAllowed: item.partialShipmentAllowed,
          transshipmentAllowed: item.transshipmentAllowed,
          marginRatio: item.marginRatio,
          marginAmount: item.marginAmount,
          commissionRate: item.commissionRate,
          advisingChargeBorneBy: item.advisingChargeBorneBy,
          ucpVersion: item.ucpVersion,
          status: item.lcStatus,
          remark: item.lcRemark
        }
      };
    } else {
      // Local value from CreateLoanLcMapDto (创建模式)
      return {
        ...item,
        _key: `lc-${index}`
      };
    }
  });

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    searchForm.resetFields();
    setSelectedLcIds([]);
    setActiveTab('select');
    setModalVisible(true);
    // 打开弹窗时加载未关联的信用证
    loadUnlinkedLcs(1, 10);
  };

  const handleEdit = (record: LcMapItem) => {
    setEditingItem(record);
    setActiveTab('create'); // 编辑时直接进入创建/编辑 Tab
    setModalVisible(true);
    // 延迟设置表单值，等待 Modal 渲染完成
    setTimeout(() => {
      const lcData = record.newLc;
      form.setFieldsValue({
        securedValue: record.securedValue ? record.securedValue / 1000000 : undefined,
        marginLockedAmount: record.marginLockedAmount ? record.marginLockedAmount / 1000000 : undefined,
        allocationNote: record.allocationNote,
        status: record.status,
        mapRemark: record.remark,
        lcNo: lcData?.lcNo,
        lcType: lcData?.lcType,
        issuingBankId: lcData?.issuingBankId,
        advisingBankId: lcData?.advisingBankId,
        confirmFlag: lcData?.confirmFlag,
        applicant: lcData?.applicant,
        beneficiary: lcData?.beneficiary,
        currency: lcData?.currency || 'CNY',
        lcAmount: lcData?.lcAmount ? lcData.lcAmount / 1000000 : undefined,
        tolerancePct: lcData?.tolerancePct,
        issueDate: lcData?.issueDate ? dayjs(lcData.issueDate) : undefined,
        expiryDate: lcData?.expiryDate ? dayjs(lcData.expiryDate) : undefined,
        placeOfExpiry: lcData?.placeOfExpiry,
        availableBy: lcData?.availableBy,
        shipmentFrom: lcData?.shipmentFrom,
        shipmentTo: lcData?.shipmentTo,
        latestShipment: lcData?.latestShipment,
        incoterm: lcData?.incoterm,
        presentationDays: lcData?.presentationDays,
        partialShipmentAllowed: lcData?.partialShipmentAllowed,
        transshipmentAllowed: lcData?.transshipmentAllowed,
        marginRatio: lcData?.marginRatio,
        marginAmount: lcData?.marginAmount ? lcData.marginAmount / 1000000 : undefined,
        commissionRate: lcData?.commissionRate,
        advisingChargeBorneBy: lcData?.advisingChargeBorneBy,
        ucpVersion: lcData?.ucpVersion,
        lcStatus: lcData?.status,
        lcRemark: lcData?.remark
      });
    }, 0);
  };

  const handleDelete = async (record: LcMapItem) => {
    if (isEdit && loanId && record.lcId) {
      try {
        const result = await lcApi.removeFromLoan(loanId, record.lcId);
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
      const newData = value.filter((_, index) => `lc-${index}` !== record._key);
      onChange?.(newData);
    }
  };

  // 搜索未关联信用证
  const handleSearch = () => {
    const searchValues = searchForm.getFieldsValue();
    loadUnlinkedLcs(1, unlinkedPagination.pageSize, searchValues);
  };

  // 重置搜索
  const handleResetSearch = () => {
    searchForm.resetFields();
    loadUnlinkedLcs(1, unlinkedPagination.pageSize);
  };

  // 处理选择已有信用证的确认
  const handleSelectExistingOk = async () => {
    if (selectedLcIds.length === 0) {
      message.warning('请至少选择一个信用证');
      return;
    }

    try {
      const mapValues = await form.validateFields(['securedValue', 'marginLockedAmount', 'allocationNote', 'mapRemark']);

      const mapData = {
        securedValue: mapValues.securedValue ? Math.round(mapValues.securedValue * 1000000) : undefined,
        marginLockedAmount: mapValues.marginLockedAmount ? Math.round(mapValues.marginLockedAmount * 1000000) : undefined,
        allocationNote: mapValues.allocationNote,
        remark: mapValues.mapRemark
      };

      if (isEdit && loanId) {
        // 编辑模式：逐个调用 API 添加
        let successCount = 0;
        for (const lcId of selectedLcIds) {
          const createData: CreateLoanLcMapDto = {
            lcId,
            ...mapData
          };
          const result = await lcApi.addToLoan(loanId, createData);
          if (result.success) {
            successCount++;
          }
        }
        if (successCount > 0) {
          message.success(`成功添加 ${successCount} 个信用证`);
          loadData();
        }
        if (successCount < selectedLcIds.length) {
          message.warning(`${selectedLcIds.length - successCount} 个信用证添加失败`);
        }
      } else {
        // 新增模式：添加到本地状态
        const selectedLcs = unlinkedLcs.filter(lc => selectedLcIds.includes(lc.id!));
        const newItems: CreateLoanLcMapDto[] = selectedLcs.map(lc => ({
          lcId: lc.id,
          existingLc: lc, // 保存选中的信用证信息用于显示
          ...mapData
        }));
        onChange?.([...value, ...newItems]);
      }

      setModalVisible(false);
      form.resetFields();
      setSelectedLcIds([]);
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error('操作失败');
      }
    }
  };

  // 处理创建新信用证的确认
  const handleCreateNewOk = async () => {
    try {
      const values = await form.validateFields();
      const newLc: CreateLoanLcDto = {
        lcNo: values.lcNo,
        lcType: values.lcType,
        issuingBankId: values.issuingBankId,
        advisingBankId: values.advisingBankId,
        confirmFlag: values.confirmFlag,
        applicant: values.applicant,
        beneficiary: values.beneficiary,
        currency: values.currency || 'CNY',
        lcAmount: values.lcAmount ? Math.round(values.lcAmount * 1000000) : 0,
        tolerancePct: values.tolerancePct,
        issueDate: values.issueDate?.format('YYYY-MM-DD'),
        expiryDate: values.expiryDate?.format('YYYY-MM-DD'),
        placeOfExpiry: values.placeOfExpiry,
        availableBy: values.availableBy,
        shipmentFrom: values.shipmentFrom,
        shipmentTo: values.shipmentTo,
        latestShipment: values.latestShipment,
        incoterm: values.incoterm,
        presentationDays: values.presentationDays,
        partialShipmentAllowed: values.partialShipmentAllowed,
        transshipmentAllowed: values.transshipmentAllowed,
        marginRatio: values.marginRatio,
        marginAmount: values.marginAmount ? Math.round(values.marginAmount * 1000000) : undefined,
        commissionRate: values.commissionRate,
        advisingChargeBorneBy: values.advisingChargeBorneBy,
        ucpVersion: values.ucpVersion,
        status: values.lcStatus,
        remark: values.lcRemark,
        uploadedAttachments: lcAttachments.map(f => ({
          attachmentId: f.attachmentId,
          fileSize: f.fileSize,
          operation: 'ADD' as const
        }))
      };

      const mapData = {
        securedValue: values.securedValue ? Math.round(values.securedValue * 1000000) : undefined,
        marginLockedAmount: values.marginLockedAmount ? Math.round(values.marginLockedAmount * 1000000) : undefined,
        allocationNote: values.allocationNote,
        status: values.status,
        remark: values.mapRemark
      };

      if (isEdit && loanId) {
        if (editingItem?.mapId) {
          // Update existing map
          const updateData: UpdateLoanLcMapDto = {
            id: editingItem.mapId,
            ...mapData
          };
          const result = await lcApi.updateMap(updateData);
          if (result.success) {
            message.success('更新成功');
            loadData();
          } else {
            message.error(result.message || '更新失败');
            return;
          }
        } else {
          // Add new LC to loan
          const createData: CreateLoanLcMapDto = {
            newLc,
            ...mapData
          };
          const result = await lcApi.addToLoan(loanId, createData);
          if (result.success) {
            message.success('添加成功');
            loadData();
          } else {
            message.error(result.message || '添加失败');
            return;
          }
        }
      } else {
        // Local mode - update parent state
        const newItem: CreateLoanLcMapDto = {
          newLc,
          ...mapData
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
      setEditingItem(null);
      setLcAttachments([]);
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error('操作失败');
      }
    }
  };

  const handleModalOk = () => {
    if (activeTab === 'select' && !editingItem) {
      handleSelectExistingOk();
    } else {
      handleCreateNewOk();
    }
  };

  // 未关联信用证表格列
  const unlinkedColumns: ColumnsType<LoanLcDto> = [
    { title: '信用证编号', dataIndex: 'lcNo', key: 'lcNo', width: 140 },
    { title: '开证行', dataIndex: 'issuingBankName', key: 'issuingBankName', ellipsis: true },
    {
      title: '金额',
      dataIndex: 'lcAmount',
      key: 'lcAmount',
      width: 120,
      render: (val) => val ? <AmountDisplay value={val} /> : '-'
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant',
      width: 100,
      ellipsis: true
    },
    {
      title: '到期日',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 110,
      render: (val) => val || '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80
    }
  ];

  const columns: ColumnsType<LcMapItem> = [
    {
      title: '信用证编号',
      key: 'lcNo',
      render: (_, record) => record.newLc?.lcNo || (record as any).existingLc?.lcNo || '-'
    },
    {
      title: '信用证金额',
      key: 'lcAmount',
      width: 140,
      render: (_, record) => {
        const amount = record.newLc?.lcAmount || (record as any).existingLc?.lcAmount;
        return amount ? <AmountDisplay value={amount} /> : '-';
      }
    },
    {
      title: '认可金额',
      dataIndex: 'securedValue',
      key: 'securedValue',
      width: 140,
      render: (val) => val ? <AmountDisplay value={val} /> : '-'
    },
    {
      title: '保证金冻结额',
      dataIndex: 'marginLockedAmount',
      key: 'marginLockedAmount',
      width: 140,
      render: (val) => val ? <AmountDisplay value={val} /> : '-'
    },
    {
      title: '到期日',
      key: 'expiryDate',
      width: 120,
      render: (_, record) => record.newLc?.expiryDate || (record as any).existingLc?.expiryDate || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: LcMapItem) => {
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

        // 编辑和删除（非只读模式）
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

  // 渲染选择已有信用证的 Tab 内容
  const renderSelectExistingTab = () => (
    <>
      {/* 搜索表单 */}
      <Form form={searchForm} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="lcNo" label="信用证编号">
          <Input placeholder="请输入" style={{ width: 140 }} allowClear />
        </Form.Item>
        <Form.Item name="issuingBankId" label="开证行">
          <InstitutionSelect placeholder="请选择" style={{ width: 180 }} allowClear />
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

      {/* 信用证列表 */}
      <Table
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: selectedLcIds,
          onChange: (selectedRowKeys) => setSelectedLcIds(selectedRowKeys as number[])
        }}
        columns={unlinkedColumns}
        dataSource={unlinkedLcs}
        rowKey="id"
        size="small"
        loading={unlinkedLoading}
        pagination={{
          ...unlinkedPagination,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => {
            const searchValues = searchForm.getFieldsValue();
            loadUnlinkedLcs(page, pageSize, searchValues);
          }
        }}
        scroll={{ y: 300 }}
      />

      {/* 选中后显示关联信息表单 */}
      {selectedLcIds.length > 0 && (
        <>
          <Divider orientation="left" style={{ fontSize: 14 }}>
            关联信息（已选 {selectedLcIds.length} 个信用证）
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="securedValue" label="认可金额（万元）">
                <InputNumber style={{ width: '100%' }} min={0} precision={6} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="marginLockedAmount" label="保证金冻结额（万元）">
                <InputNumber style={{ width: '100%' }} min={0} precision={6} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="allocationNote" label="用途说明">
                <Input placeholder="请输入" />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}
    </>
  );

  // 渲染创建新信用证的 Tab 内容
  const renderCreateNewTab = () => (
    <>
      {/* 关联信息 - 始终可编辑 */}
      <Divider orientation="left" style={{ fontSize: 14 }}>关联信息</Divider>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="securedValue" label="认可金额（万元）">
            <InputNumber style={{ width: '100%' }} min={0} precision={6} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="marginLockedAmount" label="保证金冻结额（万元）">
            <InputNumber style={{ width: '100%' }} min={0} precision={6} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="allocationNote" label="用途说明">
            <Input placeholder="请输入" />
          </Form.Item>
        </Col>
      </Row>

      {/* 信用证基础信息 - 编辑已有记录时只读展示 */}
      <Divider orientation="left" style={{ fontSize: 14 }}>信用证信息</Divider>

      {editingItem?.mapId ? (
        // 编辑模式：信用证信息以详情形式展示
        <Descriptions
          bordered
          size="small"
          column={3}
          style={{ marginBottom: 16 }}
          styles={{ label: { background: '#fafafa', width: 120 } }}
        >
          <Descriptions.Item label="信用证编号">
            {editingItem.newLc?.lcNo || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="信用证类型">
            {editingItem.newLc?.lcType || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="开证行">
            {editingItem.newLc?.issuingBankName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="币种">
            {editingItem.newLc?.currency || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="信用证金额">
            {editingItem.newLc?.lcAmount ? (
              <AmountDisplay value={editingItem.newLc.lcAmount} />
            ) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="金额容差">
            {editingItem.newLc?.tolerancePct != null ? `${editingItem.newLc.tolerancePct}%` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="开证日期">
            {editingItem.newLc?.issueDate || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="到期日">
            {editingItem.newLc?.expiryDate || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="到期地点">
            {editingItem.newLc?.placeOfExpiry || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="是否保兑">
            {editingItem.newLc?.confirmFlag ? <Tag color="blue">是</Tag> : <Tag>否</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="可用方式">
            {editingItem.newLc?.availableBy || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="交单期限">
            {editingItem.newLc?.presentationDays != null ? `${editingItem.newLc.presentationDays}天` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="申请人">
            {editingItem.newLc?.applicant || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="受益人">
            {editingItem.newLc?.beneficiary || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="装运港">
            {editingItem.newLc?.shipmentFrom || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="卸货港">
            {editingItem.newLc?.shipmentTo || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="最迟装运期">
            {editingItem.newLc?.latestShipment || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="保证金比例">
            {editingItem.newLc?.marginRatio != null ? `${editingItem.newLc.marginRatio}%` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="保证金金额">
            {editingItem.newLc?.marginAmount ? (
              <AmountDisplay value={editingItem.newLc.marginAmount} />
            ) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="开证费率">
            {editingItem.newLc?.commissionRate != null ? `${editingItem.newLc.commissionRate}%` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="允许分批装运">
            {editingItem.newLc?.partialShipmentAllowed ? <Tag color="blue">是</Tag> : <Tag>否</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="允许转运">
            {editingItem.newLc?.transshipmentAllowed ? <Tag color="blue">是</Tag> : <Tag>否</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            {editingItem.newLc?.status || '-'}
          </Descriptions.Item>
          {editingItem.newLc?.remark && (
            <Descriptions.Item label="信用证备注" span={3}>
              {editingItem.newLc.remark}
            </Descriptions.Item>
          )}
        </Descriptions>
      ) : (
        // 新增模式：信用证信息可编辑
        <>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="lcNo"
                label="信用证编号"
                rules={[{ required: true, message: '请输入信用证编号' }]}
              >
                <Input placeholder="请输入" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="lcType" label="信用证类型">
                <DictSelect dictCode="lc.type" placeholder="请选择" allowClear />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="issuingBankId"
                label="开证行"
                rules={[{ required: true, message: '请选择开证行' }]}
              >
                <InstitutionSelect placeholder="请选择" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="advisingBankId" label="通知/保兑行">
                <InstitutionSelect placeholder="请选择" allowClear />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="confirmFlag" label="是否保兑" valuePropName="checked">
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="currency"
                label="币种"
                initialValue="CNY"
                rules={[{ required: true, message: '请选择币种' }]}
              >
                <DictSelect dictCode="sys.currency" placeholder="请选择" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="lcAmount"
                label="信用证金额（万元）"
                rules={[{ required: true, message: '请输入金额' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} precision={6} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="tolerancePct" label="金额容差(%)">
                <InputNumber style={{ width: '100%' }} min={0} max={100} precision={2} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="issueDate"
                label="开证日期"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="expiryDate"
                label="到期日"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="placeOfExpiry" label="到期地点">
                <Input placeholder="请输入" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="availableBy" label="可用方式">
                <DictSelect dictCode="lc.available.by" placeholder="请选择" allowClear />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="applicant" label="申请人">
                <Input placeholder="请输入" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="beneficiary" label="受益人">
                <Input placeholder="请输入" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="presentationDays" label="交单期限(天)">
                <InputNumber style={{ width: '100%' }} min={0} precision={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="shipmentFrom" label="装运港">
                <Input placeholder="请输入" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="shipmentTo" label="卸货港">
                <Input placeholder="请输入" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="latestShipment" label="最迟装运期">
                <Input placeholder="请输入" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="marginRatio" label="保证金比例(%)">
                <InputNumber style={{ width: '100%' }} min={0} max={100} precision={2} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="marginAmount" label="保证金金额（万元）">
                <InputNumber style={{ width: '100%' }} min={0} precision={6} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="commissionRate" label="开证费率(%)">
                <InputNumber style={{ width: '100%' }} min={0} precision={4} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="partialShipmentAllowed" label="允许分批装运" valuePropName="checked">
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="transshipmentAllowed" label="允许转运" valuePropName="checked">
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="lcStatus" label="状态">
                <DictSelect dictCode="lc.status" placeholder="请选择" allowClear />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="lcRemark" label="信用证备注">
                <Input.TextArea rows={2} placeholder="请输入" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="信用证附件">
                <RaxUpload
                  bizModule="FinLoanLc"
                  value={lcAttachments}
                  onChange={setLcAttachments}
                  maxCount={10}
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}
    </>
  );

  return (
    <>
      {!readOnly && (
        <div style={{ marginBottom: 16 }}>
          <Button type="dashed" icon={<PlusOutlined />} onClick={handleAdd}>
            添加信用证
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
        locale={{ emptyText: '暂无信用证数据' }}
      />

      {!readOnly && <Modal
        title={editingItem?.mapId ? '编辑信用证关联' : (editingItem ? '编辑信用证' : '添加信用证')}
        open={modalVisible}
        onOk={handleModalOk}
        okText={activeTab === 'select' && !editingItem ? `确定添加${selectedLcIds.length > 0 ? `(${selectedLcIds.length})` : ''}` : '确定'}
        onCancel={() => {
          setModalVisible(false);
          setEditingItem(null);
          setSelectedLcIds([]);
          setLcAttachments([]);
        }}
        width={960}
        maskClosable={false}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          {editingItem ? (
            // 编辑模式：直接显示创建/编辑表单
            renderCreateNewTab()
          ) : (
            // 新增模式：显示 Tab 切换
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'select',
                  label: '选择已有',
                  children: renderSelectExistingTab()
                },
                {
                  key: 'create',
                  label: '创建新的',
                  children: renderCreateNewTab()
                }
              ]}
            />
          )}
        </Form>
      </Modal>}

      <AttachmentViewModal
        open={attachmentModalVisible}
        onClose={() => {
          setAttachmentModalVisible(false);
          setViewingAttachments([]);
        }}
        attachments={viewingAttachments}
        title="信用证附件"
      />
    </>
  );
};

export default LcForm;
