import React, { useState } from 'react';
import { Card, Row, Col, Typography, List, Statistic, Form } from 'antd';
import { CheckOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { AmountDisplay } from '@/components/AmountDisplay';
import { DictSelect } from '@/components/DictSelect';

const { Title } = Typography;

// 模拟数据
const mockTodos = [
  { id: '1', title: '审核待办事项 1', status: 'pending', deadline: '2024-01-15' },
  { id: '2', title: '财务报告提交', status: 'pending', deadline: '2024-01-16' },
  { id: '3', title: '月度总结', status: 'completed', deadline: '2024-01-14' },
  { id: '4', title: '业务数据分析', status: 'urgent', deadline: '2024-01-15' },
];

const mockQuickAccess = [
  { id: '1', title: '新增记录', path: '/records/new' },
  { id: '2', title: '财务报表', path: '/reports' },
  { id: '3', title: '用户管理', path: '/users' },
  { id: '4', title: '系统设置', path: '/settings' },
];

const mockStats = [
  { title: '总资产', value: 123456789, // 分为单位
    prefix: '¥', status: 'increase' },
  { title: '本月收入', value: 987654321, 
    prefix: '¥', status: 'increase' },
  { title: '本月支出', value: 456789123, 
    prefix: '¥', status: 'decrease' },
  { title: '待处理事项', value: 12, suffix: '项' },
];

export const Dashboard: React.FC = () => {
  const [selectedCapitalStructure, setSelectedCapitalStructure] = useState<string | undefined>();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'completed':
        return <CheckOutlined style={{ color: '#52c41a' }} />;
      case 'REJECTED':
      case 'urgent':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'completed':
        return '#52c41a';
      case 'REJECTED':
      case 'urgent':
        return '#ff4d4f';
      default:
        return '#1890ff';
    }
  };

  return (
    <div>
      <Title level={2}>仪表盘</Title>
      
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {mockStats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                formatter={(value) => {
                  if (stat.prefix === '¥' && typeof value === 'number') {
                    return <AmountDisplay value={value} showUnit={false} />;
                  }
                  return value;
                }}
                valueStyle={{
                  color: stat.status === 'increase' ? '#52c41a' : 
                         stat.status === 'decrease' ? '#ff4d4f' : undefined
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* 待办事项 */}
        <Col xs={24} lg={12}>
          <Card title="待办事项" extra={<a href="/todos">查看全部</a>}>
            <List
              dataSource={mockTodos}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Typography.Text 
                      type="secondary" 
                      style={{ fontSize: '12px' }}
                    >
                      {item.deadline}
                    </Typography.Text>
                  ]}
                >
                  <List.Item.Meta
                    avatar={getStatusIcon(item.status)}
                    title={
                      <span style={{ color: getStatusColor(item.status) }}>
                        {item.title}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 快速访问 */}
        <Col xs={24} lg={12}>
          <Card title="快速访问">
            <Row gutter={[8, 8]}>
              {mockQuickAccess.map((item) => (
                <Col span={12} key={item.id}>
                  <Card.Grid 
                    style={{ 
                      width: '100%', 
                      textAlign: 'center',
                      cursor: 'pointer',
                      padding: '16px 8px'
                    }}
                    hoverable
                  >
                    <Typography.Link>{item.title}</Typography.Link>
                  </Card.Grid>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 字典组件展示区域 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="数据字典组件演示">
            <Form layout="vertical">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="资本结构类型">
                    <DictSelect
                      dictCode="capital.structure"
                      placeholder="请选择资本结构类型"
                      value={selectedCapitalStructure}
                      onChange={setSelectedCapitalStructure}
                      showDisabled={true}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={16}>
                  <Form.Item label="选择的值">
                    <Typography.Text code>
                      {selectedCapitalStructure || '未选择'}
                    </Typography.Text>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="收支趋势">
            <div style={{ 
              height: 200, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: '#f5f5f5',
              borderRadius: '4px'
            }}>
              <Typography.Text type="secondary">
                图表组件待集成
              </Typography.Text>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="业务分布">
            <div style={{ 
              height: 200, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: '#f5f5f5',
              borderRadius: '4px'
            }}>
              <Typography.Text type="secondary">
                图表组件待集成
              </Typography.Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};