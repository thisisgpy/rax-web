import React, { useState } from 'react';
import {
  Button,
  Table,
  Space,
  Card,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Row,
  Col,
  App,
  Tooltip,
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
import { loanApi } from '@/services/loan';
import { dictApi } from '@/services/dict';
import type { LoanDto, QueryLoanDto } from '@/types/swagger-api';
import OrgSelect from '@/components/OrgSelect';
import DictSelect from '@/components/DictSelect';
import AmountDisplay from '@/components/AmountDisplay';

const { RangePicker } = DatePicker;

const Existing: React.FC = () => {
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

  // 获取数据字典 - 融资类型
  const { data: productTypeDict } = useQuery({
    queryKey: ['dict', 'fin.product'],
    queryFn: () => dictApi.getItemTreeByCode('fin.product'),
    staleTime: 5 * 60 * 1000
  });

  // 获取数据字典 - 利率模式
  const { data: rateModeDict } = useQuery({
    queryKey: ['dict', 'rate.mode'],
    queryFn: () => dictApi.getItemTreeByCode('rate.mode'),
    staleTime: 5 * 60 * 1000
  });

  // 获取数据字典 - 还款方式
  const { data: repayMethodDict } = useQuery({
    queryKey: ['dict', 'repay.method'],
    queryFn: () => dictApi.getItemTreeByCode('repay.method'),
    staleTime: 5 * 60 * 1000
  });

  // 获取数据字典 - 状态
  const { data: loanStatusDict } = useQuery({
    queryKey: ['dict', 'loan.status'],
    queryFn: () => dictApi.getItemTreeByCode('loan.status'),
    staleTime: 5 * 60 * 1000
  });

  // 查询存量融资列表
  const { data: loanData, isLoading, refetch } = useQuery({
    queryKey: ['loan', 'page', pagination.current, pagination.pageSize],
    queryFn: async () => {
      const values = form.getFieldsValue();
      const params: QueryLoanDto = {
        pageNo: pagination.current,
        pageSize: pagination.pageSize
      };

      // 处理基础字段
      if (values.loanCode) params.loanCode = values.loanCode;
      if (values.orgId) params.orgId = values.orgId;
      if (values.loanName) params.loanName = values.loanName;
      if (values.institutionName) params.institutionName = values.institutionName;
      if (values.rateMode) params.rateMode = values.rateMode;
      if (values.repayMethod) params.repayMethod = values.repayMethod;
      if (values.status) params.status = values.status;

      // 处理融资类型级联
      if (values.productType) {
        const [family, type] = values.productType;
        if (family) params.productFamily = family;
        if (type) params.productType = type;
      }

      // 处理到期日范围
      if (values.maturityDateRange) {
        params.maturityDateStart = values.maturityDateRange[0]?.format('YYYY-MM-DD');
        params.maturityDateEnd = values.maturityDateRange[1]?.format('YYYY-MM-DD');
      }

      // 处理金额范围（万元转分）
      if (values.contractAmountMin !== undefined && values.contractAmountMin !== null) {
        params.contractAmountMin = Math.round(values.contractAmountMin * 1000000);
      }
      if (values.contractAmountMax !== undefined && values.contractAmountMax !== null) {
        params.contractAmountMax = Math.round(values.contractAmountMax * 1000000);
      }

      const result = await loanApi.page(params);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || '查询失败');
    }
  });

  // 删除融资
  const deleteMutation = useMutation({
    mutationFn: (id: number) => loanApi.remove(id),
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

    const findLabel = (items: any[]): string => {
      for (const item of items) {
        if (item.value === value) return item.label;
        if (item.children?.length) {
          const found = findLabel(item.children);
          if (found !== value) return found;
        }
      }
      return value;
    };

    return findLabel(dict.data);
  };

  // 获取融资类型标签（productFamily + productType）
  const getProductTypeLabel = (record: LoanDto): string => {
    if (!productTypeDict?.data) return record.productType || '-';

    const findLabels = (items: any[], family: string, type: string): string => {
      for (const item of items) {
        if (item.value === family) {
          const familyLabel = item.label;
          if (item.children?.length) {
            const typeItem = item.children.find((c: any) => c.value === type);
            if (typeItem) {
              return `${familyLabel} - ${typeItem.label}`;
            }
          }
          return familyLabel;
        }
      }
      return type || '-';
    };

    return findLabels(productTypeDict.data, record.productFamily, record.productType);
  };

  // 获取状态标签颜色
  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      'ACTIVE': 'success',
      'PENDING': 'processing',
      'CLOSED': 'default',
      'OVERDUE': 'error'
    };
    return colorMap[status] || 'default';
  };

  // 表格列定义
  const columns: ColumnsType<LoanDto> = [
    {
      title: '融资编号',
      dataIndex: 'loanCode',
      key: 'loanCode',
      width: 150,
      fixed: 'left'
    },
    {
      title: '组织',
      dataIndex: 'orgNameAbbr',
      key: 'orgNameAbbr',
      width: 120,
      render: (text, record) => (
        <Tooltip title={record.orgName}>
          {text || '-'}
        </Tooltip>
      )
    },
    {
      title: '融资名称',
      dataIndex: 'loanName',
      key: 'loanName',
      width: 200,
      ellipsis: true
    },
    {
      title: '融资类型',
      key: 'productType',
      width: 180,
      render: (_, record) => getProductTypeLabel(record)
    },
    {
      title: '机构',
      dataIndex: 'institutionName',
      key: 'institutionName',
      width: 150,
      ellipsis: true
    },
    {
      title: '合同金额',
      dataIndex: 'contractAmount',
      key: 'contractAmount',
      width: 140,
      render: (value) => <AmountDisplay value={value} />
    },
    {
      title: '期限(月)',
      dataIndex: 'termMonths',
      key: 'termMonths',
      width: 80,
      render: (value) => value ?? '-'
    },
    {
      title: '到期日',
      dataIndex: 'maturityDate',
      key: 'maturityDate',
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
          {getDictLabel(loanStatusDict, value)}
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
            onClick: () => navigate(`/financing/existing/detail/${record.id}`)
          },
          {
            key: 'edit',
            label: '编辑',
            icon: <EditOutlined />,
            onClick: () => navigate(`/financing/existing/edit/${record.id}`)
          },
          {
            type: 'divider'
          },
          {
            key: 'delete',
            label: (
              <Popconfirm
                title="确认删除"
                description="确定要删除该融资记录吗？删除后不可恢复。"
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
            <Form.Item name="loanCode" label="融资编号" style={{ marginBottom: 16 }}>
              <Input placeholder="请输入融资编号" allowClear />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="orgId" label="组织" style={{ marginBottom: 16 }}>
              <OrgSelect placeholder="请选择组织" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="loanName" label="融资名称" style={{ marginBottom: 16 }}>
              <Input placeholder="请输入融资名称" allowClear />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="productType" label="融资类型" style={{ marginBottom: 16 }}>
              <DictSelect
                dictCode="fin.product"
                placeholder="请选择融资类型"
                allowClear
                includeAncestors
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Form.Item name="institutionName" label="机构名称" style={{ marginBottom: 16 }}>
              <Input placeholder="请输入机构名称" allowClear />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="rateMode" label="利率模式" style={{ marginBottom: 16 }}>
              <DictSelect
                dictCode="rate.mode"
                placeholder="请选择利率模式"
                allowClear
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="repayMethod" label="还款方式" style={{ marginBottom: 16 }}>
              <DictSelect
                dictCode="repay.method"
                placeholder="请选择还款方式"
                allowClear
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="status" label="状态" style={{ marginBottom: 16 }}>
              <DictSelect
                dictCode="loan.status"
                placeholder="请选择状态"
                allowClear
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Form.Item name="maturityDateRange" label="合同到期日" style={{ marginBottom: 16 }}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['开始日期', '结束日期']}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="合同金额（万元）" style={{ marginBottom: 16 }}>
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item name="contractAmountMin" noStyle>
                  <InputNumber
                    placeholder="下限"
                    min={0}
                    precision={6}
                    style={{ width: '45%' }}
                  />
                </Form.Item>
                <Input
                  style={{ width: '10%', borderLeft: 0, borderRight: 0, pointerEvents: 'none', backgroundColor: '#fff' }}
                  placeholder="~"
                  disabled
                />
                <Form.Item name="contractAmountMax" noStyle>
                  <InputNumber
                    placeholder="上限"
                    min={0}
                    precision={6}
                    style={{ width: '45%' }}
                  />
                </Form.Item>
              </Space.Compact>
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
          onClick={() => navigate('/financing/existing/create')}
        >
          登记融资
        </Button>
      </div>

      {/* 数据表格 */}
      <Table
        loading={isLoading}
        columns={columns}
        dataSource={loanData?.rows}
        rowKey="id"
        pagination={{
          ...pagination,
          total: loanData?.totalCount || 0,
          onChange: (page, pageSize) => {
            setPagination({
              ...pagination,
              current: page,
              pageSize: pageSize || pagination.pageSize
            });
          }
        }}
        scroll={{ x: 1500 }}
      />
    </Card>
  );
};

export default Existing;
