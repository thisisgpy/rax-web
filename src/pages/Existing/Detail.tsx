import React from 'react';
import {
  Card,
  Descriptions,
  Table,
  Button,
  Space,
  Tag,
  Divider
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { loanApi } from '@/services/loan';
import { dictApi } from '@/services/dict';
import type {
  LoanDto,
  FinLoanParticipantDto,
  LoanCdWithMapDto,
  LoanLcWithMapDto,
  FactoringArItemDto,
  LeasedAssetDto,
  ScfVoucherItemDto,
  TrustTrancheDto
} from '@/types/swagger-api';
import AmountDisplay from '@/components/AmountDisplay';
import AttachmentDisplay from '@/components/AttachmentDisplay';

const ExistingDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

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
    { title: '备注', dataIndex: 'remark', key: 'remark' }
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
    }
  ];

  // 融资租赁资产表格列
  const leasedAssetColumns = [
    { title: '资产名称', dataIndex: 'assetName', key: 'assetName' },
    { title: '资产类别', dataIndex: 'assetCategory', key: 'assetCategory' },
    {
      title: '原值',
      dataIndex: 'originalValue',
      key: 'originalValue',
      render: (value: number) => <AmountDisplay value={value} />
    },
    {
      title: '评估价值',
      dataIndex: 'appraisedValue',
      key: 'appraisedValue',
      render: (value: number) => <AmountDisplay value={value} />
    },
    { title: '租赁类型', dataIndex: 'leaseType', key: 'leaseType' },
    {
      title: '起租日',
      dataIndex: 'leaseStartDate',
      key: 'leaseStartDate',
      render: (value: string) => value ? dayjs(value).format('YYYY-MM-DD') : '-'
    },
    {
      title: '到期日',
      dataIndex: 'leaseEndDate',
      key: 'leaseEndDate',
      render: (value: string) => value ? dayjs(value).format('YYYY-MM-DD') : '-'
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
    }
  ];

  return (
    <Card loading={isLoading}>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/financing/existing')}
        >
          返回列表
        </Button>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/financing/existing/edit/${id}`)}
        >
          编辑
        </Button>
      </Space>

      {loanDetail && (
        <>
          {/* 基础信息 */}
          <Divider orientation="left">基础信息</Divider>
          <Descriptions bordered column={3}>
            <Descriptions.Item label="融资主体">{loanDetail.orgName}</Descriptions.Item>
            <Descriptions.Item label="融资名称">{loanDetail.loanName}</Descriptions.Item>
            <Descriptions.Item label="融资类型">{getProductTypeLabel(loanDetail)}</Descriptions.Item>
            <Descriptions.Item label="资金方">{loanDetail.institutionName}</Descriptions.Item>
            <Descriptions.Item label="合同金额">
              <AmountDisplay value={loanDetail.contractAmount} />
            </Descriptions.Item>
            <Descriptions.Item label="币种">{getDictLabel(currencyDict, loanDetail.currency || '')}</Descriptions.Item>
            <Descriptions.Item label="期限">{loanDetail.termMonths} 月</Descriptions.Item>
            <Descriptions.Item label="合同到期日">
              {loanDetail.maturityDate ? dayjs(loanDetail.maturityDate).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="是否多次放款">
              {loanDetail.isMultiDisb ? '是' : '否'}
            </Descriptions.Item>
            <Descriptions.Item label="利率方式">{getDictLabel(rateModeDict, loanDetail.rateMode)}</Descriptions.Item>
            {/* 固定利率 */}
            {loanDetail.rateMode === '固定' && (
              <Descriptions.Item label="固定利率">
                {loanDetail.fixedRate != null ? `${(loanDetail.fixedRate * 100).toFixed(4)}%` : '-'}
              </Descriptions.Item>
            )}
            {/* LPR+BP */}
            {loanDetail.rateMode === 'LPR+BP' && (
              <>
                <Descriptions.Item label="基准利率">
                  {loanDetail.baseRate != null ? `${(loanDetail.baseRate * 100).toFixed(4)}%` : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="加点（BP）">
                  {loanDetail.spreadBp != null ? `${(loanDetail.spreadBp * 10000).toFixed(0)}` : '-'}
                </Descriptions.Item>
              </>
            )}
            {/* 浮动利率 */}
            {loanDetail.rateMode === '浮动' && (
              <Descriptions.Item label="基准利率">
                {loanDetail.baseRate != null ? `${(loanDetail.baseRate * 100).toFixed(4)}%` : '-'}
              </Descriptions.Item>
            )}
            {/* 票面利率 */}
            {loanDetail.rateMode === '票面' && (
              <Descriptions.Item label="票面利率">
                {loanDetail.baseRate != null ? `${(loanDetail.baseRate * 100).toFixed(4)}%` : '-'}
              </Descriptions.Item>
            )}
            {/* 重定价信息 - 浮动或LPR+BP时显示 */}
            {(loanDetail.rateMode === '浮动' || loanDetail.rateMode === 'LPR+BP') && (
              <>
                <Descriptions.Item label="重定价周期">
                  {getDictLabel(rateResetCycleDict, loanDetail.rateResetCycle || '')}
                </Descriptions.Item>
                <Descriptions.Item label="重定价锚定日">
                  {loanDetail.rateResetAnchorDate ? dayjs(loanDetail.rateResetAnchorDate).format('YYYY-MM-DD') : '-'}
                </Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="计息日规则">
              {getDictLabel(dayCountDict, loanDetail.dayCountConvention || '')}
            </Descriptions.Item>
            <Descriptions.Item label="还款方式">{getDictLabel(repayMethodDict, loanDetail.repayMethod)}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={getStatusColor(loanDetail.status)}>
                {getDictLabel(loanStatusDict, loanDetail.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建人">{loanDetail.createBy || '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {loanDetail.createTime ? dayjs(loanDetail.createTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="修改人">{loanDetail.updateBy || '-'}</Descriptions.Item>
            <Descriptions.Item label="修改时间">
              {loanDetail.updateTime ? dayjs(loanDetail.updateTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={3}>{loanDetail.remark || '-'}</Descriptions.Item>
          </Descriptions>

          {/* 银团参与行 */}
          {loanDetail.participantList && loanDetail.participantList.length > 0 && (
            <>
              <Divider orientation="left">银团参与行</Divider>
              <Table
                columns={participantColumns}
                dataSource={loanDetail.participantList}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </>
          )}

          {/* 存单关联 */}
          {loanDetail.cdList && loanDetail.cdList.length > 0 && (
            <>
              <Divider orientation="left">存单质押</Divider>
              <Table
                columns={cdColumns}
                dataSource={loanDetail.cdList}
                rowKey="mapId"
                pagination={false}
                size="small"
              />
            </>
          )}

          {/* 信用证关联 */}
          {loanDetail.lcList && loanDetail.lcList.length > 0 && (
            <>
              <Divider orientation="left">信用证</Divider>
              <Table
                columns={lcColumns}
                dataSource={loanDetail.lcList}
                rowKey="mapId"
                pagination={false}
                size="small"
              />
            </>
          )}

          {/* 保理应收款 */}
          {loanDetail.arItemList && loanDetail.arItemList.length > 0 && (
            <>
              <Divider orientation="left">保理应收款</Divider>
              <Table
                columns={arColumns}
                dataSource={loanDetail.arItemList}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </>
          )}

          {/* 融资租赁资产 */}
          {loanDetail.leasedAssetList && loanDetail.leasedAssetList.length > 0 && (
            <>
              <Divider orientation="left">融资租赁资产</Divider>
              <Table
                columns={leasedAssetColumns}
                dataSource={loanDetail.leasedAssetList}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </>
          )}

          {/* 供应链金融凭证 */}
          {loanDetail.voucherItemList && loanDetail.voucherItemList.length > 0 && (
            <>
              <Divider orientation="left">供应链金融凭证</Divider>
              <Table
                columns={scfColumns}
                dataSource={loanDetail.voucherItemList}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </>
          )}

          {/* 信托分层 */}
          {loanDetail.trancheList && loanDetail.trancheList.length > 0 && (
            <>
              <Divider orientation="left">信托分层</Divider>
              <Table
                columns={trancheColumns}
                dataSource={loanDetail.trancheList}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </>
          )}

          {/* 附件 */}
          {loanDetail.fileAttachments && loanDetail.fileAttachments.length > 0 && (
            <>
              <Divider orientation="left">附件</Divider>
              <AttachmentDisplay
                attachments={loanDetail.fileAttachments}
                disableDelete={true}
                showDownload={true}
              />
            </>
          )}

        </>
      )}
    </Card>
  );
};

export default ExistingDetail;
