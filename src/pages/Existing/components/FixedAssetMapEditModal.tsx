import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Row,
  Col,
  Divider,
  App,
  Descriptions
} from 'antd';
import dayjs from 'dayjs';
import type {
  FixedAssetMapDto,
  UpdateFixedAssetMapDto,
  AttachmentOperationDto
} from '@/types/swagger-api';
import { fixedAssetMapApi } from '@/services/fixedAssetMap';
import AmountDisplay from '@/components/AmountDisplay';
import RaxUpload from '@/components/RaxUpload';
import type { UploadedFile } from '@/components/RaxUpload';

interface FixedAssetMapEditModalProps {
  visible: boolean;
  record: FixedAssetMapDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

const FixedAssetMapEditModal: React.FC<FixedAssetMapEditModalProps> = ({
  visible,
  record,
  onClose,
  onSuccess
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);

  // 当 record 变化时，重置表单
  useEffect(() => {
    if (visible && record) {
      form.setFieldsValue({
        bookValueAtPledge: record.bookValueAtPledge ? record.bookValueAtPledge / 1000000 : undefined,
        appraisedValue: record.appraisedValue ? record.appraisedValue / 1000000 : undefined,
        pledgeRate: record.pledgeRate,
        pledgeRegNo: record.pledgeRegNo,
        pledgeRegDate: record.pledgeRegDate ? dayjs(record.pledgeRegDate) : undefined,
        pledgee: record.pledgee,
        remark: record.remark
      });
      // 初始化附件列表
      if (record.fileAttachments && record.fileAttachments.length > 0) {
        setFiles(record.fileAttachments.map(att => ({
          attachmentId: att.id || 0,
          filename: att.originalName || '',
          fileSize: att.fileSize || 0
        })));
      } else {
        setFiles([]);
      }
    }
  }, [visible, record, form]);

  const handleOk = async () => {
    if (!record?.id) return;

    try {
      const values = await form.validateFields();
      setLoading(true);

      // 计算附件操作
      const originalFileIds = new Set(
        (record.fileAttachments || []).map((f: any) => f.id || f.attachmentId)
      );
      const currentFileIds = new Set(files.map(f => f.attachmentId));
      const attachmentOperations: AttachmentOperationDto[] = [];

      // 新增和保留的附件
      files.forEach(f => {
        attachmentOperations.push({
          attachmentId: f.attachmentId,
          fileSize: f.fileSize,
          operation: originalFileIds.has(f.attachmentId) ? 'KEEP' : 'ADD'
        });
      });
      // 删除的附件
      (record.fileAttachments || []).forEach((f: any) => {
        const fId = f.id || f.attachmentId;
        if (!currentFileIds.has(fId)) {
          attachmentOperations.push({ attachmentId: fId, fileSize: f.fileSize, operation: 'DELETE' });
        }
      });

      const updateData: UpdateFixedAssetMapDto = {
        id: record.id,
        bookValueAtPledge: values.bookValueAtPledge ? Math.round(values.bookValueAtPledge * 1000000) : undefined,
        appraisedValue: values.appraisedValue ? Math.round(values.appraisedValue * 1000000) : undefined,
        pledgeRate: values.pledgeRate,
        pledgeRegNo: values.pledgeRegNo,
        pledgeRegDate: values.pledgeRegDate?.format('YYYY-MM-DD'),
        pledgee: values.pledgee,
        remark: values.remark,
        attachmentOperations
      };

      const result = await fixedAssetMapApi.update(updateData);
      if (result.success) {
        message.success('更新成功');
        onSuccess();
        handleClose();
      } else {
        message.error(result.message || '更新失败');
      }
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error('操作失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setFiles([]);
    onClose();
  };

  return (
    <Modal
      title="编辑固定资产关联"
      open={visible}
      onOk={handleOk}
      onCancel={handleClose}
      confirmLoading={loading}
      width={960}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        {record && (
          <>
            {/* 资产信息只读展示 */}
            <Divider orientation="left" style={{ fontSize: 14, marginTop: 0 }}>资产信息</Divider>
            <Descriptions
              bordered
              size="small"
              column={3}
              style={{ marginBottom: 16 }}
              styles={{ label: { background: '#fafafa', width: 120 } }}
            >
              <Descriptions.Item label="资产编码">
                {record.assetCodeSnapshot || record.assetCode || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="资产名称">
                {record.assetNameSnapshot || record.assetName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="资产分类">
                {record.assetCategoryName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="所属组织">
                {record.assetOrgName || record.assetOrgNameAbbr || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="当前账面价值">
                {record.assetBookValue ? <AmountDisplay value={record.assetBookValue} /> : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="地址">
                {record.assetAddress || '-'}
              </Descriptions.Item>
            </Descriptions>

            {/* 关联信息可编辑 */}
            <Divider orientation="left" style={{ fontSize: 14 }}>质押关联信息</Divider>
          </>
        )}

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="bookValueAtPledge" label="质押时账面价值（万元）">
              <InputNumber style={{ width: '100%' }} min={0} precision={6} disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="appraisedValue" label="评估/认可价值（万元）">
              <InputNumber style={{ width: '100%' }} min={0} precision={6} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="pledgeRate" label="质押率(%)">
              <InputNumber style={{ width: '100%' }} min={0} max={100} precision={2} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="pledgeRegNo" label="质押登记号">
              <Input placeholder="请输入" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="pledgeRegDate" label="质押登记日期">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="pledgee" label="质权人">
              <Input placeholder="请输入" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item name="remark" label="备注">
              <Input.TextArea rows={2} placeholder="请输入" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="附件" style={{ marginBottom: 0 }}>
              <RaxUpload
                bizModule="FinLoanFixedAssetMap"
                value={files}
                onChange={setFiles}
                maxCount={10}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default FixedAssetMapEditModal;
