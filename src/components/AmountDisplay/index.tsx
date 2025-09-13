import React from 'react';
import { Typography } from 'antd';
import { usePrecision } from '@/components/GlobalPrecision';

interface AmountDisplayProps {
  value: number; // 输入单位：分
  showUnit?: boolean; // 是否显示单位
  style?: React.CSSProperties;
  className?: string;
  type?: 'default' | 'secondary' | 'success' | 'warning' | 'danger';
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({
  value,
  showUnit = true,
  style,
  className,
  type = 'default'
}) => {
  const { formatAmount } = usePrecision();

  const formattedValue = formatAmount(value);

  return (
    <Typography.Text
      type={type === 'default' ? undefined : type}
      style={style}
      className={className}
    >
      {formattedValue}
      {showUnit && (
        <Typography.Text type="secondary" style={{ marginLeft: 2 }}>
          万元
        </Typography.Text>
      )}
    </Typography.Text>
  );
};