import React, { useState, useMemo, useCallback } from 'react';
import { TreeSelect, Spin } from 'antd';
import type { TreeSelectProps } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { dictApi } from '@/services/dict';
import type { SysDictItemDto } from '@/types/swagger-api';

interface DictSelectProps extends Omit<TreeSelectProps<string | string[]>, 'treeData'> {
  dictCode: string; // 字典编码，必填
  value?: string | string[];
  onChange?: (value: string | string[], label?: any, extra?: any) => void;
  showDisabled?: boolean; // 是否显示禁用项，默认不显示
  includeAncestors?: boolean; // 是否在选中时包含所有父级值，默认 false
}

// 树节点数据结构
interface TreeNode {
  title: string;
  value: string;
  key: string;
  disabled: boolean;
  children?: TreeNode[];
}

export const DictSelect: React.FC<DictSelectProps> = ({
  dictCode,
  value,
  onChange,
  multiple = false,
  placeholder = '请选择',
  showDisabled = false,
  includeAncestors = false,
  ...restProps
}) => {
  const [searchValue, setSearchValue] = useState('');

  // 使用 React Query 获取字典项树数据
  const {
    data: dictResponse,
    isLoading,
  } = useQuery({
    queryKey: ['dictTree', dictCode],
    queryFn: () => dictApi.getItemTreeByCode(dictCode),
    enabled: !!dictCode,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });

  // 构建 value -> parent value 的映射，用于查找祖先节点
  const parentMap = useMemo(() => {
    const map = new Map<string, string | null>();

    const buildMap = (items: SysDictItemDto[], parentValue: string | null) => {
      for (const item of items) {
        if (item.value) {
          map.set(item.value, parentValue);
        }
        if (item.children && item.children.length > 0) {
          buildMap(item.children, item.value || null);
        }
      }
    };

    if (dictResponse?.success && dictResponse.data) {
      buildMap(dictResponse.data, null);
    }

    return map;
  }, [dictResponse]);

  // 获取某个值的所有祖先值（从根到该节点）
  const getAncestorPath = useCallback((nodeValue: string): string[] => {
    const path: string[] = [];
    let current: string | null = nodeValue;

    while (current !== null) {
      path.unshift(current);
      current = parentMap.get(current) ?? null;
    }

    return path;
  }, [parentMap]);

  // 从路径数组中获取最后一个值（叶子节点值）
  const getLeafValue = useCallback((val: string | string[] | undefined): string | undefined => {
    if (!val) return undefined;
    if (Array.isArray(val)) {
      return val.length > 0 ? val[val.length - 1] : undefined;
    }
    return val;
  }, []);

  // 转换字典数据为 TreeSelect 需要的格式
  const convertToTreeData = (items: SysDictItemDto[]): TreeNode[] => {
    const result = items
      .map((item) => {
        const children = item.children && item.children.length > 0 ? convertToTreeData(item.children) : undefined;
        const hasEnabledChildren = children && children.length > 0;

        // 如果项目本身启用，或者有启用的子项目，或者设置了显示禁用项，则显示
        const shouldShow = showDisabled || item.isEnabled !== false || hasEnabledChildren;

        if (!shouldShow) {
          return null;
        }

        return {
          title: item.label || '',
          value: item.value || '',
          key: item.value || '', // 使用 value 作为 key，确保一致性
          disabled: item.isEnabled === false,
          children,
        };
      })
      .filter((item): item is TreeNode => item !== null);
    return result;
  };

  const treeData = dictResponse?.success ? convertToTreeData(dictResponse.data) : [];

  // 过滤树节点
  const filterTreeNode = (input: string, node: any): boolean => {
    return node.title.toLowerCase().includes(input.toLowerCase());
  };

  // 处理值变化
  const handleChange = useCallback((newValue: string | string[], label?: any, extra?: any) => {
    if (!onChange) return;

    if (includeAncestors && !multiple) {
      // 单选模式下，开启 includeAncestors 时，返回从根到选中节点的完整路径
      const leafValue = Array.isArray(newValue) ? newValue[newValue.length - 1] : newValue;
      if (leafValue) {
        const path = getAncestorPath(leafValue);
        onChange(path, label, extra);
      } else {
        // 清空时返回空数组
        onChange([], label, extra);
      }
    } else {
      // 其他情况保持原有行为
      onChange(newValue, label, extra);
    }
  }, [onChange, includeAncestors, multiple, getAncestorPath]);

  // 计算显示用的 value（TreeSelect 内部使用的是叶子节点值）
  const displayValue = useMemo(() => {
    if (includeAncestors && !multiple) {
      // 开启 includeAncestors 时，value 是路径数组，TreeSelect 需要叶子节点值
      return getLeafValue(value);
    }
    return value;
  }, [value, includeAncestors, multiple, getLeafValue]);

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
      value={displayValue}
      onChange={handleChange}
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
