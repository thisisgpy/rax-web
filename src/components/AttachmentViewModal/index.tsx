import React from 'react';
import { Modal, Button } from 'antd';
import AttachmentDisplay from '@/components/AttachmentDisplay';
import type { SysAttachmentDto } from '@/types/swagger-api';

export interface AttachmentViewModalProps {
  /** 弹窗是否可见 */
  open: boolean;
  /** 关闭弹窗回调 */
  onClose: () => void;
  /** 附件列表 */
  attachments: SysAttachmentDto[];
  /** 弹窗标题 */
  title?: string;
}

const AttachmentViewModal: React.FC<AttachmentViewModalProps> = ({
  open,
  onClose,
  attachments,
  title = '附件列表'
}) => {
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={
        <Button onClick={onClose}>关闭</Button>
      }
      width={800}
      maskClosable={false}
      destroyOnHidden
    >
      <AttachmentDisplay
        attachments={attachments}
        disableDelete
        showDownload
        size="small"
      />
    </Modal>
  );
};

export default AttachmentViewModal;
