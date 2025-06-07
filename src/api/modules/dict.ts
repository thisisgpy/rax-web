import { get, post } from '../httpClient'

/** 数据字典管理API模块 */
export const dictApi = {
  // ===== 数据字典相关 =====
  
  /**
   * 创建数据字典
   * @param data - 创建字典数据
   */
  createDict(data: CreateDictDto): Promise<ApiResponse<SysDict>> {
    return post('/api/v1/dict/create', data)
  },

  /**
   * 更新数据字典
   * @param data - 更新字典数据
   */
  updateDict(data: UpdateDictDto): Promise<ApiResponse<SysDict>> {
    return post('/api/v1/dict/edit', data)
  },

  /**
   * 删除数据字典
   * @param id - 字典ID
   */
  removeDict(id: number): Promise<ApiResponse<boolean>> {
    return get(`/api/v1/dict/remove/${id}`)
  },

  /**
   * 获取数据字典详情
   * @param id - 字典ID
   */
  getDictById(id: number): Promise<ApiResponse<SysDict>> {
    return get(`/api/v1/dict/get/${id}`)
  },

  /**
   * 分页查询数据字典
   * @param params - 查询参数
   */
  getDictList(params: QueryDictDto): Promise<ApiResponse<PageResult<SysDict>>> {
    return post('/api/v1/dict/list', params)
  },

  // ===== 字典项相关 =====
  
  /**
   * 创建字典项
   * @param data - 创建字典项数据
   */
  createDictItem(data: CreateDictItemDto): Promise<ApiResponse<SysDictItem>> {
    return post('/api/v1/dict/item/create', data)
  },

  /**
   * 更新字典项
   * @param data - 更新字典项数据
   */
  updateDictItem(data: UpdateDictItemDto): Promise<ApiResponse<SysDictItem>> {
    return post('/api/v1/dict/item/edit', data)
  },

  /**
   * 获取字典项详情
   * @param id - 字典项ID
   */
  getDictItemById(id: number): Promise<ApiResponse<SysDictItem>> {
    return get(`/api/v1/dict/item/get/${id}`)
  },

  /**
   * 删除字典项
   * @param id - 字典项ID
   */
  removeDictItem(id: number): Promise<ApiResponse<boolean>> {
    return get(`/api/v1/dict/item/remove/${id}`)
  },

  /**
   * 根据字典编码获取字典项树形结构
   * @param code - 字典编码
   * @param onlyEnabled - 是否只返回启用的项
   */
  getDictItemTreeByCode(
    code: string, 
    onlyEnabled: boolean = true
  ): Promise<ApiResponse<DictItemTreeDto>> {
    return get(`/api/v1/dict/item/tree/${code}/${onlyEnabled}`)
  }
} 