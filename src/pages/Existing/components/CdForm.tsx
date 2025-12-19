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
  CreateLoanCdMapDto,
  CreateLoanCdDto,
  LoanCdWithMapDto,
  UpdateLoanCdMapDto,
  LoanCdDto,
  SysAttachmentDto
} from '@/types/swagger-api';
import AttachmentViewModal from '@/components/AttachmentViewModal';
import { cdApi } from '@/services/cd';
import InstitutionSelect from '@/components/InstitutionSelect';
import DictSelect from '@/components/DictSelect';
import AmountDisplay from '@/components/AmountDisplay';
import RaxUpload from '@/components/RaxUpload';
import type { UploadedFile } from '@/components/RaxUpload';

// 扩展 CreateLoanCdDto 添加从 API 返回的额外字段
interface CdInfo extends CreateLoanCdDto {
  bankName?: string;  // 银行名称（从API返回时有值）
}

interface CdMapItem extends Omit<CreateLoanCdMapDto, 'newCd'> {
  _key: string;
  mapId?: number;
  cdId?: number;
  newCd?: CdInfo;
  _attachments?: SysAttachmentDto[];
}

interface CdFormProps {
  value?: CreateLoanCdMapDto[];
  onChange?: (value: CreateLoanCdMapDto[]) => void;
  isEdit?: boolean;
  loanId?: number;
  readOnly?: boolean;
}

