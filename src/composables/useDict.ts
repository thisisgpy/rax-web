import { ref, reactive } from 'vue'
import { dictApi } from '@/api/modules/dict'
import { useErrorHandler } from './useErrorHandler'

/**
 * 数据字典composable
 * 提供获取和管理字典数据的功能
 */
export function useDict() {
  const { handleAsyncOperation } = useErrorHandler()
  
  // 字典缓存
  const dictCache = reactive<Record<string, DictItemTreeDto[]>>({})
  
  // 加载状态
  const loading = ref<Record<string, boolean>>({})
  
  /**
   * 获取字典项列表
   * @param dictCode 字典编码
   * @param onlyEnabled 是否只返回启用的项
   * @param useCache 是否使用缓存
   */
  const getDictItems = async (
    dictCode: string, 
    onlyEnabled = true, 
    useCache = true
  ): Promise<DictItemTreeDto[]> => {
    // 检查缓存
    const cacheKey = `${dictCode}_${onlyEnabled}`
    if (useCache && dictCache[cacheKey]) {
      return dictCache[cacheKey]
    }
    
    // 设置加载状态
    loading.value[dictCode] = true
    
    try {
      const result = await handleAsyncOperation(
        () => dictApi.getDictItemTreeByCode(dictCode, onlyEnabled),
        '获取字典数据'
      )
      
      if (result.success) {
        const items = result.data.data || []
        // 缓存结果
        dictCache[cacheKey] = items
        return items
      }
      
      return []
    } finally {
      loading.value[dictCode] = false
    }
  }
  
  /**
   * 获取字典项的显示标签
   * @param dictCode 字典编码
   * @param value 字典项值
   * @param defaultLabel 默认标签
   */
  const getDictLabel = async (
    dictCode: string, 
    value: string, 
    defaultLabel = value
  ): Promise<string> => {
    const items = await getDictItems(dictCode)
    const item = findDictItem(items, value)
    return item?.label || defaultLabel
  }
  
  /**
   * 获取扁平化的字典项列表（用于下拉框等）
   * @param dictCode 字典编码
   * @param onlyEnabled 是否只返回启用的项
   */
  const getFlatDictItems = async (
    dictCode: string, 
    onlyEnabled = true
  ): Promise<{ label: string; value: string; disabled?: boolean }[]> => {
    const items = await getDictItems(dictCode, false)
    return flattenDictItems(items, onlyEnabled)
  }
  
  /**
   * 递归查找字典项
   */
  const findDictItem = (items: DictItemTreeDto[], value: string): DictItemTreeDto | null => {
    for (const item of items) {
      if (item.value === value) {
        return item
      }
      if (item.children) {
        const found = findDictItem(item.children, value)
        if (found) return found
      }
    }
    return null
  }
  
  /**
   * 扁平化字典项树
   */
  const flattenDictItems = (
    items: DictItemTreeDto[], 
    onlyEnabled: boolean,
    level = 0
  ): { label: string; value: string; disabled?: boolean }[] => {
    const result: { label: string; value: string; disabled?: boolean }[] = []
    
    for (const item of items) {
      // 根据是否只要启用的项来过滤
      if (!onlyEnabled || item.isEnabled) {
        result.push({
          label: level > 0 ? `${'　'.repeat(level)}${item.label}` : item.label,
          value: item.value,
          disabled: !item.isEnabled
        })
      }
      
      // 递归处理子项
      if (item.children && item.children.length > 0) {
        result.push(...flattenDictItems(item.children, onlyEnabled, level + 1))
      }
    }
    
    return result
  }
  
  /**
   * 清除字典缓存
   * @param dictCode 字典编码，不传则清除所有缓存
   */
  const clearCache = (dictCode?: string) => {
    if (dictCode) {
      // 清除指定字典的缓存
      Object.keys(dictCache).forEach(key => {
        if (key.startsWith(dictCode)) {
          delete dictCache[key]
        }
      })
    } else {
      // 清除所有缓存
      Object.keys(dictCache).forEach(key => {
        delete dictCache[key]
      })
    }
  }
  
  /**
   * 预加载字典数据
   * @param dictCodes 字典编码数组
   */
  const preloadDicts = async (dictCodes: string[]) => {
    const promises = dictCodes.map(code => getDictItems(code))
    await Promise.all(promises)
  }
  
  return {
    // 状态
    loading,
    dictCache,
    
    // 方法
    getDictItems,
    getDictLabel,
    getFlatDictItems,
    findDictItem,
    clearCache,
    preloadDicts
  }
} 