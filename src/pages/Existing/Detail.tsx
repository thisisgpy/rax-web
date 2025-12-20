import React from 'react';
import {
  Card,
  Button,
  Space,
  Tag,
  Divider,
  Row,
  Col,
  Typography
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { loanApi } from '@/services/loan';
import { dictApi } from '@/services/dict';
import type { LoanDto } from '@/types/swagger-api';
import AmountDisplay from '@/components/AmountDisplay';
import AttachmentDisplay from '@/components/AttachmentDisplay';

// 融资特定字段组件
import ParticipantForm from './components/ParticipantForm';
import CdForm from './components/CdForm';
import LcForm from './components/LcForm';
import TrustTrancheForm from './components/TrustTrancheForm';
import FactoringArItemForm from './components/FactoringArItemForm';
import ScfVoucherItemForm from './components/ScfVoucherItemForm';
import LeasedAssetForm from './components/LeasedAssetForm';
import FixedAssetMapForm from './components/FixedAssetMapForm';

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

  // 获取当前融资类型对应的组件类型
  const componentType = loanDetail ? PRODUCT_TYPE_COMPONENT_MAP[loanDetail.productType] : null;

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
                  合同金额 ({getDictLabel(currencyDict, loanDetail.currency || '') || '人民币'})
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

          {/* 银团参与行 */}
          {componentType === 'participant' && (
            <div style={{ marginBottom: 32 }}>
              <SectionTitle title="银团参与行" />
              <ParticipantForm
                value={loanDetail.participantList as any || []}
                readOnly
              />
            </div>
          )}

          {/* 存单质押 */}
          {componentType === 'cd' && (
            <div style={{ marginBottom: 32 }}>
              <SectionTitle title="关联存单" />
              <CdForm
                value={loanDetail.cdList as any || []}
                readOnly
              />
            </div>
          )}

          {/* 信用证 */}
          {componentType === 'lc' && (
            <div style={{ marginBottom: 32 }}>
              <SectionTitle title="关联信用证" />
              <LcForm
                value={loanDetail.lcList as any || []}
                readOnly
              />
            </div>
          )}

          {/* 信托分层 */}
          {componentType === 'tranche' && (
            <div style={{ marginBottom: 32 }}>
              <SectionTitle title="信托分层" />
              <TrustTrancheForm
                value={loanDetail.trancheList as any || []}
                readOnly
              />
            </div>
          )}

          {/* 保理应收款 */}
          {componentType === 'factoring' && (
            <div style={{ marginBottom: 32 }}>
              <SectionTitle title="保理应收款" />
              <FactoringArItemForm
                value={loanDetail.arItemList as any || []}
                readOnly
              />
            </div>
          )}

          {/* 供应链金融凭证 */}
          {componentType === 'scf' && (
            <div style={{ marginBottom: 32 }}>
              <SectionTitle title="供应链金融凭证" />
              <ScfVoucherItemForm
                value={loanDetail.voucherItemList as any || []}
                readOnly
              />
            </div>
          )}

          {/* 融资租赁资产 */}
          {componentType === 'leasing' && (
            <div style={{ marginBottom: 32 }}>
              <SectionTitle title="融资租赁资产" />
              <LeasedAssetForm
                value={loanDetail.leasedAssetList as any || []}
                readOnly
              />
            </div>
          )}

          {/* 固定资产关联 */}
          {componentType === 'fixedAsset' && (
            <div style={{ marginBottom: 32 }}>
              <SectionTitle title="关联固定资产" />
              <FixedAssetMapForm
                value={loanDetail.fixedAssetMapList as any || []}
                readOnly
              />
            </div>
          )}

        </>
      )}

      {!loanDetail && isLoading && (
        <Card loading={true} style={{ minHeight: 400 }} />
      )}
    </div>
  );
};

export default ExistingDetail;
