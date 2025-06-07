import { ref, computed } from 'vue'

/** 全局货币设置类型 */
export interface GlobalCurrencySettings {
  currencyUnit: string
  decimalPlaces: number
}

/** 货币单位配置 */
export const CURRENCY_CONFIG = {
  yuan: { label: '元', divisor: 100, defaultDecimal: 2 },          // 分转元：分值 ÷ 100
  wan: { label: '万元', divisor: 1000000, defaultDecimal: 6 },     // 分转万元：分值 ÷ 1000000  
  yi: { label: '亿', divisor: 10000000000, defaultDecimal: 6 }     // 分转亿：分值 ÷ 10000000000
} as const

/** 全局货币设置 */
const globalSettings = ref<GlobalCurrencySettings>({
  currencyUnit: 'wan',
  decimalPlaces: 6
})

/** 是否已加载设置 */
let isSettingsLoaded = false

/** 加载设置 */
const loadSettings = () => {
  if (isSettingsLoaded) return
  
  try {
    const savedSettings = localStorage.getItem('globalCurrencySettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      globalSettings.value = { ...globalSettings.value, ...settings }
    }
  } catch (error) {
    console.error('加载货币设置失败:', error)
  }
  
  isSettingsLoaded = true
}

/** 保存设置 */
const saveSettings = (settings: GlobalCurrencySettings) => {
  try {
    localStorage.setItem('globalCurrencySettings', JSON.stringify(settings))
    globalSettings.value = { ...settings }
    console.log('useCurrencySettings: 全局设置已保存', settings)
  } catch (error) {
    console.error('保存货币设置失败:', error)
    throw error
  }
}



/** 获取当前货币单位信息 */
const getCurrentCurrencyInfo = computed(() => {
  loadSettings()
  const config = CURRENCY_CONFIG[globalSettings.value.currencyUnit as keyof typeof CURRENCY_CONFIG]
  return {
    unit: globalSettings.value.currencyUnit,
    label: config?.label || '未知',
    decimal: globalSettings.value.decimalPlaces,
    divisor: config?.divisor || 1
  }
})

/** 获取所有可用的货币单位 */
const getCurrencyOptions = () => {
  return Object.entries(CURRENCY_CONFIG).map(([value, config]) => ({
    value,
    label: config.label,
    defaultDecimal: config.defaultDecimal
  }))
}

export function useCurrencySettings() {
  // 初始化时加载设置
  loadSettings()
  
  return {
    // 状态
    globalSettings,
    getCurrentCurrencyInfo,
    
    // 方法
    loadSettings,
    saveSettings,
    getCurrencyOptions
  }
} 