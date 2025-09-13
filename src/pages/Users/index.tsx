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
  Select,
  message,
  Popconfirm,
  Row,
  Col,
  Tooltip,
  Dropdown,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, SettingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessApiService } from '@/services/api';
import type { 
  SysUserDto, 
  CreateUserDto, 
  UpdateUserDto, 
  QueryUserDto,
  PageResult 
} from '@/types/swagger-api';
import { OrgSelect } from '@/components/OrgSelect';

const { Option } = Select;

export const Users: React.FC = () => {
  const [searchForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<SysUserDto | null>(null);
  const [searchParams, setSearchParams] = useState<QueryUserDto>({
    pageNo: 1,
    pageSize: 10,
  });

  const queryClient = useQueryClient();

  // 查询用户列表
  const { data: userListData, isLoading } = useQuery({
    queryKey: ['users', searchParams],
    queryFn: () => businessApiService.queryUsers(searchParams),
  });

  // 创建用户
  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserDto) => businessApiService.createUser(data),
    onSuccess: () => {
      message.success('用户创建成功');
      setIsModalVisible(false);
      userForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // 更新用户
  const updateUserMutation = useMutation({
    mutationFn: (data: UpdateUserDto) => businessApiService.updateUser(data),
    onSuccess: () => {
      message.success('用户更新成功');
      setIsModalVisible(false);
      userForm.resetFields();
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // 删除用户
  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => businessApiService.deleteUser(id),
    onSuccess: () => {
      message.success('用户删除成功');
      queryClient.invalidateQueries({ queryKey: ['users'] });
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

  // 打开创建用户模态框
  const handleCreate = () => {
    setEditingUser(null);
    userForm.resetFields();
    setIsModalVisible(true);
  };

  // 打开编辑用户模态框
  const handleEdit = (user: SysUserDto) => {
    setEditingUser(user);
    setIsModalVisible(true);
    setTimeout(() => {
      userForm.setFieldsValue({
        name: user.name || '',
        mobile: user.mobile || '',
        orgId: user.orgId || undefined,
        gender: user.gender || '',
        idCard: user.idCard || '',
        status: user.status !== undefined ? user.status : undefined,
      });
    }, 100);
  };

  // 删除用户确认
  const confirmDelete = (id: number) => {
    if (!id) return;
    deleteUserMutation.mutate(id);
  };

  // 提交表单
  const handleSubmit = (values: any) => {
    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        ...values,
      });
    } else {
      createUserMutation.mutate(values);
    }
  };

  // 表格列定义
  const columns: ColumnsType<SysUserDto> = [
    {
      title: '用户名',
      dataIndex: 'name',
      key: 'name',
      render: (name) => name || '-',
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      key: 'mobile',
      render: (mobile) => mobile || '-',
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
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => gender || '-',
    },
    {
      title: '身份证号',
      dataIndex: 'idCard',
      key: 'idCard',
      render: (idCard) => {
        if (!idCard) return '-';
        return idCard.replace(/(.{4})(.*)(.{4})/, '$1****$3');
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === undefined || status === null) return '-';
        return (
          <Tag color={status === 1 ? 'green' : 'red'}>
            {status === 1 ? '正常' : '禁用'}
          </Tag>
        );
      },
    },
    {
      title: '是否默认密码',
      dataIndex: 'isDefaultPassword',
      key: 'isDefaultPassword',
      render: (isDefault) => {
        if (isDefault === undefined || isDefault === null) return '-';
        return (
          <Tag color={isDefault ? 'orange' : 'green'}>
            {isDefault ? '是' : '否'}
          </Tag>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (time) => time ? new Date(time).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => {
        const getMenuItems = (record: SysUserDto): MenuProps['items'] => [
          {
            key: 'edit',
            label: '编辑',
            icon: <EditOutlined />,
            onClick: () => handleEdit(record)
          },
          {
            key: 'delete',
            label: (
              <Popconfirm
                title="确定要删除这个用户吗？"
                onConfirm={() => record.id && confirmDelete(record.id)}
                okText="确定"
                cancelText="取消"
              >
                删除
              </Popconfirm>
            ),
            icon: <DeleteOutlined />,
            danger: true
          }
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

  const userListResult = userListData?.data as PageResult<SysUserDto> | undefined;

  return (
    <div className="p-6">
      <Card>
        {/* 搜索区域 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <Form form={searchForm} onFinish={handleSearch}>
            {/* 第一行：用户名、手机号、所属组织 */}
            <Row gutter={[16, 8]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="name" label="用户名" className="mb-2">
                  <Input placeholder="请输入用户名" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="mobile" label="手机号" className="mb-2">
                  <Input placeholder="请输入手机号" allowClear />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={8} lg={12}>
                <Form.Item name="orgId" label="所属组织" className="mb-2">
                  <OrgSelect placeholder="请选择组织" allowClear />
                </Form.Item>
              </Col>
            </Row>
            
            {/* 第二行：状态和操作按钮 */}
            <Row gutter={[16, 8]} justify="space-between" align="middle">
              <Col xs={24} sm={12} md={6} lg={4}>
                <Form.Item name="status" label="状态" style={{ marginBottom: 0 }}>
                  <Select placeholder="请选择状态" allowClear>
                    <Option value={1}>正常</Option>
                    <Option value={0}>禁用</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={18} lg={20}>
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
        <div style={{marginTop: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'flex-end'}}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreate}
          >
            创建用户
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={userListResult?.rows || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: searchParams.pageNo,
            pageSize: searchParams.pageSize,
            total: userListResult?.totalCount || 0,
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

      <Modal
        title={editingUser ? '编辑用户' : '创建用户'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          userForm.resetFields();
          setEditingUser(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="mobile"
                label="手机号"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                ]}
              >
                <Input placeholder="请输入手机号" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="orgId"
            label="所属组织"
            rules={[{ required: true, message: '请选择所属组织' }]}
          >
            <OrgSelect placeholder="请选择所属组织" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="性别"
                rules={[{ required: true, message: '请选择性别' }]}
              >
                <Select placeholder="请选择性别">
                  <Option value="男">男</Option>
                  <Option value="女">女</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              {editingUser && (
                <Form.Item
                  name="status"
                  label="状态"
                >
                  <Select placeholder="请选择状态">
                    <Option value={1}>正常</Option>
                    <Option value={0}>禁用</Option>
                  </Select>
                </Form.Item>
              )}
            </Col>
          </Row>

          <Form.Item
            name="idCard"
            label="身份证号"
            rules={[
              { required: true, message: '请输入身份证号' },
              { pattern: /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/, message: '请输入正确的身份证号' }
            ]}
          >
            <Input placeholder="请输入身份证号" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={createUserMutation.isPending || updateUserMutation.isPending}
              >
                {editingUser ? '更新' : '创建'}
              </Button>
              <Button 
                onClick={() => {
                  setIsModalVisible(false);
                  userForm.resetFields();
                  setEditingUser(null);
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