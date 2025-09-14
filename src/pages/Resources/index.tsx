import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tree, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select,
  message, 
  Popconfirm,
  Tooltip,
  Row,
  Col,
  Switch,
  Tag
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined,
  FileTextOutlined,
  MenuOutlined,
  FolderOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceApi } from '@/services/resource';
import type { SysResourceDto, CreateResourceDto, UpdateResourceDto } from '@/types/swagger-api';

interface TreeNodeData extends SysResourceDto {
  key: string;
  title: React.ReactNode;
  children?: TreeNodeData[];
}

const { Option } = Select;

// 资源类型选项
const RESOURCE_TYPES = [
  { value: 0, label: '目录', icon: <FolderOutlined />, color: '#52c41a' },
  { value: 1, label: '菜单', icon: <MenuOutlined />, color: '#1890ff' },
  { value: 2, label: '按钮', icon: <SettingOutlined />, color: '#fa8c16' },
];

export const Resources: React.FC = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  
  // 状态管理
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [selectedResource, setSelectedResource] = useState<SysResourceDto | null>(null);
  const [parentId, setParentId] = useState<number | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  // 获取资源树数据
  const { 
    data: resourceResponse, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['resourceTree'],
    queryFn: () => resourceApi.trees(),
    staleTime: 5 * 60 * 1000,
  });

  // 处理网络错误
  useEffect(() => {
    if (error) {
      message.error('获取资源树数据失败，请检查网络连接');
    }
  }, [error]);

  // 创建资源
  const createMutation = useMutation({
    mutationFn: (data: CreateResourceDto) => resourceApi.create(data),
    onSuccess: (response) => {
      if (response.success) {
        message.success('创建资源成功');
        setModalVisible(false);
        form.resetFields();
        queryClient.invalidateQueries({ queryKey: ['resourceTree'] });
      }
    },
    onError: (error: any) => {
      message.error(error?.message || '创建资源失败');
    },
  });

  // 更新资源
  const updateMutation = useMutation({
    mutationFn: (data: UpdateResourceDto) => resourceApi.update(data),
    onSuccess: (response) => {
      if (response.success) {
        message.success('更新资源成功');
        setModalVisible(false);
        form.resetFields();
        setSelectedResource(null);
        queryClient.invalidateQueries({ queryKey: ['resourceTree'] });
      }
    },
    onError: (error: any) => {
      message.error(error?.message || '更新资源失败');
    },
  });

  // 删除资源
  const deleteMutation = useMutation({
    mutationFn: (id: number) => resourceApi.remove(id),
    onSuccess: (response) => {
      if (response.success) {
        message.success('删除资源成功');
        queryClient.invalidateQueries({ queryKey: ['resourceTree'] });
      }
    },
    onError: (error: any) => {
      message.error(error?.message || '删除资源失败');
    },
  });

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

  // 获取资源类型配置
  const getResourceTypeConfig = (type: number) => {
    return RESOURCE_TYPES.find(t => t.value === type) || RESOURCE_TYPES[0];
  };

  // 转换资源数据为Tree组件需要的格式
  const convertToTreeData = (resources: SysResourceDto[]): TreeNodeData[] => {
    if (!Array.isArray(resources)) {
      console.warn('convertToTreeData: resources is not an array', resources);
      return [];
    }
    
    return resources.map((resource) => {
      const typeConfig = getResourceTypeConfig(resource.type);
      
      return {
        ...resource,
        key: resource.id.toString(),
        title: (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: 8, color: typeConfig.color }}>
                {typeConfig.icon}
              </span>
              <span>{resource.name}</span>
              <Tag color={typeConfig.color} style={{ marginLeft: 8, fontSize: '10px' }}>
                {typeConfig.label}
              </Tag>
              {resource.code && (
                <span style={{ marginLeft: 8, color: '#999', fontSize: '12px' }}>
                  [{resource.code}]
                </span>
              )}
              {resource.path && (
                <span style={{ marginLeft: 8, color: '#666', fontSize: '12px' }}>
                  ({resource.path})
                </span>
              )}
              {resource.isHidden && (
                <Tag color="red" style={{ marginLeft: 8, fontSize: '10px' }}>
                  隐藏
                </Tag>
              )}
              {resource.isKeepAlive && (
                <Tag color="blue" style={{ marginLeft: 8, fontSize: '10px' }}>
                  缓存
                </Tag>
              )}
              {resource.isExternalLink && (
                <Tag color="purple" style={{ marginLeft: 8, fontSize: '10px' }}>
                  外链
                </Tag>
              )}
            </span>
            <Space size="small" onClick={(e) => e.stopPropagation()}>
              <Tooltip title="添加子资源">
                <Button
                  type="text"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => handleCreateChild(resource)}
                />
              </Tooltip>
              <Tooltip title="编辑">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(resource)}
                />
              </Tooltip>
              <Tooltip title="删除">
                <Popconfirm
                  title="确认删除"
                  description={`确定要删除资源"${resource.name}"吗？`}
                  onConfirm={() => handleDelete(resource.id)}
                  okText="确认"
                  cancelText="取消"
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    danger
                  />
                </Popconfirm>
              </Tooltip>
            </Space>
          </div>
        ),
        children: resource.children ? convertToTreeData(resource.children) : undefined,
      };
    });
  };

  // 创建根资源
  const handleCreateRoot = () => {
    setModalType('create');
    setParentId(null);
    setSelectedResource(null);
    form.resetFields();
    // 设置默认值
    form.setFieldsValue({
      type: 0, // 默认为目录
      parentId: 0,
      sort: 0,
      isHidden: false,
      isKeepAlive: false,
      isExternalLink: false,
    });
    setModalVisible(true);
  };

  // 创建子资源
  const handleCreateChild = (parent: SysResourceDto) => {
    setModalType('create');
    setParentId(parent.id);
    setSelectedResource(null);
    form.resetFields();
    
    setTimeout(() => {
      form.setFieldsValue({ 
        parentId: parent.id,
        type: parent.type === 0 ? 1 : 2, // 目录下默认创建菜单，菜单下默认创建按钮
        sort: 0,
        isHidden: false,
        isKeepAlive: false,
        isExternalLink: false,
      });
    }, 100);
    
    setModalVisible(true);
  };

  // 编辑资源
  const handleEdit = (resource: SysResourceDto) => {
    setModalType('edit');
    setSelectedResource(resource);
    
    setTimeout(() => {
      form.setFieldsValue({
        name: resource.name,
        code: resource.code,
        type: resource.type,
        parentId: resource.parentId,
        path: resource.path,
        component: resource.component,
        icon: resource.icon,
        sort: resource.sort,
        isHidden: resource.isHidden,
        isKeepAlive: resource.isKeepAlive,
        isExternalLink: resource.isExternalLink,
      });
    }, 100);
    
    setModalVisible(true);
  };

  // 删除资源
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (modalType === 'create') {
        const createData: CreateResourceDto = {
          ...values,
          parentId: parentId === null ? 0 : parentId,
        };
        createMutation.mutate(createData);
      } else if (selectedResource) {
        const updateData: UpdateResourceDto = {
          id: selectedResource.id,
          ...values,
        };
        updateMutation.mutate(updateData);
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 取消操作
  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setSelectedResource(null);
    setParentId(null);
  };

  // 树节点展开/收缩
  const onExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue);
  };

  // 处理API返回的数据结构
  const getTreeData = () => {
    if (!resourceResponse?.success || !resourceResponse.data) {
      return [];
    }
    
    // 资源可能是多棵树（多个根节点）
    return convertToTreeData(resourceResponse.data);
  };

  const treeData = getTreeData();

  // 自动展开所有节点
  useEffect(() => {
    if (resourceResponse?.success && resourceResponse.data) {
      const allKeys = getAllNodeKeys(resourceResponse.data);
      setExpandedKeys(allKeys);
    }
  }, [resourceResponse]);

  if (error) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0', color: '#ff4d4f' }}>
          获取资源树数据失败，请稍后重试
        </div>
      </Card>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title="资源管理"
            extra={
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleCreateRoot}
                >
                  创建根资源
                </Button>
                <Button 
                  icon={<ReloadOutlined />}
                  onClick={() => refetch()}
                  loading={isLoading}
                >
                  刷新
                </Button>
              </Space>
            }
          >
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                加载中...
              </div>
            ) : treeData.length > 0 ? (
              <Tree
                showLine={{ showLeafIcon: false }}
                expandedKeys={expandedKeys}
                onExpand={onExpand}
                treeData={treeData}
                blockNode
                style={{ background: 'transparent' }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}>
                暂无资源数据，请创建根资源
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 创建/编辑资源模态框 */}
      <Modal
        title={modalType === 'create' ? '创建资源' : '编辑资源'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnHidden
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="资源名称"
                rules={[
                  { required: true, message: '请输入资源名称' },
                  { max: 50, message: '资源名称不能超过50个字符' },
                ]}
              >
                <Input placeholder="请输入资源名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label="资源编码"
                rules={[
                  { required: true, message: '请输入资源编码' },
                  { max: 50, message: '资源编码不能超过50个字符' },
                ]}
              >
                <Input placeholder="请输入资源编码" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="资源类型"
                rules={[{ required: true, message: '请选择资源类型' }]}
              >
                <Select placeholder="请选择资源类型">
                  {RESOURCE_TYPES.map(type => (
                    <Option key={type.value} value={type.value}>
                      <span style={{ marginRight: 8, color: type.color }}>
                        {type.icon}
                      </span>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sort"
                label="排序"
                rules={[{ required: true, message: '请输入排序号' }]}
              >
                <Input type="number" placeholder="请输入排序号" min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="path"
                label="资源路径"
              >
                <Input placeholder="请输入资源路径（如：/system/users）" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="component"
                label="资源组件"
              >
                <Input placeholder="请输入组件路径（如：pages/Users）" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="icon"
            label="资源图标"
          >
            <Input placeholder="请输入图标名称（如：UserOutlined）" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="isHidden"
                label="是否隐藏"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isKeepAlive"
                label="是否缓存"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isExternalLink"
                label="是否外链"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          {/* 创建根资源时不显示父级资源选择 */}
          {!(modalType === 'create' && parentId === null) && (
            <Form.Item
              name="parentId"
              label="父级资源ID"
            >
              <Input type="number" placeholder="父级资源ID（0表示根资源）" min={0} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};