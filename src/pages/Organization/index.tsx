import React, { useState, useEffect } from 'react';
import {
  Card,
  Tree,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Popconfirm,
  Tooltip,
  Row,
  Col,
  App
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined,
  ApartmentOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessApiService } from '@/services/api';
import OrgSelect from '@/components/OrgSelect';
import type { SysOrgDto, CreateOrgDto, UpdateOrgDto } from '@/types/swagger-api';

interface TreeNodeData extends SysOrgDto {
  key: string;
  title: React.ReactNode;
  children?: TreeNodeData[];
}

export const Organization: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  
  // 状态管理
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [selectedOrg, setSelectedOrg] = useState<SysOrgDto | null>(null);
  const [parentId, setParentId] = useState<number | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  // 获取组织树数据
  const { 
    data: orgResponse, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['orgTree'],
    queryFn: () => businessApiService.getOrganizations(),
    staleTime: 5 * 60 * 1000,
  });

  // 创建组织
  const createMutation = useMutation({
    mutationFn: (data: CreateOrgDto) => businessApiService.createOrganization(data),
    onSuccess: () => {
      message.success('创建组织成功');
      setModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['orgTree'] });
    },
  });

  // 更新组织
  const updateMutation = useMutation({
    mutationFn: (data: UpdateOrgDto) => businessApiService.updateOrganization(data),
    onSuccess: () => {
      message.success('更新组织成功');
      setModalVisible(false);
      form.resetFields();
      setSelectedOrg(null);
      queryClient.invalidateQueries({ queryKey: ['orgTree'] });
    },
  });

  // 删除组织
  const deleteMutation = useMutation({
    mutationFn: (id: number) => businessApiService.deleteOrganization(id),
    onSuccess: () => {
      message.success('删除组织成功');
      queryClient.invalidateQueries({ queryKey: ['orgTree'] });
    },
  });


  // 收集所有节点的key用于展开
  const getAllNodeKeys = (nodes: SysOrgDto[]): React.Key[] => {
    let keys: React.Key[] = [];
    
    const traverse = (nodeList: SysOrgDto[]) => {
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

  // 转换组织数据为Tree组件需要的格式
  const convertToTreeData = (organizations: SysOrgDto[]): TreeNodeData[] => {
    if (!Array.isArray(organizations)) {
      console.warn('convertToTreeData: organizations is not an array', organizations);
      return [];
    }
    return organizations.map((org) => {
      // 处理组织数据
      const orgName = org.name || '未命名组织';
      const orgNameAbbr = org.nameAbbr || '';
      const orgCode = org.code || '';
      
      return {
        ...org,
        key: org.id.toString(),
        title: (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ flex: 1 }}>
              <ApartmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              {orgName}
              {orgNameAbbr && (
                <span style={{ marginLeft: 8, color: '#666', fontSize: '12px', fontWeight: 'bold' }}>
                  [{orgNameAbbr}]
                </span>
              )}
              {orgCode && (
                <span style={{ marginLeft: 8, color: '#999', fontSize: '12px' }}>
                  ({orgCode})
                </span>
              )}
            </span>
            <Space size="small" onClick={(e) => e.stopPropagation()}>
            <Tooltip title="添加子组织">
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => handleCreateChild(org)}
              />
            </Tooltip>
            <Tooltip title="编辑">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(org)}
              />
            </Tooltip>
            <Tooltip title="删除">
              <Popconfirm
                title="确认删除"
                description={`确定要删除组织"${orgName}"吗？`}
                onConfirm={() => handleDelete(org.id)}
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
      children: org.children ? convertToTreeData(org.children) : undefined,
    };
  });
  };

  // 创建根组织
  const handleCreateRoot = () => {
    setModalType('create');
    setParentId(null);
    setSelectedOrg(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 创建子组织
  const handleCreateChild = (parent: SysOrgDto) => {
    setModalType('create');
    setParentId(parent.id);
    setSelectedOrg(null);
    form.resetFields();
    
    // 使用 setTimeout 确保 Modal 完全渲染后再设置表单值
    setTimeout(() => {
      form.setFieldsValue({ parentId: parent.id });
    }, 100);
    
    setModalVisible(true);
  };

  // 编辑组织
  const handleEdit = (org: SysOrgDto) => {
    setModalType('edit');
    setSelectedOrg(org);
    
    // 使用 setTimeout 确保 Modal 完全渲染后再设置表单值
    setTimeout(() => {
      form.setFieldsValue({
        name: org.name,
        nameAbbr: org.nameAbbr,
        comment: org.comment,
        parentId: org.parentId,
      });
    }, 100);
    
    setModalVisible(true);
  };

  // 删除组织
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (modalType === 'create') {
        const createData: CreateOrgDto = {
          ...values,
          parentId: parentId === null ? 0 : parentId, // 根组织的parentId设置为0
        };
        createMutation.mutate(createData);
      } else if (selectedOrg) {
        const updateData: UpdateOrgDto = {
          id: selectedOrg.id,
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
    setSelectedOrg(null);
    setParentId(null);
  };

  // 树节点展开/收缩
  const onExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue);
  };

  // 处理API返回的数据结构
  const getTreeData = () => {
    if (!orgResponse?.success || !orgResponse.data) {
      return [];
    }
    
    // 如果返回的是单个对象，将其包装为数组
    if (!Array.isArray(orgResponse.data)) {
      return convertToTreeData([orgResponse.data]);
    }
    
    // 如果返回的是数组，直接处理
    return convertToTreeData(orgResponse.data);
  };

  const treeData = getTreeData();

  // 自动展开所有节点
  useEffect(() => {
    if (orgResponse?.success && orgResponse.data) {
      const rawData = Array.isArray(orgResponse.data) ? orgResponse.data : [orgResponse.data];
      const allKeys = getAllNodeKeys(rawData);
      setExpandedKeys(allKeys);
    }
  }, [orgResponse]);

  if (error) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0', color: '#ff4d4f' }}>
          获取组织架构数据失败，请稍后重试
        </div>
      </Card>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title="组织架构管理"
            extra={
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleCreateRoot}
                >
                  创建根组织
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
                暂无组织架构数据，请创建根组织
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 创建/编辑组织模态框 */}
      <Modal
        title={modalType === 'create' ? '创建组织' : '编辑组织'}
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
          <Form.Item
            name="name"
            label="组织名称"
            rules={[
              { required: true, message: '请输入组织名称' },
              { max: 50, message: '组织名称不能超过50个字符' },
            ]}
          >
            <Input placeholder="请输入组织名称" />
          </Form.Item>

          <Form.Item
            name="nameAbbr"
            label="组织简称"
            rules={[
              { required: true, message: '请输入组织简称' },
              { max: 20, message: '组织简称不能超过20个字符' },
            ]}
          >
            <Input placeholder="请输入组织简称" />
          </Form.Item>

          <Form.Item
            name="comment"
            label="组织描述"
          >
            <Input.TextArea 
              placeholder="请输入组织描述" 
              rows={3}
              maxLength={200}
              showCount
            />
          </Form.Item>

          {/* 创建根组织时不显示父级组织选择 */}
          {!(modalType === 'create' && parentId === null) && (
            <Form.Item
              name="parentId"
              label="父级组织"
            >
              <OrgSelect
                placeholder="请选择父级组织（可选）"
                allowClear
                excludeId={modalType === 'edit' ? selectedOrg?.id : undefined}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};