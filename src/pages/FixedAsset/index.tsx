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
  InputNumber,
} from 'antd';
import { PlusOutlined, SearchOutlined, GoldOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetApi } from '@/services/asset';
import { OrgSelect } from '@/components/OrgSelect';
import { AssetCategorySelect } from '@/components/AssetCategorySelect';
import { AmountDisplay } from '@/components/AmountDisplay';
import type {
  FixedAssetDto,
  CreateFixedAssetDto,
  UpdateFixedAssetDto,
  QueryFixedAssetDto,
  PageResult
} from '@/types/swagger-api';

export const FixedAsset: React.FC = () => {
  const [searchForm] = Form.useForm();
  const [assetForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAsset, setEditingAsset] = useState<FixedAssetDto | null>(null);
  const [searchParams, setSearchParams] = useState<QueryFixedAssetDto>({
    pageNo: 1,
    pageSize: 10,
  });

  const queryClient = useQueryClient();

  // 查询固定资产列表
  const { data: assetListData, isLoading } = useQuery({
    queryKey: ['fixedAssets', searchParams],
    queryFn: () => assetApi.page(searchParams),
  });

  // 创建固定资产
  const createAssetMutation = useMutation({
    mutationFn: (data: CreateFixedAssetDto) => assetApi.create(data),
    onSuccess: () => {
      message.success('固定资产创建成功');
      setIsModalVisible(false);
      assetForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['fixedAssets'] });
    },
    onError: () => {
      message.error('固定资产创建失败');
    },
  });

  // 更新固定资产
  const updateAssetMutation = useMutation({
    mutationFn: (data: UpdateFixedAssetDto) => assetApi.update(data),
    onSuccess: () => {
      message.success('固定资产更新成功');
      setIsModalVisible(false);
      setIsEditMode(false);
      setEditingAsset(null);
      assetForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['fixedAssets'] });
    },
    onError: () => {
      message.error('固定资产更新失败');
    },
  });

  // 删除固定资产
  const deleteAssetMutation = useMutation({
    mutationFn: (id: number) => assetApi.remove(id),
    onSuccess: () => {
      message.success('固定资产删除成功');
      queryClient.invalidateQueries({ queryKey: ['fixedAssets'] });
    },
    onError: () => {
      message.error('固定资产删除失败');
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

  // 打开创建固定资产模态框
  const handleCreate = () => {
    setIsEditMode(false);
    setEditingAsset(null);
    assetForm.resetFields();
    setIsModalVisible(true);
  };

  // 打开编辑固定资产模态框
  const handleEdit = (record: FixedAssetDto) => {
    setIsEditMode(true);
    setEditingAsset(record);
    assetForm.setFieldsValue({
      name: record.name,
      code: record.code,
      address: record.address,
      bookValue: record.bookValue / 1000000, // 分转换为万元显示
      orgId: record.orgId,
      category: {
        code: record.categoryCode,
        name: record.categoryName,
      },
    });
    setIsModalVisible(true);
  };

  // 删除固定资产确认
  const confirmDelete = (id: number) => {
    if (!id) return;
    deleteAssetMutation.mutate(id);
  };

  // 提交表单
  const handleSubmit = (values: any) => {
    const formData = {
      name: values.name,
      code: values.code,
      address: values.address,
      bookValue: values.bookValue * 1000000, // 万元转换为分，不四舍五入保持精度
      orgId: values.orgId,
      categoryCode: values.category?.code,
      categoryName: values.category?.name,
    };


    if (isEditMode && editingAsset) {
      updateAssetMutation.mutate({
        id: editingAsset.id,
        ...formData,
      });
    } else {
      createAssetMutation.mutate(formData);
    }
  };

  // 表格列定义
  const columns: ColumnsType<FixedAssetDto> = [
    {
      title: '资产名称',
      dataIndex: 'name',
      key: 'name',
      render: (name) => name || '-',
    },
    {
      title: '资产编号',
      dataIndex: 'code',
      key: 'code',
      render: (code) => code || '-',
    },
    {
      title: '资产分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (categoryName, record) => {
        if (!categoryName && !record.categoryCode) return '-';

        // 如果有分类名称和分类编号，显示分类名称并用 Tooltip 显示分类编号
        if (categoryName && record.categoryCode) {
          return (
            <Tooltip title={record.categoryCode} placement="top">
              <span style={{ cursor: 'help', borderBottom: '1px dashed #ccc' }}>
                {categoryName}
              </span>
            </Tooltip>
          );
        }

        // 如果只有分类名称没有编号，直接显示分类名称
        return categoryName || '-';
      }
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
      title: '资产地址',
      dataIndex: 'address',
      key: 'address',
      render: (address) => address || '-',
    },
    {
      title: '账面价值',
      dataIndex: 'bookValue',
      key: 'bookValue',
      align: 'right',
      render: (bookValue) => {
        if (bookValue === undefined || bookValue === null) return '-';
        // AmountDisplay 组件接收分为单位的数值，直接传入即可
        return <AmountDisplay value={bookValue} />;
      },
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
              title="确定要删除这个固定资产吗？"
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

  const assetListResult = assetListData?.data as PageResult<FixedAssetDto> | undefined;

  return (
    <div className="p-6">
      <Card>
        {/* 搜索区域 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <Form form={searchForm} onFinish={handleSearch}>
            {/* 第一行：资产名称、资产编号、所属组织 */}
            <Row gutter={[16, 8]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="name" label="资产名称" className="mb-2">
                  <Input placeholder="请输入资产名称" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="code" label="资产编号" className="mb-2">
                  <Input placeholder="请输入资产编号" allowClear />
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

            {/* 第二行：资产地址和操作按钮 */}
            <Row gutter={[16, 8]} justify="space-between" align="middle">
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="address" label="资产地址" style={{ marginBottom: 0 }}>
                  <Input placeholder="请输入资产地址" allowClear />
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
            创建固定资产
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={assetListResult?.rows || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: searchParams.pageNo,
            pageSize: searchParams.pageSize,
            total: assetListResult?.totalCount || 0,
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

      {/* 创建/编辑固定资产模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <GoldOutlined style={{ color: '#1890ff' }} />
            <span>{isEditMode ? '编辑固定资产' : '创建固定资产'}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditMode(false);
          setEditingAsset(null);
          assetForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={assetForm}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="资产名称"
            rules={[{ required: true, message: '请输入资产名称' }]}
          >
            <Input placeholder="请输入资产名称" />
          </Form.Item>

          <Form.Item
            name="code"
            label="资产编号"
            rules={[{ required: true, message: '请输入资产编号' }]}
          >
            <Input placeholder="请输入资产编号" />
          </Form.Item>

          <Form.Item
            name="category"
            label="资产分类"
            rules={[{ required: true, message: '请选择资产分类' }]}
          >
            <AssetCategorySelect
              placeholder="请选择资产分类"
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="orgId"
            label="所属组织"
            rules={[{ required: true, message: '请选择所属组织' }]}
          >
            <OrgSelect placeholder="请选择组织" />
          </Form.Item>

          <Form.Item
            name="address"
            label="资产地址"
            rules={[{ required: true, message: '请输入资产地址' }]}
          >
            <Input placeholder="请输入资产地址" />
          </Form.Item>

          <Form.Item
            name="bookValue"
            label="账面价值 (万元)"
            rules={[
              { required: true, message: '请输入账面价值' },
              { type: 'number', min: 0, message: '账面价值不能为负数' }
            ]}
          >
            <InputNumber
              placeholder="请输入账面价值"
              style={{ width: '100%' }}
              min={0}
              addonAfter="万元"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={createAssetMutation.isPending || updateAssetMutation.isPending}
              >
                {isEditMode ? '更新' : '创建'}
              </Button>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  setIsEditMode(false);
                  setEditingAsset(null);
                  assetForm.resetFields();
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