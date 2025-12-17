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
import { cdApi } from '@/services/cd';
import { dictApi } from '@/services/dict';
import AmountDisplay from '@/components/AmountDisplay';

const CDDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 获取存单详情
  const { data: cdDetail, isLoading } = useQuery({
    queryKey: ['cd', 'detail', id],
    queryFn: async () => {
      const result = await cdApi.get(Number(id));
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || '获取详情失败');
    },
    enabled: !!id
  });

  // 获取字典数据
  const { data: dayCountConventionDict } = useQuery({
    queryKey: ['dict', 'day.count.convention'],
    queryFn: () => dictApi.getItemTreeByCode('day.count.convention'),
    staleTime: 5 * 60 * 1000
  });

  const { data: interestPayFreqDict } = useQuery({
    queryKey: ['dict', 'cd.interest.pay.freq'],
    queryFn: () => dictApi.getItemTreeByCode('cd.interest.pay.freq'),
    staleTime: 5 * 60 * 1000
  });

  const { data: statusDict } = useQuery({
    queryKey: ['dict', 'cd.status'],
    queryFn: () => dictApi.getItemTreeByCode('cd.status'),
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
          onClick={() => navigate('/bill/cd')}
          style={{ padding: 0, color: '#262626' }}
        >
          返回列表
        </Button>
        <Button
          type="primary"
          onClick={() => navigate(`/bill/cd/edit/${id}`)}
        >
          编辑
        </Button>
      </div>

      {cdDetail && (
        <>
          {/* 头部信息 */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ marginBottom: 8 }}>
              <Space align="center" size={12}>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {cdDetail.cdNo}
                </Typography.Title>
                {cdDetail.freezeFlag && <Tag color="orange">已质押/冻结</Tag>}
                {cdDetail.status && (
                  <Tag color="blue">{getDictLabel(statusDict, cdDetail.status)}</Tag>
                )}
              </Space>
            </div>
            <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 24 }}>
              开立银行：{cdDetail.bankName || '-'}
            </div>
            <Row gutter={48}>
              <Col>
                <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 4 }}>
                  本金 ({getDictLabel(currencyDict, cdDetail.currency) || 'CNY'})
                </div>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#262626' }}>
                  <AmountDisplay value={cdDetail.principalAmount} style={{ fontSize: 20, fontWeight: 500 }} />
                </div>
              </Col>
              <Col>
                <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 4 }}>到期日</div>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#262626' }}>
                  {cdDetail.maturityDate ? dayjs(cdDetail.maturityDate).format('YYYY-MM-DD') : '-'}
                </div>
              </Col>
              <Col>
                <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 4 }}>名义利率</div>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#262626' }}>
                  {cdDetail.interestRate != null ? `${cdDetail.interestRate}%` : '-'}
                </div>
              </Col>
              <Col>
                <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 4 }}>期限</div>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#262626' }}>
                  {cdDetail.termMonths != null ? `${cdDetail.termMonths} 个月` : '-'}
                </div>
              </Col>
            </Row>
            <Row gutter={48} style={{ marginTop: 16 }}>
              <Col>
                <span style={{ color: '#8c8c8c', fontSize: 12 }}>创建人：{cdDetail.createBy || '-'}</span>
              </Col>
              <Col>
                <span style={{ color: '#8c8c8c', fontSize: 12 }}>创建时间：{cdDetail.createTime ? dayjs(cdDetail.createTime).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
              </Col>
              <Col>
                <span style={{ color: '#8c8c8c', fontSize: 12 }}>修改人：{cdDetail.updateBy || '-'}</span>
              </Col>
              <Col>
                <span style={{ color: '#8c8c8c', fontSize: 12 }}>修改时间：{cdDetail.updateTime ? dayjs(cdDetail.updateTime).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
              </Col>
            </Row>
          </div>

          <Divider style={{ margin: '0 0 32px 0' }} />

          {/* 存单条款 */}
          <div style={{ marginBottom: 32 }}>
            <SectionTitle title="存单条款" />
            <Row gutter={16}>
              <InfoItem label="存单编号">{cdDetail.cdNo || '-'}</InfoItem>
              <InfoItem label="开立银行">{cdDetail.bankName || '-'}</InfoItem>
              <InfoItem label="币种">{getDictLabel(currencyDict, cdDetail.currency)}</InfoItem>

              <InfoItem label="本金">
                {cdDetail.principalAmount ? <AmountDisplay value={cdDetail.principalAmount} /> : '-'}
              </InfoItem>
              <InfoItem label="名义利率">
                {cdDetail.interestRate != null ? `${cdDetail.interestRate}%` : '-'}
              </InfoItem>
              <InfoItem label="计息规则">
                {getDictLabel(dayCountConventionDict, cdDetail.dayCountConvention)}
              </InfoItem>

              <InfoItem label="付息频率">
                {getDictLabel(interestPayFreqDict, cdDetail.interestPayFreq)}
              </InfoItem>
              <InfoItem label="是否复利">
                {cdDetail.compoundFlag ? <Tag color="blue">是</Tag> : <Tag>否</Tag>}
              </InfoItem>
              <InfoItem label="期限">{cdDetail.termMonths != null ? `${cdDetail.termMonths} 个月` : '-'}</InfoItem>
            </Row>
          </div>

          {/* 期限信息 */}
          <div style={{ marginBottom: 32 }}>
            <SectionTitle title="期限信息" />
            <Row gutter={16}>
              <InfoItem label="起息日">
                {cdDetail.issueDate ? dayjs(cdDetail.issueDate).format('YYYY-MM-DD') : '-'}
              </InfoItem>
              <InfoItem label="到期日">
                {cdDetail.maturityDate ? dayjs(cdDetail.maturityDate).format('YYYY-MM-DD') : '-'}
              </InfoItem>
              <InfoItem label="存单持有人">{cdDetail.certificateHolder || '-'}</InfoItem>

              <InfoItem label="是否自动续存">
                {cdDetail.autoRenewFlag ? <Tag color="blue">是</Tag> : <Tag>否</Tag>}
              </InfoItem>
              <InfoItem label="续存次数">{cdDetail.rolloverCount ?? '-'}</InfoItem>
              <InfoItem label="冻结/质押状态">
                {cdDetail.freezeFlag ? <Tag color="orange">是</Tag> : <Tag>否</Tag>}
              </InfoItem>
            </Row>
          </div>

          {/* 备注 */}
          {cdDetail.remark && (
            <div style={{ marginBottom: 32 }}>
              <SectionTitle title="备注" />
              <div style={{ color: '#262626', fontSize: 14, backgroundColor: '#fafafa', padding: 16, borderRadius: 4 }}>
                {cdDetail.remark}
              </div>
            </div>
          )}
        </>
      )}

      {!cdDetail && isLoading && (
        <Card loading={true} style={{ minHeight: 400 }} />
      )}
    </div>
  );
};

export default CDDetail;
