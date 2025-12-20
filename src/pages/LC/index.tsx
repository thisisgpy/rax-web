import React, { useState } from 'react';
import {
  Button,
  Table,
  Space,
  Card,
  Form,
  Input,
  DatePicker,
  Row,
  Col,
  App,
  Tag,
  Dropdown,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  SettingOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { lcApi } from '@/services/lc';
import { dictApi } from '@/services/dict';
import type { LoanLcDto, QueryLoanLcDto } from '@/types/swagger-api';
import InstitutionSelect from '@/components/InstitutionSelect';
import DictSelect from '@/components/DictSelect';
import AmountDisplay from '@/components/AmountDisplay';

const { RangePicker } = DatePicker;

const LC: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showQuickJumper: true,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50'],
    showTotal: (total: number, range: [number, number]) =>
      `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
  });

  // 获取数据字典 - 信用证类型
  const { data: lcTypeDict } = useQuery({
    queryKey: ['dict', 'lc.type'],
    queryFn: () => dictApi.getItemTreeByCode('lc.type'),
    staleTime: 5 * 60 * 1000
  });

  // 获取数据字典 - 信用证状态
  const { data: lcStatusDict } = useQuery({
    queryKey: ['dict', 'lc.status'],
    queryFn: () => dictApi.getItemTreeByCode('lc.status'),
    staleTime: 5 * 60 * 1000
  });

  // 查询信用证列表
  const { data: lcData, isLoading, refetch } = useQuery({
    queryKey: ['lc', 'page', pagination.current, pagination.pageSize],
    queryFn: async () => {
      const values = form.getFieldsValue();
      const params: QueryLoanLcDto = {
        pageNo: pagination.current,
        pageSize: pagination.pageSize
      };

      if (values.lcNo) params.lcNo = values.lcNo;
      if (values.lcType) params.lcType = values.lcType;
      if (values.issuingBankId) params.issuingBankId = values.issuingBankId;
      if (values.status) params.status = values.status;

      // 处理开证日范围
      if (values.issueDateRange) {
        params.issueDateStart = values.issueDateRange[0]?.format('YYYY-MM-DD');
        params.issueDateEnd = values.issueDateRange[1]?.format('YYYY-MM-DD');
      }

      // 处理到期日范围
      if (values.expiryDateRange) {
        params.expiryDateStart = values.expiryDateRange[0]?.format('YYYY-MM-DD');
        params.expiryDateEnd = values.expiryDateRange[1]?.format('YYYY-MM-DD');
      }

      const result = await lcApi.page(params);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || '查询失败');
    }
  });

  // 删除信用证
  const deleteMutation = useMutation({
    mutationFn: (id: number) => lcApi.remove(id),
    onSuccess: () => {
      message.success('删除成功');
      refetch();
    },
    onError: (error: any) => {
      message.error(error.message || '删除失败');
    }
  });

  // 处理搜索
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    setTimeout(() => refetch(), 0);
  };

  // 处理重置
  const handleReset = () => {
    form.resetFields();
    setPagination({ ...pagination, current: 1 });
    setTimeout(() => refetch(), 0);
  };

  // 获取字典项标签
  const getDictLabel = (dict: any, value: string): string => {
    if (!dict?.data || !value) return value || '-';
    const item = dict.data.find((d: any) => d.value === value);
    return item?.label || value;
  };

  // 获取状态标签颜色
  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      'ACTIVE': 'success',
      'PENDING': 'processing',
      'EXPIRED': 'default',
      'CANCELLED': 'error'
    };
    return colorMap[status] || 'default';
  };

  // 表格列定义
  const columns: ColumnsType<LoanLcDto> = [
    {
      title: '信用证编号',
      dataIndex: 'lcNo',
      key: 'lcNo',
      width: 130,
      fixed: 'left'
    },
    {
      title: '信用证类型',
      dataIndex: 'lcType',
      key: 'lcType',
      width: 120,
      render: (value) => getDictLabel(lcTypeDict, value)
    },
    {
      title: '开证行',
      dataIndex: 'issuingBank',
      key: 'issuingBank',
      width: 150,
      ellipsis: true
    },
    {
      title: '信用证金额',
      dataIndex: 'lcAmount',
      key: 'lcAmount',
      width: 140,
      render: (value) => <AmountDisplay value={value} />
    },
    {
      title: '开证日期',
      dataIndex: 'issueDate',
      key: 'issueDate',
      width: 110,
      render: (value) => value ? dayjs(value).format('YYYY-MM-DD') : '-'
    },
    {
      title: '到期日',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 110,
      render: (value) => value ? dayjs(value).format('YYYY-MM-DD') : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (value) => (
        <Tag color={getStatusColor(value)}>
          {getDictLabel(lcStatusDict, value)}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 80,
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'view',
            label: '详情',
            icon: <EyeOutlined />,
            onClick: () => navigate(`/bill/lc/detail/${record.id}`)
          },
          {
            key: 'edit',
            label: '编辑',
            icon: <EditOutlined />,
            onClick: () => navigate(`/bill/lc/edit/${record.id}`)
          },
          {
            type: 'divider'
          },
          {
            key: 'delete',
            label: (
              <Popconfirm
                title="确认删除"
                description="确定要删除该信用证记录吗？删除后不可恢复。"
                onConfirm={() => deleteMutation.mutate(record.id)}
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
            menu={{ items: menuItems }}
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
      }
    }
  ];

  return (
    <Card>
      {/* 搜索表单 */}
      <Form
        form={form}
        layout="vertical"
        style={{ marginBottom: 16 }}
        onFinish={handleSearch}
        preserve={false}
      >
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Form.Item name="lcNo" label="信用证编号" style={{ marginBottom: 16 }}>
              <Input placeholder="请输入信用证编号" allowClear />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="lcType" label="信用证类型" style={{ marginBottom: 16 }}>
              <DictSelect
                dictCode="lc.type"
                placeholder="请选择信用证类型"
                allowClear
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="issuingBankId" label="开证行" style={{ marginBottom: 16 }}>
              <InstitutionSelect placeholder="请选择开证行" allowClear style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="status" label="状态" style={{ marginBottom: 16 }}>
              <DictSelect
                dictCode="lc.status"
                placeholder="请选择状态"
                allowClear
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="issueDateRange" label="开证日期" style={{ marginBottom: 16 }}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['开始日期', '结束日期']}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="expiryDateRange" label="到期日" style={{ marginBottom: 16 }}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['开始日期', '结束日期']}
              />
            </Form.Item>
          </Col>
          <Col span={6} style={{ textAlign: 'right', display: 'flex', alignItems: 'end', justifyContent: 'flex-end', paddingBottom: 16 }}>
            <Space>
              <Button onClick={handleReset}>重置</Button>
              <Button type="primary" onClick={handleSearch}>查询</Button>
            </Space>
          </Col>
        </Row>
      </Form>

      {/* 操作按钮 */}
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/bill/lc/create')}
        >
          新增信用证
        </Button>
      </div>

      {/* 数据表格 */}
      <Table
        loading={isLoading}
        columns={columns}
        dataSource={lcData?.rows}
        rowKey="id"
        pagination={{
          ...pagination,
          total: lcData?.totalCount || 0,
          onChange: (page, pageSize) => {
            setPagination({
              ...pagination,
              current: page,
              pageSize: pageSize || pagination.pageSize
            });
          }
        }}
        scroll={{ x: 1600 }}
      />
    </Card>
  );
};

export default LC;
