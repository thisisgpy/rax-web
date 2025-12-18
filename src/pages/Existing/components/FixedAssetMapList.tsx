import React from 'react';
import { Table, Button, Dropdown, Modal } from 'antd';
import { EditOutlined, DeleteOutlined, PaperClipOutlined, SettingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { FixedAssetMapDto } from '@/types/swagger-api';
import AmountDisplay from '@/components/AmountDisplay';

interface FixedAssetMapListProps {
  dataSource: any[];
  loading?: boolean;
  rowKey?: string | ((record: any) => string);
  onEdit: (record: any) => void;
  onDelete: (record: any) => void;
  onViewAttachments?: (attachments: any[]) => void;
}

const FixedAssetMapList: React.FC<FixedAssetMapListProps> = ({
  dataSource,
  loading = false,
  rowKey = 'id',
  onEdit,
  onDelete,
  onViewAttachments
}) => {
  const columns: ColumnsType<any> = [
    {
      title: '资产编码',
      key: 'assetCode',
      width: 120,
      render: (_, record) => record.assetCodeSnapshot || record.assetCode || record._selectedAsset?.code || '-'
    },
    {
      title: '资产名称',
      key: 'assetName',
      ellipsis: true,
      render: (_, record) => record.assetNameSnapshot || record.assetName || record._selectedAsset?.name || '-'
    },
    {
      title: '所属组织',
      key: 'assetOrgNameAbbr',
      width: 100,
      render: (_, record) => record.assetOrgNameAbbr || record._selectedAsset?.orgNameAbbr || '-'
    },
    {
      title: '质押时账面价值',
      dataIndex: 'bookValueAtPledge',
      key: 'bookValueAtPledge',
      width: 140,
      render: (value: number) => value ? <AmountDisplay value={value} /> : '-'
    },
    {
      title: '评估价值',
      dataIndex: 'appraisedValue',
      key: 'appraisedValue',
      width: 120,
      render: (value: number) => value ? <AmountDisplay value={value} /> : '-'
    },
    {
      title: '质押率',
      dataIndex: 'pledgeRate',
      key: 'pledgeRate',
      width: 80,
      render: (value: number) => value ? `${value}%` : '-'
    },
    {
      title: '质押登记号',
      dataIndex: 'pledgeRegNo',
      key: 'pledgeRegNo',
      width: 120,
      render: (value) => value || '-'
    },
    {
      title: '质权人',
      dataIndex: 'pledgee',
      key: 'pledgee',
      width: 100,
      render: (value) => value || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => {
        const items = [
          ...(record.fileAttachments && record.fileAttachments.length > 0 && onViewAttachments ? [{
            key: 'attachment',
            label: `附件(${record.fileAttachments.length})`,
            icon: <PaperClipOutlined />,
            onClick: () => onViewAttachments(record.fileAttachments || [])
          }] : []),
          {
            key: 'edit',
            label: '编辑',
            icon: <EditOutlined />,
            onClick: () => onEdit(record)
          },
          {
            key: 'delete',
            label: '删除',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => {
              Modal.confirm({
                title: '确定要删除吗？',
                okText: '确定',
                cancelText: '取消',
                onOk: () => onDelete(record)
              });
            }
          }
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<SettingOutlined />} />
          </Dropdown>
        );
      }
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      rowKey={rowKey}
      pagination={false}
      size="small"
      loading={loading}
      scroll={{ x: 1200 }}
    />
  );
};

export default FixedAssetMapList;
