import React, { useState } from 'react';
import { Card, Row, Col, Typography, Form, Divider } from 'antd';
import DictSelect from '@/components/DictSelect';

const { Title, Text, Paragraph } = Typography;

export const Dashboard: React.FC = () => {
  // 普通模式：返回单个值
  const [normalValue, setNormalValue] = useState<string | string[]>();

  // includeAncestors 模式：返回路径数组
  const [ancestorValue, setAncestorValue] = useState<string | string[]>();

  return (
    <div>
      <Title level={2}>DictSelect 组件演示</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="includeAncestors 功能演示">
            <Paragraph>
              <Text>
                当 <Text code>includeAncestors=true</Text> 时，选中某个选项后，
                <Text code>onChange</Text> 会返回从根节点到选中节点的完整路径数组。
              </Text>
            </Paragraph>

            <Divider />

            <Form layout="vertical">
              <Row gutter={[24, 16]}>
                {/* 普通模式 */}
                <Col xs={24} md={12}>
                  <Card type="inner" title="普通模式（默认）">
                    <Form.Item label="选择产品类型">
                      <DictSelect
                        dictCode="fin.product"
                        placeholder="请选择产品类型"
                        value={normalValue}
                        onChange={(val) => setNormalValue(val)}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                    <Form.Item label="返回值">
                      <Text code style={{ wordBreak: 'break-all' }}>
                        {normalValue
                          ? JSON.stringify(normalValue)
                          : '未选择'}
                      </Text>
                    </Form.Item>
                  </Card>
                </Col>

                {/* includeAncestors 模式 */}
                <Col xs={24} md={12}>
                  <Card type="inner" title="includeAncestors 模式">
                    <Form.Item label="选择产品类型">
                      <DictSelect
                        dictCode="fin.product"
                        placeholder="请选择产品类型"
                        value={ancestorValue}
                        onChange={(val) => setAncestorValue(val)}
                        includeAncestors
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                    <Form.Item label="返回值（路径数组）">
                      <Text code style={{ wordBreak: 'break-all' }}>
                        {ancestorValue
                          ? JSON.stringify(ancestorValue)
                          : '未选择'}
                      </Text>
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
            </Form>

            <Divider />

            <Paragraph type="secondary">
              <Text strong>说明：</Text>
              <br />
              - 普通模式下，选中子选项 B 时返回 <Text code>"B"</Text>
              <br />
              - includeAncestors 模式下，选中子选项 B 时返回 <Text code>["A", "B"]</Text>（A 是 B 的父级）
            </Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
