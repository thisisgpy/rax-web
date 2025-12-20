import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Space,
  Row,
  Col,
  App,
  Spin,
  Typography,
  Divider
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const { Title } = Typography;
import { useQuery, useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { cdApi } from '@/services/cd';
import type { CreateLoanCdDto, UpdateLoanCdDto, SysAttachmentDto, AttachmentOperationDto } from '@/types/swagger-api';
import InstitutionSelect from '@/components/InstitutionSelect';
import DictSelect from '@/components/DictSelect';
import RaxUpload from '@/components/RaxUpload';
import type { UploadedFile } from '@/components/RaxUpload';

const CDForm: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const isEdit = !!id;

  // 附件状态
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [originalFiles, setOriginalFiles] = useState<SysAttachmentDto[]>([]);

  // 获取存单详情
  const { data: cdDetail, isLoading } = useQuery({
    queryKey: ['cd', 'detail', id],
    queryFn: async () => {
      const result = await cdApi.get(Number(id));
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || '获取详情失败');
    },
    enabled: isEdit
  });

  // 设置表单初始值
  useEffect(() => {
    if (cdDetail) {
      form.setFieldsValue({
        cdNo: cdDetail.cdNo,
        bankId: cdDetail.bankId,
        cardId: cdDetail.cardId,
        currency: cdDetail.currency,
        principalAmount: cdDetail.principalAmount ? cdDetail.principalAmount / 1000000 : undefined,
        interestRate: cdDetail.interestRate,
        issueDate: cdDetail.issueDate ? dayjs(cdDetail.issueDate) : undefined,
        maturityDate: cdDetail.maturityDate ? dayjs(cdDetail.maturityDate) : undefined,
        termMonths: cdDetail.termMonths,
        remark: cdDetail.remark
      });

      // 设置附件
      if (cdDetail.attachments) {
        setOriginalFiles(cdDetail.attachments);
        setFiles(cdDetail.attachments.map((att: SysAttachmentDto) => ({
          attachmentId: att.id,
          filename: att.originalName || '',
          fileSize: att.fileSize || 0
        })));
      }
    }
  }, [cdDetail, form]);

  // 创建存单
  const createMutation = useMutation({
    mutationFn: (data: CreateLoanCdDto) => cdApi.create(data),
    onSuccess: () => {
      message.success('创建成功');
      navigate('/bill/cd');
    },
    onError: (error: any) => {
      message.error(error.message || '创建失败');
    }
  });

  // 更新存单
  const updateMutation = useMutation({
    mutationFn: (data: UpdateLoanCdDto) => cdApi.update(data),
    onSuccess: () => {
      message.success('更新成功');
      navigate(`/bill/cd/detail/${id}`);
    },
    onError: (error: any) => {
      message.error(error.message || '更新失败');
    }
  });

  // 计算附件操作（用于编辑模式）
  const computeAttachmentOperations = (): AttachmentOperationDto[] => {
    const operations: AttachmentOperationDto[] = [];
    const originalIds = new Set(originalFiles.map(f => f.id));
    const currentIds = new Set(files.map(f => f.attachmentId));

    // 新增的附件（当前有，原始没有）
    files.forEach(f => {
      if (!originalIds.has(f.attachmentId)) {
        operations.push({
          attachmentId: f.attachmentId,
          fileSize: f.fileSize,
          operation: 'ADD'
        });
      }
    });

    // 保留的附件（当前有，原始也有）
    files.forEach(f => {
      if (originalIds.has(f.attachmentId)) {
        operations.push({
          attachmentId: f.attachmentId,
          fileSize: f.fileSize,
          operation: 'KEEP'
        });
      }
    });

    // 删除的附件（原始有，当前没有）
    originalFiles.forEach(f => {
      if (!currentIds.has(f.id)) {
        operations.push({
          attachmentId: f.id,
          fileSize: f.fileSize,
          operation: 'DELETE'
        });
      }
    });

    return operations;
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const data = {
        cdNo: values.cdNo,
        bankId: values.bankId,
        cardId: values.cardId,
        currency: values.currency,
        principalAmount: values.principalAmount ? Math.round(values.principalAmount * 1000000) : 0,
        interestRate: values.interestRate,
        issueDate: values.issueDate?.format('YYYY-MM-DD'),
        maturityDate: values.maturityDate?.format('YYYY-MM-DD'),
        termMonths: values.termMonths,
        remark: values.remark
      };

      if (isEdit) {
        updateMutation.mutate({
          id: Number(id),
          ...data,
          attachmentOperations: computeAttachmentOperations()
        } as UpdateLoanCdDto);
      } else {
        // 创建模式：所有附件都是新增
        const uploadedAttachments = files.map(f => ({
          attachmentId: f.attachmentId,
          fileSize: f.fileSize,
          operation: 'ADD' as const
        }));
        createMutation.mutate({
          ...data,
          uploadedAttachments
        } as CreateLoanCdDto);
      }
    } catch (error) {
      // 表单验证失败
    }
  };

  // 区块标题组件
  const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
    <div style={{
      fontSize: 16,
      fontWeight: 500,
      color: '#262626',
      marginBottom: 24,
      paddingLeft: 12,
      borderLeft: '3px solid #1890ff'
    }}>
      {title}
    </div>
  );

  return (
    <Spin spinning={isLoading}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
        {/* 顶部操作栏 */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/bill/cd')}
            style={{ padding: 0, color: '#262626' }}
          >
            返回列表
          </Button>
          <Space>
            <Button onClick={() => navigate('/bill/cd')}>取消</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {isEdit ? '保存' : '创建'}
            </Button>
          </Space>
        </div>

        {/* 页面标题 */}
        <div style={{ marginBottom: 32 }}>
          <Title level={4} style={{ margin: 0 }}>
            {isEdit ? '编辑存单' : '新增存单'}
          </Title>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={{ currency: '人民币' }}
        >
          {/* 基本信息 */}
          <div style={{ marginBottom: 32 }}>
            <SectionTitle title="基本信息" />
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="cdNo"
                  label="存单编号"
                  rules={[{ required: true, message: '请输入存单编号' }]}
                >
                  <Input placeholder="请输入存单编号" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="bankId"
                  label="开立银行"
                  rules={[{ required: true, message: '请选择开立银行' }]}
                >
                  <InstitutionSelect placeholder="请选择开立银行" initialLabel={cdDetail?.bankName} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="currency"
                  label="币种"
                  rules={[{ required: true, message: '请选择币种' }]}
                >
                  <DictSelect dictCode="sys.currency" placeholder="请选择币种" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="principalAmount"
                  label="本金（万元）"
                  rules={[{ required: true, message: '请输入本金' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={6}
                    placeholder="请输入本金"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider style={{ margin: '0 0 32px 0' }} />

          {/* 期限信息 */}
          <div style={{ marginBottom: 32 }}>
            <SectionTitle title="期限信息" />
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="issueDate"
                  label="起息日"
                  rules={[{ required: true, message: '请选择起息日' }]}
                >
                  <DatePicker style={{ width: '100%' }} placeholder="请选择起息日" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="maturityDate"
                  label="到期日"
                  rules={[{ required: true, message: '请选择到期日' }]}
                >
                  <DatePicker style={{ width: '100%' }} placeholder="请选择到期日" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="termMonths" label="期限(月)">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={0}
                    placeholder="请输入期限"
                  />
                </Form.Item>
              </Col>
            </Row>

          </div>

          <Divider style={{ margin: '0 0 32px 0' }} />

          {/* 利率信息 */}
          <div style={{ marginBottom: 32 }}>
            <SectionTitle title="利率信息" />
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item name="interestRate" label="名义利率(%)">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={4}
                    placeholder="请输入利率"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider style={{ margin: '0 0 32px 0' }} />

          {/* 备注 */}
          <div style={{ marginBottom: 32 }}>
            <SectionTitle title="备注" />
            <Row gutter={24}>
              <Col span={16}>
                <Form.Item name="remark">
                  <Input.TextArea rows={3} placeholder="请输入备注" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider style={{ margin: '0 0 32px 0' }} />

          {/* 附件 */}
          <div style={{ marginBottom: 32 }}>
            <SectionTitle title="附件" />
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item>
                  <RaxUpload
                    bizModule="FinLoanCd"
                    value={files}
                    onChange={setFiles}
                    maxCount={10}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* 底部操作栏 */}
          <Divider style={{ margin: '0 0 24px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingBottom: 24 }}>
            <Button onClick={() => navigate('/bill/cd')}>取消</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {isEdit ? '保存' : '创建'}
            </Button>
          </div>
        </Form>
      </div>
    </Spin>
  );
};

export default CDForm;
