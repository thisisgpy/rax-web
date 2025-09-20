import React, { useState } from 'react';
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Tag,
  Space,
} from 'antd';
import { BankOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';
import { institutionApi } from '@/services/institution';
import { DictSelect } from '@/components/DictSelect';
import { AreaCascader } from '@/components/AreaCascader';
import { dictApi } from '@/services/dict';
import type {
  FinInstitutionDto,
  QueryInstitutionDto,
  PageResult
} from '@/types/swagger-api';

export interface InstitutionSelectProps {
  value?: number;                    // 当前选中的金融机构ID
  onChange?: (value?: number, institution?: FinInstitutionDto) => void; // 选择回调
  placeholder?: string;              // 占位符
  disabled?: boolean;                // 是否禁用
  allowClear?: boolean;              // 是否可清除
}

export const InstitutionSelect: React.FC<InstitutionSelectProps> = ({
  value,
  onChange,
  placeholder = '请选择金融机构',
  disabled = false,
  allowClear = false,
}) => {
  const [searchForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<FinInstitutionDto | null>(null);
  const [searchParams, setSearchParams] = useState<QueryInstitutionDto>({
    pageNo: 1,
    pageSize: 5,
  });

  // 查询金融机构列表
  const { data: institutionListData, isLoading } = useQuery({
    queryKey: ['institutions-select', searchParams],
    queryFn: () => institutionApi.page(searchParams),
    enabled: isModalVisible, // 只有在模态框打开时才查询
  });

  // 查询机构类型字典
  const { data: institutionTypeDict } = useQuery({
    queryKey: ['institutionTypeDict'],
    queryFn: () => dictApi.getItemTreeByCode('institution.type'),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });

  // 根据ID查询已选择的金融机构信息
  const { data: currentInstitutionData } = useQuery({
    queryKey: ['institution-detail', value],
    queryFn: () => institutionApi.get(value!),
    enabled: !!value && !selectedInstitution,
  });

  // 更新当前选中的机构信息
  React.useEffect(() => {
    if (currentInstitutionData?.success && currentInstitutionData.data) {
      setSelectedInstitution(currentInstitutionData.data);
    }
  }, [currentInstitutionData]);

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

  // 选择金融机构
  const handleSelect = (institution: FinInstitutionDto) => {
    setSelectedInstitution(institution);
    setIsModalVisible(false);
    searchForm.resetFields();
    setSearchParams({ pageNo: 1, pageSize: 5 }); // 重置搜索参数
    onChange?.(institution.id, institution);
  };

  // 清除选择
  const handleClear = () => {
    setSelectedInstitution(null);
    onChange?.(undefined, undefined);
  };

  // 打开选择模态框
  const handleOpenModal = () => {
    if (disabled) return;
    setIsModalVisible(true);
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
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleSelect(record)}
        >
          选择
        </Button>
      ),
    },
  ];

  const institutionListResult = institutionListData?.data as PageResult<FinInstitutionDto> | undefined;

  // 显示文本
  const displayText = selectedInstitution
    ? `${selectedInstitution.name}${selectedInstitution.branchName ? ` - ${selectedInstitution.branchName}` : ''}`
    : placeholder;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Input
          value={selectedInstitution ? displayText : ''}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          onClick={handleOpenModal}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
          suffix={<BankOutlined style={{ color: '#bfbfbf' }} />}
        />
        {allowClear && selectedInstitution && !disabled && (
          <Button size="small" onClick={handleClear}>
            清除
          </Button>
        )}
      </div>

      {/* 金融机构选择模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BankOutlined style={{ color: '#1890ff' }} />
            <span>选择金融机构</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          searchForm.resetFields();
          setSearchParams({ pageNo: 1, pageSize: 5 });
        }}
        footer={null}
        width={1000}
        destroyOnClose
      >
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
            pageSizeOptions: ['5', '10', '20'],
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
      </Modal>
    </>
  );
};