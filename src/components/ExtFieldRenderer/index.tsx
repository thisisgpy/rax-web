import React from 'react';
import { Input, InputNumber, DatePicker, Switch } from 'antd';
import type { Dayjs } from 'dayjs';
import DictSelect from '@/components/DictSelect';
import type { FinLoanExtFieldDefDto } from '@/types/swagger-api';

export interface ExtFieldRendererProps {
  /** 字段定义 */
  field: FinLoanExtFieldDefDto;
  /** 字段值 */
  value?: any;
  /** 值变化回调 */
  onChange?: (value: any) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 扩展字段渲染器
 * 根据字段定义的 dataType 渲染对应的表单控件
 */
const ExtFieldRenderer: React.FC<ExtFieldRendererProps> = ({
  field,
  value,
  onChange,
  disabled = false,
}) => {
  const { dataType, dictCode, fieldLabel } = field;

  // 如果有 dictCode，使用 DictSelect
  if (dictCode) {
    return (
      <DictSelect
        dictCode={dictCode}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={`请选择${fieldLabel}`}
      />
    );
  }

  // 根据 dataType 渲染不同的控件
  switch (dataType) {
    case 'string':
      return (
        <Input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          placeholder={`请输入${fieldLabel}`}
          maxLength={2048}
        />
      );

    case 'number':
      return (
        <InputNumber
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={`请输入${fieldLabel}`}
          precision={0}
          style={{ width: '100%' }}
        />
      );

    case 'decimal':
      return (
        <InputNumber
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={`请输入${fieldLabel}`}
          precision={10}
          style={{ width: '100%' }}
        />
      );

    case 'date':
      return (
        <DatePicker
          value={value as Dayjs}
          onChange={onChange}
          disabled={disabled}
          placeholder={`请选择${fieldLabel}`}
          style={{ width: '100%' }}
        />
      );

    case 'datetime':
      return (
        <DatePicker
          value={value as Dayjs}
          onChange={onChange}
          disabled={disabled}
          placeholder={`请选择${fieldLabel}`}
          showTime
          style={{ width: '100%' }}
        />
      );

    case 'boolean':
      return (
        <Switch
          checked={value}
          onChange={onChange}
          disabled={disabled}
        />
      );

    default:
      // 未知类型默认使用 Input
      return (
        <Input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          placeholder={`请输入${fieldLabel}`}
        />
      );
  }
};

export default ExtFieldRenderer;

// 导出工具函数
export {
  formValuesToExtFieldValList,
  extFieldValListToFormValues,
  getFormValueFromExtFieldVal,
  buildExtFieldVal,
} from './utils';

// 导出批量渲染组件
export { default as ExtFieldFormItems } from './ExtFieldFormItems';
