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
import { lcApi } from '@/services/lc';
import { dictApi } from '@/services/dict';
import AmountDisplay from '@/components/AmountDisplay';
import AttachmentDisplay from '@/components/AttachmentDisplay';

const LCDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

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
    enabled: !!id
  });

  // 获取字典数据
  const { data: lcTypeDict } = useQuery({
    queryKey: ['dict', 'lc.type'],
    queryFn: () => dictApi.getItemTreeByCode('lc.type'),
    staleTime: 5 * 60 * 1000
  });

  const { data: availableByDict } = useQuery({
    queryKey: ['dict', 'lc.available.by'],
    queryFn: () => dictApi.getItemTreeByCode('lc.available.by'),
    staleTime: 5 * 60 * 1000
  });

  const { data: incotermDict } = useQuery({
    queryKey: ['dict', 'lc.incoterm'],
    queryFn: () => dictApi.getItemTreeByCode('lc.incoterm'),
    staleTime: 5 * 60 * 1000
  });

  const { data: chargeBearerDict } = useQuery({
    queryKey: ['dict', 'lc.charge.bearer'],
    queryFn: () => dictApi.getItemTreeByCode('lc.charge.bearer'),
    staleTime: 5 * 60 * 1000
  });

  const { data: ucpVersionDict } = useQuery({
    queryKey: ['dict', 'lc.ucp.version'],
    queryFn: () => dictApi.getItemTreeByCode('lc.ucp.version'),
    staleTime: 5 * 60 * 1000
  });

  const { data: statusDict } = useQuery({
    queryKey: ['dict', 'lc.status'],
    queryFn: () => dictApi.getItemTreeByCode('lc.status'),
    staleTime: 5 * 60 * 1000
  });

  const { data: currencyDict } = useQuery({
    queryKey: ['dict', 'sys.currency'],
    queryFn: () => dictApi.getItemTreeByCode('sys.currency'),
    staleTime: 5 * 60 * 1000
  });

  // 获取字典项标签
  const getDictLabel = (dict: any, value: string | undefined): string => {
    if (!dict?.data || !value) return value || '-';
    const item = dict.data.find((d: any) => d.value === value);
    return item?.label || value;
  };

  // 获取状态标签颜色
  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      'ACTIVE': 'success',
      'PENDING': 'processing',
      'EXPIRED': 'default',
      'CANCELLED': 'error'
    };
    return colorMap[status] || 'blue';
  };

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
          onClick={() => navigate('/bill/lc')}
          style={{ padding: 0, color: '#262626' }}
        >
          返回列表
        </Button>
        <Button
          type="primary"
          onClick={() => navigate(`/bill/lc/edit/${id}`)}
        >
          编辑
        </Button>
      </div>

      {lcDetail && (
        <>
          {/* 头部信息 */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ marginBottom: 8 }}>
              <Space align="center" size={12}>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {lcDetail.lcNo}
                </Typography.Title>
                {lcDetail.confirmFlag && <Tag color="blue">保兑信用证</Tag>}
                {lcDetail.status && (
                  <Tag color={getStatusColor(lcDetail.status)}>
                    {getDictLabel(statusDict, lcDetail.status)}
                  </Tag>
                )}
              </Space>
            </div>
            <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 24 }}>
              开证行：{lcDetail.issuingBank || '-'}
            </div>
            <Row gutter={48}>
              <Col>
                <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 4 }}>
                  信用证金额 ({getDictLabel(currencyDict, lcDetail.currency) || 'CNY'})
                </div>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#262626' }}>
                  <AmountDisplay value={lcDetail.lcAmount} style={{ fontSize: 20, fontWeight: 500 }} />
                </div>
              </Col>
              <Col>
                <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 4 }}>到期日</div>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#262626' }}>
                  {lcDetail.expiryDate ? dayjs(lcDetail.expiryDate).format('YYYY-MM-DD') : '-'}
                </div>
              </Col>
              <Col>
                <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 4 }}>申请人</div>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#262626' }}>
                  {lcDetail.applicant || '-'}
                </div>
              </Col>
              <Col>
                <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 4 }}>受益人</div>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#262626' }}>
                  {lcDetail.beneficiary || '-'}
                </div>
              </Col>
            </Row>
            <Row gutter={48} style={{ marginTop: 16 }}>
              <Col>
                <span style={{ color: '#8c8c8c', fontSize: 12 }}>创建人：{lcDetail.createBy || '-'}</span>
              </Col>
              <Col>
                <span style={{ color: '#8c8c8c', fontSize: 12 }}>创建时间：{lcDetail.createTime ? dayjs(lcDetail.createTime).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
              </Col>
              <Col>
                <span style={{ color: '#8c8c8c', fontSize: 12 }}>修改人：{lcDetail.updateBy || '-'}</span>
              </Col>
              <Col>
                <span style={{ color: '#8c8c8c', fontSize: 12 }}>修改时间：{lcDetail.updateTime ? dayjs(lcDetail.updateTime).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
              </Col>
            </Row>
          </div>

          <Divider style={{ margin: '0 0 32px 0' }} />

          {/* 基本信息 */}
          <div style={{ marginBottom: 32 }}>
            <SectionTitle title="基本信息" />
            <Row gutter={16}>
              <InfoItem label="信用证编号">{lcDetail.lcNo || '-'}</InfoItem>
              <InfoItem label="信用证类型">{getDictLabel(lcTypeDict, lcDetail.lcType)}</InfoItem>
              <InfoItem label="开证行">{lcDetail.issuingBank || '-'}</InfoItem>

              <InfoItem label="通知/保兑行">{lcDetail.advisingBank || '-'}</InfoItem>
              <InfoItem label="是否保兑">
                {lcDetail.confirmFlag ? <Tag color="blue">是</Tag> : <Tag>否</Tag>}
              </InfoItem>
              <InfoItem label="币种">{getDictLabel(currencyDict, lcDetail.currency)}</InfoItem>

              <InfoItem label="信用证金额">
                {lcDetail.lcAmount ? <AmountDisplay value={lcDetail.lcAmount} /> : '-'}
              </InfoItem>
              <InfoItem label="金额容差">
                {lcDetail.tolerancePct != null ? `${lcDetail.tolerancePct}%` : '-'}
              </InfoItem>
              <InfoItem label="可用方式">{getDictLabel(availableByDict, lcDetail.availableBy)}</InfoItem>
            </Row>
          </div>

          {/* 有效期信息 */}
          <div style={{ marginBottom: 32 }}>
            <SectionTitle title="有效期信息" />
            <Row gutter={16}>
              <InfoItem label="开证日期">
                {lcDetail.issueDate ? dayjs(lcDetail.issueDate).format('YYYY-MM-DD') : '-'}
              </InfoItem>
              <InfoItem label="到期日">
                {lcDetail.expiryDate ? dayjs(lcDetail.expiryDate).format('YYYY-MM-DD') : '-'}
              </InfoItem>
              <InfoItem label="到期地点">{lcDetail.placeOfExpiry || '-'}</InfoItem>

              <InfoItem label="交单期限">
                {lcDetail.presentationDays != null ? `${lcDetail.presentationDays} 天` : '-'}
              </InfoItem>
            </Row>
          </div>

          {/* 当事人信息 */}
          <div style={{ marginBottom: 32 }}>
            <SectionTitle title="当事人信息" />
            <Row gutter={16}>
              <InfoItem label="申请人">{lcDetail.applicant || '-'}</InfoItem>
              <InfoItem label="受益人">{lcDetail.beneficiary || '-'}</InfoItem>
            </Row>
          </div>

          {/* 运输信息 */}
          <div style={{ marginBottom: 32 }}>
            <SectionTitle title="运输信息" />
            <Row gutter={16}>
              <InfoItem label="装运港/起运地">{lcDetail.shipmentFrom || '-'}</InfoItem>
              <InfoItem label="卸货港/目的地">{lcDetail.shipmentTo || '-'}</InfoItem>
              <InfoItem label="最迟装运期">{lcDetail.latestShipment || '-'}</InfoItem>

              <InfoItem label="贸易术语">{getDictLabel(incotermDict, lcDetail.incoterm)}</InfoItem>
              <InfoItem label="允许分批装运">
                {lcDetail.partialShipmentAllowed ? <Tag color="blue">是</Tag> : <Tag>否</Tag>}
              </InfoItem>
              <InfoItem label="允许转运">
                {lcDetail.transshipmentAllowed ? <Tag color="blue">是</Tag> : <Tag>否</Tag>}
              </InfoItem>
            </Row>
          </div>

          {/* 费用信息 */}
          <div style={{ marginBottom: 32 }}>
            <SectionTitle title="费用信息" />
            <Row gutter={16}>
              <InfoItem label="保证金比例">
                {lcDetail.marginRatio != null ? `${lcDetail.marginRatio}%` : '-'}
              </InfoItem>
              <InfoItem label="保证金金额">
                {lcDetail.marginAmount ? <AmountDisplay value={lcDetail.marginAmount} /> : '-'}
              </InfoItem>
              <InfoItem label="开证费率">
                {lcDetail.commissionRate != null ? `${lcDetail.commissionRate}%` : '-'}
              </InfoItem>

              <InfoItem label="通知费承担方">{getDictLabel(chargeBearerDict, lcDetail.advisingChargeBorneBy)}</InfoItem>
              <InfoItem label="适用规则版本">{getDictLabel(ucpVersionDict, lcDetail.ucpVersion)}</InfoItem>
            </Row>
          </div>

          {/* 备注 */}
          {lcDetail.remark && (
            <div style={{ marginBottom: 32 }}>
              <SectionTitle title="备注" />
              <div style={{ color: '#262626', fontSize: 14, backgroundColor: '#fafafa', padding: 16, borderRadius: 4 }}>
                {lcDetail.remark}
              </div>
            </div>
          )}

          {/* 附件 */}
          {lcDetail.attachments && lcDetail.attachments.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <SectionTitle title="附件" />
              <AttachmentDisplay
                attachments={lcDetail.attachments}
                disableDelete
                showDownload
              />
            </div>
          )}
        </>
      )}

      {!lcDetail && isLoading && (
        <Card loading={true} style={{ minHeight: 400 }} />
      )}
    </div>
  );
};

export default LCDetail;
