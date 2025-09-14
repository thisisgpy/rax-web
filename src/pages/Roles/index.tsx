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
import { roleApi } from '@/services/role';
import type { 
  SysRoleDto, 
  CreateRoleDto, 
  UpdateRoleDto, 
  QueryRoleDto,
  PageResult 
} from '@/types/swagger-api';

const { Option } = Select;

export const Roles: React.FC = () => {
  const [searchForm] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<SysRoleDto | null>(null);
  const [searchParams, setSearchParams] = useState<QueryRoleDto>({
    pageNo: 1,
    pageSize: 10,
  });

  const queryClient = useQueryClient();

  // 查询角色列表
  const { data: roleListData, isLoading } = useQuery({
    queryKey: ['roles', searchParams],
    queryFn: () => roleApi.page(searchParams),
  });

  // 创建角色
  const createRoleMutation = useMutation({
    mutationFn: (data: CreateRoleDto) => roleApi.create(data),
    onSuccess: () => {
      message.success('角色创建成功');
      setIsModalVisible(false);
      roleForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  // 更新角色
  const updateRoleMutation = useMutation({
    mutationFn: (data: UpdateRoleDto) => roleApi.update(data),
    onSuccess: () => {
      message.success('角色更新成功');
      setIsModalVisible(false);
      roleForm.resetFields();
      setEditingRole(null);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  // 删除角色
  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) => roleApi.remove(id),
    onSuccess: () => {
      message.success('角色删除成功');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
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

  // 打开创建角色模态框
  const handleCreate = () => {
    setEditingRole(null);
    roleForm.resetFields();
    setIsModalVisible(true);
  };

  // 打开编辑角色模态框
  const handleEdit = (role: SysRoleDto) => {
    setEditingRole(role);
    setIsModalVisible(true);
    setTimeout(() => {
      roleForm.setFieldsValue({
        name: role.name || '',
        code: role.code || '',
        comment: role.comment || '',
      });
    }, 100);
  };

  // 删除角色确认
  const confirmDelete = (id: number) => {
    if (!id) return;
    deleteRoleMutation.mutate(id);
  };

  // 提交表单
  const handleSubmit = (values: any) => {
    if (editingRole) {
      updateRoleMutation.mutate({
        id: editingRole.id,
        ...values,
      });
    } else {
      createRoleMutation.mutate(values);
    }
  };

  // 表格列定义
  const columns: ColumnsType<SysRoleDto> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      render: (name) => name || '-',
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      key: 'code',
      render: (code) => code || '-',
    },
    {
      title: '角色说明',
      dataIndex: 'comment',
      key: 'comment',
      render: (comment) => {
        if (!comment) return '-';
        return comment.length > 50 ? (
          <Tooltip title={comment} placement="top">
            <span style={{ cursor: 'help', borderBottom: '1px dashed #ccc' }}>
              {comment.substring(0, 50)}...
            </span>
          </Tooltip>
        ) : comment;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => {
        const getMenuItems = (record: SysRoleDto): MenuProps['items'] => [
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
                title="确定要删除这个角色吗？"
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

  const roleListResult = roleListData?.data as PageResult<SysRoleDto> | undefined;

  return (
    <div className="p-6">
      <Card>
        {/* 搜索区域 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <Form form={searchForm} onFinish={handleSearch}>
            <Row gutter={[16, 8]} align="middle">
              <Col xs={24} sm={12} md={8} lg={6}>
                <Form.Item name="name" label="角色名称" style={{marginBottom: 0}}>
                  <Input placeholder="请输入角色名称" allowClear />
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
        <div style={{marginTop: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'flex-end'}}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreate}
          >
            创建角色
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={roleListResult?.rows || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: searchParams.pageNo,
            pageSize: searchParams.pageSize,
            total: roleListResult?.totalCount || 0,
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
        title={editingRole ? '编辑角色' : '创建角色'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          roleForm.resetFields();
          setEditingRole(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={roleForm}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="角色名称"
                rules={[{ required: true, message: '请输入角色名称' }]}
              >
                <Input placeholder="请输入角色名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label="角色编码"
                rules={[{ required: true, message: '请输入角色编码' }]}
              >
                <Input placeholder="请输入角色编码" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="comment"
            label="角色说明"
          >
            <Input.TextArea placeholder="请输入角色说明" rows={4} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={createRoleMutation.isPending || updateRoleMutation.isPending}
              >
                {editingRole ? '更新' : '创建'}
              </Button>
              <Button 
                onClick={() => {
                  setIsModalVisible(false);
                  roleForm.resetFields();
                  setEditingRole(null);
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