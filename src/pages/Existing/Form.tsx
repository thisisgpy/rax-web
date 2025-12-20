import React, { useEffect, useState, useMemo } from 'react';
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Switch,
  Button,
  Space,
  Row,
  Col,
  App,
  Typography,
  Divider,
  Spin
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined
} from '@ant-design/icons';

const { Title } = Typography;
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { loanApi } from '@/services/loan';
import { loanExtFieldApi } from '@/services/loanExtField';
import type {
  CreateLoanDto,
  UpdateLoanDto,
  LoanRelatedData,
  AttachmentOperationDto,
  FinInstitutionDto,
  SysAttachmentDto
} from '@/types/swagger-api';
import OrgSelect from '@/components/OrgSelect';
import InstitutionSelect from '@/components/InstitutionSelect';
import DictSelect from '@/components/DictSelect';
import RaxUpload from '@/components/RaxUpload';
import type { UploadedFile } from '@/components/RaxUpload';
import {
  ExtFieldFormItems,
  formValuesToExtFieldValList,
  extFieldValListToFormValues
} from '@/components/ExtFieldRenderer';

// 融资类型与子表单组件的映射
import ParticipantForm from './components/ParticipantForm';
import LcForm from './components/LcForm';
import CdForm from './components/CdForm';
import TrustTrancheForm from './components/TrustTrancheForm';
import FactoringArItemForm from './components/FactoringArItemForm';
import ScfVoucherItemForm from './components/ScfVoucherItemForm';
import LeasedAssetForm from './components/LeasedAssetForm';
import FixedAssetMapForm from './components/FixedAssetMapForm';

const { TextArea } = Input;

// 融资类型代码映射（productType -> 组件类型）
const PRODUCT_TYPE_COMPONENT_MAP: Record<string, string> = {
  '银团融资': 'participant',
  '信用证': 'lc',
  '存单质押': 'cd',
  '信托公司融资': 'tranche',
  '保理公司融资': 'factoring',
  '供应链金融平台融资': 'scf',
  '融资租赁公司融资': 'leasing',
  '固定资产融资': 'fixedAsset',
};