const CdForm: React.FC<CdFormProps> = ({
  value = [],
  onChange,
  isEdit,
  loanId,
  readOnly = false
}) => {
  const { message } = App.useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<CdMapItem | null>(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<LoanCdWithMapDto[]>([]);
  const [cdAttachments, setCdAttachments] = useState<UploadedFile[]>([]);

  // 附件查看相关状态
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
  const [viewingAttachments, setViewingAttachments] = useState<SysAttachmentDto[]>([]);

  // Tab 切换相关状态
  const [activeTab, setActiveTab] = useState<string>('select');
  const [unlinkedCds, setUnlinkedCds] = useState<LoanCdDto[]>([]);
  const [unlinkedLoading, setUnlinkedLoading] = useState(false);
  const [selectedCdIds, setSelectedCdIds] = useState<number[]>([]);
  const [unlinkedPagination, setUnlinkedPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    if (isEdit && loanId) {
      loadData();
    }
  }, [isEdit, loanId]);

  const loadData = async () => {
    if (!loanId) return;
    setLoading(true);
    try {
      const result = await cdApi.listByLoanId(loanId);
      if (result.success) {
        setApiData(result.data || []);
      }
    } catch (error) {
      message.error('加载存单数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载未关联的存单列表
  const loadUnlinkedCds = async (page = 1, pageSize = 10, searchValues?: any) => {
    setUnlinkedLoading(true);
    try {
      const result = await cdApi.pageUnlinked({
        pageNo: page,
        pageSize,
        ...searchValues
      });
      if (result.success && result.data) {
        setUnlinkedCds(result.data.rows || []);
        setUnlinkedPagination({
          current: result.data.pageNo || page,
          pageSize: result.data.pageSize || pageSize,
          total: result.data.totalCount || 0
        });
      }
    } catch (error) {
      message.error('加载可用存单失败');
    } finally {
      setUnlinkedLoading(false);
    }
  };

  // 查看附件
  const handleViewAttachments = (record: CdMapItem) => {
    setViewingAttachments(record._attachments || []);
    setAttachmentModalVisible(true);
  };

  // Convert API data or local value to table data source
  const dataSource: CdMapItem[] = (isEdit && loanId ? apiData : value).map((item: any, index) => {
    // 判断是否是 API 返回的 LoanCdWithMapDto 格式（cdNo 在顶层）
    const isApiFormat = 'cdNo' in item && !('newCd' in item);

    if (isEdit && loanId || isApiFormat) {
      // API data from LoanCdWithMapDto (编辑模式或 readOnly 模式下传入的详情数据)
      return {
        _key: `cd-${item.mapId || index}`,
        mapId: item.mapId,
        cdId: item.cdId,
        pledgeRatio: item.pledgeRatio,
        securedValue: item.securedValue,
        registrationNo: item.registrationNo,
        registrationDate: item.registrationDate,
        releaseDate: item.releaseDate,
        status: item.mapStatus,
        voucherNo: item.voucherNo,
        remark: item.mapRemark,
        _attachments: item.attachments || [],
        newCd: {
          cdNo: item.cdNo,
          bankId: item.bankId,
          bankName: item.bankName,
          cardId: item.cardId,
          currency: item.currency,
          principalAmount: item.principalAmount,
          interestRate: item.interestRate,
          dayCountConvention: item.dayCountConvention,
          interestPayFreq: item.interestPayFreq,
          compoundFlag: item.compoundFlag,
          issueDate: item.issueDate,
          maturityDate: item.maturityDate,
          termMonths: item.termMonths,
          autoRenewFlag: item.autoRenewFlag,
          rolloverCount: item.rolloverCount,
          certificateHolder: item.certificateHolder,
          freezeFlag: item.freezeFlag,
          status: item.cdStatus,
          remark: item.cdRemark
        }
      };
    } else {
      // Local value from CreateLoanCdMapDto (创建模式)
      return {
        ...item,
        _key: `cd-${index}`
      };
    }
  });

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    searchForm.resetFields();
    setSelectedCdIds([]);
    setActiveTab('select');
    setModalVisible(true);
    // 打开弹窗时加载未关联的存单
    loadUnlinkedCds(1, 10);
  };

  const handleEdit = (record: CdMapItem) => {
    setEditingItem(record);
    setActiveTab('create'); // 编辑时直接进入创建/编辑 Tab
    setModalVisible(true);
    // 延迟设置表单值，等待 Modal 渲染完成
    setTimeout(() => {
      const cdData = record.newCd;
      form.setFieldsValue({
        pledgeRatio: record.pledgeRatio,
        securedValue: record.securedValue ? record.securedValue / 1000000 : undefined,
        registrationNo: record.registrationNo,
        registrationDate: record.registrationDate ? dayjs(record.registrationDate) : undefined,
        releaseDate: record.releaseDate ? dayjs(record.releaseDate) : undefined,
        status: record.status,
        voucherNo: record.voucherNo,
        mapRemark: record.remark,
        cdNo: cdData?.cdNo,
        bankId: cdData?.bankId,
        cardId: cdData?.cardId,
        currency: cdData?.currency || 'CNY',
        principalAmount: cdData?.principalAmount ? cdData.principalAmount / 1000000 : undefined,
        interestRate: cdData?.interestRate,
        dayCountConvention: cdData?.dayCountConvention,
        interestPayFreq: cdData?.interestPayFreq,
        compoundFlag: cdData?.compoundFlag,
        issueDate: cdData?.issueDate ? dayjs(cdData.issueDate) : undefined,
        maturityDate: cdData?.maturityDate ? dayjs(cdData.maturityDate) : undefined,
        termMonths: cdData?.termMonths,
        autoRenewFlag: cdData?.autoRenewFlag,
        rolloverCount: cdData?.rolloverCount,
        certificateHolder: cdData?.certificateHolder,
        freezeFlag: cdData?.freezeFlag,
        cdStatus: cdData?.status,
        cdRemark: cdData?.remark
      });
    }, 0);
  };

  const handleDelete = async (record: CdMapItem) => {
    if (isEdit && loanId && record.cdId) {
      try {
        const result = await cdApi.removeFromLoan(loanId, record.cdId);
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
      const newData = value.filter((_, index) => `cd-${index}` !== record._key);
      onChange?.(newData);
    }
  };

  // 搜索未关联存单
  const handleSearch = () => {
    const searchValues = searchForm.getFieldsValue();
    loadUnlinkedCds(1, unlinkedPagination.pageSize, searchValues);
  };

  // 重置搜索
  const handleResetSearch = () => {
    searchForm.resetFields();
    loadUnlinkedCds(1, unlinkedPagination.pageSize);
  };

  // 处理选择已有存单的确认
  const handleSelectExistingOk = async () => {
    if (selectedCdIds.length === 0) {
      message.warning('请至少选择一个存单');
      return;
    }

    try {
      const mapValues = await form.validateFields(['pledgeRatio', 'securedValue', 'registrationNo', 'registrationDate', 'releaseDate', 'voucherNo', 'mapRemark']);

      const mapData = {
        pledgeRatio: mapValues.pledgeRatio,
        securedValue: mapValues.securedValue ? Math.round(mapValues.securedValue * 1000000) : undefined,
        registrationNo: mapValues.registrationNo,
        registrationDate: mapValues.registrationDate?.format('YYYY-MM-DD'),
        releaseDate: mapValues.releaseDate?.format('YYYY-MM-DD'),
        voucherNo: mapValues.voucherNo,
        remark: mapValues.mapRemark
      };

      if (isEdit && loanId) {
        // 编辑模式：逐个调用 API 添加
        let successCount = 0;
        for (const cdId of selectedCdIds) {
          const createData: CreateLoanCdMapDto = {
            cdId,
            ...mapData
          };
          const result = await cdApi.addToLoan(loanId, createData);
          if (result.success) {
            successCount++;
          }
        }
        if (successCount > 0) {
          message.success(`成功添加 ${successCount} 个存单`);
          loadData();
        }
        if (successCount < selectedCdIds.length) {
          message.warning(`${selectedCdIds.length - successCount} 个存单添加失败`);
        }
      } else {
        // 新增模式：添加到本地状态
        const selectedCds = unlinkedCds.filter(cd => selectedCdIds.includes(cd.id!));
        const newItems: CreateLoanCdMapDto[] = selectedCds.map(cd => ({
          cdId: cd.id,
          existingCd: cd, // 保存选中的存单信息用于显示
          ...mapData
        }));
        onChange?.([...value, ...newItems]);
      }

      setModalVisible(false);
      form.resetFields();
      setSelectedCdIds([]);
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error('操作失败');
      }
    }
  };

  // 处理创建新存单的确认
  const handleCreateNewOk = async () => {
    try {
      const values = await form.validateFields();
      const newCd: CreateLoanCdDto = {
        cdNo: values.cdNo,
        bankId: values.bankId,
        cardId: values.cardId,
        currency: values.currency || 'CNY',
        principalAmount: values.principalAmount ? Math.round(values.principalAmount * 1000000) : 0,
        interestRate: values.interestRate,
        dayCountConvention: values.dayCountConvention,
        interestPayFreq: values.interestPayFreq,
        compoundFlag: values.compoundFlag,
        issueDate: values.issueDate?.format('YYYY-MM-DD'),
        maturityDate: values.maturityDate?.format('YYYY-MM-DD'),
        termMonths: values.termMonths,
        autoRenewFlag: values.autoRenewFlag,
        rolloverCount: values.rolloverCount,
        certificateHolder: values.certificateHolder,
        freezeFlag: values.freezeFlag,
        status: values.cdStatus,
        remark: values.cdRemark,
        // 附件
        uploadedAttachments: cdAttachments.map(f => ({
          attachmentId: f.attachmentId,
          fileSize: f.fileSize,
          operation: 'ADD' as const
        }))
      };

      const mapData = {
        pledgeRatio: values.pledgeRatio,
        securedValue: values.securedValue ? Math.round(values.securedValue * 1000000) : undefined,
        registrationNo: values.registrationNo,
        registrationDate: values.registrationDate?.format('YYYY-MM-DD'),
        releaseDate: values.releaseDate?.format('YYYY-MM-DD'),
        status: values.status,
        voucherNo: values.voucherNo,
        remark: values.mapRemark
      };

      if (isEdit && loanId) {
        if (editingItem?.mapId) {
          // Update existing map
          const updateData: UpdateLoanCdMapDto = {
            id: editingItem.mapId,
            ...mapData
          };
          const result = await cdApi.updateMap(updateData);
          if (result.success) {
            message.success('更新成功');
            loadData();
          } else {
            message.error(result.message || '更新失败');
            return;
          }
        } else {
          // Add new CD to loan
          const createData: CreateLoanCdMapDto = {
            newCd,
            ...mapData
          };
          const result = await cdApi.addToLoan(loanId, createData);
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
        const newItem: CreateLoanCdMapDto = {
          newCd,
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
      setCdAttachments([]);
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

  // 未关联存单表格列
  const unlinkedColumns: ColumnsType<LoanCdDto> = [
    { title: '存单编号', dataIndex: 'cdNo', key: 'cdNo', width: 140 },
    { title: '开立银行', dataIndex: 'bankName', key: 'bankName', ellipsis: true },
    {
      title: '本金',
      dataIndex: 'principalAmount',
      key: 'principalAmount',
      width: 120,
      render: (val) => val ? <AmountDisplay value={val} /> : '-'
    },
    {
      title: '利率',
      dataIndex: 'interestRate',
      key: 'interestRate',
      width: 80,
      render: (val) => val ? `${val}%` : '-'
    },
    {
      title: '到期日',
      dataIndex: 'maturityDate',
      key: 'maturityDate',
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

  const columns: ColumnsType<CdMapItem> = [
    {
      title: '存单编号',
      key: 'cdNo',
      render: (_, record) => record.newCd?.cdNo || (record as any).existingCd?.cdNo || '-'
    },
    {
      title: '本金',
      key: 'principalAmount',
      width: 140,
      render: (_, record) => {
        const amount = record.newCd?.principalAmount || (record as any).existingCd?.principalAmount;
        return amount ? <AmountDisplay value={amount} /> : '-';
      }
    },
    {
      title: '质押比例',
      dataIndex: 'pledgeRatio',
      key: 'pledgeRatio',
      width: 100,
      render: (val) => val ? `${val}%` : '-'
    },
    {
      title: '认可价值',
      dataIndex: 'securedValue',
      key: 'securedValue',
      width: 140,
      render: (val) => val ? <AmountDisplay value={val} /> : '-'
    },
    {
      title: '质押登记号',
      dataIndex: 'registrationNo',
      key: 'registrationNo',
      ellipsis: true
    },
    {
      title: '到期日',
      key: 'maturityDate',
      width: 120,
      render: (_, record) => record.newCd?.maturityDate || (record as any).existingCd?.maturityDate || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: CdMapItem) => {
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

  // 渲染选择已有存单的 Tab 内容
  const renderSelectExistingTab = () => (
    <>
      {/* 搜索表单 */}
      <Form form={searchForm} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="cdNo" label="存单编号">
          <Input placeholder="请输入" style={{ width: 140 }} allowClear />
        </Form.Item>
        <Form.Item name="bankId" label="开立银行">
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

      {/* 存单列表 */}
      <Table
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: selectedCdIds,
          onChange: (selectedRowKeys) => setSelectedCdIds(selectedRowKeys as number[])
        }}
        columns={unlinkedColumns}
        dataSource={unlinkedCds}
        rowKey="id"
        size="small"
        loading={unlinkedLoading}
        pagination={{
          ...unlinkedPagination,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => {
            const searchValues = searchForm.getFieldsValue();
            loadUnlinkedCds(page, pageSize, searchValues);
          }
        }}
        scroll={{ y: 300 }}
      />

      {/* 选中后显示质押关联信息表单 */}
      {selectedCdIds.length > 0 && (
        <>
          <Divider orientation="left" style={{ fontSize: 14 }}>
            质押关联信息（已选 {selectedCdIds.length} 个存单）
          </Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="pledgeRatio" label="质押比例(%)">
                <InputNumber style={{ width: '100%' }} min={0} max={100} precision={2} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="securedValue" label="认可价值（万元）">
                <InputNumber style={{ width: '100%' }} min={0} precision={6} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="registrationNo" label="质押登记号">
                <Input placeholder="请输入" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="registrationDate" label="质押登记日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="releaseDate" label="解押日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="voucherNo" label="记账凭证编号">
                <Input placeholder="请输入" />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}
    </>
  );

  // 渲染创建新存单的 Tab 内容
  const renderCreateNewTab = () => (
    <>
      {/* 关联信息 - 始终可编辑 */}
      <Divider orientation="left" style={{ fontSize: 14 }}>质押关联信息</Divider>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="pledgeRatio" label="质押比例(%)">
            <InputNumber style={{ width: '100%' }} min={0} max={100} precision={2} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="securedValue" label="认可价值（万元）">
            <InputNumber style={{ width: '100%' }} min={0} precision={6} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="registrationNo" label="质押登记号">
            <Input placeholder="请输入" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="registrationDate" label="质押登记日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="releaseDate" label="解押日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="voucherNo" label="记账凭证编号">
            <Input placeholder="请输入" />
          </Form.Item>
        </Col>
      </Row>

      {/* 存单基础信息 - 编辑已有记录时只读展示 */}
      <Divider orientation="left" style={{ fontSize: 14 }}>存单信息</Divider>

      {editingItem?.mapId ? (
        // 编辑模式：存单信息以详情形式展示
        <Descriptions
          bordered
          size="small"
          column={3}
          style={{ marginBottom: 16 }}
          styles={{ label: { background: '#fafafa', width: 120 } }}
        >
          <Descriptions.Item label="存单编号">
            {editingItem.newCd?.cdNo || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="开立银行">
            {editingItem.newCd?.bankName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="币种">
            {editingItem.newCd?.currency || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="本金">
            {editingItem.newCd?.principalAmount ? (
              <AmountDisplay value={editingItem.newCd.principalAmount} />
            ) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="名义利率">
            {editingItem.newCd?.interestRate != null ? `${editingItem.newCd.interestRate}%` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="计息规则">
            {editingItem.newCd?.dayCountConvention || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="付息频率">
            {editingItem.newCd?.interestPayFreq || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="是否复利">
            {editingItem.newCd?.compoundFlag ? <Tag color="blue">是</Tag> : <Tag>否</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="期限(月)">
            {editingItem.newCd?.termMonths ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="起息日">
            {editingItem.newCd?.issueDate || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="到期日">
            {editingItem.newCd?.maturityDate || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="存单持有人">
            {editingItem.newCd?.certificateHolder || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="自动续存">
            {editingItem.newCd?.autoRenewFlag ? <Tag color="blue">是</Tag> : <Tag>否</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="续存次数">
            {editingItem.newCd?.rolloverCount ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="冻结/质押">
            {editingItem.newCd?.freezeFlag ? <Tag color="orange">是</Tag> : <Tag>否</Tag>}
          </Descriptions.Item>
          {editingItem.newCd?.remark && (
            <Descriptions.Item label="存单备注" span={3}>
              {editingItem.newCd.remark}
            </Descriptions.Item>
          )}
        </Descriptions>
      ) : (
        // 新增模式：存单信息可编辑
        <>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="cdNo"
                label="存单编号"
                rules={[{ required: true, message: '请输入存单编号' }]}
              >
                <Input placeholder="请输入" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="bankId"
                label="开立银行"
                rules={[{ required: true, message: '请选择开立银行' }]}
              >
                <InstitutionSelect placeholder="请选择" />
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
                name="principalAmount"
                label="本金（万元）"
                rules={[{ required: true, message: '请输入本金' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} precision={6} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="interestRate" label="名义利率(%)">
                <InputNumber style={{ width: '100%' }} min={0} precision={4} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dayCountConvention" label="计息规则">
                <DictSelect dictCode="day.count.convention" placeholder="请选择" allowClear />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="interestPayFreq" label="付息频率">
                <DictSelect dictCode="cd.interest.pay.freq" placeholder="请选择" allowClear />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="compoundFlag" label="是否复利" valuePropName="checked">
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="termMonths" label="期限(月)">
                <InputNumber style={{ width: '100%' }} min={0} precision={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="issueDate"
                label="起息日"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="maturityDate"
                label="到期日"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="certificateHolder" label="存单持有人">
                <Input placeholder="请输入" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="autoRenewFlag" label="是否自动续存" valuePropName="checked">
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="rolloverCount" label="续存次数">
                <InputNumber style={{ width: '100%' }} min={0} precision={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="freezeFlag" label="是否冻结/质押" valuePropName="checked">
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="cdRemark" label="存单备注">
                <Input.TextArea rows={2} placeholder="请输入" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="存单附件">
                <RaxUpload
                  bizModule="FinLoanCd"
                  value={cdAttachments}
                  onChange={setCdAttachments}
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
            添加存单
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
        locale={{ emptyText: '暂无存单数据' }}
      />

      {!readOnly && <Modal
        title={editingItem?.mapId ? '编辑存单关联' : (editingItem ? '编辑存单' : '添加存单')}
        open={modalVisible}
        onOk={handleModalOk}
        okText={activeTab === 'select' && !editingItem ? `确定添加${selectedCdIds.length > 0 ? `(${selectedCdIds.length})` : ''}` : '确定'}
        onCancel={() => {
          setModalVisible(false);
          setEditingItem(null);
          setSelectedCdIds([]);
          setCdAttachments([]);
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
        title="存单附件"
      />
    </>
  );
};

export default CdForm;
