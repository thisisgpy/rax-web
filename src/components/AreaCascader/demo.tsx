import React, { useState } from 'react';
import { Card, Form, Button, Space, Typography } from 'antd';
import AreaCascader from './index';

const { Title, Text } = Typography;

export const AreaCascaderDemo: React.FC = () => {
  const [form] = Form.useForm();
  const [selectedValues, setSelectedValues] = useState<string[]>();

  const handleValuesChange = (values: string[]) => {
    setSelectedValues(values);
  };

  const handleFinish = (values: any) => {
    // 表单提交处理
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>AreaCascader 组件演示</Title>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 基础使用 */}
        <Card title="基础使用">
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            支持部分选择：可以只选择省份，或省+市，不强制选择到最后一级
          </Text>
          <AreaCascader
            placeholder="请选择省/市/区"
            onChange={handleValuesChange}
            style={{ width: 300 }}
          />
          {selectedValues && (
            <div style={{ marginTop: 16 }}>
              <Text>选中的值: {selectedValues.join(' → ')}</Text>
              <br />
              <Text type="secondary">
                级别: {selectedValues.length === 1 ? '省份' :
                      selectedValues.length === 2 ? '省+市' : '省+市+区'}
              </Text>
            </div>
          )}
        </Card>

        {/* 部分选择演示 */}
        <Card title="部分选择演示">
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            以下示例展示了可以在任意级别停止选择的效果：
          </Text>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong>示例1: 只选择四川省</Text>
              <AreaCascader
                placeholder="点击四川省即可选择"
                style={{ width: 300, marginLeft: 16 }}
                onChange={(values) => {/* 省份选择回调 */}}
              />
            </div>
            <div>
              <Text strong>示例2: 选择四川省 → 成都市</Text>
              <AreaCascader
                placeholder="可在市级停止选择"
                style={{ width: 300, marginLeft: 16 }}
                onChange={(values) => {/* 省市选择回调 */}}
              />
            </div>
            <div>
              <Text strong>示例3: 完整选择到区县</Text>
              <AreaCascader
                placeholder="也可以选择到区县"
                style={{ width: 300, marginLeft: 16 }}
                onChange={(values) => {/* 完整选择回调 */}}
              />
            </div>
          </Space>
        </Card>

        {/* 级别控制 */}
        <Card title="级别控制">
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            通过 level 参数控制最大可选择的级别：
          </Text>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong>仅省份选择 (level=1):</Text>
              <AreaCascader
                placeholder="只能选择省份"
                level={1}
                style={{ width: 300, marginLeft: 16 }}
                onChange={(values) => {/* 仅省份选择 */}}
              />
            </div>
            <div>
              <Text strong>省市选择 (level=2):</Text>
              <AreaCascader
                placeholder="最多选择到市级"
                level={2}
                style={{ width: 300, marginLeft: 16 }}
                onChange={(values) => {/* 省市选择 */}}
              />
            </div>
            <div>
              <Text strong>省市区选择 (level=3):</Text>
              <AreaCascader
                placeholder="可选择到区县级"
                level={3}
                style={{ width: 300, marginLeft: 16 }}
                onChange={(values) => {/* 省市区选择 */}}
              />
            </div>
          </Space>
        </Card>


        {/* 表单集成 */}
        <Card title="表单集成">
          <Form
            form={form}
            onFinish={handleFinish}
            layout="vertical"
            style={{ maxWidth: 400 }}
          >
            <Form.Item
              name="area"
              label="所在地区"
              rules={[{ required: true, message: '请选择所在地区' }]}
            >
              <AreaCascader placeholder="请选择省/市/区" />
            </Form.Item>

            <Form.Item
              name="birthPlace"
              label="出生地 (仅省市)"
            >
              <AreaCascader
                placeholder="请选择出生地"
                level={2}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  提交
                </Button>
                <Button onClick={() => form.resetFields()}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </div>
  );
};