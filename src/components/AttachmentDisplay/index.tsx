import React, { useState } from 'react';
import { Table, Button, Popconfirm, Space, Typography, Tag } from 'antd';
import { DeleteOutlined, FileOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { attachmentApi } from '@/services';
import { formatFileSize } from '@/components/RaxUpload/constants';
import type { SysAttachmentDto } from '@/types/swagger-api';

const { Text } = Typography;

/**
 * AttachmentDisplay 组件属性
 */
export interface AttachmentDisplayProps {
  /** 附件列表数据 */
  attachments: SysAttachmentDto[];
  /** 删除附件后的回调 */
  onDelete?: (deletedAttachment: SysAttachmentDto) => void;
  /** 是否禁用删除功能 */
  disableDelete?: boolean;
  /** 是否显示下载功能 */
  showDownload?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 表格大小 */
  size?: 'small' | 'middle' | 'large';
}

/**
 * 获取文件类型标签颜色
 */
const getFileTypeColor = (extension: string): string => {
  const colorMap: Record<string, string> = {
    '.pdf': 'red',
    '.doc': 'blue',
    '.docx': 'blue',
    '.xls': 'green',
    '.xlsx': 'green',
    '.csv': 'orange',
    '.jpg': 'purple',
    '.jpeg': 'purple',
    '.png': 'purple',
    '.gif': 'purple',
    '.bmp': 'purple',
    '.webp': 'purple'
  };

  return colorMap[extension.toLowerCase()] || 'default';
};

/**
 * 格式化日期时间
 */
const formatDateTime = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

const AttachmentDisplay: React.FC<AttachmentDisplayProps> = ({
  attachments,
  onDelete,
  disableDelete = false,
  showDownload = true,
  className,
  size = 'middle'
}) => {
  const [loading, setLoading] = useState<Set<number>>(new Set());

  // 处理删除附件
  const handleDelete = async (attachment: SysAttachmentDto) => {
    if (!attachment.id) return;

    setLoading(prev => new Set([...prev, attachment.id]));

    try {
      const result = await attachmentApi.remove(attachment.id);
      if (result.success) {
        onDelete?.(attachment);
      } else {
        throw new Error(result.message || '删除失败');
      }
    } catch (error: any) {
      console.error('删除附件失败:', error);
      // 这里可以添加错误提示
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(attachment.id);
        return newSet;
      });
    }
  };

  // 处理下载（这里只是示例，实际可能需要根据 fullUrl 或其他方式实现）
  const handleDownload = (attachment: SysAttachmentDto) => {
    // 实际实现可能需要根据具体的文件存储方案来调整
    console.log('下载文件:', attachment);
    // 可以通过 window.open 或创建 a 标签来下载
  };

  const columns: ColumnsType<SysAttachmentDto> = [
    {
      title: '文件名',
      dataIndex: 'originalName',
      key: 'originalName',
      ellipsis: { showTitle: true },
      render: (originalName: string, record) => (
        <Space>
          <FileOutlined />
          <Text strong title={originalName}>
            {originalName}
          </Text>
          {record.extension && (
            <Tag color={getFileTypeColor(record.extension)} size="small">
              {record.extension.toUpperCase()}
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 120,
      render: (fileSize: number) => (
        <Text type="secondary">{formatFileSize(fileSize)}</Text>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (createTime: string) => (
        <Text type="secondary">{formatDateTime(createTime)}</Text>
      )
    },
    {
      title: '创建人',
      dataIndex: 'createBy',
      key: 'createBy',
      width: 120,
      render: (createBy: string) => (
        <Text type="secondary">{createBy || '-'}</Text>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: showDownload ? 120 : 80,
      render: (_, record) => (
        <Space size="small">
          {showDownload && (
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
              title="下载文件"
            />
          )}
          {!disableDelete && (
            <Popconfirm
              title="确认删除"
              description={`确定要删除文件 "${record.originalName}" 吗？`}
              onConfirm={() => handleDelete(record)}
              okText="删除"
              cancelText="取消"
              okType="danger"
            >
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                loading={record.id ? loading.has(record.id) : false}
                title="删除文件"
              />
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className={className}>
      <Table
        columns={columns}
        dataSource={attachments}
        rowKey="id"
        size={size}
        pagination={false}
        locale={{
          emptyText: '暂无附件'
        }}
        scroll={{ x: 600 }}
      />
    </div>
  );
};

export default AttachmentDisplay;
export type { AttachmentDisplayProps };