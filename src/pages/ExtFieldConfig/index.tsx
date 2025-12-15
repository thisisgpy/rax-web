import React, { useState } from 'react';
import {
  Card,
  Button,
  Table,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Tag,
  Switch,
  Popconfirm,
  Row,
  Col,
  Typography,
  App,
  Dropdown,
  Tooltip,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  FileTextOutlined,
  ExclamationCircleFilled,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loanExtFieldApi } from '@/services/loanExtField';
import DictSelect from '@/components/DictSelect';
import type {
  FinLoanExtFieldConfigDto,
  CreateFinLoanExtFieldConfigDto,
  UpdateFinLoanExtFieldConfigDto,
  FinLoanExtFieldDefDto,
  CreateFinLoanExtFieldDefDto,
  UpdateFinLoanExtFieldDefDto,
} from '@/types/swagger-api';

const ExtFieldConfig: React.FC = () => {
  const { message } = App.useApp();
  const [configForm] = Form.useForm();
  const [defForm] = Form.useForm();

  // 配置相关状态
  const [isConfigModalVisible, setIsConfigModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<FinLoanExtFieldConfigDto | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<FinLoanExtFieldConfigDto | null>(null);

  // 字段定义相关状态
  const [isDefModalVisible, setIsDefModalVisible] = useState(false);
  const [editingDef, setEditingDef] = useState<FinLoanExtFieldDefDto | null>(null);

  const queryClient = useQueryClient();

  // ===== 配置相关查询和操作 =====

  // 查询配置列表
  const { data: configListData, isLoading: configLoading } = useQuery({
    queryKey: ['extFieldConfigs'],
    queryFn: () => loanExtFieldApi.getConfigList(),
  });

  // 创建配置
  const createConfigMutation = useMutation({
    mutationFn: (data: CreateFinLoanExtFieldConfigDto) => loanExtFieldApi.createConfig(data),
    onSuccess: () => {
      message.success('配置创建成功');
      setIsConfigModalVisible(false);
      configForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['extFieldConfigs'] });
    },
  });

  // 更新配置
  const updateConfigMutation = useMutation({
    mutationFn: (data: UpdateFinLoanExtFieldConfigDto) => loanExtFieldApi.updateConfig(data),
    onSuccess: () => {
      message.success('配置更新成功');
      setIsConfigModalVisible(false);
      configForm.resetFields();
      setEditingConfig(null);
      queryClient.invalidateQueries({ queryKey: ['extFieldConfigs'] });
    },
  });

  // 删除配置
  const deleteConfigMutation = useMutation({
    mutationFn: (id: number) => loanExtFieldApi.removeConfig(id),
    onSuccess: () => {
      message.success('配置删除成功');
      queryClient.invalidateQueries({ queryKey: ['extFieldConfigs'] });
      if (selectedConfig) {
        setSelectedConfig(null);
      }
    },
  });

  // ===== 字段定义相关查询和操作 =====

  // 查询字段定义列表
  const { data: defListData, isLoading: defLoading } = useQuery({
    queryKey: ['extFieldDefs', selectedConfig?.id],
    queryFn: () => loanExtFieldApi.getDefListByConfig(selectedConfig!.id),
    enabled: !!selectedConfig,
  });

  // 创建字段定义
  const createDefMutation = useMutation({
    mutationFn: (data: CreateFinLoanExtFieldDefDto) => loanExtFieldApi.createDef(data),
    onSuccess: () => {
      message.success('字段定义创建成功');
      setIsDefModalVisible(false);
      defForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['extFieldDefs', selectedConfig?.id] });
    },
  });

  // 更新字段定义
  const updateDefMutation = useMutation({
    mutationFn: (data: UpdateFinLoanExtFieldDefDto) => loanExtFieldApi.updateDef(data),
    onSuccess: () => {
      message.success('字段定义更新成功');
      setIsDefModalVisible(false);
      defForm.resetFields();
      setEditingDef(null);
      queryClient.invalidateQueries({ queryKey: ['extFieldDefs', selectedConfig?.id] });
    },
  });

  // 删除字段定义
  const deleteDefMutation = useMutation({
    mutationFn: (id: number) => loanExtFieldApi.removeDef(id),
    onSuccess: () => {
      message.success('字段定义删除成功');
      queryClient.invalidateQueries({ queryKey: ['extFieldDefs', selectedConfig?.id] });
    },
  });

  // ===== 配置操作处理函数 =====

  // 选择配置
  const handleSelectConfig = (config: FinLoanExtFieldConfigDto) => {
    setSelectedConfig(config);
  };

  // 创建配置
  const handleCreateConfig = () => {
    setEditingConfig(null);
    configForm.resetFields();
    configForm.setFieldsValue({
      isGlobal: false,
      isEnabled: true,
      orderNo: 0,
    });
    setIsConfigModalVisible(true);
  };

  // 编辑配置
  const handleEditConfig = (config: FinLoanExtFieldConfigDto) => {
    setEditingConfig(config);
    setIsConfigModalVisible(true);
    setTimeout(() => {
      configForm.setFieldsValue({
        productFamily: config.productFamily,
        productType: config.productType,
        description: config.description || '',
        orderNo: config.orderNo || 0,
        isEnabled: config.isEnabled !== false,
      });
    }, 100);
  };

  // 删除配置确认
  const confirmDeleteConfig = (id: number) => {
    deleteConfigMutation.mutate(id);
  };

  // 提交配置表单
  const handleConfigSubmit = (values: any) => {
    let productFamily: string;
    let productType: string;

    if (values.isGlobal) {
      // 通用字段：productFamily 和 productType 都传 ALL
      productFamily = 'ALL';
      productType = 'ALL';
    } else {
      // 处理级联选择的产品类型
      [productFamily, productType] = values.productType || [];
    }

    if (editingConfig) {
      updateConfigMutation.mutate({
        id: editingConfig.id,
        description: values.description,
        orderNo: values.orderNo,
        isEnabled: values.isEnabled,
      });
    } else {
      createConfigMutation.mutate({
        productFamily,
        productType,
        description: values.description,
        orderNo: values.orderNo,
        isEnabled: values.isEnabled,
      });
    }
  };

  // ===== 字段定义操作处理函数 =====

  // 创建字段定义
  const handleCreateDef = () => {
    if (!selectedConfig) return;
    setEditingDef(null);
    defForm.resetFields();
    defForm.setFieldsValue({
      isRequired: false,
      isVisible: true,
    });
    setIsDefModalVisible(true);
  };

  // 编辑字段定义
  const handleEditDef = (def: FinLoanExtFieldDefDto) => {
    setEditingDef(def);
    setIsDefModalVisible(true);
    setTimeout(() => {
      defForm.setFieldsValue({
        fieldKey: def.fieldKey,
        fieldLabel: def.fieldLabel,
        dataType: def.dataType,
        isRequired: def.isRequired || false,
        isVisible: def.isVisible !== false,
        dictCode: def.dictCode || '',
        remark: def.remark || '',
      });
    }, 100);
  };

  // 删除字段定义确认
  const confirmDeleteDef = (id: number) => {
    deleteDefMutation.mutate(id);
  };

  // 提交字段定义表单
  const handleDefSubmit = (values: any) => {
    if (editingDef) {
      updateDefMutation.mutate({
        id: editingDef.id,
        ...values,
      });
    } else {
      createDefMutation.mutate({
        configId: selectedConfig!.id,
        ...values,
      });
    }
  };

  // ===== 表格列定义 =====

  // 配置表格列
  const configColumns: ColumnsType<FinLoanExtFieldConfigDto> = [
    {
      title: '产品族',
      dataIndex: 'productFamily',
      key: 'productFamily',
      render: (value, record) => {
        const isGlobal = record.productFamily === 'ALL' && record.productType === 'ALL';
        return (
          <Button
            type="link"
            onClick={() => handleSelectConfig(record)}
            style={{
              padding: 0,
              height: 'auto',
              fontWeight: selectedConfig?.id === record.id ? 'bold' : 'normal',
              color: selectedConfig?.id === record.id ? '#1890ff' : undefined,
            }}
          >
            {isGlobal ? <Tag color="purple">通用</Tag> : (value || '-')}
          </Button>
        );
      },
    },
    {
      title: '产品类型',
      dataIndex: 'productType',
      key: 'productType',
      render: (value, record) => {
        const isGlobal = record.productFamily === 'ALL' && record.productType === 'ALL';
        if (isGlobal) {
          return <Tag color="purple">通用</Tag>;
        }
        if (record.description) {
          return (
            <Tooltip title={record.description}>
              <span style={{ cursor: 'help', borderBottom: '1px dashed #ccc' }}>
                {value || '-'}
              </span>
            </Tooltip>
          );
        }
        return value || '-';
      },
    },
    {
      title: '排序',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 80,
      render: (value) => value ?? 0,
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      key: 'isEnabled',
      width: 80,
      render: (isEnabled) => (
        <Tag color={isEnabled ? 'green' : 'red'}>
          {isEnabled ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => {
        const getMenuItems = (record: FinLoanExtFieldConfigDto): MenuProps['items'] => [
          {
            key: 'edit',
            label: '编辑',
            icon: <EditOutlined />,
            onClick: () => handleEditConfig(record),
          },
          {
            key: 'delete',
            label: (
              <Popconfirm
                title="确定要删除这个配置吗？"
                description="删除后，该配置下的所有字段定义也将被删除"
                onConfirm={() => confirmDeleteConfig(record.id)}
                okText="确定"
                cancelText="取消"
              >
                删除
              </Popconfirm>
            ),
            icon: <DeleteOutlined />,
            danger: true,
          },
        ];

        return (
          <Dropdown
            menu={{ items: getMenuItems(record) }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              size="small"
              icon={<SettingOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        );
      },
    },
  ];

  // 字段定义表格列
  const defColumns: ColumnsType<FinLoanExtFieldDefDto> = [
    {
      title: '字段键',
      dataIndex: 'fieldKey',
      key: 'fieldKey',
      render: (value) => (
        <Typography.Text code>{value}</Typography.Text>
      ),
    },
    {
      title: '显示名',
      dataIndex: 'fieldLabel',
      key: 'fieldLabel',
    },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 100,
      render: (value) => (
        <Tag color="blue">{value}</Tag>
      ),
    },
    {
      title: '规则',
      key: 'flags',
      width: 70,
      render: (_, record) => (
        <Space size={4}>
          {record.isRequired && (
            <Tooltip title="必填字段">
              <ExclamationCircleFilled style={{ color: '#fa8c16', fontSize: 16 }} />
            </Tooltip>
          )}
          <Tooltip title={record.isVisible !== false ? '可见' : '隐藏'}>
            {record.isVisible !== false ? (
              <EyeOutlined style={{ color: '#52c41a', fontSize: 16 }} />
            ) : (
              <EyeInvisibleOutlined style={{ color: '#999', fontSize: 16 }} />
            )}
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '字典编码',
      dataIndex: 'dictCode',
      key: 'dictCode',
      ellipsis: true,
      render: (value) => value || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => {
        const getMenuItems = (record: FinLoanExtFieldDefDto): MenuProps['items'] => [
          {
            key: 'edit',
            label: '编辑',
            icon: <EditOutlined />,
            onClick: () => handleEditDef(record),
          },
          {
            key: 'delete',
            label: (
              <Popconfirm
                title="确定要删除这个字段定义吗？"
                onConfirm={() => confirmDeleteDef(record.id)}
                okText="确定"
                cancelText="取消"
              >
                删除
              </Popconfirm>
            ),
            icon: <DeleteOutlined />,
            danger: true,
          },
        ];

        return (
          <Dropdown
            menu={{ items: getMenuItems(record) }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              size="small"
              icon={<SettingOutlined />}
              onClick={(e) => e.preventDefault()}
            />
          </Dropdown>
        );
      },
    },
  ];

  const configList = configListData?.data || [];
  const defList = defListData?.data || [];

  return (
    <div className="p-6">
      <Row gutter={16}>
        {/* 左侧：配置管理 */}
        <Col span={10}>
          <Card
            title="扩展字段配置"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateConfig}
              >
                新增配置
              </Button>
            }
          >
            <Table
              columns={configColumns}
              dataSource={configList}
              rowKey="id"
              loading={configLoading}
              pagination={false}
              size="small"
              onRow={(record) => ({
                onClick: () => handleSelectConfig(record),
                style: {
                  cursor: 'pointer',
                  backgroundColor: selectedConfig?.id === record.id ? '#e6f7ff' : undefined,
                },
              })}
            />
          </Card>
        </Col>

        {/* 右侧：字段定义管理 */}
        <Col span={14}>
          <Card
            title={
              selectedConfig
                ? selectedConfig.productFamily === 'ALL' && selectedConfig.productType === 'ALL'
                  ? '字段定义 - 通用字段'
                  : `字段定义 - ${selectedConfig.productFamily} / ${selectedConfig.productType}`
                : '请选择配置'
            }
            extra={
              selectedConfig && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateDef}
                >
                  添加字段
                </Button>
              )
            }
          >
            {selectedConfig ? (
              <Table
                columns={defColumns}
                dataSource={defList}
                rowKey="id"
                loading={defLoading}
                pagination={false}
                size="small"
                locale={{
                  emptyText: (
                    <div style={{ padding: '40px 0', color: '#999' }}>
                      <FileTextOutlined style={{ fontSize: 32, marginBottom: 16, display: 'block' }} />
                      暂无字段定义，点击上方按钮添加
                    </div>
                  ),
                }}
              />
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '80px 20px',
                  color: '#999',
                }}
              >
                <SettingOutlined style={{ fontSize: 48, marginBottom: 24, color: '#d9d9d9' }} />
                <div style={{ fontSize: 16 }}>请在左侧选择一个配置来管理其字段定义</div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 配置编辑模态框 */}
      <Modal
        title={editingConfig ? '编辑配置' : '新增配置'}
        open={isConfigModalVisible}
        onCancel={() => {
          setIsConfigModalVisible(false);
          configForm.resetFields();
          setEditingConfig(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={configForm}
          layout="vertical"
          onFinish={handleConfigSubmit}
        >
          {!editingConfig && (
            <Form.Item
              name="isGlobal"
              valuePropName="checked"
            >
              <Switch checkedChildren="通用字段" unCheckedChildren="指定产品" />
            </Form.Item>
          )}

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.isGlobal !== curr.isGlobal}>
            {({ getFieldValue }) => {
              const isGlobal = getFieldValue('isGlobal');
              if (editingConfig || isGlobal) {
                return null;
              }
              return (
                <Form.Item
                  name="productType"
                  label="产品类型"
                  rules={[{ required: true, message: '请选择产品类型' }]}
                >
                  <DictSelect
                    dictCode="fin.product"
                    placeholder="请选择产品类型"
                    includeAncestors
                  />
                </Form.Item>
              );
            }}
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea placeholder="请输入描述" rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="orderNo"
                label="排序号"
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入排序号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isEnabled"
                label="是否启用"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={createConfigMutation.isPending || updateConfigMutation.isPending}
              >
                {editingConfig ? '更新' : '创建'}
              </Button>
              <Button
                onClick={() => {
                  setIsConfigModalVisible(false);
                  configForm.resetFields();
                  setEditingConfig(null);
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 字段定义编辑模态框 */}
      <Modal
        title={editingDef ? '编辑字段定义' : '新增字段定义'}
        open={isDefModalVisible}
        onCancel={() => {
          setIsDefModalVisible(false);
          defForm.resetFields();
          setEditingDef(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={defForm}
          layout="vertical"
          onFinish={handleDefSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fieldKey"
                label="字段键"
                rules={[{ required: true, message: '请输入字段键' }]}
              >
                <Input placeholder="请输入字段键（英文）" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="fieldLabel"
                label="显示名"
                rules={[{ required: true, message: '请输入显示名' }]}
              >
                <Input placeholder="请输入显示名（中文）" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dataType"
                label="数据类型"
                rules={[{ required: true, message: '请选择数据类型' }]}
              >
                <DictSelect
                  dictCode="loan.ext.field.datatype"
                  placeholder="请选择数据类型"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dictCode"
                label="字典编码"
                tooltip="当数据类型为字典时，需要指定字典编码"
              >
                <Input placeholder="请输入字典编码" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="isRequired"
                label="是否必填"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isVisible"
                label="是否可见"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="remark"
            label="备注"
          >
            <Input.TextArea placeholder="请输入备注" rows={3} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={createDefMutation.isPending || updateDefMutation.isPending}
              >
                {editingDef ? '更新' : '创建'}
              </Button>
              <Button
                onClick={() => {
                  setIsDefModalVisible(false);
                  defForm.resetFields();
                  setEditingDef(null);
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExtFieldConfig;
