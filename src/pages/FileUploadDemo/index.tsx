import React, { useState } from 'react';
import { Card, Row, Col, Divider, Typography, Space, Button, message } from 'antd';
import { RaxUpload, AttachmentDisplay } from '@/components';
import type { UploadedFile } from '@/components';
import type { SysAttachmentDto } from '@/types/swagger-api';

const { Title, Paragraph, Text } = Typography;

/**
 * 文件上传组件演示页面
 */
const FileUploadDemo: React.FC = () => {
  // RaxUpload 组件状态
  const [reserveFiles, setReserveFiles] = useState<UploadedFile[]>([]);
  const [finExistingFiles, setFinExistingFiles] = useState<UploadedFile[]>([]);

  // AttachmentDisplay 组件模拟数据
  const [mockAttachments, setMockAttachments] = useState<SysAttachmentDto[]>([
    {
      id: 1,
      bizModule: 'ReserveReport',
      bizId: 100,
      originalName: '储备融资报告.pdf',
      savedName: 'reserve_report_20231201.pdf',
      extension: '.pdf',
      fileSize: 2048576, // 2MB
      isDeleted: false,
      createTime: '2023-12-01 10:30:00',
      createBy: '张三'
    },
    {
      id: 2,
      bizModule: 'ReserveReport',
      bizId: 100,
      originalName: '预算表.xlsx',
      savedName: 'budget_20231201.xlsx',
      extension: '.xlsx',
      fileSize: 512000, // 500KB
      isDeleted: false,
      createTime: '2023-12-01 14:15:00',
      createBy: '李四'
    },
    {
      id: 3,
      bizModule: 'FinExisting',
      bizId: 200,
      originalName: '项目图片.jpg',
      savedName: 'project_image_001.jpg',
      extension: '.jpg',
      fileSize: 1536000, // 1.5MB
      isDeleted: false,
      createTime: '2023-12-02 09:45:00',
      createBy: '王五'
    }
  ]);

  // 处理 AttachmentDisplay 删除
  const handleAttachmentDelete = (deletedAttachment: SysAttachmentDto) => {
    setMockAttachments(prev =>
      prev.filter(att => att.id !== deletedAttachment.id)
    );
    message.success(`附件 "${deletedAttachment.originalName}" 删除成功`);
  };

  // 模拟提交数据
  const handleSubmitData = () => {
    const data = {
      reserveFiles,
      finExistingFiles,
      attachments: mockAttachments
    };
    console.log('提交的数据:', data);
    message.info('数据已打印到控制台，请查看 Console');
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>融安心 - 文件上传组件</Title>

      <Row gutter={[24, 24]}>
        {/* RaxUpload 组件演示 */}
        <Col span={24}>
          <Card title="RaxUpload 文件上传组件">
            <Row gutter={24}>
              <Col xs={24} lg={12}>
                <Title level={4}>储备融资报告 (最多3个，≤10MB)</Title>
                <RaxUpload
                  bizModule="ReserveReport"
                  value={reserveFiles}
                  onChange={setReserveFiles}
                  maxSize={10 * 1024 * 1024}
                  maxCount={3}
                />
              </Col>

              <Col xs={24} lg={12}>
                <Title level={4}>存量融资文件 (无限制，≤5MB)</Title>
                <RaxUpload
                  bizModule="FinExisting"
                  value={finExistingFiles}
                  onChange={setFinExistingFiles}
                  maxSize={5 * 1024 * 1024}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* AttachmentDisplay 组件演示 */}
        <Col span={24}>
          <Card title="AttachmentDisplay 附件展示组件">
            <AttachmentDisplay
              attachments={mockAttachments}
              onDelete={handleAttachmentDelete}
              showDownload={true}
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FileUploadDemo;