const ExistingForm: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const loanId = id ? Number(id) : undefined;
  const [form] = Form.useForm();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [originalFiles, setOriginalFiles] = useState<SysAttachmentDto[]>([]); // 原始附件列表，用于计算附件操作
  const [relatedData, setRelatedData] = useState<LoanRelatedData>({});

  // 监听融资类型变化
  const productType = Form.useWatch('productType', form);
  const rateMode = Form.useWatch('rateMode', form);

  // 当前融资类型对应的子表单类型
  const currentComponentType = useMemo(() => {
    if (!productType) return null;
    // productType 可能是级联选择的结果 [family, type]
    const typeCode = Array.isArray(productType) ? productType[1] : productType;
    return PRODUCT_TYPE_COMPONENT_MAP[typeCode] || null;
  }, [productType]);

  // 获取扩展字段定义（根据产品类型）
  const { data: extFieldDefsData } = useQuery({
    queryKey: ['extFieldDefs', productType],
    queryFn: async () => {
      if (!productType) return [];
      const [family, type] = Array.isArray(productType) ? productType : [productType, productType];
      const result = await loanExtFieldApi.getDefListByProduct(family, type);
      if (result.success) {
        return result.data;
      }
      return [];
    },
    enabled: !!productType
  });

  const extFieldDefs = extFieldDefsData || [];

  // 获取融资详情（编辑模式）
  const { data: loanDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['loan', 'detail', id],
    queryFn: async () => {
      if (!id) return null;
      const result = await loanApi.get(Number(id));
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || '获取详情失败');
    },
    enabled: isEdit
  });

  // 创建融资
  const createMutation = useMutation({
    mutationFn: (data: CreateLoanDto) => loanApi.create(data),
    onSuccess: () => {
      message.success('创建成功');
      navigate('/financing/existing');
    },
    onError: (error: any) => {
      message.error(error.message || '创建失败');
    }
  });

  // 更新融资
  const updateMutation = useMutation({
    mutationFn: (data: UpdateLoanDto) => loanApi.update(data),
    onSuccess: () => {
      message.success('更新成功');
      navigate(`/financing/existing/detail/${id}`);
    },
    onError: (error: any) => {
      message.error(error.message || '更新失败');
    }
  });

  // 初始化表单数据（编辑模式）
  useEffect(() => {
    if (loanDetail) {
      const formData: any = {
        ...loanDetail,
        // 融资类型需要转换为级联格式
        productType: [loanDetail.productFamily, loanDetail.productType],
        // 日期转换
        maturityDate: loanDetail.maturityDate ? dayjs(loanDetail.maturityDate) : undefined,
        rateResetAnchorDate: loanDetail.rateResetAnchorDate ? dayjs(loanDetail.rateResetAnchorDate) : undefined,
        // 金额转换（分 -> 万元）
        contractAmount: loanDetail.contractAmount ? loanDetail.contractAmount / 1000000 : undefined,
      };

      // 回填扩展字段值
      if (loanDetail.extFieldValList && loanDetail.extFieldValList.length > 0) {
        const extFieldValues = extFieldValListToFormValues(loanDetail.extFieldValList);
        Object.assign(formData, extFieldValues);
      }

      form.setFieldsValue(formData);

      // 设置附件
      if (loanDetail.fileAttachments) {
        // 保存原始附件列表，用于编辑时计算附件操作
        setOriginalFiles(loanDetail.fileAttachments);
        setFiles(loanDetail.fileAttachments.map((att: any) => ({
          attachmentId: att.id || att.attachmentId,
          filename: att.originalName || att.filename,
          fileSize: att.fileSize
        })));
      }

      // 设置关联数据
      // 注意：编辑模式下，participantList/arItemList/leasedAssetList/voucherItemList/trancheList
      // 由各子表单组件通过独立API加载，不在此处设置（类型也不兼容）
      // 仅设置 cdMapList/lcMapList，因为它们需要数据转换
      setRelatedData({
        cdMapList: loanDetail.cdList?.map((cd: any) => ({
          cdId: cd.cdId,
          pledgeRatio: cd.pledgeRatio,
          securedValue: cd.securedValue,
          registrationNo: cd.registrationNo,
          registrationDate: cd.registrationDate,
          releaseDate: cd.releaseDate,
          status: cd.mapStatus,
          voucherNo: cd.voucherNo,
          remark: cd.mapRemark
        })),
        lcMapList: loanDetail.lcList?.map((lc: any) => ({
          lcId: lc.lcId,
          securedValue: lc.securedValue,
          marginLockedAmount: lc.marginLockedAmount,
          allocationNote: lc.allocationNote,
          status: lc.mapStatus,
          remark: lc.mapRemark
        }))
      });
    }
  }, [loanDetail, form]);

  // 处理机构选择
  const handleInstitutionChange = (_institutionId?: number, institution?: FinInstitutionDto) => {
    if (institution) {
      form.setFieldsValue({
        institutionId: institution.id,
        institutionName: institution.branchName || institution.name
      });
    } else {
      form.setFieldsValue({
        institutionId: undefined,
        institutionName: undefined
      });
    }
  };

  // 处理关联数据变化
  const handleRelatedDataChange = (key: keyof LoanRelatedData, data: any) => {
    setRelatedData(prev => ({
      ...prev,
      [key]: data
    }));
  };

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
      // 处理融资类型
      const [productFamily, productTypeValue] = values.productType || [];

      // 公共基础数据
      const baseData = {
        orgId: values.orgId,
        loanName: values.loanName,
        productFamily,
        productType: productTypeValue,
        institutionId: values.institutionId,
        institutionName: values.institutionName,
        contractAmount: values.contractAmount ? Math.round(values.contractAmount * 1000000) : 0,
        currency: values.currency || '人民币',
        isMultiDisb: values.isMultiDisb || false,
        termMonths: values.termMonths,
        maturityDate: values.maturityDate?.format('YYYY-MM-DD'),
        rateMode: values.rateMode,
        fixedRate: values.fixedRate != null ? values.fixedRate / 100 : undefined,
        baseRate: values.baseRate != null ? values.baseRate / 100 : undefined,
        spreadBp: values.spreadBp != null ? values.spreadBp / 10000 : undefined,
        rateResetCycle: values.rateResetCycle,
        rateResetAnchorDate: values.rateResetAnchorDate?.format('YYYY-MM-DD'),
        dayCountConvention: values.dayCountConvention,
        repayMethod: values.repayMethod,
        status: values.status,
        remark: values.remark,
        // 扩展字段值
        extFieldValList: extFieldDefs.length > 0
          ? formValuesToExtFieldValList(values, extFieldDefs)
          : undefined,
      };

      if (isEdit) {
        // 编辑模式：只提交基础信息、扩展字段、附件操作
        // 关联数据通过独立API管理，不在此处提交
        const updateData: UpdateLoanDto = {
          id: Number(id),
          ...baseData,
          attachmentOperations: computeAttachmentOperations()
        };
        updateMutation.mutate(updateData);
      } else {
        // 创建模式：提交所有数据，包括关联数据和附件
        const createData: CreateLoanDto = {
          ...baseData,
          relatedData: relatedData,
          fileAttachments: files.map(f => ({
            attachmentId: f.attachmentId,
            fileSize: f.fileSize,
            operation: 'ADD' as const
          }))
        };
        createMutation.mutate(createData);
      }
    } catch (errorInfo: any) {
      // 验证失败时，提示用户
      if (errorInfo?.errorFields?.length > 0) {
        message.warning('融资信息未完善，无法保存');
      }
    }
  };

  // 渲染融资类型特定字段表单
  const renderRelatedForm = () => {
    if (!currentComponentType) return null;

    // 公共属性：编辑模式传入 loanId，用于独立API调用
    const commonProps = {
      isEdit,
      loanId,  // 编辑模式传入 loanId，用于独立CRUD
      onChange: handleRelatedDataChange
    };

    switch (currentComponentType) {
      case 'participant':
        return (
          <ParticipantForm
            {...commonProps}
            value={relatedData.participantList}
            onChange={(data) => handleRelatedDataChange('participantList', data)}
          />
        );
      case 'lc':
        return (
          <LcForm
            {...commonProps}
            value={relatedData.lcMapList}
            onChange={(data) => handleRelatedDataChange('lcMapList', data)}
          />
        );
      case 'cd':
        return (
          <CdForm
            {...commonProps}
            value={relatedData.cdMapList}
            onChange={(data) => handleRelatedDataChange('cdMapList', data)}
          />
        );
      case 'tranche':
        return (
          <TrustTrancheForm
            {...commonProps}
            value={relatedData.trancheList}
            onChange={(data) => handleRelatedDataChange('trancheList', data)}
          />
        );
      case 'factoring':
        return (
          <FactoringArItemForm
            {...commonProps}
            value={relatedData.arItemList}
            onChange={(data) => handleRelatedDataChange('arItemList', data)}
          />
        );
      case 'scf':
        return (
          <ScfVoucherItemForm
            {...commonProps}
            value={relatedData.voucherItemList}
            onChange={(data) => handleRelatedDataChange('voucherItemList', data)}
          />
        );
      case 'leasing':
        return (
          <LeasedAssetForm
            {...commonProps}
            value={relatedData.leasedAssetList}
            onChange={(data) => handleRelatedDataChange('leasedAssetList', data)}
          />
        );
      case 'fixedAsset':
        return (
          <FixedAssetMapForm
            {...commonProps}
            value={relatedData.fixedAssetMapList}
            onChange={(data) => handleRelatedDataChange('fixedAssetMapList', data)}
          />
        );
      default:
        return null;
    }
  };

  // 区块标题组件（参考详情页风格）
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

  // 编辑模式下，数据加载中显示遮罩
  const pageLoading = isEdit && detailLoading;

  return (
    <Spin spinning={pageLoading} tip="加载中...">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
        {/* 顶部操作栏 */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/financing/existing')}
            style={{ padding: 0, color: '#262626' }}
          >
            返回列表
          </Button>
          <Space>
            <Button onClick={() => navigate('/financing/existing')}>
              取消
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleSubmit}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {isEdit ? '保存' : '提交'}
            </Button>
          </Space>
        </div>

      {/* 页面标题 */}
      <div style={{ marginBottom: 32 }}>
        <Title level={4} style={{ margin: 0 }}>
          {isEdit ? '编辑存量融资' : '新增存量融资'}
        </Title>
      </div>

      <Form
        form={form}
        layout="vertical"
      >
        {/* 基础信息区块 */}
        <div style={{ marginBottom: 32 }}>
          <SectionTitle title="基础信息" />
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="orgId"
                label="融资主体"
                rules={[{ required: true, message: '请选择融资主体' }]}
              >
                <OrgSelect placeholder="请选择融资主体" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="loanName"
                label="融资名称"
                rules={[{ required: true, message: '请输入融资名称' }]}
              >
                <Input placeholder="请输入融资名称" maxLength={100} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="productType"
                label="融资类型"
                rules={[{ required: true, message: '请选择融资类型' }]}
              >
                <DictSelect
                  dictCode="fin.product"
                  placeholder="请选择融资类型"
                  includeAncestors
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="institutionId"
                label="资金方"
                rules={[{ required: true, message: '请选择资金方' }]}
              >
                <InstitutionSelect
                  placeholder="请选择资金方"
                  onChange={handleInstitutionChange}
                  initialLabel={loanDetail?.institutionName}
                />
              </Form.Item>
              <Form.Item name="institutionName" hidden>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="contractAmount"
                label="合同金额（万元）"
                rules={[
                  { required: true, message: '请输入合同金额' },
                  { type: 'number', min: 0.000001, message: '合同金额必须大于0' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入合同金额"
                  min={0}
                  precision={6}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="currency"
                label="币种"
                initialValue="人民币"
              >
                <DictSelect
                  dictCode="sys.currency"
                  placeholder="请选择币种"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="termMonths"
                label="期限（月）"
                rules={[{ required: true, message: '请输入期限' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入期限"
                  min={1}
                  precision={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="maturityDate"
                label="合同到期日"
                rules={[{ required: true, message: '请选择合同到期日' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="请选择日期" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isMultiDisb"
                label="是否多次放款"
                valuePropName="checked"
              >
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="repayMethod"
                label="还款方式"
                rules={[{ required: true, message: '请选择还款方式' }]}
              >
                <DictSelect
                  dictCode="repay.method"
                  placeholder="请选择还款方式"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <DictSelect
                  dictCode="loan.status"
                  placeholder="请选择状态"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Divider style={{ margin: '0 0 32px 0' }} />

        {/* 利率信息区块 */}
        <div style={{ marginBottom: 32 }}>
          <SectionTitle title="利率信息" />
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="rateMode"
                label="利率方式"
                rules={[{ required: true, message: '请选择利率方式' }]}
              >
                <DictSelect
                  dictCode="rate.mode"
                  placeholder="请选择利率方式"
                />
              </Form.Item>
            </Col>
            {rateMode === '固定' && (
              <Col span={8} key="fixedRate">
                <Form.Item
                  name="fixedRate"
                  label="固定利率（%）"
                  rules={[{ required: true, message: '请输入固定利率' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="请输入固定利率"
                    min={0}
                    max={100}
                    precision={4}
                  />
                </Form.Item>
              </Col>
            )}
            {rateMode === 'LPR+BP' && (
              <Col span={8} key="baseRate-lpr">
                <Form.Item
                  name="baseRate"
                  label="基准利率（%）"
                  rules={[{ required: true, message: '请输入基准利率' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="请输入基准利率"
                    min={0}
                    max={100}
                    precision={4}
                  />
                </Form.Item>
              </Col>
            )}
            {rateMode === 'LPR+BP' && (
              <Col span={8} key="spreadBp">
                <Form.Item
                  name="spreadBp"
                  label="加点（BP）"
                  rules={[{ required: true, message: '请输入加点' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="请输入加点"
                    precision={0}
                  />
                </Form.Item>
              </Col>
            )}
            {rateMode === '浮动' && (
              <Col span={8} key="baseRate-floating">
                <Form.Item
                  name="baseRate"
                  label="基准利率（%）"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="请输入基准利率"
                    min={0}
                    max={100}
                    precision={4}
                  />
                </Form.Item>
              </Col>
            )}
            {rateMode === '票面' && (
              <Col span={8} key="baseRate-coupon">
                <Form.Item
                  name="baseRate"
                  label="票面利率（%）"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="请输入票面利率"
                    min={0}
                    max={100}
                    precision={4}
                  />
                </Form.Item>
              </Col>
            )}
          </Row>

          <Row gutter={24}>
            {(rateMode === '浮动' || rateMode === 'LPR+BP') && (
              <Col span={8} key="rateResetCycle">
                <Form.Item
                  name="rateResetCycle"
                  label="重定价周期"
                >
                  <DictSelect
                    dictCode="rate.reset.cycle"
                    placeholder="请选择重定价周期"
                    allowClear
                  />
                </Form.Item>
              </Col>
            )}
            {(rateMode === '浮动' || rateMode === 'LPR+BP') && (
              <Col span={8} key="rateResetAnchorDate">
                <Form.Item
                  name="rateResetAnchorDate"
                  label="重定价锚定日"
                >
                  <DatePicker style={{ width: '100%' }} placeholder="请选择日期" />
                </Form.Item>
              </Col>
            )}
            <Col span={8}>
              <Form.Item
                name="dayCountConvention"
                label="计息日规则"
              >
                <DictSelect
                  dictCode="day.count.convention"
                  placeholder="请选择计息日规则"
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Divider style={{ margin: '0 0 32px 0' }} />

        {/* 备注与附件区块 */}
        <div style={{ marginBottom: 32 }}>
          <SectionTitle title="备注与附件" />
          <Row gutter={24}>
            <Col span={16}>
              <Form.Item
                name="remark"
                label="备注"
              >
                <TextArea rows={3} placeholder="请输入备注" maxLength={500} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label="融资附件">
                <RaxUpload
                  bizModule="FinLoan"
                  value={files}
                  onChange={setFiles}
                  maxCount={10}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* 扩展字段区块 */}
        {extFieldDefs.length > 0 && (
          <>
            <Divider style={{ margin: '0 0 32px 0' }} />
            <div style={{ marginBottom: 32 }}>
              <SectionTitle title="扩展信息" />
              <ExtFieldFormItems fields={extFieldDefs} columns={3} />
            </div>
          </>
        )}

        {/* 融资类型特定信息区块 */}
        {currentComponentType && (
          <>
            <Divider style={{ margin: '0 0 32px 0' }} />
            <div style={{ marginBottom: 32 }}>
              <SectionTitle title={`${Array.isArray(productType) ? productType[1] : productType}特定信息`} />
              {renderRelatedForm()}
            </div>
          </>
        )}

        {/* 底部操作栏 */}
        <Divider style={{ margin: '0 0 24px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingBottom: 24 }}>
          <Button onClick={() => navigate('/financing/existing')}>
            取消
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {isEdit ? '保存' : '提交'}
          </Button>
        </div>
      </Form>
      </div>
    </Spin>
  );
};

export default ExistingForm;
