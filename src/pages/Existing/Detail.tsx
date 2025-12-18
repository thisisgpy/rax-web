import React, { useState } from 'react';
import {
  Card,
  Descriptions,
  Table,
  Button,
  Space,
  Tag,
  Divider,
  Tooltip,
  Modal,
  Form,
  InputNumber,
  Input,
  App,
  Dropdown,
  Row,
  Col,
  Typography
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  PaperClipOutlined,
  DeleteOutlined,
  PlusOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { loanApi } from '@/services/loan';
import { dictApi } from '@/services/dict';
import { participantApi } from '@/services/participant';
import { fixedAssetMapApi } from '@/services/fixedAssetMap';
import type {
  LoanDto,
  FinLoanParticipantDto,
  UpdateLoanParticipantDto,
  CreateLoanParticipantDto,
  AttachmentOperationDto,
  FinInstitutionDto,
  FixedAssetMapDto
} from '@/types/swagger-api';
import FixedAssetMapEditModal from './components/FixedAssetMapEditModal';
import FixedAssetMapList from './components/FixedAssetMapList';
import InstitutionSelect from '@/components/InstitutionSelect';
import DictSelect from '@/components/DictSelect';
import RaxUpload from '@/components/RaxUpload';
import type { UploadedFile } from '@/components/RaxUpload';
import AmountDisplay from '@/components/AmountDisplay';
import AttachmentDisplay from '@/components/AttachmentDisplay';
import { attachmentApi } from '@/services/attachment';

// 融资类型与特定组件的映射（productType -> 组件类型）
const PRODUCT_TYPE_COMPONENT_MAP: Record<string, string> = {
  '银团融资': 'participant',
  '信用证': 'lc',
  '存单质押': 'cd',
  '信托公司融资': 'tranche',
  '保理公司融资': 'factoring',
  '供应链金融平台融资': 'scf',
  '融资租赁公司融资': 'leasing',
  '固定资产融资': 'fixedAsset',
};

// 紧凑型附件渲染函数
const renderCompactAttachments = (attachments: any[]) => {
  if (!attachments || attachments.length === 0) return '-';

  const handleDownload = async (att: any) => {
    try {
      const result = await attachmentApi.getDownloadUrl(att.id);
      if (result.success && result.data) {
        window.open(result.data, '_blank');
      }
    } catch (error) {
      console.error('下载失败', error);
    }
  };

  return (
    <Space direction="vertical" size={2}>
      {attachments.map((att: any) => (
        <Tooltip key={att.id} title={`${att.originalName} (${(att.fileSize / 1024).toFixed(1)} KB)`}>
          <a
            onClick={() => handleDownload(att)}
            style={{ cursor: 'pointer', fontSize: 12 }}
          >
            <PaperClipOutlined style={{ marginRight: 4 }} />
            {att.originalName?.length > 15 ? att.originalName.substring(0, 15) + '...' : att.originalName}
          </a>
        </Tooltip>
      ))}
    </Space>
  );
};

const ExistingDetail: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();

  // 银团参与行编辑相关状态
  const [participantModalVisible, setParticipantModalVisible] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<FinLoanParticipantDto | null>(null);
  const [participantForm] = Form.useForm();
  const [participantFiles, setParticipantFiles] = useState<UploadedFile[]>([]);
  // 附件查看弹窗状态
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
  const [viewingAttachments, setViewingAttachments] = useState<any[]>([]);

  // 固定资产关联编辑相关状态
  const [fixedAssetMapModalVisible, setFixedAssetMapModalVisible] = useState(false);
  const [editingFixedAssetMap, setEditingFixedAssetMap] = useState<FixedAssetMapDto | null>(null);

  // 获取融资详情
  const { data: loanDetail, isLoading } = useQuery({
    queryKey: ['loan', 'detail', id],
    queryFn: async () => {
      const result = await loanApi.get(Number(id));
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || '获取详情失败');
    }
  });

  // 获取数据字典
  const { data: productTypeDict } = useQuery({
    queryKey: ['dict', 'fin.product'],
    queryFn: () => dictApi.getItemTreeByCode('fin.product'),
    staleTime: 5 * 60 * 1000
  });

  const { data: rateModeDict } = useQuery({
    queryKey: ['dict', 'rate.mode'],
    queryFn: () => dictApi.getItemTreeByCode('rate.mode'),
    staleTime: 5 * 60 * 1000
  });

  const { data: repayMethodDict } = useQuery({
    queryKey: ['dict', 'repay.method'],
    queryFn: () => dictApi.getItemTreeByCode('repay.method'),
    staleTime: 5 * 60 * 1000
  });

  const { data: loanStatusDict } = useQuery({
    queryKey: ['dict', 'loan.status'],
    queryFn: () => dictApi.getItemTreeByCode('loan.status'),
    staleTime: 5 * 60 * 1000
  });

  const { data: currencyDict } = useQuery({
    queryKey: ['dict', 'sys.currency'],
    queryFn: () => dictApi.getItemTreeByCode('sys.currency'),
    staleTime: 5 * 60 * 1000
  });

  const { data: dayCountDict } = useQuery({
    queryKey: ['dict', 'day.count.convention'],
    queryFn: () => dictApi.getItemTreeByCode('day.count.convention'),
    staleTime: 5 * 60 * 1000
  });

  const { data: rateResetCycleDict } = useQuery({
    queryKey: ['dict', 'rate.reset.cycle'],
    queryFn: () => dictApi.getItemTreeByCode('rate.reset.cycle'),
    staleTime: 5 * 60 * 1000
  });

  // 获取字典项标签
  const getDictLabel = (dict: any, value: string): string => {
    if (!dict?.data || !value) return value || '-';

    const findLabel = (items: any[]): string => {
      for (const item of items) {
        if (item.value === value) return item.label;
        if (item.children?.length) {
          const found = findLabel(item.children);
          if (found !== value) return found;
        }
      }
      return value;
    };

    return findLabel(dict.data);
  };

  // 获取融资类型标签（productFamily + productType）
  const getProductTypeLabel = (detail: LoanDto): string => {
    if (!productTypeDict?.data) return detail.productType || '-';

    const findLabels = (items: any[], family: string, type: string): string => {
      for (const item of items) {
        if (item.value === family) {
          const familyLabel = item.label;
          if (item.children?.length) {
            const typeItem = item.children.find((c: any) => c.value === type);
            if (typeItem) {
              return `${familyLabel} - ${typeItem.label}`;
            }
          }
          return familyLabel;
        }
      }
      return type || '-';
    };

    return findLabels(productTypeDict.data, detail.productFamily, detail.productType);
  };

  // 获取状态标签颜色
  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      'ACTIVE': 'success',
      'PENDING': 'processing',
      'CLOSED': 'default',
      'OVERDUE': 'error'
    };
    return colorMap[status] || 'default';
  };

  // 刷新详情数据
  const refreshDetail = () => {
    queryClient.invalidateQueries({ queryKey: ['loan', 'detail', id] });
  };

  // 打开新增银团参与行弹窗
  const handleAddParticipant = () => {
    setEditingParticipant(null);
    participantForm.resetFields();
    setParticipantFiles([]);
    setParticipantModalVisible(true);
  };

  // 打开编辑银团参与行弹窗
  const handleEditParticipant = (record: FinLoanParticipantDto) => {
    setEditingParticipant(record);
    participantForm.setFieldsValue({
      ...record,
      commitAmount: record.commitAmount ? record.commitAmount / 1000000 : undefined,
      sharePct: record.sharePct ? record.sharePct * 100 : undefined
    });
    setParticipantFiles(
      (record.fileAttachments || []).map((att: any) => ({
        attachmentId: att.id || att.attachmentId,
        filename: att.originalName || '',
        fileSize: att.fileSize
      }))
    );
    setParticipantModalVisible(true);
  };

  // 删除银团参与行
  const handleDeleteParticipant = async (record: FinLoanParticipantDto) => {
    if (!record.id) return;
    try {
      const result = await participantApi.remove(record.id);
      if (result.success) {
        message.success('删除成功');
        refreshDetail();
      } else {
        message.error(result.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 处理机构选择
  const handleParticipantInstitutionChange = (_institutionId?: number, institution?: FinInstitutionDto) => {
    if (institution) {
      participantForm.setFieldsValue({
        institutionId: institution.id,
        institutionName: institution.branchName || institution.name
      });
    }
  };

  // 提交银团参与行弹窗
  const handleParticipantModalOk = async () => {
    try {
      const values = await participantForm.validateFields();

      if (editingParticipant?.id) {
        // 更新已有记录
        const originalFileIds = new Set(
          (editingParticipant.fileAttachments || []).map((f: any) => f.id || f.attachmentId)
        );
        const currentFileIds = new Set(participantFiles.map(f => f.attachmentId));
        const attachmentOperations: AttachmentOperationDto[] = [];

        // 新增和保留的附件
        participantFiles.forEach(f => {
          attachmentOperations.push({
            attachmentId: f.attachmentId,
            fileSize: f.fileSize,
            operation: originalFileIds.has(f.attachmentId) ? 'KEEP' : 'ADD'
          });
        });
        // 删除的附件
        (editingParticipant.fileAttachments || []).forEach((f: any) => {
          const fId = f.id || f.attachmentId;
          if (!currentFileIds.has(fId)) {
            attachmentOperations.push({ attachmentId: fId, fileSize: f.fileSize, operation: 'DELETE' });
          }
        });

        const updateData: UpdateLoanParticipantDto = {
          id: editingParticipant.id,
          role: values.role,
          institutionId: values.institutionId,
          institutionName: values.institutionName,
          commitAmount: values.commitAmount ? Math.round(values.commitAmount * 1000000) : undefined,
          sharePct: values.sharePct ? values.sharePct / 100 : undefined,
          remark: values.remark,
          attachmentOperations
        };
        const result = await participantApi.update(updateData);
        if (result.success) {
          message.success('更新成功');
          refreshDetail();
        } else {
          message.error(result.message || '更新失败');
          return;
        }
      } else {
        // 新增记录
        const createData: CreateLoanParticipantDto = {
          role: values.role,
          institutionId: values.institutionId,
          institutionName: values.institutionName,
          commitAmount: values.commitAmount ? Math.round(values.commitAmount * 1000000) : undefined,
          sharePct: values.sharePct ? values.sharePct / 100 : undefined,
          remark: values.remark,
          fileAttachments: participantFiles.map(f => ({
            attachmentId: f.attachmentId,
            fileSize: f.fileSize,
            operation: 'ADD' as const
          }))
        };
        const result = await participantApi.createBatch(Number(id), [createData]);
        if (result.success) {
          message.success('添加成功');
          refreshDetail();
        } else {
          message.error(result.message || '添加失败');
          return;
        }
      }

      setParticipantModalVisible(false);
      participantForm.resetFields();
      setParticipantFiles([]);
      setEditingParticipant(null);
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error('操作失败');
      }
    }
  };

  // 打开编辑固定资产关联弹窗
  const handleEditFixedAssetMap = (record: FixedAssetMapDto) => {
    setEditingFixedAssetMap(record);
    setFixedAssetMapModalVisible(true);
  };

  // 删除固定资产关联
  const handleDeleteFixedAssetMap = async (record: FixedAssetMapDto) => {
    if (!record.id) return;
    try {
      const result = await fixedAssetMapApi.remove(record.id);
      if (result.success) {
        message.success('删除成功');
        refreshDetail();
      } else {
        message.error(result.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 银团参与行表格列
  const participantColumns = [
    { title: '机构名称', dataIndex: 'institutionName', key: 'institutionName' },
    { title: '角色', dataIndex: 'role', key: 'role' },
    {
      title: '承诺额度',
      dataIndex: 'commitAmount',
      key: 'commitAmount',
      render: (value: number) => <AmountDisplay value={value} />
    },
    {
      title: '份额比例',
      dataIndex: 'sharePct',
      key: 'sharePct',
      render: (value: number) => value ? `${(value * 100).toFixed(2)}%` : '-'
    },
    { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: FinLoanParticipantDto) => {
        const items = [
          ...(record.fileAttachments && record.fileAttachments.length > 0 ? [{
            key: 'attachment',
            label: `附件(${record.fileAttachments.length})`,
            icon: <PaperClipOutlined />,
            onClick: () => {
              setViewingAttachments(record.fileAttachments || []);
              setAttachmentModalVisible(true);
            }
          }] : []),
          {
            key: 'edit',
            label: '编辑',
            icon: <EditOutlined />,
            onClick: () => handleEditParticipant(record)
          },
          {
            key: 'delete',
            label: '删除',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: '确定要删除吗？',
                okText: '确定',
                cancelText: '取消',
                onOk: () => handleDeleteParticipant(record)
              });
            }
          }
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<SettingOutlined />} />
          </Dropdown>
        );
      }
    }
  ];

  // 存单关联表格列
  const cdColumns = [
    { title: '存单编号', dataIndex: 'cdNo', key: 'cdNo' },
    { title: '开立银行', dataIndex: 'bankName', key: 'bankName' },
    {
      title: '本金',
      dataIndex: 'principalAmount',
      key: 'principalAmount',
      render: (value: number) => <AmountDisplay value={value} />
    },
    {
      title: '质押比例',
      dataIndex: 'pledgeRatio',
      key: 'pledgeRatio',
      render: (value: number) => value ? `${value}%` : '-'
    },
    {
      title: '认可价值',
      dataIndex: 'securedValue',
      key: 'securedValue',
      render: (value: number) => <AmountDisplay value={value} />
    },
    { title: '质押登记号', dataIndex: 'registrationNo', key: 'registrationNo' },
    {
      title: '到期日',
      dataIndex: 'maturityDate',
      key: 'maturityDate',
      render: (value: string) => value ? dayjs(value).format('YYYY-MM-DD') : '-'
    }
  ];

  // 信用证关联表格列
  const lcColumns = [
    { title: '信用证编号', dataIndex: 'lcNo', key: 'lcNo' },
    { title: '开证行', dataIndex: 'issuingBank', key: 'issuingBank' },
    {
      title: '信用证金额',
      dataIndex: 'lcAmount',
      key: 'lcAmount',
      render: (value: number) => <AmountDisplay value={value} />
    },
    {
      title: '认可金额',
      dataIndex: 'securedValue',
      key: 'securedValue',
      render: (value: number) => <AmountDisplay value={value} />
    },
    {
      title: '保证金冻结额',
      dataIndex: 'marginLockedAmount',
      key: 'marginLockedAmount',
      render: (value: number) => <AmountDisplay value={value} />
    },
    {
      title: '到期日',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (value: string) => value ? dayjs(value).format('YYYY-MM-DD') : '-'
    }
  ];

  // 保理应收款表格列
  const arColumns = [
    { title: '发票号', dataIndex: 'invoiceNo', key: 'invoiceNo' },
    { title: '债务人', dataIndex: 'debtorName', key: 'debtorName' },
    {
      title: '票面金额',
      dataIndex: 'arFaceAmount',
      key: 'arFaceAmount',
      render: (value: number) => <AmountDisplay value={value} />
    },
    {
      title: '转让金额',
      dataIndex: 'assignedAmount',
      key: 'assignedAmount',
      render: (value: number) => <AmountDisplay value={value} />
    },
    {
      title: '开具日期',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (value: string) => value ? dayjs(value).format('YYYY-MM-DD') : '-'
    },
    {
      title: '到期日',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (value: string) => value ? dayjs(value).format('YYYY-MM-DD') : '-'
    },
    {
      title: '是否回款',
      dataIndex: 'paidFlag',
      key: 'paidFlag',
      render: (value: boolean) => value ? '是' : '否'
    },
    {
      title: '附件',
      dataIndex: 'fileAttachments',
      key: 'fileAttachments',
      width: 180,
      render: renderCompactAttachments
    }
  ];

  // 融资租赁资产表格列
  const leasedAssetColumns = [
    { title: '资产名称', dataIndex: 'assetNameSnapshot', key: 'assetNameSnapshot' },
    { title: '资产编码', dataIndex: 'assetCodeSnapshot', key: 'assetCodeSnapshot' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '单位', dataIndex: 'unit', key: 'unit' },
    {
      title: '账面价值',
      dataIndex: 'bookValueAtLease',
      key: 'bookValueAtLease',
      render: (value: number) => <AmountDisplay value={value} />
    },
    {
      title: '评估价值',
      dataIndex: 'appraisedValueAtLease',
      key: 'appraisedValueAtLease',
      render: (value: number) => <AmountDisplay value={value} />
    },
    { title: '序列号', dataIndex: 'serialNo', key: 'serialNo' },
    {
      title: '附件',
      dataIndex: 'fileAttachments',
      key: 'fileAttachments',
      width: 180,
      render: renderCompactAttachments
    }
  ];

  // 供应链金融凭证表格列
  const scfColumns = [
    { title: '凭证编号', dataIndex: 'voucherNo', key: 'voucherNo' },
    { title: '凭证类型', dataIndex: 'voucherType', key: 'voucherType' },
    { title: '核心企业', dataIndex: 'coreCorpName', key: 'coreCorpName' },
    { title: '债务人', dataIndex: 'debtorName', key: 'debtorName' },
    {
      title: '底层金额',
      dataIndex: 'underlyingAmount',
      key: 'underlyingAmount',
      render: (value: number) => <AmountDisplay value={value} />
    },
    {
      title: '到期日',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (value: string) => value ? dayjs(value).format('YYYY-MM-DD') : '-'
    },
    {
      title: '附件',
      dataIndex: 'fileAttachments',
      key: 'fileAttachments',
      width: 180,
      render: renderCompactAttachments
    }
  ];

  // 信托分层表格列
  const trancheColumns = [
    { title: '分层名称', dataIndex: 'trancheName', key: 'trancheName' },
    { title: '分层级别', dataIndex: 'trancheLevel', key: 'trancheLevel' },
    { title: '清偿顺序', dataIndex: 'paymentRank', key: 'paymentRank' },
    {
      title: '认购金额',
      dataIndex: 'subscribeAmount',
      key: 'subscribeAmount',
      render: (value: number) => <AmountDisplay value={value} />
    },
    {
      title: '份额占比',
      dataIndex: 'sharePct',
      key: 'sharePct',
      render: (value: number) => value ? `${value}%` : '-'
    },
    {
      title: '预期收益率',
      dataIndex: 'expectedYieldRate',
      key: 'expectedYieldRate',
      render: (value: number) => value ? `${value}%` : '-'
    },
    {
      title: '附件',
      dataIndex: 'fileAttachments',
      key: 'fileAttachments',
      width: 180,
      render: renderCompactAttachments
    }
  ];

  // 固定资产关联表格列

  // 信息项组件
  const InfoItem: React.FC<{ label: string; children: React.ReactNode; span?: number }> = ({ label, children, span = 8 }) => (
    <Col span={span} style={{ marginBottom: 24 }}>
      <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 8 }}>{label}</div>
      <div style={{ color: '#262626', fontSize: 14 }}>{children}</div>
    </Col>
  );

  // 区块标题组件
  const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
    <div style={{
      fontSize: 16,
      fontWeight: 500,
      color: '#262626',
      marginBottom: 24,
      paddingLeft: 12,
      borderLeft: '3px solid #1890ff'
    }}>
      {title}
    </div>
  );

  return (
    <div>
      {/* 顶部操作栏 */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/financing/existing')}
          style={{ padding: 0, color: '#262626' }}
        >
          返回列表
        </Button>
        <Button
          type="primary"
          onClick={() => navigate(`/financing/existing/edit/${id}`)}
        >
          编辑
        </Button>
      </div>

      {loanDetail && (
        <>
          {/* 头部信息 */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ marginBottom: 8 }}>
              <Space align="center" size={12}>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {loanDetail.loanName}
                </Typography.Title>
                <Tag color={getStatusColor(loanDetail.status)}>
                  {getDictLabel(loanStatusDict, loanDetail.status)}
                </Tag>
              </Space>
            </div>
            <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 24 }}>
              融资编号：{loanDetail.loanCode || '-'}
            </div>
            <Row gutter={48}>
              <Col>
                <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 4 }}>
                  合同金额 ({getDictLabel(currencyDict, loanDetail.currency || '') || 'CNY'})
                </div>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#262626' }}>
                  <AmountDisplay value={loanDetail.contractAmount} style={{ fontSize: 20, fontWeight: 500 }} />
                </div>
              </Col>
              <Col>
                <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 4 }}>合同到期日</div>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#262626' }}>
                  {loanDetail.maturityDate ? dayjs(loanDetail.maturityDate).format('YYYY-MM-DD') : '-'}
                </div>
              </Col>
              <Col>
                <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 4 }}>融资主体</div>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#262626' }}>
                  {loanDetail.orgName}
                </div>
              </Col>
            </Row>
            <Row gutter={48} style={{ marginTop: 16 }}>
              <Col>
                <span style={{ color: '#8c8c8c', fontSize: 12 }}>创建人：{loanDetail.createBy || '-'}</span>
              </Col>
              <Col>
                <span style={{ color: '#8c8c8c', fontSize: 12 }}>创建时间：{loanDetail.createTime ? dayjs(loanDetail.createTime).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
              </Col>
              <Col>
                <span style={{ color: '#8c8c8c', fontSize: 12 }}>修改人：{loanDetail.updateBy || '-'}</span>
              </Col>
              <Col>
                <span style={{ color: '#8c8c8c', fontSize: 12 }}>修改时间：{loanDetail.updateTime ? dayjs(loanDetail.updateTime).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
              </Col>
            </Row>
          </div>

          <Divider style={{ margin: '0 0 32px 0' }} />

          {/* 融资条款 */}
          <div style={{ marginBottom: 32 }}>
            <SectionTitle title="融资条款" />
            <Row gutter={16}>
              <InfoItem label="资金方">{loanDetail.institutionName || '-'}</InfoItem>
              <InfoItem label="融资类型">{getProductTypeLabel(loanDetail)}</InfoItem>
              <InfoItem label="期限">{loanDetail.termMonths ? `${loanDetail.termMonths} 个月` : '-'}</InfoItem>

              <InfoItem label="利率方式">{getDictLabel(rateModeDict, loanDetail.rateMode) || '-'}</InfoItem>
              {loanDetail.rateMode === '固定' && (
                <InfoItem label="固定利率">
                  {loanDetail.fixedRate != null ? `${(loanDetail.fixedRate * 100).toFixed(4)}%` : '-'}
                </InfoItem>
              )}
              {loanDetail.rateMode === 'LPR+BP' && (
                <>
                  <InfoItem label="基准利率">
                    {loanDetail.baseRate != null ? `${(loanDetail.baseRate * 100).toFixed(4)}%` : '-'}
                  </InfoItem>
                  <InfoItem label="加点（BP）">
                    {loanDetail.spreadBp != null ? `${(loanDetail.spreadBp * 10000).toFixed(0)}` : '-'}
                  </InfoItem>
                </>
              )}
              {['浮动', '票面'].includes(loanDetail.rateMode) && (
                <InfoItem label={loanDetail.rateMode === '票面' ? '票面利率' : '基准利率'}>
                  {loanDetail.baseRate != null ? `${(loanDetail.baseRate * 100).toFixed(4)}%` : '-'}
                </InfoItem>
              )}
              <InfoItem label="计息日规则">{getDictLabel(dayCountDict, loanDetail.dayCountConvention || '') || '-'}</InfoItem>

              <InfoItem label="还款方式">{getDictLabel(repayMethodDict, loanDetail.repayMethod) || '-'}</InfoItem>
              {['LPR+BP', '浮动'].includes(loanDetail.rateMode) && (
                <>
                  <InfoItem label="重定价锚定日">
                    {loanDetail.rateResetAnchorDate ? dayjs(loanDetail.rateResetAnchorDate).format('YYYY-MM-DD') : '-'}
                  </InfoItem>
                  <InfoItem label="重定价周期">
                    {getDictLabel(rateResetCycleDict, loanDetail.rateResetCycle || '') || '-'}
                  </InfoItem>
                </>
              )}
              <InfoItem label="是否多次放款">{loanDetail.isMultiDisb ? '是' : '否'}</InfoItem>
            </Row>
            {loanDetail.remark && (
              <Row>
                <InfoItem label="备注" span={24}>{loanDetail.remark}</InfoItem>
              </Row>
            )}
          </div>

          {/* 扩展字段 */}
          {loanDetail.extFieldValList && loanDetail.extFieldValList.some((f: any) =>
            f.valueStr || f.valueNum != null || f.valueDate || f.valueDt || f.valueBool != null
          ) && (
            <div style={{ marginBottom: 32 }}>
              <SectionTitle title="扩展信息" />
              <Row gutter={16}>
                {loanDetail.extFieldValList.map((field: any, index: number) => {
                  let displayValue: React.ReactNode = '-';
                  if (field.dataType === 'string' && field.valueStr) {
                    displayValue = field.valueStr;
                  } else if (field.dataType === 'decimal' && field.valueNum != null) {
                    displayValue = field.valueNum;
                  } else if (field.dataType === 'integer' && field.valueNum != null) {
                    displayValue = field.valueNum;
                  } else if (field.dataType === 'date' && field.valueDate) {
                    displayValue = dayjs(field.valueDate).format('YYYY-MM-DD');
                  } else if (field.dataType === 'datetime' && field.valueDt) {
                    displayValue = dayjs(field.valueDt).format('YYYY-MM-DD HH:mm:ss');
                  } else if (field.dataType === 'boolean' && field.valueBool != null) {
                    displayValue = field.valueBool ? '是' : '否';
                  }
                  if (displayValue === '-') return null;
                  return (
                    <InfoItem key={field.fieldKey || index} label={field.fieldLabel}>
                      {displayValue}
                    </InfoItem>
                  );
                })}
              </Row>
            </div>
          )}

          {/* 融资主体附件 */}
          {loanDetail.fileAttachments && loanDetail.fileAttachments.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionTitle title="融资主体附件" />
              <AttachmentDisplay
                attachments={loanDetail.fileAttachments}
                disableDelete={true}
                showDownload={true}
              />
            </div>
          )}

          {/* 银团参与行 - 根据融资类型显示 */}
          {PRODUCT_TYPE_COMPONENT_MAP[loanDetail.productType] === 'participant' && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <SectionTitle title="银团参与行" />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddParticipant}>
                  添加
                </Button>
              </div>
              {loanDetail.participantList && loanDetail.participantList.length > 0 ? (
                <Table
                  columns={participantColumns}
                  dataSource={loanDetail.participantList}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              ) : (
                <div style={{ color: '#999', padding: '24px 0', textAlign: 'center', background: '#fafafa', borderRadius: 4 }}>
                  暂无银团参与行数据
                </div>
              )}
            </div>
          )}

          {/* 存单质押 - 根据融资类型显示 */}
          {PRODUCT_TYPE_COMPONENT_MAP[loanDetail.productType] === 'cd' && (
            <div style={{ marginBottom: 32 }}>
              <SectionTitle title="关联存单" />
              {loanDetail.cdList && loanDetail.cdList.length > 0 ? (
                <Table
                  columns={cdColumns}
                  dataSource={loanDetail.cdList}
                  rowKey="mapId"
                  pagination={false}
                  size="small"
                />
              ) : (
                <div style={{ color: '#999', padding: '24px 0', textAlign: 'center', background: '#fafafa', borderRadius: 4 }}>
                  暂无关联存单
                </div>
              )}
            </div>
          )}

          {/* 信用证 - 根据融资类型显示 */}
          {PRODUCT_TYPE_COMPONENT_MAP[loanDetail.productType] === 'lc' && (
            <div style={{ marginBottom: 32 }}>
              <SectionTitle title="关联信用证" />
              {loanDetail.lcList && loanDetail.lcList.length > 0 ? (
                <Table
                  columns={lcColumns}
                  dataSource={loanDetail.lcList}
                  rowKey="mapId"
                  pagination={false}
                  size="small"
                />
              ) : (
                <div style={{ color: '#999', padding: '24px 0', textAlign: 'center', background: '#fafafa', borderRadius: 4 }}>
                  暂无关联信用证
                </div>
              )}
            </div>
          )}

          {/* 保理应收款 - 根据融资类型显示 */}
          {PRODUCT_TYPE_COMPONENT_MAP[loanDetail.productType] === 'factoring' && (
            <div style={{ marginBottom: 32 }}>
              <SectionTitle title="保理应收款" />
              {loanDetail.arItemList && loanDetail.arItemList.length > 0 ? (
                <Table
                  columns={arColumns}
                  dataSource={loanDetail.arItemList}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              ) : (
                <div style={{ color: '#999', padding: '24px 0', textAlign: 'center', background: '#fafafa', borderRadius: 4 }}>
                  暂无保理应收款数据
                </div>
              )}
            </div>
          )}

          {/* 融资租赁资产 - 根据融资类型显示 */}
          {PRODUCT_TYPE_COMPONENT_MAP[loanDetail.productType] === 'leasing' && (
            <div style={{ marginBottom: 32 }}>
              <SectionTitle title="融资租赁资产" />
              {loanDetail.leasedAssetList && loanDetail.leasedAssetList.length > 0 ? (
                <Table
                  columns={leasedAssetColumns}
                  dataSource={loanDetail.leasedAssetList}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              ) : (
                <div style={{ color: '#999', padding: '24px 0', textAlign: 'center', background: '#fafafa', borderRadius: 4 }}>
                  暂无融资租赁资产数据
                </div>
              )}
            </div>
          )}

          {/* 供应链金融凭证 - 根据融资类型显示 */}
          {PRODUCT_TYPE_COMPONENT_MAP[loanDetail.productType] === 'scf' && (
            <div style={{ marginBottom: 32 }}>
              <SectionTitle title="供应链金融凭证" />
              {loanDetail.voucherItemList && loanDetail.voucherItemList.length > 0 ? (
                <Table
                  columns={scfColumns}
                  dataSource={loanDetail.voucherItemList}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              ) : (
                <div style={{ color: '#999', padding: '24px 0', textAlign: 'center', background: '#fafafa', borderRadius: 4 }}>
                  暂无供应链金融凭证数据
                </div>
              )}
            </div>
          )}

          {/* 信托分层 - 根据融资类型显示 */}
          {PRODUCT_TYPE_COMPONENT_MAP[loanDetail.productType] === 'tranche' && (
            <div style={{ marginBottom: 32 }}>
              <SectionTitle title="信托分层" />
              {loanDetail.trancheList && loanDetail.trancheList.length > 0 ? (
                <Table
                  columns={trancheColumns}
                  dataSource={loanDetail.trancheList}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              ) : (
                <div style={{ color: '#999', padding: '24px 0', textAlign: 'center', background: '#fafafa', borderRadius: 4 }}>
                  暂无信托分层数据
                </div>
              )}
            </div>
          )}

          {/* 固定资产关联 - 根据融资类型显示 */}
          {PRODUCT_TYPE_COMPONENT_MAP[loanDetail.productType] === 'fixedAsset' && (
            <div style={{ marginBottom: 32 }}>
              <SectionTitle title="关联固定资产" />
              {loanDetail.fixedAssetMapList && loanDetail.fixedAssetMapList.length > 0 ? (
                <FixedAssetMapList
                  dataSource={loanDetail.fixedAssetMapList}
                  onEdit={handleEditFixedAssetMap}
                  onDelete={handleDeleteFixedAssetMap}
                  onViewAttachments={(attachments) => {
                    setViewingAttachments(attachments);
                    setAttachmentModalVisible(true);
                  }}
                />
              ) : (
                <div style={{ color: '#999', padding: '24px 0', textAlign: 'center', background: '#fafafa', borderRadius: 4 }}>
                  暂无关联固定资产数据
                </div>
              )}
            </div>
          )}

        </>
      )}

      {!loanDetail && isLoading && (
        <Card loading={true} style={{ minHeight: 400 }} />
      )}

      {/* 银团参与行编辑弹窗 */}
      <Modal
        title={editingParticipant ? '编辑银团参与行' : '添加银团参与行'}
        open={participantModalVisible}
        onOk={handleParticipantModalOk}
        onCancel={() => {
          setParticipantModalVisible(false);
          participantForm.resetFields();
          setParticipantFiles([]);
          setEditingParticipant(null);
        }}
        width={700}
      >
        <Form form={participantForm} layout="vertical">
          <Space.Compact block style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="role"
              label="角色"
              rules={[{ required: true, message: '请选择角色' }]}
              style={{ flex: 1 }}
            >
              <DictSelect
                dictCode="participant.role"
                placeholder="请选择角色"
              />
            </Form.Item>

            <Form.Item
              name="institutionId"
              label="金融机构"
              rules={[{ required: true, message: '请选择金融机构' }]}
              style={{ flex: 2 }}
            >
              <InstitutionSelect
                placeholder="请选择金融机构"
                onChange={handleParticipantInstitutionChange}
              />
            </Form.Item>
          </Space.Compact>
          <Form.Item name="institutionName" hidden>
            <Input />
          </Form.Item>

          <Space.Compact block style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="commitAmount"
              label="承诺额度（万元）"
              style={{ flex: 1 }}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入承诺额度"
                min={0}
                precision={6}
              />
            </Form.Item>

            <Form.Item
              name="sharePct"
              label="份额比例（%）"
              style={{ flex: 1 }}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入份额比例"
                min={0}
                max={100}
                precision={2}
              />
            </Form.Item>
          </Space.Compact>

          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>

          <Form.Item label="附件" style={{ marginBottom: 0 }}>
            <RaxUpload
              bizModule="FinLoanParticipant"
              value={participantFiles}
              onChange={setParticipantFiles}
              maxCount={5}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 固定资产关联编辑弹窗 */}
      <FixedAssetMapEditModal
        visible={fixedAssetMapModalVisible}
        record={editingFixedAssetMap}
        onClose={() => {
          setFixedAssetMapModalVisible(false);
          setEditingFixedAssetMap(null);
        }}
        onSuccess={refreshDetail}
      />

      {/* 附件查看弹窗 */}
      <Modal
        title="附件列表"
        open={attachmentModalVisible}
        onCancel={() => {
          setAttachmentModalVisible(false);
          setViewingAttachments([]);
        }}
        footer={
          <Button onClick={() => {
            setAttachmentModalVisible(false);
            setViewingAttachments([]);
          }}>
            关闭
          </Button>
        }
        width={800}
      >
        <AttachmentDisplay
          attachments={viewingAttachments}
          disableDelete={true}
          showDownload={true}
        />
      </Modal>
    </div>
  );
};

export default ExistingDetail;
