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
  Tree,
  Switch,
  Typography,
  App,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  SettingOutlined,
  BookOutlined,
  FileTextOutlined,
  MenuOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dictApi } from '@/services/dict';
import type {
  SysDictDto,
  SysDictItemDto,
  CreateDictDto,
  UpdateDictDto,
  QueryDictDto,
  CreateDictItemDto,
  UpdateDictItemDto,
  PageResult,
} from '@/types/swagger-api';

const { Option } = Select;

export const Dictionary: React.FC = () => {
  const { message } = App.useApp();
  const [dictSearchForm] = Form.useForm();
  const [dictForm] = Form.useForm();
  const [itemForm] = Form.useForm();
  
  // 字典相关状态
  const [isDictModalVisible, setIsDictModalVisible] = useState(false);
  const [editingDict, setEditingDict] = useState<SysDictDto | null>(null);
  const [searchParams, setSearchParams] = useState<QueryDictDto>({
    pageNo: 1,
    pageSize: 10,
  });
  const [selectedDict, setSelectedDict] = useState<SysDictDto | null>(null);
  
  // 字典项相关状态
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<SysDictItemDto | null>(null);
  const [dictItems, setDictItems] = useState<SysDictItemDto[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [parentId, setParentId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // 查询字典列表
  const { data: dictListData, isLoading } = useQuery({
    queryKey: ['dicts', searchParams],
    queryFn: () => dictApi.page(searchParams),
  });

  // 创建字典
  const createDictMutation = useMutation({
    mutationFn: (data: CreateDictDto) => dictApi.create(data),
    onSuccess: () => {
      message.success('字典创建成功');
      setIsDictModalVisible(false);
      dictForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['dicts'] });
    },
  });

  // 更新字典
  const updateDictMutation = useMutation({
    mutationFn: (data: UpdateDictDto) => dictApi.update(data),
    onSuccess: () => {
      message.success('字典更新成功');
      setIsDictModalVisible(false);
      dictForm.resetFields();
      setEditingDict(null);
      queryClient.invalidateQueries({ queryKey: ['dicts'] });
    },
  });

  // 删除字典
  const deleteDictMutation = useMutation({
    mutationFn: (id: number) => dictApi.remove(id),
    onSuccess: () => {
      message.success('字典删除成功');
      queryClient.invalidateQueries({ queryKey: ['dicts'] });
      // 如果删除的是当前选中的字典，清空右侧
      if (selectedDict && selectedDict.id === selectedDict?.id) {
        setSelectedDict(null);
        setDictItems([]);
      }
    },
  });

  // 获取字典项树
  const getItemTreeMutation = useMutation({
    mutationFn: (dictId: number) => dictApi.getItemTree(dictId),
    onSuccess: (response) => {
      if (response.success) {
        setDictItems(response.data || []);
        // 自动展开所有节点
        const allKeys = getAllNodeKeys(response.data || []);
        setExpandedKeys(allKeys);
      }
    },
  });

  // 创建字典项
  const createItemMutation = useMutation({
    mutationFn: (data: CreateDictItemDto) => dictApi.createItem(data),
    onSuccess: () => {
      message.success('字典项创建成功');
      setIsItemModalVisible(false);
      itemForm.resetFields();
      setParentId(null);
      if (selectedDict) {
        getItemTreeMutation.mutate(selectedDict.id);
      }
    },
  });

  // 更新字典项
  const updateItemMutation = useMutation({
    mutationFn: (data: UpdateDictItemDto) => dictApi.updateItem(data),
    onSuccess: () => {
      message.success('字典项更新成功');
      setIsItemModalVisible(false);
      itemForm.resetFields();
      setEditingItem(null);
      setParentId(null);
      if (selectedDict) {
        getItemTreeMutation.mutate(selectedDict.id);
      }
    },
  });

  // 删除字典项
  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => dictApi.removeItem(id),
    onSuccess: () => {
      message.success('字典项删除成功');
      if (selectedDict) {
        getItemTreeMutation.mutate(selectedDict.id);
      }
    },
  });

  // 收集所有节点的key用于展开
  const getAllNodeKeys = (nodes: SysDictItemDto[]): React.Key[] => {
    let keys: React.Key[] = [];
    
    const traverse = (nodeList: SysDictItemDto[]) => {
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

  // 处理字典搜索
  const handleDictSearch = (values: any) => {
    setSearchParams({
      ...values,
      pageNo: 1,
      pageSize: searchParams.pageSize,
      // 明确不过滤启用状态，显示所有字典
    });
  };

  // 处理字典分页
  const handleDictTableChange = (pagination: any) => {
    setSearchParams({
      ...searchParams,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  // 选择字典
  const handleSelectDict = (dict: SysDictDto) => {
    setSelectedDict(dict);
    getItemTreeMutation.mutate(dict.id);
  };

  // 创建字典
  const handleCreateDict = () => {
    setEditingDict(null);
    dictForm.resetFields();
    setIsDictModalVisible(true);
  };

  // 编辑字典
  const handleEditDict = (dict: SysDictDto) => {
    setEditingDict(dict);
    setIsDictModalVisible(true);
    setTimeout(() => {
      dictForm.setFieldsValue({
        name: dict.name || '',
        code: dict.code || '',
        comment: dict.comment || '',
        isEnabled: dict.isEnabled !== false,
      });
    }, 100);
  };

  // 删除字典确认
  const confirmDeleteDict = (id: number) => {
    if (!id) return;
    deleteDictMutation.mutate(id);
  };

  // 提交字典表单
  const handleDictSubmit = (values: any) => {
    if (editingDict) {
      updateDictMutation.mutate({
        id: editingDict.id,
        ...values,
      });
    } else {
      createDictMutation.mutate(values);
    }
  };

  // 创建根字典项
  const handleCreateRootItem = () => {
    if (!selectedDict) return;
    setEditingItem(null);
    setParentId(null);
    itemForm.resetFields();
    itemForm.setFieldsValue({
      dictId: selectedDict.id,
      dictCode: selectedDict.code,
      parentId: 0,
      sort: 0,
      isEnabled: true,
    });
    setIsItemModalVisible(true);
  };

  // 创建子字典项
  const handleCreateChildItem = (parent: SysDictItemDto) => {
    if (!selectedDict) return;
    setEditingItem(null);
    setParentId(parent.id);
    itemForm.resetFields();
    // 在setTimeout中设置表单值，确保表单已经重置完成
    setTimeout(() => {
      itemForm.setFieldsValue({
        parentId: parent.id,
        sort: 0,
        isEnabled: true,
      });
    }, 100);
    setIsItemModalVisible(true);
  };

  // 编辑字典项
  const handleEditItem = (item: SysDictItemDto) => {
    setEditingItem(item);
    setIsItemModalVisible(true);
    setTimeout(() => {
      itemForm.setFieldsValue({
        label: item.label || '',
        value: item.value || '',
        comment: item.comment || '',
        sort: item.sort || 0,
        parentId: item.parentId || 0,
        isEnabled: item.isEnabled !== false,
      });
    }, 100);
  };

  // 删除字典项确认
  const confirmDeleteItem = (id: number) => {
    if (!id) return;
    deleteItemMutation.mutate(id);
  };

  // 提交字典项表单
  const handleItemSubmit = (values: any) => {
    if (editingItem) {
      updateItemMutation.mutate({
        id: editingItem.id,
        ...values,
      });
    } else {
      // 创建字典项时确保包含parentId
      const createData = {
        dictId: selectedDict!.id,
        dictCode: selectedDict!.code!,
        ...values,
        parentId: parentId || 0, // 确保parentId被正确传递
      };
      createItemMutation.mutate(createData);
    }
  };

  // 转换字典项数据为Tree组件需要的格式
  const convertToTreeData = (items: SysDictItemDto[]): any[] => {
    if (!Array.isArray(items)) {
      return [];
    }
    
    return items.map((item) => ({
      ...item,
      key: item.id.toString(),
      title: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileTextOutlined style={{ color: '#1890ff' }} />
            <span>{item.label}</span>
            {item.value && (
              <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                [{item.value}]
              </Typography.Text>
            )}
            <Tag color={item.isEnabled ? 'green' : 'red'} size="small">
              {item.isEnabled ? '可选' : '不可选'}
            </Tag>
          </div>
          <Space size="small" onClick={(e) => e.stopPropagation()}>
            <Tooltip title="添加子项">
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => handleCreateChildItem(item)}
              />
            </Tooltip>
            <Tooltip title="编辑">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditItem(item)}
              />
            </Tooltip>
            <Tooltip title="删除">
              <Popconfirm
                title="确认删除"
                description={`确定要删除字典项"${item.label}"吗？`}
                onConfirm={() => confirmDeleteItem(item.id)}
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
      children: item.children ? convertToTreeData(item.children) : undefined,
    }));
  };

  // 字典表格列定义
  const dictColumns: ColumnsType<SysDictDto> = [
    {
      title: '字典名称',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Button
          type="link"
          onClick={() => handleSelectDict(record)}
          style={{
            padding: 0,
            height: 'auto',
            fontWeight: selectedDict?.id === record.id ? 'bold' : 'normal',
            color: selectedDict?.id === record.id ? '#1890ff' : undefined,
          }}
        >
          {name || '-'}
        </Button>
      ),
    },
    {
      title: '字典编码',
      dataIndex: 'code',
      key: 'code',
      render: (code, record) => {
        if (!code) return '-';
        if (record.comment) {
          return (
            <Tooltip title={record.comment}>
              <span style={{ cursor: 'help', borderBottom: '1px dashed #ccc' }}>
                {code}
              </span>
            </Tooltip>
          );
        }
        return code;
      },
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      key: 'isEnabled',
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
        const getMenuItems = (record: SysDictDto): MenuProps['items'] => [
          {
            key: 'edit',
            label: '编辑',
            icon: <EditOutlined />,
            onClick: () => handleEditDict(record)
          },
          {
            key: 'delete',
            label: (
              <Popconfirm
                title="确定要删除这个字典吗？"
                onConfirm={() => record.id && confirmDeleteDict(record.id)}
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

  const dictListResult = dictListData?.data as PageResult<SysDictDto> | undefined;

  return (
    <div className="p-6">
      <Row gutter={16}>
        {/* 左侧：字典管理 */}
        <Col span={12}>
          <Card title="数据字典" extra={
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleCreateDict}
            >
              创建字典
            </Button>
          }>
            {/* 搜索区域 */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <Form form={dictSearchForm} onFinish={handleDictSearch}>
                <Row gutter={[16, 8]} align="middle">
                  <Col xs={24} sm={8} md={8}>
                    <Form.Item name="name" label="字典名称" style={{ marginBottom: 0 }}>
                      <Input placeholder="请输入字典名称" allowClear />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8} md={8}>
                    <Form.Item name="code" label="字典编码" style={{ marginBottom: 0 }}>
                      <Input placeholder="请输入字典编码" allowClear />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8} md={8}>
                    <div>
                      <Space>
                        <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                          搜索
                        </Button>
                        <Button onClick={() => dictSearchForm.resetFields()}>重置</Button>
                      </Space>
                    </div>
                  </Col>
                </Row>
              </Form>
            </div>

            <Table
              columns={dictColumns}
              dataSource={dictListResult?.rows || []}
              rowKey="id"
              loading={isLoading}
              pagination={{
                current: searchParams.pageNo,
                pageSize: searchParams.pageSize,
                total: dictListResult?.totalCount || 0,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                pageSizeOptions: ['10', '20', '50'],
                showQuickJumper: {
                  goButton: '跳转',
                },
                locale: {
                  items_per_page: '条/页',
                  jump_to: '跳至',
                  jump_to_confirm: '确定',
                  page: '页',
                  prev_page: '上一页',
                  next_page: '下一页',
                  prev_5: '向前 5 页',
                  next_5: '向后 5 页',
                  prev_3: '向前 3 页',
                  next_3: '向后 3 页',
                },
              }}
              onChange={handleDictTableChange}
            />
          </Card>
        </Col>

        {/* 右侧：字典项管理 */}
        <Col span={12}>
          <Card 
            title={selectedDict ? `字典项管理 - ${selectedDict.name}` : '请选择字典'}
            extra={selectedDict && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleCreateRootItem}
              >
                添加根项
              </Button>
            )}
          >
            {selectedDict ? (
              <div style={{ minHeight: 400 }}>
                {getItemTreeMutation.isPending ? (
                  <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <BookOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 16 }} />
                    <div>加载字典项中...</div>
                  </div>
                ) : dictItems.length > 0 ? (
                  <Tree
                    showLine={{ showLeafIcon: false }}
                    showIcon={false}
                    expandedKeys={expandedKeys}
                    onExpand={setExpandedKeys}
                    treeData={convertToTreeData(dictItems)}
                    blockNode
                    style={{ 
                      background: '#fafafa',
                      border: '1px solid #f0f0f0',
                      borderRadius: 6,
                      padding: 16,
                      maxHeight: 500,
                      overflowY: 'auto'
                    }}
                  />
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px', 
                    color: '#999',
                    backgroundColor: '#fafafa',
                    borderRadius: 6,
                    border: '1px dashed #d9d9d9'
                  }}>
                    <FileTextOutlined style={{ fontSize: 32, marginBottom: 16, color: '#d9d9d9' }} />
                    <div style={{ fontSize: 14 }}>该字典暂无数据项</div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '100px 20px', 
                color: '#999',
              }}>
                <BookOutlined style={{ fontSize: 48, marginBottom: 24, color: '#d9d9d9' }} />
                <div style={{ fontSize: 16 }}>请在左侧选择一个字典来管理其数据项</div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 字典编辑模态框 */}
      <Modal
        title={editingDict ? '编辑字典' : '创建字典'}
        open={isDictModalVisible}
        onCancel={() => {
          setIsDictModalVisible(false);
          dictForm.resetFields();
          setEditingDict(null);
        }}
        footer={null}
        width={600}
        maskClosable={false}
      >
        <Form
          form={dictForm}
          layout="vertical"
          onFinish={handleDictSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="字典名称"
                rules={[{ required: true, message: '请输入字典名称' }]}
              >
                <Input placeholder="请输入字典名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label="字典编码"
                rules={[{ required: true, message: '请输入字典编码' }]}
              >
                <Input placeholder="请输入字典编码" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="comment"
            label="字典备注"
          >
            <Input.TextArea placeholder="请输入字典备注" rows={4} />
          </Form.Item>

          <Form.Item
            name="isEnabled"
            label="是否启用"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={createDictMutation.isPending || updateDictMutation.isPending}
              >
                {editingDict ? '更新' : '创建'}
              </Button>
              <Button 
                onClick={() => {
                  setIsDictModalVisible(false);
                  dictForm.resetFields();
                  setEditingDict(null);
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 字典项编辑模态框 */}
      <Modal
        title={editingItem ? '编辑字典项' : '创建字典项'}
        open={isItemModalVisible}
        onCancel={() => {
          setIsItemModalVisible(false);
          itemForm.resetFields();
          setEditingItem(null);
          setParentId(null);
        }}
        footer={null}
        width={600}
        maskClosable={false}
      >
        <Form
          form={itemForm}
          layout="vertical"
          onFinish={handleItemSubmit}
        >
          {/* 隐藏的parentId字段 */}
          <Form.Item name="parentId" hidden>
            <Input type="hidden" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="label"
                label="标签"
                rules={[{ required: true, message: '请输入标签' }]}
              >
                <Input placeholder="请输入标签" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="value"
                label="值"
              >
                <Input placeholder="请输入值" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sort"
                label="排序"
                rules={[{ required: true, message: '请输入排序号' }]}
              >
                <Input type="number" placeholder="请输入排序号" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isEnabled"
                label="是否可选"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="comment"
            label="备注"
          >
            <Input.TextArea placeholder="请输入备注" rows={4} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={createItemMutation.isPending || updateItemMutation.isPending}
              >
                {editingItem ? '更新' : '创建'}
              </Button>
              <Button 
                onClick={() => {
                  setIsItemModalVisible(false);
                  itemForm.resetFields();
                  setEditingItem(null);
                  setParentId(null);
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