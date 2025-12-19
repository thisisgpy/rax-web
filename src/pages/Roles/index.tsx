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
  Popconfirm,
  Row,
  Col,
  Tooltip,
  Dropdown,
  List,
  Tree,
  Checkbox,
  Typography,
  App,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, SettingOutlined, FileTextOutlined, SafetyOutlined, FolderOutlined, MenuOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleApi } from '@/services/role';
import { resourceApi } from '@/services/resource';
import { authApi } from '@/services/auth';
import type { 
  SysRoleDto, 
  CreateRoleDto, 
  UpdateRoleDto, 
  QueryRoleDto,
  PageResult,
  SysResourceDto,
  AssignRoleResourceDto
} from '@/types/swagger-api';

const { Option } = Select;

export const Roles: React.FC = () => {
  const { message } = App.useApp();
  const [searchForm] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<SysRoleDto | null>(null);
  const [searchParams, setSearchParams] = useState<QueryRoleDto>({
    pageNo: 1,
    pageSize: 10,
  });
  const [resourceModalVisible, setResourceModalVisible] = useState(false);
  const [assignResourceModalVisible, setAssignResourceModalVisible] = useState(false);
  const [viewingRole, setViewingRole] = useState<SysRoleDto | null>(null);
  const [assigningRole, setAssigningRole] = useState<SysRoleDto | null>(null);
  const [roleResources, setRoleResources] = useState<SysResourceDto[]>([]);
  const [allResources, setAllResources] = useState<SysResourceDto[]>([]);
  const [selectedResourceIds, setSelectedResourceIds] = useState<number[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

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

  // 获取角色资源
  const getRoleResourcesMutation = useMutation({
    mutationFn: (roleId: number) => resourceApi.getResource(roleId),
    onSuccess: (response) => {
      if (response.success) {
        const resources = response.data || [];
        setRoleResources(resources);
        // 如果是在分配资源模态框中，自动设置已分配的资源为选中状态
        if (assignResourceModalVisible) {
          setSelectedResourceIds(resources.map(resource => resource.id));
        }
      }
    },
  });

  // 获取所有资源
  const getAllResourcesMutation = useMutation({
    mutationFn: () => resourceApi.trees(),
    onSuccess: (response) => {
      if (response.success) {
        setAllResources(response.data || []);
        // 自动展开所有节点
        const allKeys = getAllNodeKeys(response.data || []);
        setExpandedKeys(allKeys);
      }
    },
  });

  // 分配角色资源
  const assignRoleResourceMutation = useMutation({
    mutationFn: (data: AssignRoleResourceDto) => authApi.assignRoleResource(data),
    onSuccess: () => {
      message.success('资源分配成功');
      setAssignResourceModalVisible(false);
      setAssigningRole(null);
      setSelectedResourceIds([]);
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

  // 收集所有节点的key用于展开
  const getAllNodeKeys = (nodes: SysResourceDto[]): React.Key[] => {
    let keys: React.Key[] = [];
    
    const traverse = (nodeList: SysResourceDto[]) => {
      nodeList.forEach(node => {
        keys.push(node.id.toString());
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    
    traverse(nodes);
    return keys;
  };

  // 查看角色资源
  const handleViewResources = (role: SysRoleDto) => {
    setViewingRole(role);
    setResourceModalVisible(true);
    // 获取所有资源和角色当前资源，用于复用分配资源的布局
    getAllResourcesMutation.mutate();
    getRoleResourcesMutation.mutate(role.id);
  };

  // 分配角色资源
  const handleAssignResources = (role: SysRoleDto) => {
    setAssigningRole(role);
    setAssignResourceModalVisible(true);
    // 获取所有资源和角色当前资源
    getAllResourcesMutation.mutate();
    getRoleResourcesMutation.mutate(role.id);
  };

  // 确保包含所有必要的父节点
  const ensureParentNodes = (selectedIds: number[], resources: SysResourceDto[]): number[] => {
    const finalIds = new Set(selectedIds);
    
    // 对每个选中的资源，确保其所有父节点也被包含
    selectedIds.forEach(id => {
      const parentIds = getAllParentIds(id, resources);
      parentIds.forEach(parentId => finalIds.add(parentId));
    });
    
    return Array.from(finalIds);
  };

  // 确认分配资源
  const handleConfirmAssignResources = () => {
    if (!assigningRole) return;
    
    // 确保包含所有必要的父节点
    const finalResourceIds = ensureParentNodes(selectedResourceIds, allResources);
    
    const data: AssignRoleResourceDto = {
      roleId: assigningRole.id,
      resourceIds: finalResourceIds,
    };
    
    assignRoleResourceMutation.mutate(data);
  };

  // 获取所有子节点ID
  const getAllChildrenIds = (node: SysResourceDto): number[] => {
    let ids: number[] = [node.id];
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        ids = ids.concat(getAllChildrenIds(child));
      });
    }
    return ids;
  };

  // 获取所有父节点ID
  const getAllParentIds = (nodeId: number, resources: SysResourceDto[]): number[] => {
    const parentIds: number[] = [];
    
    const findParent = (nodes: SysResourceDto[], targetId: number): SysResourceDto | null => {
      for (const node of nodes) {
        if (node.children && node.children.some(child => child.id === targetId)) {
          return node;
        }
        if (node.children) {
          const found = findParent(node.children, targetId);
          if (found) return node;
        }
      }
      return null;
    };
    
    let currentId = nodeId;
    while (true) {
      const parent = findParent(resources, currentId);
      if (!parent) break;
      parentIds.push(parent.id);
      currentId = parent.id;
    }
    
    return parentIds;
  };

  // 检查所有子节点是否都被选中
  const areAllChildrenSelected = (node: SysResourceDto): boolean => {
    if (!node.children || node.children.length === 0) {
      return true;
    }
    
    return node.children.every(child => {
      const isSelected = selectedResourceIds.includes(child.id);
      const childrenSelected = areAllChildrenSelected(child);
      return isSelected && childrenSelected;
    });
  };

  // 检查父节点是否应该被选中
  const shouldSelectParent = (parentId: number, resources: SysResourceDto[], currentSelected: number[]): boolean => {
    const findNode = (nodes: SysResourceDto[], targetId: number): SysResourceDto | null => {
      for (const node of nodes) {
        if (node.id === targetId) return node;
        if (node.children) {
          const found = findNode(node.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };
    
    const parentNode = findNode(resources, parentId);
    if (!parentNode || !parentNode.children) return false;
    
    return parentNode.children.every(child => currentSelected.includes(child.id));
  };

  // 处理资源选择的级联逻辑
  const handleResourceSelect = (resource: SysResourceDto, checked: boolean) => {
    if (checked) {
      // 选中时，选中所有子节点
      const childrenIds = getAllChildrenIds(resource);
      setSelectedResourceIds(prev => {
        const newSelected = new Set([...prev, ...childrenIds]);
        const newArray = Array.from(newSelected);
        
        // 检查父节点是否应该被自动选中
        const parentIds = getAllParentIds(resource.id, allResources);
        parentIds.forEach(parentId => {
          if (shouldSelectParent(parentId, allResources, newArray)) {
            newSelected.add(parentId);
          }
        });
        
        return Array.from(newSelected);
      });
    } else {
      // 取消选中时，取消选中所有子节点和父节点
      const childrenIds = getAllChildrenIds(resource);
      const parentIds = getAllParentIds(resource.id, allResources);
      setSelectedResourceIds(prev => {
        return prev.filter(id => !childrenIds.includes(id) && !parentIds.includes(id));
      });
    }
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
            key: 'viewResources',
            label: '查看资源',
            icon: <FileTextOutlined />,
            onClick: () => handleViewResources(record)
          },
          {
            key: 'assignResources',
            label: '分配资源',
            icon: <SafetyOutlined />,
            onClick: () => handleAssignResources(record)
          },
          {
            type: 'divider'
          },
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

  // 资源类型配置
  const RESOURCE_TYPES = [
    { value: 0, label: '目录', icon: <FolderOutlined />, color: '#52c41a' },
    { value: 1, label: '菜单', icon: <MenuOutlined />, color: '#1890ff' },
    { value: 2, label: '按钮', icon: <SettingOutlined />, color: '#fa8c16' },
  ];

  // 获取资源类型配置
  const getResourceTypeConfig = (type: number) => {
    return RESOURCE_TYPES.find(t => t.value === type) || RESOURCE_TYPES[0];
  };

  // 转换资源数据为Tree组件需要的格式
  const convertToTreeData = (resources: SysResourceDto[], mode: 'view' | 'assign' = 'view'): any[] => {
    if (!Array.isArray(resources)) {
      return [];
    }
    
    return resources.map((resource) => {
      const typeConfig = getResourceTypeConfig(resource.type);
      const isCurrentlyAssigned = roleResources.some(rr => rr.id === resource.id);
      const isSelected = selectedResourceIds.includes(resource.id);
      
      // 在分配模式下，检查是否为半选状态
      const isIndeterminate = mode === 'assign' && !isSelected && resource.children && resource.children.length > 0 && 
        resource.children.some(child => selectedResourceIds.includes(child.id)) && 
        !areAllChildrenSelected(resource);
      
      // 在查看模式下，只显示已分配的资源
      if (mode === 'view' && !isCurrentlyAssigned) {
        return null;
      }
      
      return {
        ...resource,
        key: resource.id.toString(),
        title: mode === 'assign' ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                checked={isSelected}
                indeterminate={isIndeterminate}
                onChange={(e) => handleResourceSelect(resource, e.target.checked)}
                onClick={(e) => e.stopPropagation()}
                style={{ marginRight: 8 }}
              />
              <span style={{ marginRight: 8, color: typeConfig.color }}>
                {typeConfig.icon}
              </span>
              <span>{resource.name}</span>
              <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: '12px' }}>
                [{resource.code}]
              </Typography.Text>
              {isCurrentlyAssigned && (
                <Typography.Text type="success" style={{ marginLeft: 8, fontSize: '10px' }}>
                  已分配
                </Typography.Text>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: 8, color: typeConfig.color }}>
              {typeConfig.icon}
            </span>
            <span>{resource.name}</span>
            <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: '12px' }}>
              [{resource.code}]
            </Typography.Text>
            {resource.path && (
              <Typography.Text type="secondary" style={{ marginLeft: 8, fontSize: '12px' }}>
                ({resource.path})
              </Typography.Text>
            )}
          </div>
        ),
        children: resource.children ? convertToTreeData(resource.children, mode).filter(child => child !== null) : undefined,
      };
    }).filter(item => item !== null);
  };

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
        maskClosable={false}
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

      {/* 查看角色资源模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 40 }}>
            <span>查看角色资源 - {viewingRole?.name || ''}</span>
            {roleResources.length > 0 && (
              <Typography.Text type="secondary">
                共 {roleResources.length} 个资源
              </Typography.Text>
            )}
          </div>
        }
        open={resourceModalVisible}
        onCancel={() => {
          setResourceModalVisible(false);
          setViewingRole(null);
          setRoleResources([]);
          setAllResources([]);
          setExpandedKeys([]);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setResourceModalVisible(false);
            setViewingRole(null);
            setRoleResources([]);
            setAllResources([]);
            setExpandedKeys([]);
          }}>
            关闭
          </Button>
        ]}
        width={900}
        style={{ top: 50 }}
        maskClosable={false}
      >
        <div style={{ minHeight: 400, maxHeight: 700 }}>
          {getAllResourcesMutation.isPending || getRoleResourcesMutation.isPending ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <FileTextOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 16 }} />
              <div>加载资源数据中...</div>
            </div>
          ) : (
            <div>
              <div style={{ 
                marginBottom: 16, 
                padding: '12px 16px', 
                backgroundColor: '#f0f7ff', 
                border: '1px solid #91d5ff',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileTextOutlined style={{ color: '#1890ff' }} />
                  <span>该角色已分配的资源权限</span>
                </div>
              </div>
              
              <div style={{ 
                border: '1px solid #f0f0f0',
                borderRadius: 6,
                backgroundColor: '#fafafa',
                padding: 16,
                maxHeight: 550,
                overflowY: 'auto'
              }}>
                {allResources.length > 0 ? (
                  <Tree
                    showLine={{ showLeafIcon: false }}
                    showIcon={false}
                    expandedKeys={expandedKeys}
                    onExpand={setExpandedKeys}
                    treeData={convertToTreeData(allResources, 'view')}
                    blockNode
                    style={{ background: 'transparent' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                    暂无资源数据
                  </div>
                )}
              </div>
              
              {roleResources.length === 0 && allResources.length > 0 && (
                <div style={{ 
                  marginTop: 16, 
                  padding: '12px 16px', 
                  background: '#fff7e6', 
                  border: '1px solid #ffd591',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fa8c16' }}>
                    <FileTextOutlined />
                    <span>该角色暂无分配任何资源权限</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* 分配角色资源模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 40 }}>
            <span>分配资源 - {assigningRole?.name || ''}</span>
            {allResources.length > 0 && (
              <Typography.Text type="secondary">共 {allResources.length} 个资源</Typography.Text>
            )}
            {selectedResourceIds.length > 0 && (
              <Typography.Text type="success">已选 {selectedResourceIds.length} 个</Typography.Text>
            )}
          </div>
        }
        open={assignResourceModalVisible}
        onOk={handleConfirmAssignResources}
        onCancel={() => {
          setAssignResourceModalVisible(false);
          setAssigningRole(null);
          setSelectedResourceIds([]);
          setAllResources([]);
          setRoleResources([]);
          setExpandedKeys([]);
        }}
        confirmLoading={assignRoleResourceMutation.isPending}
        width={900}
        style={{ top: 50 }}
        okText="确认分配"
        cancelText="取消"
        maskClosable={false}
      >
        <div style={{ minHeight: 400, maxHeight: 600 }}>
          {getAllResourcesMutation.isPending || getRoleResourcesMutation.isPending ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <FileTextOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 16 }} />
              <div>加载资源数据中...</div>
            </div>
          ) : (
            <div>
              <div style={{ 
                marginBottom: 16, 
                padding: '12px 16px', 
                backgroundColor: '#f0f7ff', 
                border: '1px solid #91d5ff',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileTextOutlined style={{ color: '#1890ff' }} />
                  <span>请选择要为角色分配的资源</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button 
                    size="small" 
                    onClick={() => {
                      const allIds: number[] = [];
                      const traverse = (nodes: SysResourceDto[]) => {
                        nodes.forEach(node => {
                          allIds.push(node.id);
                          if (node.children) {
                            traverse(node.children);
                          }
                        });
                      };
                      traverse(allResources);
                      setSelectedResourceIds(allIds);
                    }}
                    disabled={selectedResourceIds.length === getAllNodeKeys(allResources).length}
                  >
                    全选
                  </Button>
                  <Button 
                    size="small" 
                    onClick={() => setSelectedResourceIds([])}
                    disabled={selectedResourceIds.length === 0}
                  >
                    清空
                  </Button>
                </div>
              </div>
              
              <div style={{ 
                border: '1px solid #f0f0f0',
                borderRadius: 6,
                backgroundColor: '#fafafa',
                padding: 16,
                maxHeight: 400,
                overflowY: 'auto'
              }}>
                {allResources.length > 0 ? (
                  <Tree
                    showLine={{ showLeafIcon: false }}
                    showIcon={false}
                    expandedKeys={expandedKeys}
                    onExpand={setExpandedKeys}
                    treeData={convertToTreeData(allResources, 'assign')}
                    blockNode
                    style={{ background: 'transparent' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                    暂无资源数据
                  </div>
                )}
              </div>
              
              {selectedResourceIds.length > 0 && (
                <div style={{ 
                  marginTop: 16,
                  marginBottom: 16,
                  padding: '12px 16px', 
                  background: 'linear-gradient(90deg, #f0f9ff 0%, #e6f7ff 100%)', 
                  border: '1px solid #91d5ff',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileTextOutlined style={{ color: '#1890ff' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span>已选择 <strong>{selectedResourceIds.length}</strong> 个资源</span>
                      {(() => {
                        const finalCount = ensureParentNodes(selectedResourceIds, allResources).length;
                        return finalCount > selectedResourceIds.length && (
                          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                            (包含必要的父级节点，实际提交 <strong>{finalCount}</strong> 个)
                          </Typography.Text>
                        );
                      })()}
                    </div>
                  </div>
                  <Button 
                    size="small" 
                    type="link" 
                    onClick={() => setSelectedResourceIds([])}
                  >
                    清空选择
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};