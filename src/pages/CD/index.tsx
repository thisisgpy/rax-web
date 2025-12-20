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
import { cdApi } from '@/services/cd';
import type { LoanCdDto, QueryLoanCdDto } from '@/types/swagger-api';
import InstitutionSelect from '@/components/InstitutionSelect';
import DictSelect from '@/components/DictSelect';
import AmountDisplay from '@/components/AmountDisplay';

const { RangePicker } = DatePicker;

const CD: React.FC = () => {
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

  // 查询存单列表
  const { data: cdData, isLoading, refetch } = useQuery({
    queryKey: ['cd', 'page', pagination.current, pagination.pageSize],
    queryFn: async () => {
      const values = form.getFieldsValue();
      const params: QueryLoanCdDto = {
        pageNo: pagination.current,
        pageSize: pagination.pageSize
      };

      if (values.cdNo) params.cdNo = values.cdNo;
      if (values.bankId) params.bankId = values.bankId;

      // 处理起息日范围
      if (values.issueDateRange) {
        params.issueDateStart = values.issueDateRange[0]?.format('YYYY-MM-DD');
        params.issueDateEnd = values.issueDateRange[1]?.format('YYYY-MM-DD');
      }

      // 处理到期日范围
      if (values.maturityDateRange) {
        params.maturityDateStart = values.maturityDateRange[0]?.format('YYYY-MM-DD');
        params.maturityDateEnd = values.maturityDateRange[1]?.format('YYYY-MM-DD');
      }

      const result = await cdApi.page(params);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || '查询失败');
    }
  });

  // 删除存单
  const deleteMutation = useMutation({
    mutationFn: (id: number) => cdApi.remove(id),
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

  // 表格列定义
  const columns: ColumnsType<LoanCdDto> = [
    {
      title: '存单编号',
      dataIndex: 'cdNo',
      key: 'cdNo',
      width: 150,
      fixed: 'left'
    },
    {
      title: '开立银行',
      dataIndex: 'bankName',
      key: 'bankName',
      width: 150,
      ellipsis: true
    },
    {
      title: '本金',
      dataIndex: 'principalAmount',
      key: 'principalAmount',
      width: 140,
      render: (value) => <AmountDisplay value={value} />
    },
    {
      title: '利率(%)',
      dataIndex: 'interestRate',
      key: 'interestRate',
      width: 100,
      render: (value) => value != null ? `${value}%` : '-'
    },
    {
      title: '期限(月)',
      dataIndex: 'termMonths',
      key: 'termMonths',
      width: 80,
      render: (value) => value ?? '-'
    },
    {
      title: '起息日',
      dataIndex: 'issueDate',
      key: 'issueDate',
      width: 110,
      render: (value) => value ? dayjs(value).format('YYYY-MM-DD') : '-'
    },
    {
      title: '到期日',
      dataIndex: 'maturityDate',
      key: 'maturityDate',
      width: 110,
      render: (value) => value ? dayjs(value).format('YYYY-MM-DD') : '-'
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
            onClick: () => navigate(`/bill/cd/detail/${record.id}`)
          },
          {
            key: 'edit',
            label: '编辑',
            icon: <EditOutlined />,
            onClick: () => navigate(`/bill/cd/edit/${record.id}`)
          },
          {
            type: 'divider'
          },
          {
            key: 'delete',
            label: (
              <Popconfirm
                title="确认删除"
                description="确定要删除该存单记录吗？删除后不可恢复。"
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
            <Form.Item name="cdNo" label="存单编号" style={{ marginBottom: 16 }}>
              <Input placeholder="请输入存单编号" allowClear />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="bankId" label="开立银行" style={{ marginBottom: 16 }}>
              <InstitutionSelect placeholder="请选择开立银行" allowClear style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="issueDateRange" label="起息日" style={{ marginBottom: 16 }}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['开始日期', '结束日期']}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="maturityDateRange" label="到期日" style={{ marginBottom: 16 }}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['开始日期', '结束日期']}
              />
            </Form.Item>
          </Col>
          <Col span={12} style={{ textAlign: 'right', display: 'flex', alignItems: 'end', justifyContent: 'flex-end', paddingBottom: 16 }}>
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
          onClick={() => navigate('/bill/cd/create')}
        >
          新增存单
        </Button>
      </div>

      {/* 数据表格 */}
      <Table
        loading={isLoading}
        columns={columns}
        dataSource={cdData?.rows}
        rowKey="id"
        pagination={{
          ...pagination,
          total: cdData?.totalCount || 0,
          onChange: (page, pageSize) => {
            setPagination({
              ...pagination,
              current: page,
              pageSize: pageSize || pagination.pageSize
            });
          }
        }}
        scroll={{ x: 1400 }}
      />
    </Card>
  );
};

export default CD;
