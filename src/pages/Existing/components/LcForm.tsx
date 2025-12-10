import React, { useState } from 'react';
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
  App
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { CreateLoanLcMapDto, CreateLoanLcDto, FinInstitutionDto } from '@/types/swagger-api';
import InstitutionSelect from '@/components/InstitutionSelect';
import DictSelect from '@/components/DictSelect';
import AmountDisplay from '@/components/AmountDisplay';

interface LcMapItem extends CreateLoanLcMapDto {
  _key: string;
}

interface LcFormProps {
  value?: CreateLoanLcMapDto[];
  onChange?: (value: CreateLoanLcMapDto[]) => void;
  isEdit?: boolean;
}

const LcForm: React.FC<LcFormProps> = ({
  value = [],
  onChange,
  isEdit
}) => {
  const { message } = App.useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<LcMapItem | null>(null);
  const [form] = Form.useForm();

  // 转换数据为带 _key 的格式
  const dataSource: LcMapItem[] = value.map((item, index) => ({
    ...item,
    _key: `lc-${index}`
  }));

  // 打开新增弹窗
  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑弹窗
  const handleEdit = (record: LcMapItem) => {
    setEditingItem(record);
    const lcData = record.newLc;
    form.setFieldsValue({
      // 关联字段
      securedValue: record.securedValue ? record.securedValue / 1000000 : undefined,
      marginLockedAmount: record.marginLockedAmount ? record.marginLockedAmount / 1000000 : undefined,
      allocationNote: record.allocationNote,
      status: record.status,
      mapRemark: record.remark,
      // 信用证字段
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

  // 删除
  const handleDelete = (record: LcMapItem) => {
    const newData = value.filter((_, index) => `lc-${index}` !== record._key);
    onChange?.(newData);
  };

  // 提交弹窗
  const handleModalOk = () => {
    form.validateFields().then(values => {
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

      const newItem: CreateLoanLcMapDto = {
        newLc,
        securedValue: values.securedValue ? Math.round(values.securedValue * 1000000) : undefined,
        marginLockedAmount: values.marginLockedAmount ? Math.round(values.marginLockedAmount * 1000000) : undefined,
        allocationNote: values.allocationNote,
        status: values.status,
        remark: values.mapRemark
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
      setEditingItem(null);
    });
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
          添加信用证
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
        title={editingItem ? '编辑信用证' : '添加信用证'}
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
          {/* 关联信息 */}
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

          {/* 信用证基础信息 */}
          <Divider orientation="left" style={{ fontSize: 14 }}>信用证信息</Divider>
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
        </Form>
      </Modal>
    </>
  );
};

export default LcForm;
