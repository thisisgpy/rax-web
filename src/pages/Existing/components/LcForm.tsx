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
  Popconfirm,
  Descriptions,
  Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type {
  CreateLoanLcMapDto,
  CreateLoanLcDto,
  LoanLcWithMapDto,
  UpdateLoanLcMapDto
} from '@/types/swagger-api';
import { lcApi } from '@/services/lc';
import InstitutionSelect from '@/components/InstitutionSelect';
import DictSelect from '@/components/DictSelect';
import AmountDisplay from '@/components/AmountDisplay';

interface LcMapItem extends CreateLoanLcMapDto {
  _key: string;
  mapId?: number;
  lcId?: number;
}

interface LcFormProps {
  value?: CreateLoanLcMapDto[];
  onChange?: (value: CreateLoanLcMapDto[]) => void;
  isEdit?: boolean;
  loanId?: number;
}

const LcForm: React.FC<LcFormProps> = ({
  value = [],
  onChange,
  isEdit,
  loanId
}) => {
  const { message } = App.useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<LcMapItem | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<LoanLcWithMapDto[]>([]);

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

  // Convert API data or local value to table data source
  const dataSource: LcMapItem[] = (isEdit && loanId ? apiData : value).map((item: any, index) => {
    if (isEdit && loanId) {
      // API data from LoanLcWithMapDto
      return {
        _key: `lc-${item.mapId || index}`,
        mapId: item.mapId,
        lcId: item.lcId,
        securedValue: item.securedValue,
        marginLockedAmount: item.marginLockedAmount,
        allocationNote: item.allocationNote,
        status: item.mapStatus,
        remark: item.mapRemark,
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
      // Local value from CreateLoanLcMapDto
      return {
        ...item,
        _key: `lc-${index}`
      };
    }
  });

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: LcMapItem) => {
    setEditingItem(record);
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
    setModalVisible(true);
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

  const handleModalOk = async () => {
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
        remark: values.lcRemark
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
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error('操作失败');
      }
    }
  };

  const columns: ColumnsType<LcMapItem> = [
    {
      title: '信用证编号',
      key: 'lcNo',
      render: (_, record) => record.newLc?.lcNo || '-'
    },
    {
      title: '信用证金额',
      key: 'lcAmount',
      width: 140,
      render: (_, record) => record.newLc?.lcAmount ? <AmountDisplay value={record.newLc.lcAmount} /> : '-'
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
      render: (_, record) => record.newLc?.expiryDate || '-'
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
          添加信用证
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
        title={editingItem?.mapId ? '编辑信用证关联' : (editingItem ? '编辑信用证' : '添加信用证')}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingItem(null);
        }}
        width={900}
      >
        <Form form={form} layout="vertical">
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
              labelStyle={{ background: '#fafafa', width: 120 }}
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
            </>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default LcForm;
