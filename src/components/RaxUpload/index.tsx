import React from 'react';
import { Upload, Button, Progress, Alert, Card, Empty } from 'antd';
import { UploadOutlined, DeleteOutlined, StopOutlined } from '@ant-design/icons';
import { DEFAULT_ACCEPTED_TYPES, DEFAULT_MAX_SIZE, formatFileSize } from './constants';
import { useRaxUpload } from './hooks';
import type { RaxUploadProps } from './types';
import type { RcFile } from 'antd/lib/upload';

const RaxUpload: React.FC<RaxUploadProps> = ({
  bizModule,
  value = [],
  onChange,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  disabled = false,
  maxCount,
  className
}) => {
  // 使用自定义 hook 处理上传逻辑
  const {
    uploadState,
    handleFileUpload,
    handleRemoveFile,
    cancelUpload,
    clearError
  } = useRaxUpload(bizModule, value, onChange, {
    maxSize,
    acceptedTypes,
    maxCount
  });

  // 生成 accept 属性
  const acceptProp = acceptedTypes.join(',');

  // 检查是否禁用上传
  const isUploadDisabled = disabled || uploadState.uploading || (maxCount && value.length >= maxCount);

  // 处理文件选择
  const handleBeforeUpload = (file: RcFile) => {
    handleFileUpload(file);
    return false; // 阻止 Upload 组件的默认上传行为
  };

  return (
    <div className={className}>
      {/* 文件上传区域 - 按照要求不支持拖拽 */}
      <div style={{ marginBottom: 16 }}>
        {uploadState.uploading ? (
          // 上传中显示取消按钮
          <Button
            icon={<StopOutlined />}
            danger
            size="large"
            onClick={cancelUpload}
            style={{ width: '100%', height: 64 }}
          >
            <div>
              <div style={{ fontSize: 16, marginBottom: 4 }}>
                取消上传
              </div>
              <div style={{ fontSize: 12, color: '#999' }}>
                点击取消当前上传任务
              </div>
            </div>
          </Button>
        ) : (
          // 正常状态显示上传按钮
          <Upload
            accept={acceptProp}
            beforeUpload={handleBeforeUpload}
            showUploadList={false}
            disabled={isUploadDisabled}
            multiple={false}
          >
            <Button
              icon={<UploadOutlined />}
              disabled={isUploadDisabled}
              size="large"
              style={{ width: '100%', height: 64 }}
            >
              <div>
                <div style={{ fontSize: 16, marginBottom: 4 }}>
                  点击选择文件
                </div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  支持单个文件上传，最大 {formatFileSize(maxSize)}
                  {maxCount && ` • 最多 ${maxCount} 个文件`}
                </div>
              </div>
            </Button>
          </Upload>
        )}
      </div>

      {/* 上传进度 */}
      {uploadState.uploading && (
        <div style={{ marginBottom: 16 }}>
          <Progress
            percent={uploadState.progress}
            status="active"
            showInfo={true}
          />
          <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: 12 }}>
            正在上传文件，请稍候...
          </p>
        </div>
      )}

      {/* 错误提示 */}
      {uploadState.error && (
        <Alert
          message="上传失败"
          description={uploadState.error}
          type="error"
          closable
          onClose={clearError}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 已上传文件列表 */}
      {value.length > 0 ? (
        <Card size="small" title={`已上传文件 (${value.length})`}>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {value.map((file, index) => (
              <div
                key={`${file.attachmentId}-${index}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: index < value.length - 1 ? '1px solid #f0f0f0' : 'none'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={file.filename}
                  >
                    {file.filename}
                  </div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                    {formatFileSize(file.fileSize)} • ID: {file.attachmentId}
                  </div>
                </div>
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveFile(index)}
                  disabled={disabled}
                  title="删除文件"
                />
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card size="small" title="已上传文件">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无文件"
            style={{ margin: '16px 0' }}
          />
        </Card>
      )}
    </div>
  );
};

export default RaxUpload;
export type { RaxUploadProps, UploadedFile, BizModule } from './types';