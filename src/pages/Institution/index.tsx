import React, { useState } from 'react';
import {
  Card,
  Button,
  Table,
  Form,
  Input,
  Modal,
  Space,
  Tag,
  message,
  Popconfirm,
  Row,
  Col,
} from 'antd';
import { PlusOutlined, DeleteOutlined, SearchOutlined, BankOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { institutionApi } from '@/services/institution';
import DictSelect from '@/components/DictSelect';
import AreaCascader from '@/components/AreaCascader';
import { dictApi } from '@/services/dict';
import type {
  FinInstitutionDto,
  CreateInstitutionDto,
  QueryInstitutionDto,
  PageResult
} from '@/types/swagger-api';


export const Institution: React.FC = () => {
  const [searchForm] = Form.useForm();
  const [institutionForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchParams, setSearchParams] = useState<QueryInstitutionDto>({
    pageNo: 1,
    pageSize: 10,
  });

  const queryClient = useQueryClient();

  // 查询金融机构列表
  const { data: institutionListData, isLoading } = useQuery({
    queryKey: ['institutions', searchParams],
    queryFn: () => institutionApi.page(searchParams),
  });

  // 查询机构类型字典
  const { data: institutionTypeDict } = useQuery({
    queryKey: ['institutionTypeDict'],
    queryFn: () => dictApi.getItemTreeByCode('institution.type'),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });

  // 获取机构类型显示文本的函数
  const getInstitutionTypeText = (typeValue: string) => {
    if (!institutionTypeDict?.success || !institutionTypeDict.data) {
      return typeValue;
    }

    const findTypeText = (items: any[]): string => {
      for (const item of items) {
        if (item.value === typeValue) {
          return item.label;
        }
        if (item.children && item.children.length > 0) {
          const childResult = findTypeText(item.children);
          if (childResult !== typeValue) {
            return childResult;
          }
        }
      }
      return typeValue;
    };

    return findTypeText(institutionTypeDict.data);
  };

  // 创建金融机构
  const createInstitutionMutation = useMutation({
    mutationFn: (data: CreateInstitutionDto) => institutionApi.create(data),
    onSuccess: () => {
      message.success('金融机构创建成功');
      setIsModalVisible(false);
      institutionForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
    },
    onError: () => {
      message.error('金融机构创建失败');
    },
  });


  // 删除金融机构
  const deleteInstitutionMutation = useMutation({
    mutationFn: (id: number) => institutionApi.remove(id),
    onSuccess: () => {
      message.success('金融机构删除成功');
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
    },
    onError: () => {
      message.error('金融机构删除失败');
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

  // 打开创建金融机构模态框
  const handleCreate = () => {
    institutionForm.resetFields();
    setIsModalVisible(true);
  };

  // 删除金融机构确认
  const confirmDelete = (id: number) => {
    if (!id) return;
    deleteInstitutionMutation.mutate(id);
  };

  // 提交表单
  const handleSubmit = (values: any) => {
    createInstitutionMutation.mutate(values);
  };


  // 表格列定义
  const columns: ColumnsType<FinInstitutionDto> = [
    {
      title: '机构名称',
      dataIndex: 'name',
      key: 'name',
      render: (name) => name || '-',
    },
    {
      title: '分支机构',
      dataIndex: 'branchName',
      key: 'branchName',
      render: (branchName) => branchName || '-',
    },
    {
      title: '机构类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        if (!type) return '-';
        const typeText = getInstitutionTypeText(String(type));
        return (
          <Tag color={type === '1' ? 'blue' : 'green'}>
            {typeText}
          </Tag>
        );
      },
    },
    {
      title: '所在地区',
      key: 'location',
      render: (_, record) => {
        const location = [record.province, record.city, record.district]
          .filter(Boolean)
          .join(' - ');
        return location || '-';
      },
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
      width: 80,
      render: (_, record) => {
        return (
          <Popconfirm
            title="确定要删除这个金融机构吗？"
            onConfirm={() => record.id && confirmDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              danger
            />
          </Popconfirm>
        );
      },
    },
  ];

  const institutionListResult = institutionListData?.data as PageResult<FinInstitutionDto> | undefined;

  return (
    <div className="p-6">
      <Card>
        {/* 搜索区域 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <Form form={searchForm} onFinish={handleSearch}>
            {/* 第一行：所在地区、机构名称、分支机构 */}
            <Row gutter={[16, 8]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="areaIds" label="所在地区" className="mb-2">
                  <AreaCascader
                    placeholder="请选择省/市"
                    allowClear
                    level={2}
                    onChange={(values) => {
                      // 同步更新隐藏字段以便于后端查询 - 现在values是区域名称数组
                      const [provinceName, cityName, districtName] = values || [];
                      searchForm.setFieldsValue({
                        province: provinceName || undefined,
                        city: cityName || undefined,
                        district: districtName || undefined,
                      });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="name" label="机构名称" className="mb-2">
                  <Input placeholder="请输入机构名称" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="branchName" label="分支机构" className="mb-2">
                  <Input placeholder="请输入分支机构名称" allowClear />
                </Form.Item>
              </Col>
            </Row>

            {/* 第二行：机构类型和操作按钮 */}
            <Row gutter={[16, 8]} justify="space-between" align="middle">
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="type" label="机构类型" style={{ marginBottom: 0 }}>
                  <DictSelect
                    dictCode="institution.type"
                    placeholder="请选择机构类型"
                    allowClear
                  />
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

            {/* 隐藏字段用于后端查询 */}
            <Form.Item name="province" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="city" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="district" hidden>
              <Input />
            </Form.Item>
          </Form>
        </div>

        {/* 操作按钮区域 */}
        <div style={{ marginTop: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            创建金融机构
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={institutionListResult?.rows || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: searchParams.pageNo,
            pageSize: searchParams.pageSize,
            total: institutionListResult?.totalCount || 0,
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

      {/* 创建金融机构模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BankOutlined style={{ color: '#1890ff' }} />
            <span>创建金融机构</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          institutionForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={institutionForm}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="机构名称"
                rules={[{ required: true, message: '请输入机构名称' }]}
              >
                <Input placeholder="请输入机构名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="branchName"
                label="分支机构名称"
              >
                <Input placeholder="请输入分支机构名称" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="type"
            label="机构类型"
            rules={[{ required: true, message: '请选择机构类型' }]}
          >
            <DictSelect
              dictCode="institution.type"
              placeholder="请选择机构类型"
            />
          </Form.Item>

          <Form.Item
            name="areaIds"
            label="所在地区"
            rules={[{ required: true, message: '请选择所在地区' }]}
          >
            <AreaCascader
              placeholder="请选择省/市/区"
              level={2}
              onChange={(values) => {
                // 同步更新独立字段 - 现在values是区域名称数组
                const [provinceName, cityName, districtName] = values || [];
                institutionForm.setFieldsValue({
                  province: provinceName || undefined,
                  city: cityName || undefined,
                  district: districtName || undefined,
                });
              }}
            />
          </Form.Item>

          {/* 隐藏字段保存实际的省市区值 */}
          <Form.Item name="province" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="city" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="district" hidden>
            <Input />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={createInstitutionMutation.isPending}
              >
                创建
              </Button>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  institutionForm.resetFields();
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