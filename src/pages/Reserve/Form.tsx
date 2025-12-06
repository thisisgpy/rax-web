import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Button,
  Card,
  Space,
  Row,
  Col,
  App,
  Divider,
  Table,
  Modal
} from 'antd';
import {
  PlusOutlined,
  MinusCircleOutlined,
  SaveOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { reserveApi } from '@/services/reserve';
import { dictApi } from '@/services/dict';
import type {
  CreateReserveDto,
  UpdateReserveDto,
  CreateReserveCostDto,
  CreateReserveProgressDto,
  FinReserveProgressStep
} from '@/types/swagger-api';
import OrgSelect from '@/components/OrgSelect';
import InstitutionSelect from '@/components/InstitutionSelect';
import DictSelect from '@/components/DictSelect';

const { Option } = Select;
const { TextArea } = Input;

interface CostItem extends CreateReserveCostDto {
  key?: string;
}

const ReserveForm: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [form] = Form.useForm();
  const [costs, setCosts] = useState<CostItem[]>([]);
  const [progresses, setProgresses] = useState<CreateReserveProgressDto[]>([]);
  const [showCostModal, setShowCostModal] = useState(false);
  const [editingCost, setEditingCost] = useState<CostItem | null>(null);
  const [costForm] = Form.useForm();
  const [costType, setCostType] = useState<string>('');

  // 获取进度步骤定义
  const { data: progressSteps, isLoading: progressStepsLoading, error: progressStepsError } = useQuery({
    queryKey: ['reserve', 'progressSteps'],
    queryFn: async () => {
      const result = await reserveApi.getProgressSteps();
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || '获取进度步骤失败');
    }
  });

  // 获取成本类型字典
  const { data: costTypeDict } = useQuery({
    queryKey: ['dict', 'cost.type'],
    queryFn: () => dictApi.getItemTreeByCode('cost.type')
  });

  // 获取融资方式字典
  const { data: fundingModeDict } = useQuery({
    queryKey: ['dict', 'funding.mode'],
    queryFn: () => dictApi.getItemTreeByCode('funding.mode')
  });

  // 获取储备融资详情（编辑模式）
  const { data: reserveDetail } = useQuery({
    queryKey: ['reserve', 'detail', id],
    queryFn: async () => {
      if (!id) return null;
      const result = await reserveApi.get(Number(id));
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || '获取详情失败');
    },
    enabled: isEdit
  });

  // 创建储备融资
  const createMutation = useMutation({
    mutationFn: (data: CreateReserveDto) => reserveApi.create(data),
    onSuccess: (result) => {
      message.success('创建成功');
      navigate(`/financing/reserve/detail/${result.data}`);
    }
  });

  // 更新储备融资
  const updateMutation = useMutation({
    mutationFn: (data: UpdateReserveDto) => reserveApi.update(data),
    onSuccess: () => {
      message.success('更新成功');
      navigate(`/financing/reserve/detail/${id}`);
    }
  });

  // 初始化表单数据
  useEffect(() => {
    if (reserveDetail) {
      const formData = {
        ...reserveDetail,
        expectedDisbursementDate: reserveDetail.expectedDisbursementDate
          ? dayjs(reserveDetail.expectedDisbursementDate)
          : undefined,
        combinedRatio: reserveDetail.combinedRatio ? reserveDetail.combinedRatio * 100 : undefined,
        fundingAmount: reserveDetail.fundingAmount ? reserveDetail.fundingAmount / 1000000 : undefined,
        additionalCosts: reserveDetail.additionalCosts ? reserveDetail.additionalCosts / 1000000 : undefined
      };
      form.setFieldsValue(formData);

      // 设置成本明细
      if (reserveDetail.costs) {
        setCosts(reserveDetail.costs.map((cost: any, index: number) => ({
          ...cost,
          key: `cost-${index}`
        })));
      }

      // 设置进度信息
      if (reserveDetail.progresses) {
        setProgresses(reserveDetail.progresses.map((progress: any) => ({
          ...progress,
          planDate: progress.planDate ? dayjs(progress.planDate).format('YYYY-MM-DD') : ''
        })));
      }
    }
  }, [reserveDetail, form]);

  // 初始化新增模式下的进度信息
  useEffect(() => {
    if (!isEdit && progressSteps && progressSteps.length > 0) {
      // 新增模式下，立即初始化进度信息（不设置具体日期，等用户选择预计放款日期后自动计算）
      const initialProgresses = progressSteps.map((step: FinReserveProgressStep) => ({
        progressName: step.name || '',
        planDate: ''
      }));
      setProgresses(initialProgresses);
    }
  }, [isEdit, progressSteps]);

  // 处理预计放款日期变化，自动计算进度计划日期
  const handleExpectedDateChange = (date: any) => {
    if (date && progressSteps) {
      const newProgresses = progressSteps.map((step: FinReserveProgressStep) => {
        // 在编辑模式下，检查是否已完成
        if (isEdit) {
          const existingProgress = progresses.find(p => p.progressName === step.name);
          const isCompleted = reserveDetail?.progresses?.find(
            (p: any) => p.progressName === step.name && p.actualDate
          );

          // 如果已完成，保留原计划日期
          if (isCompleted && existingProgress) {
            return existingProgress;
          }
        }

        const planDate = dayjs(date).add(step.gap || 0, 'month');
        return {
          progressName: step.name || '',
          planDate: planDate.format('YYYY-MM-DD')
        };
      });
      setProgresses(newProgresses);
    } else if (!date && !isEdit) {
      // 新增模式下，如果清除了预计放款日期，则重置进度信息但保留结构
      if (progressSteps) {
        const resetProgresses = progressSteps.map((step: FinReserveProgressStep) => ({
          progressName: step.name || '',
          planDate: ''
        }));
        setProgresses(resetProgresses);
      }
    }
  };

  // 处理进度日期变化
  const handleProgressDateChange = (index: number, date: any) => {
    const newProgresses = [...progresses];
    newProgresses[index].planDate = date ? dayjs(date).format('YYYY-MM-DD') : '';
    setProgresses(newProgresses);
  };

  // 添加/编辑成本明细
  const handleCostSubmit = () => {
    costForm.validateFields().then(values => {
      if (editingCost) {
        // 编辑模式
        setCosts(costs.map(cost =>
          cost.key === editingCost.key
            ? { ...values, key: editingCost.key }
            : cost
        ));
      } else {
        // 新增模式
        setCosts([...costs, { ...values, key: `cost-${Date.now()}` }]);
      }
      setShowCostModal(false);
      costForm.resetFields();
      setEditingCost(null);
    });
  };

  // 删除成本明细
  const handleDeleteCost = (key: string) => {
    setCosts(costs.filter(cost => cost.key !== key));
  };

  // 编辑成本明细
  const handleEditCost = (record: CostItem) => {
    setEditingCost(record);
    costForm.setFieldsValue(record);
    setShowCostModal(true);
  };

  // 提交表单
  const handleSubmit = () => {
    // 验证进度信息
    const incompleteProgress = progresses.find(p => !p.planDate);
    if (incompleteProgress) {
      message.error(`请完善进度"${incompleteProgress.progressName}"的计划完成日期`);
      return;
    }

    form.validateFields().then(values => {
      const data: any = {
        ...values,
        expectedDisbursementDate: values.expectedDisbursementDate?.format('YYYY-MM-DD'),
        combinedRatio: values.combinedRatio ? values.combinedRatio / 100 : 0,
        fundingAmount: values.fundingAmount ? Math.round(values.fundingAmount * 1000000) : 0,
        additionalCosts: values.additionalCosts ? Math.round(values.additionalCosts * 1000000) : 0,
        costs: costs.map(({ key, ...cost }) => cost),
        progresses: isEdit
          ? progresses.map(progress => {
              // 查找对应的原始进度项
              const originalProgress = reserveDetail?.progresses?.find((rp: any) => rp.progressName === progress.progressName);
              return {
                ...progress,
                // 如果是现有进度项，保留原有的id；如果是新增的，不设置id
                ...(originalProgress && { id: originalProgress.id })
              };
            }).filter(p => !(reserveDetail?.progresses?.find((rp: any) => rp.progressName === p.progressName && rp.actualDate)))
          : progresses,
        loanRenewalFromId: 0 // 默认值，等存量融资开发后调整
      };

      if (isEdit) {
        updateMutation.mutate({ id: Number(id), ...data });
      } else {
        createMutation.mutate(data);
      }
    });
  };

  // 成本明细表格列
  const costColumns = [
    {
      title: '成本类型',
      dataIndex: 'costType',
      key: 'costType',
      render: (value: string) => {
        const item = costTypeDict?.data?.find((d: any) => d.itemValue === value);
        return item?.itemLabel || value;
      }
    },
    {
      title: '成本描述',
      dataIndex: 'costDescription',
      key: 'costDescription'
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: CostItem) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEditCost(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger onClick={() => handleDeleteCost(record.key!)}>
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <>
      <Card>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/financing/reserve')}
          style={{ marginBottom: 16 }}
        >
          返回列表
        </Button>

        <Form
          form={form}
          layout="vertical"
          requiredMark="optional"
        >
          {/* 基础信息 */}
          <Divider orientation="left">基础信息</Divider>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="orgId"
                label="融资主体"
                rules={[{ required: true, message: '请选择融资主体' }]}
              >
                <OrgSelect placeholder="请选择融资主体" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="financialInstitutionId"
                label="金融机构"
                rules={[{ required: true, message: '请选择金融机构' }]}
              >
                <InstitutionSelect placeholder="请选择金融机构" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="fundingMode"
                label="融资方式"
                rules={[{ required: true, message: '请选择融资方式' }]}
              >
                <DictSelect
                  dictCode="funding.mode"
                  placeholder="请选择融资方式"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="fundingAmount"
                label="融资金额（万元）"
                rules={[
                  { required: true, message: '请输入融资金额' },
                  { type: 'number', min: 0.01, message: '融资金额必须大于0' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入融资金额"
                  min={0.01}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="expectedDisbursementDate"
                label="预计放款日期"
                rules={[{ required: true, message: '请选择预计放款日期' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="请选择日期"
                  onChange={handleExpectedDateChange}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="leaderName"
                label="牵头领导"
                rules={[{ required: true, message: '请输入牵头领导' }]}
              >
                <Input placeholder="请输入牵头领导姓名" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="handlerName"
                label="经办人"
                rules={[{ required: true, message: '请输入经办人' }]}
              >
                <Input placeholder="请输入经办人姓名" />
              </Form.Item>
            </Col>
          </Row>

          {/* 成本信息 */}
          <Divider orientation="left">成本信息</Divider>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="combinedRatio"
                label="综合成本率（%）"
                rules={[
                  { required: true, message: '请输入综合成本率' },
                  { type: 'number', min: 0, max: 100, message: '综合成本率在0-100之间' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入综合成本率"
                  min={0}
                  max={100}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="additionalCosts"
                label="额外成本（万元）"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入额外成本"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ marginBottom: 16 }}>
            <Button
              type="dashed"
              onClick={() => {
                setEditingCost(null);
                costForm.resetFields();
                setCostType('');
                setShowCostModal(true);
              }}
              icon={<PlusOutlined />}
            >
              添加成本明细
            </Button>
          </div>
          <Table
            columns={costColumns}
            dataSource={costs}
            rowKey="key"
            pagination={false}
            size="small"
          />

          {/* 进度信息 */}
          <Divider orientation="left">进度信息</Divider>
          {!isEdit && (
            <div style={{
              marginBottom: 16,
              padding: '12px',
              background: '#f6f8fa',
              border: '1px solid #e1e4e8',
              borderRadius: '6px',
              color: '#666'
            }}>
              <div style={{ marginBottom: '8px', fontWeight: 500 }}>📋 进度计划说明</div>
              <div>• 选择预计放款日期后，系统将自动计算各进度的计划完成日期</div>
              <div>• 自动计算后，您还可以手动调整各进度的具体日期</div>
              <div>• 所有进度的计划完成日期不能晚于预计放款日期</div>
            </div>
          )}

          {/* 显示进度点和日期选择控件 */}
          <Row gutter={24}>
            {progresses.map((progress, index) => {
              const isCompleted = isEdit && reserveDetail?.progresses?.find(
                (p: any) => p.progressName === progress.progressName && p.actualDate
              );
              const expectedDate = form.getFieldValue('expectedDisbursementDate');
              const hasExpectedDate = !!expectedDate;

              // 获取对应的进度步骤信息
              const progressStep = progressSteps?.find(
                (step: FinReserveProgressStep) => step.name === progress.progressName
              );
              const gap = progressStep?.gap || 0;

              // 生成标签显示
              const getProgressLabel = () => {
                if (!isEdit && !hasExpectedDate && gap !== 0) {
                  const timeDesc = gap > 0
                    ? `放款后 ${gap} 个月`
                    : `放款前 ${Math.abs(gap)} 个月`;
                  return (
                    <span>
                      {progress.progressName}
                      <span style={{ color: '#666', fontSize: '12px', marginLeft: '8px' }}>
                        ({timeDesc})
                      </span>
                    </span>
                  );
                }
                return progress.progressName;
              };

              return (
                <Col span={12} key={index}>
                  <Form.Item
                    label={getProgressLabel()}
                    rules={[{ required: true, message: '请选择计划完成日期' }]}
                    extra={
                      isCompleted
                        ? `已完成：${dayjs(isCompleted.actualDate).format('YYYY-MM-DD')}`
                        : (!isEdit && !hasExpectedDate)
                        ? "等待选择预计放款日期后自动计算"
                        : undefined
                    }
                  >
                    <DatePicker
                      style={{
                        width: '100%',
                        ...((!isEdit && !hasExpectedDate) ? { opacity: 0.7 } : {})
                      }}
                      placeholder={hasExpectedDate ? "请选择计划完成日期" : "请先选择预计放款日期"}
                      value={progress.planDate ? dayjs(progress.planDate) : undefined}
                      onChange={(date) => handleProgressDateChange(index, date)}
                      disabled={!!isCompleted || (!isEdit && !hasExpectedDate)}
                      disabledDate={(current) => {
                        return expectedDate && current && current.isAfter(expectedDate);
                      }}
                    />
                  </Form.Item>
                </Col>
              );
            })}
          </Row>

          {/* 加载状态 */}
          {progressStepsLoading && (
            <div style={{ textAlign: 'center', color: '#1890ff', padding: '20px' }}>
              正在加载进度步骤...
            </div>
          )}

          {progressStepsError && (
            <div style={{ textAlign: 'center', color: '#f5222d', padding: '20px' }}>
              加载进度步骤失败: {progressStepsError.message}
            </div>
          )}

          {!progressStepsLoading && !progressStepsError && progresses.length === 0 && (
            <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
              正在初始化进度信息...
            </div>
          )}

          {/* 操作按钮 */}
          <Row>
            <Col span={24} style={{ textAlign: 'center' }}>
              <Space size="large">
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSubmit}
                  loading={createMutation.isPending || updateMutation.isPending}
                >
                  {isEdit ? '保存' : '提交'}
                </Button>
                <Button onClick={() => navigate('/financing/reserve')}>
                  取消
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 成本明细弹窗 */}
      <Modal
        title={editingCost ? '编辑成本明细' : '添加成本明细'}
        open={showCostModal}
        onOk={handleCostSubmit}
        onCancel={() => {
          setShowCostModal(false);
          costForm.resetFields();
          setEditingCost(null);
          setCostType('');
        }}
      >
        <Form
          form={costForm}
          layout="vertical"
        >
          <Form.Item
            name="costType"
            label="成本类型"
            rules={[{ required: true, message: '请选择成本类型' }]}
          >
            <Select
              placeholder="请选择成本类型"
              onChange={(value) => setCostType(value)}
            >
              {costTypeDict?.data?.map((item: any) => (
                <Option key={item.id} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {costType === '其他' && (
            <Form.Item
              name="costTypeCustom"
              label="自定义成本类型"
              rules={[{ required: true, message: '请输入成本类型' }]}
            >
              <Input placeholder="请输入成本类型" />
            </Form.Item>
          )}
          <Form.Item
            name="costDescription"
            label="成本描述"
            rules={[{ required: true, message: '请输入成本描述' }]}
          >
            <TextArea
              rows={4}
              placeholder="请输入成本描述，可输入任何内容"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ReserveForm;