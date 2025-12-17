import React, { useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Switch,
  Button,
  Space,
  Row,
  Col,
  App,
  Spin,
  Divider
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { lcApi } from '@/services/lc';
import type { CreateLoanLcDto, UpdateLoanLcDto } from '@/types/swagger-api';
import InstitutionSelect from '@/components/InstitutionSelect';
import DictSelect from '@/components/DictSelect';

const LCForm: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const isEdit = !!id;

  // 获取信用证详情
  const { data: lcDetail, isLoading } = useQuery({
    queryKey: ['lc', 'detail', id],
    queryFn: async () => {
      const result = await lcApi.get(Number(id));
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || '获取详情失败');
    },
    enabled: isEdit
  });

  // 设置表单初始值
  useEffect(() => {
    if (lcDetail) {
      form.setFieldsValue({
        lcNo: lcDetail.lcNo,
        lcType: lcDetail.lcType,
        issuingBankId: lcDetail.issuingBankId,
        advisingBankId: lcDetail.advisingBankId,
        confirmFlag: lcDetail.confirmFlag,
        applicant: lcDetail.applicant,
        beneficiary: lcDetail.beneficiary,
        currency: lcDetail.currency,
        lcAmount: lcDetail.lcAmount ? lcDetail.lcAmount / 1000000 : undefined,
        tolerancePct: lcDetail.tolerancePct,
        issueDate: lcDetail.issueDate ? dayjs(lcDetail.issueDate) : undefined,
        expiryDate: lcDetail.expiryDate ? dayjs(lcDetail.expiryDate) : undefined,
        placeOfExpiry: lcDetail.placeOfExpiry,
        availableBy: lcDetail.availableBy,
        shipmentFrom: lcDetail.shipmentFrom,
        shipmentTo: lcDetail.shipmentTo,
        latestShipment: lcDetail.latestShipment,
        incoterm: lcDetail.incoterm,
        presentationDays: lcDetail.presentationDays,
        partialShipmentAllowed: lcDetail.partialShipmentAllowed,
        transshipmentAllowed: lcDetail.transshipmentAllowed,
        marginRatio: lcDetail.marginRatio,
        marginAmount: lcDetail.marginAmount ? lcDetail.marginAmount / 1000000 : undefined,
        commissionRate: lcDetail.commissionRate,
        advisingChargeBorneBy: lcDetail.advisingChargeBorneBy,
        ucpVersion: lcDetail.ucpVersion,
        status: lcDetail.status,
        remark: lcDetail.remark
      });
    }
  }, [lcDetail, form]);

  // 创建信用证
  const createMutation = useMutation({
    mutationFn: (data: CreateLoanLcDto) => lcApi.create(data),
    onSuccess: () => {
      message.success('创建成功');
      navigate('/bill/lc');
    },
    onError: (error: any) => {
      message.error(error.message || '创建失败');
    }
  });

  // 更新信用证
  const updateMutation = useMutation({
    mutationFn: (data: UpdateLoanLcDto) => lcApi.update(data),
    onSuccess: () => {
      message.success('更新成功');
      navigate('/bill/lc');
    },
    onError: (error: any) => {
      message.error(error.message || '更新失败');
    }
  });

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const data = {
        lcNo: values.lcNo,
        lcType: values.lcType,
        issuingBankId: values.issuingBankId,
        advisingBankId: values.advisingBankId,
        confirmFlag: values.confirmFlag,
        applicant: values.applicant,
        beneficiary: values.beneficiary,
        currency: values.currency,
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
        status: values.status,
        remark: values.remark
      };

      if (isEdit) {
        updateMutation.mutate({ id: Number(id), ...data } as UpdateLoanLcDto);
      } else {
        createMutation.mutate(data as CreateLoanLcDto);
      }
    } catch (error) {
      // 表单验证失败
    }
  };

  return (
    <Spin spinning={isLoading}>
      <Card title={isEdit ? '编辑信用证' : '新增信用证'}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ currency: 'CNY' }}
        >
          {/* 基本信息 */}
          <Divider orientation="left">基本信息</Divider>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="lcNo"
                label="信用证编号"
                rules={[{ required: true, message: '请输入信用证编号' }]}
              >
                <Input placeholder="请输入信用证编号" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="lcType" label="信用证类型">
                <DictSelect dictCode="lc.type" placeholder="请选择信用证类型" allowClear />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="issuingBankId"
                label="开证行"
                rules={[{ required: true, message: '请选择开证行' }]}
              >
                <InstitutionSelect placeholder="请选择开证行" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item name="advisingBankId" label="通知/保兑行">
                <InstitutionSelect placeholder="请选择通知/保兑行" allowClear />
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
                rules={[{ required: true, message: '请选择币种' }]}
              >
                <DictSelect dictCode="sys.currency" placeholder="请选择币种" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="lcAmount"
                label="信用证金额（万元）"
                rules={[{ required: true, message: '请输入金额' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={6}
                  placeholder="请输入金额"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="tolerancePct" label="金额容差(%)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={100}
                  precision={2}
                  placeholder="请输入容差"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="issueDate"
                label="开证日期"
                rules={[{ required: true, message: '请选择开证日期' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择开证日期" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="expiryDate"
                label="到期日"
                rules={[{ required: true, message: '请选择到期日' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择到期日" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="placeOfExpiry" label="到期地点">
                <Input placeholder="请输入到期地点" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="availableBy" label="可用方式">
                <DictSelect dictCode="lc.available.by" placeholder="请选择可用方式" allowClear />
              </Form.Item>
            </Col>
          </Row>

          {/* 当事人信息 */}
          <Divider orientation="left">当事人信息</Divider>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item name="applicant" label="申请人">
                <Input placeholder="请输入申请人" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="beneficiary" label="受益人">
                <Input placeholder="请输入受益人" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="presentationDays" label="交单期限(天)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={0}
                  placeholder="请输入交单期限"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* 运输信息 */}
          <Divider orientation="left">运输信息</Divider>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item name="shipmentFrom" label="装运港/起运地">
                <Input placeholder="请输入装运港/起运地" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="shipmentTo" label="卸货港/目的地">
                <Input placeholder="请输入卸货港/目的地" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="latestShipment" label="最迟装运期">
                <Input placeholder="请输入最迟装运期" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item name="incoterm" label="贸易术语">
                <DictSelect dictCode="lc.incoterm" placeholder="请选择贸易术语" allowClear />
              </Form.Item>
            </Col>
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
          </Row>

          {/* 费用信息 */}
          <Divider orientation="left">费用信息</Divider>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item name="marginRatio" label="保证金比例(%)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={100}
                  precision={2}
                  placeholder="请输入保证金比例"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="marginAmount" label="保证金金额（万元）">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={6}
                  placeholder="请输入保证金金额"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="commissionRate" label="开证费率(%)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={4}
                  placeholder="请输入开证费率"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item name="advisingChargeBorneBy" label="通知费承担方">
                <DictSelect dictCode="lc.charge.bearer" placeholder="请选择承担方" allowClear />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="ucpVersion" label="适用规则版本">
                <DictSelect dictCode="lc.ucp.version" placeholder="请选择规则版本" allowClear />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="状态">
                <DictSelect dictCode="lc.status" placeholder="请选择状态" allowClear />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item name="remark" label="备注">
                <Input.TextArea rows={3} placeholder="请输入备注" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              <Button type="primary" onClick={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>
                {isEdit ? '保存' : '创建'}
              </Button>
              <Button onClick={() => navigate('/bill/lc')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </Spin>
  );
};

export default LCForm;
