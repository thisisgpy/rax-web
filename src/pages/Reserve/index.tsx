import React, { useState } from 'react';
import {
  Button,
  Table,
  Space,
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  App,
  Modal,
  Tooltip,
  Tag,
  Dropdown,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  SyncOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ReserveStatus, ReserveStatusText, ReserveStatusColor } from '@/types/reserve';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { reserveApi } from '@/services/reserve';
import { dictApi } from '@/services/dict';
import type { FinReserveDto, QueryReserveDto, FinReserveProgressDto, UpdateReserveProgressDto } from '@/types/swagger-api';
import OrgSelect from '@/components/OrgSelect';
import DictSelect from '@/components/DictSelect';
import AmountDisplay from '@/components/AmountDisplay';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 状态标签颜色映射（Ant Design Tag 颜色）
const STATUS_TAG_COLOR_MAP: Record<ReserveStatus, string> = {
  [ReserveStatus.WAITING_FOR_LOAN]: 'processing',
  [ReserveStatus.LOANED]: 'success',
  [ReserveStatus.CANCELLED]: 'default'
};

// 金融机构类型映射
const INSTITUTION_TYPE_MAP: Record<string, string> = {
  '1': '银行',
  '2': '非银行金融机构'
};

const Reserve: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [progressForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showQuickJumper: true,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50'],
    showTotal: (total: number, range: [number, number]) =>
      `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
  });
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [selectedReserve, setSelectedReserve] = useState<FinReserveDto | null>(null);
  const [selectedProgress, setSelectedProgress] = useState<FinReserveProgressDto | null>(null);

  // 获取数据字典
  const { data: fundingModeDict } = useQuery({
    queryKey: ['dict', 'funding.mode'],
    queryFn: () => dictApi.getItemTreeByCode('funding.mode')
  });

  // 查询储备融资列表
  const { data: reserveData, isLoading, refetch } = useQuery({
    queryKey: ['reserve', 'page', pagination.current, pagination.pageSize],
    queryFn: async () => {
      const values = form.getFieldsValue();
      const params: QueryReserveDto = {
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
        ...values
      };

      // 处理日期范围
      if (values.expectedDisbursementDateRange) {
        params.expectedDisbursementDateStart = values.expectedDisbursementDateRange[0]?.format('YYYY-MM-DD');
        params.expectedDisbursementDateEnd = values.expectedDisbursementDateRange[1]?.format('YYYY-MM-DD');
        delete (params as any).expectedDisbursementDateRange;
      }

      const result = await reserveApi.page(params);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || '查询失败');
    }
  });

  // 删除储备融资
  const deleteMutation = useMutation({
    mutationFn: (id: number) => reserveApi.remove(id),
    onSuccess: () => {
      message.success('删除成功');
      refetch();
    }
  });

  // 获取储备融资详情（用于进度更新）
  const { data: reserveDetail, refetch: refetchDetail } = useQuery({
    queryKey: ['reserve', 'detail', selectedReserve?.id],
    queryFn: async () => {
      if (!selectedReserve?.id) return null;
      const result = await reserveApi.get(selectedReserve.id);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || '获取详情失败');
    },
    enabled: !!selectedReserve?.id && progressModalVisible
  });

  // 更新进度
  const updateProgressMutation = useMutation({
    mutationFn: (data: UpdateReserveProgressDto) => reserveApi.updateProgress(data),
    onSuccess: () => {
      message.success('进度更新成功');
      refetchDetail();
      refetch();
      progressForm.resetFields();
      setSelectedProgress(null);
    }
  });


  // 处理搜索
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    setTimeout(() => refetch(), 0);
  };

  // 处理重置
  const handleReset = () => {
    form.resetFields();
    setPagination({ ...pagination, current: 1 });
    setTimeout(() => refetch(), 0);
  };

  // 处理更新进度
  const handleUpdateProgress = (record: FinReserveDto) => {
    setSelectedReserve(record);
    setProgressModalVisible(true);
  };

  // 处理具体进度更新
  const handleProgressUpdate = (progress: FinReserveProgressDto) => {
    const progressList = reserveDetail?.progresses || [];
    const index = progressList.findIndex(p => p.id === progress.id);
    const prevProgress = index > 0 ? progressList[index - 1] : null;
    const isPrevCompleted = !prevProgress || prevProgress.actualDate;
    const canUpdate = !progress.actualDate;

    if (!canUpdate) {
      message.warning('该进度已完成，不能修改');
      return;
    }

    if (!isPrevCompleted) {
      message.warning('请先完成前一个进度');
      return;
    }

    setSelectedProgress(progress);
  };

  // 提交进度更新
  const handleProgressSubmit = () => {
    if (!selectedProgress) return;

    progressForm.validateFields().then(values => {
      const actualDate = values.actualDate.format('YYYY-MM-DD');
      const planDate = dayjs(selectedProgress.planDate);
      const actualDateObj = dayjs(actualDate);
      const daysDiff = actualDateObj.diff(planDate, 'day');

      const confirmUpdate = () => {
        updateProgressMutation.mutate({
          id: selectedProgress.id!,
          actualDate
        });
      };

      if (daysDiff > 0) {
        Modal.confirm({
          title: '进度延期提醒',
          content: `该进度已延期 ${daysDiff} 天，是否确认提交？`,
          onOk: confirmUpdate
        });
      } else {
        confirmUpdate();
      }
    });
  };

  // 计算进度状态
  const getProgressStatus = (progress: FinReserveProgressDto) => {
    if (!progress.actualDate) {
      return { text: '未完成', color: 'default', icon: <ClockCircleOutlined /> };
    }

    const planDate = dayjs(progress.planDate);
    const actualDate = dayjs(progress.actualDate);
    const daysDiff = actualDate.diff(planDate, 'day');

    if (daysDiff < 0) {
      return {
        text: `提前 ${Math.abs(daysDiff)} 天`,
        color: 'success',
        icon: <CheckCircleOutlined />
      };
    } else if (daysDiff > 0) {
      return {
        text: `延期 ${daysDiff} 天`,
        color: 'error',
        icon: <ExclamationCircleOutlined />
      };
    } else {
      return {
        text: '按期完成',
        color: 'success',
        icon: <CheckCircleOutlined />
      };
    }
  };

  // 表格列定义
  const columns: ColumnsType<FinReserveDto> = [
    {
      title: '融资主体',
      dataIndex: 'orgNameAbbr',
      key: 'orgNameAbbr',
      width: 150,
      render: (text, record) => (
        <Tooltip title={record.orgName}>
          {text}
        </Tooltip>
      )
    },
    {
      title: '金融机构',
      dataIndex: 'financialInstitutionBranchName',
      key: 'financialInstitutionBranchName',
      width: 200,
      ellipsis: true
    },
    {
      title: '融资方式',
      dataIndex: 'fundingMode',
      key: 'fundingMode',
      width: 120,
      render: (value) => {
        const item = fundingModeDict?.data?.find((d: any) => d.value === value);
        return item?.label || value;
      }
    },
    {
      title: '融资金额',
      dataIndex: 'fundingAmount',
      key: 'fundingAmount',
      width: 150,
      render: (value) => <AmountDisplay value={value} />
    },
    {
      title: '预计放款日期',
      dataIndex: 'expectedDisbursementDate',
      key: 'expectedDisbursementDate',
      width: 120,
      render: (value) => value ? dayjs(value).format('YYYY-MM-DD') : '-'
    },
    {
      title: '续贷',
      dataIndex: 'loanRenewalFromId',
      key: 'loanRenewalFromId',
      width: 80,
      render: (value) => {
        if (value === 0) {
          return '非续贷';
        }
        return '查看';
      }
    },
    {
      title: '经办人',
      dataIndex: 'handlerName',
      key: 'handlerName',
      width: 100
    },
    {
      title: '综合成本率',
      dataIndex: 'combinedRatio',
      key: 'combinedRatio',
      width: 100,
      render: (value) => value ? `${(value * 100).toFixed(2)}%` : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (value: ReserveStatus) => {
        const text = ReserveStatusText[value];
        const color = STATUS_TAG_COLOR_MAP[value];
        return text ? (
          <Tag color={color}>{text}</Tag>
        ) : value;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (value) => value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    {
      title: '创建人',
      dataIndex: 'createBy',
      key: 'createBy',
      width: 100
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 80,
      render: (_, record) => {
        const isCompleted = record.status === ReserveStatus.LOANED || record.status === ReserveStatus.CANCELLED;
        const isWaitingForLoan = record.status === ReserveStatus.WAITING_FOR_LOAN;

        const getMenuItems = (record: FinReserveDto): MenuProps['items'] => {
          const items: MenuProps['items'] = [];

          // 查看详情 - 始终显示
          items.push({
            key: 'view',
            label: '查看详情',
            icon: <EyeOutlined />,
            onClick: () => navigate(`/financing/reserve/detail/${record.id}`)
          });

          // 如果未完成，显示编辑和更新进度
          if (!isCompleted) {
            items.push(
              {
                key: 'edit',
                label: '编辑',
                icon: <EditOutlined />,
                onClick: () => navigate(`/financing/reserve/edit/${record.id}`)
              },
              {
                key: 'progress',
                label: '更新进度',
                icon: <SyncOutlined />,
                onClick: () => handleUpdateProgress(record)
              }
            );

            // 如果是待放款状态，显示危险操作
            if (isWaitingForLoan) {
              items.push(
                {
                  type: 'divider'
                },
                {
                  key: 'delete',
                  label: (
                    <Popconfirm
                      title="确认删除"
                      description="确定要删除该储备融资记录吗？"
                      onConfirm={() => deleteMutation.mutate(record.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      删除
                    </Popconfirm>
                  ),
                  icon: <DeleteOutlined />,
                  danger: true
                },
                {
                  key: 'cancel',
                  label: '取消',
                  icon: <CloseCircleOutlined />,
                  danger: true,
                  onClick: () => navigate(`/financing/reserve/detail/${record.id}?action=cancel`)
                }
              );
            }
          }

          return items;
        };

        return (
          <Dropdown
            menu={{ items: getMenuItems(record) }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              size="small"
              icon={<SettingOutlined />}
              onClick={(e) => e.preventDefault()}
            />
          </Dropdown>
        );
      }
    }
  ];

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        style={{ marginBottom: 16 }}
        onFinish={handleSearch}
        preserve={false}
      >
        <Row gutter={[16, 16]} style={{ width: '100%' }}>
          <Col span={6}>
            <Form.Item name="orgId" label="融资主体" style={{ marginBottom: 16 }}>
              <OrgSelect
                placeholder="请选择融资主体"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="institutionType" label="金融机构类型" style={{ marginBottom: 16 }}>
              <Select placeholder="请选择" allowClear style={{ width: '100%' }}>
                <Option value="1">银行</Option>
                <Option value="2">非银行金融机构</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="financialInstitutionName" label="金融机构名称" style={{ marginBottom: 16 }}>
              <Input placeholder="请输入关键字" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="financialInstitutionBranchName" label="分支机构名称" style={{ marginBottom: 16 }}>
              <Input placeholder="请输入关键字" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ width: '100%' }}>
          <Col span={6}>
            <Form.Item name="fundingMode" label="融资方式" style={{ marginBottom: 16 }}>
              <DictSelect
                dictCode="funding.mode"
                placeholder="请选择"
                allowClear
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="expectedDisbursementDateRange" label="预计放款日期" style={{ marginBottom: 16 }}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['开始日期', '结束日期']}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="isRenewal" label="是否续贷" style={{ marginBottom: 16 }}>
              <Select placeholder="请选择" allowClear style={{ width: '100%' }}>
                <Option value={true}>是</Option>
                <Option value={false}>否</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="leaderName" label="牵头领导" style={{ marginBottom: 16 }}>
              <Input placeholder="请输入姓名" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ width: '100%' }}>
          <Col span={6}>
            <Form.Item name="handlerName" label="经办人" style={{ marginBottom: 16 }}>
              <Input placeholder="请输入姓名" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="status" label="状态" style={{ marginBottom: 16 }}>
              <Select placeholder="请选择" allowClear style={{ width: '100%' }}>
                <Option value={ReserveStatus.WAITING_FOR_LOAN}>{ReserveStatusText[ReserveStatus.WAITING_FOR_LOAN]}</Option>
                <Option value={ReserveStatus.LOANED}>{ReserveStatusText[ReserveStatus.LOANED]}</Option>
                <Option value={ReserveStatus.CANCELLED}>{ReserveStatusText[ReserveStatus.CANCELLED]}</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12} style={{ textAlign: 'right', display: 'flex', alignItems: 'end', justifyContent: 'flex-end', paddingBottom: 16 }}>
            <Space>
              <Button onClick={handleReset}>重置</Button>
              <Button type="primary" onClick={handleSearch}>查询</Button>
            </Space>
          </Col>
        </Row>
      </Form>

      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/financing/reserve/create')}
        >
          新增储备融资
        </Button>
      </div>

      <Table
        loading={isLoading}
        columns={columns}
        dataSource={reserveData?.rows}
        rowKey="id"
        pagination={{
          ...pagination,
          total: reserveData?.totalCount || 0,
          onChange: (page, pageSize) => {
            setPagination({
              ...pagination,
              current: page,
              pageSize: pageSize || pagination.pageSize
            });
          }
        }}
        scroll={{ x: 1800 }}
      />

      {/* 更新进度弹窗 */}
      <Modal
        title={`更新进度 - ${selectedReserve?.orgName || ''}`}
        open={progressModalVisible}
        onCancel={() => {
          setProgressModalVisible(false);
          setSelectedReserve(null);
          setSelectedProgress(null);
          progressForm.resetFields();
        }}
        footer={null}
        width="70%"
        maskClosable={false}
      >
        <Form form={progressForm}>
          <Table
            columns={[
              {
                title: '进度名称',
                dataIndex: 'progressName',
                key: 'progressName'
              },
              {
                title: '计划完成日期',
                dataIndex: 'planDate',
                key: 'planDate',
                render: (value) => value ? dayjs(value).format('YYYY-MM-DD') : '-'
              },
              {
                title: '实际完成日期',
                dataIndex: 'actualDate',
                key: 'actualDate',
                render: (value, record) => {
                  if (!value && selectedProgress?.id === record.id) {
                    return (
                      <div>
                        <Form.Item
                          name="actualDate"
                          rules={[{ required: true, message: '请选择实际完成日期' }]}
                          style={{ marginBottom: 8 }}
                        >
                          <DatePicker
                            placeholder="请选择实际完成日期"
                            disabledDate={(current) => current && current.isAfter(dayjs())}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                        <Space>
                          <Button
                            type="primary"
                            size="small"
                            onClick={handleProgressSubmit}
                            loading={updateProgressMutation.isPending}
                          >
                            保存
                          </Button>
                          <Button
                            size="small"
                            onClick={() => {
                              setSelectedProgress(null);
                              progressForm.resetFields();
                            }}
                          >
                            取消
                          </Button>
                        </Space>
                      </div>
                    );
                  }
                  if (!value) {
                    return (
                      <Button
                        type="link"
                        size="small"
                        onClick={() => handleProgressUpdate(record)}
                      >
                        填写
                      </Button>
                    );
                  }
                  return dayjs(value).format('YYYY-MM-DD');
                }
              },
              {
                title: '状态',
                key: 'status',
                render: (_, record) => {
                  const status = getProgressStatus(record);
                  return (
                    <Tag color={status.color} icon={status.icon}>
                      {status.text}
                    </Tag>
                  );
                }
              }
            ]}
            dataSource={reserveDetail?.progresses || []}
            rowKey="id"
            pagination={false}
            loading={!reserveDetail && progressModalVisible}
          />
        </Form>
      </Modal>
    </Card>
  );
};

export default Reserve;