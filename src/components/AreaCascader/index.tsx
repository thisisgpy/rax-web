import React, { useState, useCallback, useRef } from 'react';
import { Cascader, message } from 'antd';
import type { CascaderProps } from 'antd';
import { areaApi } from '@/services/area';
import type { SysAreaDto } from '@/types/swagger-api';

// 扩展 Cascader 选项类型以支持异步加载
interface AreaOption {
  value: number;
  label: string;
  isLeaf?: boolean;
  loading?: boolean;
  children?: AreaOption[];
}

interface AreaCascaderProps extends Omit<CascaderProps<AreaOption>, 'options' | 'loadData'> {
  value?: string[];
  onChange?: (value: string[], selectedOptions?: AreaOption[]) => void;
  placeholder?: string;
  level?: number; // 1: 仅省份, 2: 省市, 3: 省市区 (默认)
}

export const AreaCascader: React.FC<AreaCascaderProps> = ({
  value,
  onChange,
  placeholder = '请选择省/市/区',
  level = 3,
  ...restProps
}) => {
  const [options, setOptions] = useState<AreaOption[]>([]);
  const [loading, setLoading] = useState(false);
  const optionsRef = useRef<AreaOption[]>([]);

  // 将名称数组转换为ID数组用于内部使用
  const convertNamesToIds = useCallback((names: string[]): number[] => {
    const findIdByName = (name: string, optionList: AreaOption[]): number | null => {
      for (const option of optionList) {
        if (option.label === name) {
          return option.value;
        }
        if (option.children) {
          const childId = findIdByName(name, option.children);
          if (childId !== null) return childId;
        }
      }
      return null;
    };

    return names.map(name => findIdByName(name, optionsRef.current) || 0).filter(id => id > 0);
  }, []);

  const internalValue = value ? convertNamesToIds(value) : undefined;

  // 转换 SysAreaDto 到 AreaOption
  const convertToOptions = useCallback((areas: SysAreaDto[], currentLevel: number): AreaOption[] => {
    return areas.map(area => ({
      value: area.id,
      label: area.name,
      isLeaf: currentLevel >= level, // 在最大级别时设为叶子节点，否则支持异步加载
      children: undefined,
    }));
  }, [level]);

  // 异步加载数据函数
  const loadData = useCallback(async (selectedOptions: AreaOption[]) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    const currentLevel = selectedOptions.length;

    // 如果已经达到最大级别，不再加载
    if (currentLevel >= level) {
      return;
    }

    // 如果已经有子数据或正在加载中，不再重复请求
    if (targetOption.children || targetOption.loading) {
      return;
    }

    // 设置当前选项为加载状态
    targetOption.loading = true;
    const newOptions = [...optionsRef.current];
    setOptions(newOptions);
    optionsRef.current = newOptions;

    try {
      // 使用当前选中项的 ID 作为 parentId 查询下级区域
      const response = await areaApi.listSubArea(targetOption.value);

      if (response.success && response.data) {
        const childrenOptions = convertToOptions(response.data, currentLevel + 1);

        // 更新目标选项的子选项
        targetOption.children = childrenOptions;
        targetOption.loading = false;

        // 更新选项列表
        const updatedOptions = [...optionsRef.current];
        setOptions(updatedOptions);
        optionsRef.current = updatedOptions;
      } else {
        message.error('加载区域数据失败');
        targetOption.loading = false;
        const updatedOptions = [...optionsRef.current];
        setOptions(updatedOptions);
        optionsRef.current = updatedOptions;
      }
    } catch (error) {
      console.error('加载区域数据出错:', error);
      message.error('加载区域数据出错');
      targetOption.loading = false;
      const updatedOptions = [...optionsRef.current];
      setOptions(updatedOptions);
      optionsRef.current = updatedOptions;
    }
  }, [convertToOptions, level]);

  // 初始化加载省份数据
  const initializeProvinces = useCallback(async () => {
    if (options.length > 0) return; // 避免重复加载

    setLoading(true);
    try {
      // parentId = 0 查询所有省份
      const response = await areaApi.listSubArea(0);

      if (response.success && response.data) {
        const provinceOptions = convertToOptions(response.data, 1);
        setOptions(provinceOptions);
        optionsRef.current = provinceOptions;
      } else {
        message.error('加载省份数据失败');
      }
    } catch (error) {
      console.error('加载省份数据出错:', error);
      message.error('加载省份数据出错');
    } finally {
      setLoading(false);
    }
  }, [options.length, convertToOptions]);

  // 处理下拉框打开事件
  const handleDropdownVisibleChange = useCallback((visible: boolean) => {
    if (visible) {
      initializeProvinces();
    }
  }, [initializeProvinces]);

  // 处理值变化 - 将ID转换为名称
  const handleChange = useCallback((val: number[], selectedOptions?: AreaOption[]) => {
    // 将选中的选项转换为名称数组
    const names = selectedOptions?.map(option => option.label) || [];
    onChange?.(names, selectedOptions);
  }, [onChange]);

  // 获取级别标签
  const getLevelLabels = useCallback(() => {
    switch (level) {
      case 1:
        return ['省份'];
      case 2:
        return ['省份', '城市'];
      case 3:
      default:
        return ['省份', '城市', '区县'];
    }
  }, [level]);

  return (
    <Cascader<AreaOption>
      {...restProps}
      options={options}
      loadData={loadData}
      value={internalValue}
      onChange={handleChange}
      placeholder={placeholder}
      loading={loading}
      onOpenChange={handleDropdownVisibleChange}
      changeOnSelect={true} // 支持部分选择，不强制选择到最后一级
      showSearch={{
        filter: (inputValue, path) => {
          return path.some(option =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
          );
        },
      }}
      fieldNames={{
        label: 'label',
        value: 'value',
        children: 'children',
      }}
      displayRender={(labels) => labels.join(' / ')}
      style={{ width: '100%', ...restProps.style }}
      styles={{
        popup: {
          root: { maxHeight: 400, overflow: 'auto' }
        }
      }}
      getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
      notFoundContent={loading ? '加载中...' : '暂无数据'}
      expandTrigger="click"
    />
  );
};

// 导出类型以供外部使用
export type { AreaOption, AreaCascaderProps };