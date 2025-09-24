import React, { createContext, useContext, useState } from 'react';
import { Button, Dropdown, Typography } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import type { PrecisionLevel } from '@/types';

interface PrecisionContextType {
  precision: PrecisionLevel;
  setPrecision: (precision: PrecisionLevel) => void;
  formatAmount: (cents: number) => string;
}

const PrecisionContext = createContext<PrecisionContextType | undefined>(undefined);

export const usePrecision = (): PrecisionContextType => {
  const context = useContext(PrecisionContext);
  if (!context) {
    throw new Error('usePrecision must be used within a PrecisionProvider');
  }
  return context;
};

interface PrecisionProviderProps {
  children: React.ReactNode;
  defaultPrecision?: PrecisionLevel;
}

export const PrecisionProvider: React.FC<PrecisionProviderProps> = ({
  children,
  defaultPrecision = 2
}) => {
  const [precision, setPrecision] = useState<PrecisionLevel>(defaultPrecision);

  // 将分转换为万元并格式化
  const formatAmount = (cents: number): string => {
    const wanYuan = cents / 1000000; // 分 -> 万元
    return wanYuan.toFixed(precision === 2 ? 2 : precision === 4 ? 4 : 6);
  };

  const value: PrecisionContextType = {
    precision,
    setPrecision,
    formatAmount,
  };

  return (
    <PrecisionContext.Provider value={value}>
      {children}
    </PrecisionContext.Provider>
  );
};

export const GlobalPrecisionControl: React.FC = () => {
  const { precision, setPrecision } = usePrecision();

  const precisionOptions = [
    {
      key: '2',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 120 }}>
          <span>2位小数</span>
          <Typography.Text type="secondary">(百元)</Typography.Text>
        </div>
      ),
      onClick: () => setPrecision(2),
    },
    {
      key: '4',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 120 }}>
          <span>4位小数</span>
          <Typography.Text type="secondary">(元)</Typography.Text>
        </div>
      ),
      onClick: () => setPrecision(4),
    },
    {
      key: '6',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 120 }}>
          <span>6位小数</span>
          <Typography.Text type="secondary">(分)</Typography.Text>
        </div>
      ),
      onClick: () => setPrecision(6),
    },
  ];

  const getCurrentLabel = () => {
    switch (precision) {
      case 2:
        return '百元精度';
      case 4:
        return '元精度';
      case 6:
        return '分精度';
      default:
        return '元精度';
    }
  };

  return (
    <Dropdown
      menu={{ 
        items: precisionOptions,
        selectedKeys: [precision.toString()]
      }}
      placement="bottomRight"
      trigger={['click']}
    >
      <Button type="text" icon={<SettingOutlined />} size="small">
        {getCurrentLabel()}
      </Button>
    </Dropdown>
  );
};