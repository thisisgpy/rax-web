import React, { useEffect } from 'react';
import { TreeSelect, Spin, App } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { businessApiService } from '@/services/api';
import type { SysOrgDto } from '@/types/swagger-api';

interface OrgSelectProps {
  value?: number | null;
  onChange?: (value: number | null | undefined) => void;
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  excludeId?: number; // 排除的组织ID（编辑时排除自己）
  style?: React.CSSProperties;
  size?: 'small' | 'middle' | 'large';
  multiple?: boolean; // 支持多选
}

interface OrgTreeNode {
  title: string;
  value: number | null;
  key: string;
  children?: OrgTreeNode[];
}

export const OrgSelect: React.FC<OrgSelectProps> = ({
  value,
  onChange,
  placeholder = '请选择组织',
  allowClear = true,
  disabled = false,
  excludeId,
  style,
  size = 'middle',
  multiple = false,
}) => {
  const { message } = App.useApp();
  
  // 获取组织树数据
  const { data: orgResponse, isLoading, error } = useQuery({
    queryKey: ['orgTree'],
    queryFn: () => businessApiService.getOrganizations(),
    staleTime: 5 * 60 * 1000,
  });

  // 错误提示已在 ApiService 中统一处理

  // 处理网络错误
  useEffect(() => {
    if (error) {
      message.error('获取组织架构数据失败，请检查网络连接');
    }
  }, [error, message]);

  // 转换组织数据为TreeSelect需要的格式
  const convertToTreeSelectData = (organizations: SysOrgDto[]): OrgTreeNode[] => {
    if (!Array.isArray(organizations)) {
      return [];
    }

    return organizations
      .filter(org => org && typeof org.id !== 'undefined' && org.id !== null && org.id !== excludeId) // 过滤无效数据
      .map(org => {
        const orgName = org.name || '未命名组织';
        const orgNameAbbr = org.nameAbbr || '';
        const orgCode = org.code || '';
        
        // 构建显示标题：组织名称 [简称] (编码)
        let title = orgName;
        if (orgNameAbbr) {
          title += ` [${orgNameAbbr}]`;
        }
        if (orgCode) {
          title += ` (${orgCode})`;
        }
        
        return {
          title,
          value: org.id,
          key: org.id, // 确保 key 是唯一的字符串
          children: org.children && org.children.length > 0 
            ? convertToTreeSelectData(org.children) 
            : undefined,
        };
      });
  };

  // 生成树形数据
  const getTreeData = (): OrgTreeNode[] => {
    if (!orgResponse?.success || !orgResponse.data) {
      return [];
    }
    
    const rawData = Array.isArray(orgResponse.data) ? orgResponse.data : [orgResponse.data];
    const treeData = convertToTreeSelectData(rawData);
    
    return treeData;
  };

  const treeData = getTreeData();

  return (
    <TreeSelect
      style={{ width: '100%', ...style }}
      size={size}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      allowClear={allowClear}
      disabled={disabled}
      loading={isLoading}
      showSearch
      treeDefaultExpandAll
      multiple={multiple}
      treeData={treeData}
      filterTreeNode={(search, node) => {
        return (node.title as string)?.toLowerCase().includes(search.toLowerCase()) || false;
      }}
      treeNodeFilterProp="title"
      notFoundContent={isLoading ? <Spin size="small" /> : '暂无数据'}
      styles={{
        popup: {
          root: { maxHeight: 400, overflow: 'auto' }
        }
      }}
    />
  );
};