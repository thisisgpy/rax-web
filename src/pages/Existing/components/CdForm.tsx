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
import type { CreateLoanCdMapDto, CreateLoanCdDto } from '@/types/swagger-api';
import InstitutionSelect from '@/components/InstitutionSelect';
import DictSelect from '@/components/DictSelect';
import AmountDisplay from '@/components/AmountDisplay';

interface CdMapItem extends CreateLoanCdMapDto {
  _key: string;
}

interface CdFormProps {
  value?: CreateLoanCdMapDto[];
  onChange?: (value: CreateLoanCdMapDto[]) => void;
  isEdit?: boolean;
}

const CdForm: React.FC<CdFormProps> = ({
  value = [],
  onChange,
  isEdit
}) => {
  const { message } = App.useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<CdMapItem | null>(null);
  const [form] = Form.useForm();

  // 转换数据为带 _key 的格式
  const dataSource: CdMapItem[] = value.map((item, index) => ({
    ...item,
    _key: `cd-${index}`
  }));

  // 打开新增弹窗
  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑弹窗
  const handleEdit = (record: CdMapItem) => {
    setEditingItem(record);
    const cdData = record.newCd;
    form.setFieldsValue({
      // 关联字段
      pledgeRatio: record.pledgeRatio,
      securedValue: record.securedValue ? record.securedValue / 1000000 : undefined,
      registrationNo: record.registrationNo,
      registrationDate: record.registrationDate ? dayjs(record.registrationDate) : undefined,
      releaseDate: record.releaseDate ? dayjs(record.releaseDate) : undefined,
      status: record.status,
      voucherNo: record.voucherNo,
      mapRemark: record.remark,
      // 存单字段
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
    setModalVisible(true);
  };

  // 删除
  const handleDelete = (record: CdMapItem) => {
    const newData = value.filter((_, index) => `cd-${index}` !== record._key);
    onChange?.(newData);
  };

  // 提交弹窗
  const handleModalOk = () => {
    form.validateFields().then(values => {
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
        remark: values.cdRemark
      };

      const newItem: CreateLoanCdMapDto = {
        newCd,
        pledgeRatio: values.pledgeRatio,
        securedValue: values.securedValue ? Math.round(values.securedValue * 1000000) : undefined,
        registrationNo: values.registrationNo,
        registrationDate: values.registrationDate?.format('YYYY-MM-DD'),
        releaseDate: values.releaseDate?.format('YYYY-MM-DD'),
        status: values.status,
        voucherNo: values.voucherNo,
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

  const columns: ColumnsType<CdMapItem> = [
    {
      title: '存单编号',
      key: 'cdNo',
      render: (_, record) => record.newCd?.cdNo || '-'
    },
    {
      title: '本金',
      key: 'principalAmount',
      width: 140,
      render: (_, record) => record.newCd?.principalAmount ? <AmountDisplay value={record.newCd.principalAmount} /> : '-'
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
      render: (_, record) => record.newCd?.maturityDate || '-'
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
          添加存单
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
        title={editingItem ? '编辑存单' : '添加存单'}
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

          {/* 存单基础信息 */}
          <Divider orientation="left" style={{ fontSize: 14 }}>存单信息</Divider>
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
        </Form>
      </Modal>
    </>
  );
};

export default CdForm;
