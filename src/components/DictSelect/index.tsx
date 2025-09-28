import React, { useEffect, useState } from 'react';
import { TreeSelect, Spin, message } from 'antd';
import type { TreeSelectProps } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { dictApi } from '@/services/dict';
import type { SysDictItemDto } from '@/types/swagger-api';

interface DictSelectProps extends Omit<TreeSelectProps<string | string[]>, 'treeData'> {
  dictCode: string; // 字典编码，必填
  value?: string | string[];
  onChange?: (value: string | string[], label?: any, extra?: any) => void;
  showDisabled?: boolean; // 是否显示禁用项，默认不显示
}

export const DictSelect: React.FC<DictSelectProps> = ({
  dictCode,
  value,
  onChange,
  multiple = false,
  placeholder = '请选择',
  showDisabled = false,
  ...restProps
}) => {
  const [searchValue, setSearchValue] = useState('');

  // 使用 React Query 获取字典项树数据
  const {
    data: dictResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['dictTree', dictCode],
    queryFn: () => dictApi.getItemTreeByCode(dictCode),
    enabled: !!dictCode,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });

  useEffect(() => {
    if (error) {
      message.error('获取字典数据失败');
    }
  }, [error]);

  // 转换字典数据为 TreeSelect 需要的格式
  const convertToTreeData = (items: SysDictItemDto[]): any[] => {
    const result = items
      .filter((item) => {
        const shouldShow = showDisabled || item.isEnabled !== false;
        return shouldShow;
      })
      .map((item) => ({
        title: item.label,
        value: item.value,
        key: item.value, // 使用 value 作为 key，确保一致性
        disabled: item.isEnabled === false,
        children: item.children && item.children.length > 0 ? convertToTreeData(item.children) : undefined,
      }));
    return result;
  };

  const treeData = dictResponse?.success ? convertToTreeData(dictResponse.data) : [];

  // 过滤树节点
  const filterTreeNode = (input: string, node: any): boolean => {
    return node.title.toLowerCase().includes(input.toLowerCase());
  };

  // 如果没有提供 dictCode，显示错误提示
  if (!dictCode) {
    return (
      <TreeSelect
        {...restProps}
        placeholder="请配置字典编码"
        disabled
        style={{ width: '100%', ...restProps.style }}
      />
    );
  }

  return (
    <TreeSelect
      {...restProps}
      value={value}
      onChange={onChange}
      treeData={treeData}
      placeholder={placeholder}
      multiple={multiple}
      showSearch
      allowClear
      treeDefaultExpandAll
      filterTreeNode={filterTreeNode}
      searchValue={searchValue}
      onSearch={setSearchValue}
      notFoundContent={isLoading ? <Spin size="small" /> : '暂无数据'}
      style={{ width: '100%', ...restProps.style }}
      styles={{
        popup: {
          root: { maxHeight: 400, overflow: 'auto' }
        }
      }}
      treeNodeFilterProp="title"
    />
  );
};

export default DictSelect;