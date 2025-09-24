import React, { useState } from 'react';
import { Cascader } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { assetApi } from '@/services/asset';
import type { SysFixedAssetCategoryDto } from '@/types/swagger-api';

export interface AssetCategorySelectProps {
  value?: { code: string; name: string }; // 当前选中的分类信息
  onChange?: (value?: { code: string; name: string }) => void; // 选择回调
  placeholder?: string;              // 占位符
  disabled?: boolean;                // 是否禁用
  allowClear?: boolean;              // 是否可清除
}

interface CascaderOption {
  value: string;
  label: string;
  isLeaf?: boolean;
  children?: CascaderOption[];
  categoryData?: SysFixedAssetCategoryDto;
}

export const AssetCategorySelect: React.FC<AssetCategorySelectProps> = ({
  value,
  onChange,
  placeholder = '请选择固定资产分类',
  disabled = false,
  allowClear = false,
}) => {
  const [options, setOptions] = useState<CascaderOption[]>([]);

  // 查询顶级分类
  const { data: topCategoriesData } = useQuery({
    queryKey: ['asset-categories', 0],
    queryFn: () => assetApi.getCategories(0),
  });

  // 处理顶级分类数据更新
  React.useEffect(() => {
    if (topCategoriesData?.success && topCategoriesData.data) {
      const topOptions: CascaderOption[] = topCategoriesData.data.map(category => ({
        value: category.code,
        label: category.name,
        isLeaf: false, // 假设所有顶级分类都有子分类，动态加载时再判断
        categoryData: category,
      }));
      setOptions(topOptions);
    }
  }, [topCategoriesData]);

  // 动态加载子分类
  const loadData = async (selectedOptions: CascaderOption[]) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    if (!targetOption.categoryData) return;

    try {
      const result = await assetApi.getCategories(targetOption.categoryData.id);
      if (result.success && result.data && result.data.length > 0) {
        targetOption.children = result.data.map(category => ({
          value: category.code,
          label: category.name,
          isLeaf: false, // 继续假设有子分类，实际使用时可以根据业务规则判断
          categoryData: category,
        }));
      } else {
        // 没有子分类，标记为叶子节点
        targetOption.isLeaf = true;
      }

      setOptions([...options]);
    } catch (error) {
      console.error('Failed to load asset categories:', error);
      targetOption.isLeaf = true;
      setOptions([...options]);
    }
  };

  // 处理选择变化
  const handleChange = (selectedValues: string[], selectedOptions: CascaderOption[]) => {

    if (!selectedValues || selectedValues.length === 0) {
      onChange?.(undefined);
      return;
    }

    // 获取最后一级选中的分类信息
    const lastOption = selectedOptions[selectedOptions.length - 1];
    if (lastOption && lastOption.categoryData) {
      const result = {
        code: lastOption.categoryData.code,
        name: lastOption.categoryData.name,
      };
      onChange?.(result);
    }
  };

  // 自定义显示渲染函数
  const displayRender = (labels: string[]) => {
    // 如果有当前值，显示格式化的字符串
    if (value) {
      return `${value.name}(${value.code})`;
    }
    return labels.join(' / ');
  };

  // 将当前值转换为Cascader可以识别的数组格式
  // 注意：这里需要递归查找完整路径，但为了简化，我们使用displayRender来控制显示
  const cascaderValue = value ? [value.code] : undefined;

  return (
    <Cascader
      options={options}
      loadData={loadData}
      onChange={handleChange}
      value={cascaderValue}
      placeholder={placeholder}
      disabled={disabled}
      allowClear={allowClear}
      displayRender={displayRender}
      showSearch={{
        filter: (inputValue, path) =>
          path.some(option =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
          ),
      }}
      style={{ width: '100%' }}
    />
  );
};