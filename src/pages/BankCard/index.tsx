import React, { useState } from 'react';
import {
  Card,
  Button,
  Table,
  Form,
  Input,
  Modal,
  Space,
  message,
  Popconfirm,
  Row,
  Col,
  Tooltip,
} from 'antd';
import { PlusOutlined, SearchOutlined, CreditCardOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bankCardApi } from '@/services/bankCard';
import { OrgSelect } from '@/components/OrgSelect';
import { InstitutionSelect } from '@/components/InstitutionSelect';
import type {
  SysBankCardDto,
  CreateBankCardDto,
  UpdateBankCardDto,
  QueryBankCardDto,
  PageResult
} from '@/types/swagger-api';

export const BankCard: React.FC = () => {
  const [searchForm] = Form.useForm();
  const [bankCardForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCard, setEditingCard] = useState<SysBankCardDto | null>(null);
  const [searchParams, setSearchParams] = useState<QueryBankCardDto>({
    pageNo: 1,
    pageSize: 10,
  });

  const queryClient = useQueryClient();

  // 查询银行卡列表
  const { data: bankCardListData, isLoading } = useQuery({
    queryKey: ['bankCards', searchParams],
    queryFn: () => bankCardApi.page(searchParams),
  });


  // 创建银行卡
  const createBankCardMutation = useMutation({
    mutationFn: (data: CreateBankCardDto) => bankCardApi.create(data),
    onSuccess: () => {
      message.success('银行卡创建成功');
      setIsModalVisible(false);
      bankCardForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['bankCards'] });
    },
    onError: () => {
      message.error('银行卡创建失败');
    },
  });

  // 更新银行卡
  const updateBankCardMutation = useMutation({
    mutationFn: (data: UpdateBankCardDto) => bankCardApi.update(data),
    onSuccess: () => {
      message.success('银行卡更新成功');
      setIsModalVisible(false);
      setIsEditMode(false);
      setEditingCard(null);
      bankCardForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['bankCards'] });
    },
    onError: () => {
      message.error('银行卡更新失败');
    },
  });

  // 删除银行卡
  const deleteBankCardMutation = useMutation({
    mutationFn: (id: number) => bankCardApi.remove(id),
    onSuccess: () => {
      message.success('银行卡删除成功');
      queryClient.invalidateQueries({ queryKey: ['bankCards'] });
    },
    onError: () => {
      message.error('银行卡删除失败');
    },
  });

  // 处理搜索
  const handleSearch = (values: any) => {
    setSearchParams({
      ...values,
      pageNo: 1,
      pageSize: searchParams.pageSize,
    });
  };

  // 处理分页
  const handleTableChange = (pagination: any) => {
    setSearchParams({
      ...searchParams,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  // 打开创建银行卡模态框
  const handleCreate = () => {
    setIsEditMode(false);
    setEditingCard(null);
    bankCardForm.resetFields();
    setIsModalVisible(true);
  };

  // 打开编辑银行卡模态框
  const handleEdit = (record: SysBankCardDto) => {
    setIsEditMode(true);
    setEditingCard(record);
    bankCardForm.setFieldsValue({
      orgId: record.orgId,
      institutionId: record.institutionId,
      cardName: record.cardName,
      cardNumber: record.cardNumber,
    });
    setIsModalVisible(true);
  };

  // 删除银行卡确认
  const confirmDelete = (id: number) => {
    if (!id) return;
    deleteBankCardMutation.mutate(id);
  };

  // 提交表单
  const handleSubmit = (values: any) => {
    if (isEditMode && editingCard) {
      updateBankCardMutation.mutate({
        id: editingCard.id,
        ...values,
      });
    } else {
      createBankCardMutation.mutate(values);
    }
  };


  // 表格列定义
  const columns: ColumnsType<SysBankCardDto> = [
    {
      title: '银行卡名称',
      dataIndex: 'cardName',
      key: 'cardName',
      render: (cardName) => cardName || '-',
    },
    {
      title: '银行卡号',
      dataIndex: 'cardNumber',
      key: 'cardNumber',
      render: (cardNumber) => cardNumber || '-',
    },
    {
      title: '所属组织',
      dataIndex: 'orgNameAbbr',
      key: 'orgNameAbbr',
      render: (orgNameAbbr, record) => {
        if (!record.orgName && !orgNameAbbr) return '-';

        // 如果有简称，显示简称并用 Tooltip 显示全称
        if (orgNameAbbr && record.orgName) {
          return (
            <Tooltip title={record.orgName} placement="top">
              <span style={{ cursor: 'help', borderBottom: '1px dashed #ccc' }}>
                {orgNameAbbr}
              </span>
            </Tooltip>
          );
        }

        // 如果只有全称没有简称，直接显示全称
        return record.orgName || '-';
      }
    },
    {
      title: '开户行',
      dataIndex: 'institutionName',
      key: 'institutionName',
      render: (institutionName) => institutionName || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (time) => time ? new Date(time).toLocaleString() : '-',
    },
    {
      title: '创建人',
      dataIndex: 'createBy',
      key: 'createBy',
      render: (createBy) => createBy || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => {
        return (
          <Space size="small">
            <Button
              type="link"
              size="small"
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定要删除这张银行卡吗？"
              onConfirm={() => record.id && confirmDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
                danger
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const bankCardListResult = bankCardListData?.data as PageResult<SysBankCardDto> | undefined;

  return (
    <div className="p-6">
      <Card>
        {/* 搜索区域 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <Form form={searchForm} onFinish={handleSearch}>
            {/* 第一行：银行卡名称、银行卡号、所属组织 */}
            <Row gutter={[16, 8]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="cardName" label="银行卡名称" className="mb-2">
                  <Input placeholder="请输入银行卡名称" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="cardNumber" label="银行卡号" className="mb-2">
                  <Input placeholder="请输入银行卡号" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={8} lg={12}>
                <Form.Item name="orgId" label="所属组织" className="mb-2">
                  <OrgSelect
                    placeholder="请选择组织"
                    allowClear
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* 第二行：开户行和操作按钮 */}
            <Row gutter={[16, 8]} justify="space-between" align="middle">
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="institutionName" label="开户行" style={{ marginBottom: 0 }}>
                  <Input placeholder="请输入开户行名称" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={16} lg={18}>
                <div>
                  <Space>
                    <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                      搜索
                    </Button>
                    <Button onClick={() => searchForm.resetFields()}>重置</Button>
                  </Space>
                </div>
              </Col>
            </Row>
          </Form>
        </div>

        {/* 操作按钮区域 */}
        <div style={{ marginTop: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            创建银行卡
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={bankCardListResult?.rows || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: searchParams.pageNo,
            pageSize: searchParams.pageSize,
            total: bankCardListResult?.totalCount || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50', '100'],
            locale: {
              items_per_page: '条/页',
              jump_to: '跳至',
              page: '页',
              prev_page: '上一页',
              next_page: '下一页',
              prev_5: '向前 5 页',
              next_5: '向后 5 页',
              prev_3: '向前 3 页',
              next_3: '向后 3 页',
            },
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* 创建/编辑银行卡模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CreditCardOutlined style={{ color: '#1890ff' }} />
            <span>{isEditMode ? '编辑银行卡' : '创建银行卡'}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditMode(false);
          setEditingCard(null);
          bankCardForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={bankCardForm}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="orgId"
            label="所属组织"
            rules={[{ required: true, message: '请选择所属组织' }]}
          >
            <OrgSelect placeholder="请选择组织" />
          </Form.Item>

          <Form.Item
            name="institutionId"
            label="开户行"
            rules={[{ required: true, message: '请选择开户行' }]}
          >
            <InstitutionSelect
              placeholder="请选择开户行"
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="cardName"
            label="银行卡名称"
            rules={[{ required: true, message: '请输入银行卡名称' }]}
          >
            <Input placeholder="请输入银行卡名称" />
          </Form.Item>

          <Form.Item
            name="cardNumber"
            label="银行卡号"
            rules={[
              { required: true, message: '请输入银行卡号' },
              { pattern: /^\d{16,19}$/, message: '请输入16-19位银行卡号' }
            ]}
          >
            <Input placeholder="请输入银行卡号" maxLength={19} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={createBankCardMutation.isPending || updateBankCardMutation.isPending}
              >
                {isEditMode ? '更新' : '创建'}
              </Button>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  setIsEditMode(false);
                  setEditingCard(null);
                  bankCardForm.resetFields();
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