import React from 'react';
import { Form, Row, Col } from 'antd';
import type { FinLoanExtFieldDefDto } from '@/types/swagger-api';
import ExtFieldRenderer from './index';

export interface ExtFieldFormItemsProps {
  /** 字段定义列表 */
  fields: FinLoanExtFieldDefDto[];
  /** 是否禁用所有字段 */
  disabled?: boolean;
  /** 每行显示列数，默认 2 */
  columns?: 1 | 2 | 3;
}

/**
 * 扩展字段表单项批量渲染组件
 * 根据字段定义列表批量渲染 Form.Item
 */
const ExtFieldFormItems: React.FC<ExtFieldFormItemsProps> = ({
  fields,
  disabled = false,
  columns = 2,
}) => {
  if (!fields || fields.length === 0) {
    return null;
  }

  // 过滤出可见的字段
  const visibleFields = fields.filter((field) => field.isVisible !== false);

  if (visibleFields.length === 0) {
    return null;
  }

  // 计算每列的 span
  const colSpan = 24 / columns;

  return (
    <Row gutter={16}>
      {visibleFields.map((field) => (
        <Col span={colSpan} key={field.fieldKey}>
          <Form.Item
            name={field.fieldKey}
            label={field.fieldLabel}
            rules={[
              {
                required: field.isRequired,
                message: `请输入${field.fieldLabel}`,
              },
            ]}
            tooltip={field.remark}
            valuePropName={field.dataType === 'boolean' ? 'checked' : 'value'}
          >
            <ExtFieldRenderer field={field} disabled={disabled} />
          </Form.Item>
        </Col>
      ))}
    </Row>
  );
};

export default ExtFieldFormItems;
