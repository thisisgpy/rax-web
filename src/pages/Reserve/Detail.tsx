import React, { useEffect, useState } from 'react';
import {
  Card,
  Descriptions,
  Table,
  Timeline,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  DatePicker,
  App,
  Divider,
  Row,
  Col,
  Progress,
  Alert
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  SyncOutlined,
  PlusOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { reserveApi } from '@/services/reserve';
import { ReserveStatus } from '@/types/reserve';
import { dictApi } from '@/services/dict';
import type {
  FinReserveDto,
  FinReserveProgressDto,
  FinReserveReportDto,
  UpdateReserveProgressDto,
  CreateReserveReportDto,
  CancelReserveDto,
  UploadedAttachmentDto
} from '@/types/swagger-api';
import AmountDisplay from '@/components/AmountDisplay';
import AttachmentDisplay from '@/components/AttachmentDisplay';
import RaxUpload from '@/components/RaxUpload';

const { TextArea } = Input;

// 状态映射
const STATUS_MAP: Record<string, { text: string; color: string }> = {
  '0': { text: '待放款', color: 'processing' },
  '1': { text: '已放款', color: 'success' },
  '2': { text: '已取消', color: 'default' }
};

const ReserveDetail: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action');

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedProgress, setSelectedProgress] = useState<FinReserveProgressDto | null>(null);
  const [progressForm] = Form.useForm();
  const [reportForm] = Form.useForm();
  const [cancelForm] = Form.useForm();
  const [cancelAttachments, setCancelAttachments] = useState<UploadedAttachmentDto[]>([]);
  const [reportAttachments, setReportAttachments] = useState<UploadedAttachmentDto[]>([]);

  // 获取储备融资详情
  const { data: reserveDetail, refetch } = useQuery({
    queryKey: ['reserve', 'detail', id],
    queryFn: async () => {
      const result = await reserveApi.get(Number(id));
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || '获取详情失败');
    }
  });


  // 获取融资方式字典
  const { data: fundingModeDict } = useQuery({
    queryKey: ['dict', 'funding.mode'],
    queryFn: () => dictApi.getItemTreeByCode('funding.mode')
  });

  // 获取成本类型字典
  const { data: costTypeDict } = useQuery({
    queryKey: ['dict', 'cost.type'],
    queryFn: () => dictApi.getItemTreeByCode('cost.type')
  });

  // 从详情数据中提取进度和报告列表
  const progressList = reserveDetail?.progresses;
  const reportList = reserveDetail?.reports;

  // 更新进度
  const updateProgressMutation = useMutation({
    mutationFn: (data: UpdateReserveProgressDto) => reserveApi.updateProgress(data),
    onSuccess: () => {
      message.success('进度更新成功');
      refetch();
      progressForm.resetFields();
    },
    onError: (error: any) => {
      message.error(error.message || '进度更新失败');
    }
  });

  // 创建报告
  const createReportMutation = useMutation({
    mutationFn: (data: CreateReserveReportDto) => reserveApi.createReport(data),
    onSuccess: () => {
      message.success('报告创建成功');
      refetch();
      setReportModalVisible(false);
      reportForm.resetFields();
      setReportAttachments([]);
    },
    onError: (error: any) => {
      message.error(error.message || '报告创建失败');
    }
  });

  // 删除报告
  const deleteReportMutation = useMutation({
    mutationFn: (reportId: number) => reserveApi.removeReport(reportId),
    onSuccess: () => {
      message.success('报告删除成功');
      refetch();
    },
    onError: (error: any) => {
      message.error(error.message || '报告删除失败');
    }
  });

  // 取消储备融资
  const cancelMutation = useMutation({
    mutationFn: (data: CancelReserveDto) => reserveApi.cancel(data),
    onSuccess: () => {
      message.success('储备融资已取消');
      setCancelModalVisible(false);
      cancelForm.resetFields();
      setCancelAttachments([]);
      refetch();
    },
    onError: (error: any) => {
      message.error(error.message || '取消失败');
    }
  });

  // 处理页面初始化时的action参数
  useEffect(() => {
    if (action === 'cancel') {
      setCancelModalVisible(true);
    }
  }, [action]);


  // 处理更新进度
  const handleUpdateProgress = (progress: FinReserveProgressDto) => {
    // 检查是否可以更新
    const canUpdate = !progress.actualDate;
    const index = progressList?.findIndex(p => p.id === progress.id) || 0;
    const prevProgress = index > 0 ? progressList![index - 1] : null;
    const isPrevCompleted = !prevProgress || prevProgress.actualDate;

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

  // 提交报告
  const handleReportSubmit = () => {
    reportForm.validateFields().then(values => {
      createReportMutation.mutate({
        reserveId: Number(id),
        reportContent: values.reportContent,
        uploadedAttachments: reportAttachments
      });
    });
  };

  // 提交取消
  const handleCancelSubmit = () => {
    cancelForm.validateFields().then(values => {
      cancelMutation.mutate({
        id: Number(id),
        cancelReport: {
          reserveId: Number(id),
          reportContent: values.cancelReason,
          uploadedAttachments: cancelAttachments
        }
      });
    });
  };

  // 删除报告
  const handleDeleteReport = (reportId: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该报告吗？',
      onOk: () => {
        deleteReportMutation.mutate(reportId);
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

  // 成本明细表格列
  const costColumns = [
    {
      title: '成本类型',
      dataIndex: 'costType',
      key: 'costType',
      render: (value: string) => {
        const item = costTypeDict?.data?.find((d: any) => d.value === value);
        return item?.label || value;
      }
    },
    {
      title: '成本描述',
      dataIndex: 'costDescription',
      key: 'costDescription'
    }
  ];

  const isCompleted = reserveDetail?.status === ReserveStatus.LOANED || reserveDetail?.status === ReserveStatus.CANCELLED;

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

        {reserveDetail?.status !== ReserveStatus.CANCELLED && reserveDetail?.status !== ReserveStatus.LOANED && (
          <Space style={{ float: 'right' }}>
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/financing/reserve/edit/${id}`)}
            >
              编辑
            </Button>
          </Space>
        )}

        {/* 基础信息 */}
        <Divider orientation="left">基础信息</Divider>
        <Descriptions bordered column={3}>
          <Descriptions.Item label="融资主体">{reserveDetail?.orgName}</Descriptions.Item>
          <Descriptions.Item label="金融机构">
            {reserveDetail?.financialInstitutionBranchName}
          </Descriptions.Item>
          <Descriptions.Item label="融资方式">
            {fundingModeDict?.data?.find((d: any) => d.value === reserveDetail?.fundingMode)?.label || reserveDetail?.fundingMode}
          </Descriptions.Item>
          <Descriptions.Item label="融资金额">
            <AmountDisplay value={reserveDetail?.fundingAmount} />
          </Descriptions.Item>
          <Descriptions.Item label="预计放款日期">
            {reserveDetail?.expectedDisbursementDate ? dayjs(reserveDetail.expectedDisbursementDate).format('YYYY-MM-DD') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="续贷">
            {reserveDetail?.loanRenewalFromId === 0 ? '非续贷' : '查看'}
          </Descriptions.Item>
          <Descriptions.Item label="牵头领导">{reserveDetail?.leaderName}</Descriptions.Item>
          <Descriptions.Item label="经办人">{reserveDetail?.handlerName}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={STATUS_MAP[reserveDetail?.status || '0']?.color}>
              {STATUS_MAP[reserveDetail?.status || '0']?.text}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        {/* 成本信息 */}
        <Divider orientation="left">成本信息</Divider>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="综合成本率">
            {reserveDetail?.combinedRatio ? `${(reserveDetail.combinedRatio * 100).toFixed(2)}%` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="额外成本">
            <AmountDisplay value={reserveDetail?.additionalCosts} />
          </Descriptions.Item>
        </Descriptions>

        {reserveDetail?.costs && reserveDetail.costs.length > 0 && (
          <Table
            style={{ marginTop: 16 }}
            columns={costColumns}
            dataSource={reserveDetail.costs}
            rowKey="id"
            pagination={false}
            size="small"
          />
        )}

        {/* 进度信息 */}
        <Divider orientation="left">进度信息</Divider>
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
                        onClick={() => handleUpdateProgress(record)}
                        disabled={reserveDetail?.status === ReserveStatus.CANCELLED || reserveDetail?.status === ReserveStatus.LOANED}
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
            dataSource={progressList}
            rowKey="id"
            pagination={false}
          />
        </Form>

        {/* 进度报告 */}
        <Divider orientation="left">
          进度报告
          {reserveDetail?.status !== ReserveStatus.CANCELLED && (
            <Button
              type="link"
              icon={<PlusOutlined />}
              onClick={() => setReportModalVisible(true)}
              style={{ marginLeft: 16 }}
            >
              新增报告
            </Button>
          )}
        </Divider>
        <Timeline
          items={reportList?.map((report: FinReserveReportDto) => ({
            key: report.id,
            children: (
              <div>
                <div style={{ marginBottom: 8 }}>
                  <Space>
                    <span>{dayjs(report.createTime).format('YYYY-MM-DD HH:mm:ss')}</span>
                    <span>{report.createBy}</span>
                    {reserveDetail?.status === ReserveStatus.WAITING_FOR_LOAN && (
                      <Button
                        type="link"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteReport(report.id!)}
                      >
                        删除
                      </Button>
                    )}
                  </Space>
                </div>
                <div style={{ marginBottom: 8 }}>{report.reportContent}</div>
                {report.attachments && report.attachments.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <AttachmentDisplay
                      attachments={report.attachments}
                      disableDelete={true}
                      showDownload={true}
                      size="small"
                    />
                  </div>
                )}
              </div>
            )
          })) || []}
        />

        {reserveDetail?.status === ReserveStatus.WAITING_FOR_LOAN && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Button
              type="primary"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => setCancelModalVisible(true)}
            >
              取消储备融资
            </Button>
          </div>
        )}
      </Card>


      {/* 新增报告弹窗 */}
      <Modal
        title="新增进度报告"
        open={reportModalVisible}
        onOk={handleReportSubmit}
        onCancel={() => {
          setReportModalVisible(false);
          reportForm.resetFields();
          setReportAttachments([]);
        }}
        confirmLoading={createReportMutation.isPending}
      >
        <Form form={reportForm} layout="vertical">
          <Form.Item
            name="reportContent"
            label="报告内容"
            rules={[{ required: true, message: '请输入报告内容' }]}
          >
            <TextArea rows={4} placeholder="请输入报告内容" />
          </Form.Item>
          <Form.Item label="附件">
            <RaxUpload
              bizModule="ReserveReport"
              value={reportAttachments}
              onChange={setReportAttachments}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 取消储备融资弹窗 */}
      <Modal
        title="取消储备融资"
        open={cancelModalVisible}
        onOk={handleCancelSubmit}
        onCancel={() => {
          setCancelModalVisible(false);
          cancelForm.resetFields();
          setCancelAttachments([]);
        }}
        confirmLoading={cancelMutation.isPending}
      >
        <Alert
          message="取消操作不可恢复，请谨慎操作"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form form={cancelForm} layout="vertical">
          <Form.Item
            name="cancelReason"
            label="取消原因"
            rules={[{ required: true, message: '请输入取消原因' }]}
          >
            <TextArea rows={4} placeholder="请输入取消原因" />
          </Form.Item>
          <Form.Item label="附件">
            <RaxUpload
              bizModule="ReserveReport"
              value={cancelAttachments}
              onChange={setCancelAttachments}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ReserveDetail;